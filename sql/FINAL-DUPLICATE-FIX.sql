-- ═══════════════════════════════════════════════════════════════════════════
-- FINAL DUPLICATE FIX - Simple and Complete
-- Fixes both project_credits and credit_listings duplicates
-- ═══════════════════════════════════════════════════════════════════════════

-- Step 1: Check what needs cleaning
SELECT 'BEFORE CLEANUP - Checking duplicates...' AS status;

SELECT 
    'project_credits duplicates:' AS check_type,
    project_id,
    COUNT(*) as duplicate_count
FROM project_credits
GROUP BY project_id
HAVING COUNT(*) > 1;

SELECT 
    'credit_listings duplicates:' AS check_type,
    project_credit_id,
    COUNT(*) as duplicate_count
FROM credit_listings
WHERE status = 'active'
GROUP BY project_credit_id
HAVING COUNT(*) > 1;

-- Step 2: Delete duplicate project_credits (keep oldest)
WITH duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at ASC) as row_num
    FROM project_credits
)
DELETE FROM project_credits
WHERE id IN (SELECT id FROM duplicates WHERE row_num > 1);

-- Step 3: Delete duplicate credit_listings (keep oldest)
WITH duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (PARTITION BY project_credit_id ORDER BY created_at ASC) as row_num
    FROM credit_listings
    WHERE status = 'active'
)
DELETE FROM credit_listings
WHERE id IN (SELECT id FROM duplicates WHERE row_num > 1);

-- Step 4: Add unique constraints
ALTER TABLE project_credits 
DROP CONSTRAINT IF EXISTS project_credits_project_id_unique;

ALTER TABLE project_credits
ADD CONSTRAINT project_credits_project_id_unique UNIQUE (project_id);

ALTER TABLE credit_listings 
DROP CONSTRAINT IF EXISTS credit_listings_project_credit_id_unique;

ALTER TABLE credit_listings
ADD CONSTRAINT credit_listings_project_credit_id_unique UNIQUE (project_credit_id);

-- Step 5: Verify results
SELECT 'AFTER CLEANUP - Verification:' AS status;

SELECT 
    'Total projects:' AS metric,
    COUNT(*) as count
FROM projects
WHERE status = 'approved';

SELECT 
    'Total project_credits:' AS metric,
    COUNT(*) as count
FROM project_credits;

SELECT 
    'Total active listings:' AS metric,
    COUNT(*) as count
FROM credit_listings
WHERE status = 'active';

-- Step 6: Check relationship is correct
SELECT 
    'Projects → Credits → Listings relationship:' AS metric,
    COUNT(DISTINCT p.id) as projects,
    COUNT(DISTINCT pc.id) as credits,
    COUNT(DISTINCT cl.id) as listings
FROM projects p
LEFT JOIN project_credits pc ON pc.project_id = p.id
LEFT JOIN credit_listings cl ON cl.project_credit_id = pc.id AND cl.status = 'active'
WHERE p.status = 'approved';

-- ═══════════════════════════════════════════════════════════════════════════
-- FIX DATABASE TRIGGER (This is the real culprit!)
-- The trigger creates credits WITHOUT checking if they exist
-- We need to make it handle existing credits gracefully
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop existing trigger
DROP TRIGGER IF EXISTS trigger_generate_project_credits ON projects;

-- Create improved trigger function that checks for existing credits
CREATE OR REPLACE FUNCTION generate_project_credits()
RETURNS TRIGGER AS $$
DECLARE
  existing_credit_id UUID;
  credits_amount INTEGER;
  base_price DECIMAL(10,2);
BEGIN
  -- Only generate credits when project status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- Check if credits already exist for this project
    SELECT id INTO existing_credit_id
    FROM project_credits
    WHERE project_id = NEW.id
    LIMIT 1;
    
    -- If credits already exist, skip creation (avoid duplicate)
    IF existing_credit_id IS NOT NULL THEN
      RAISE NOTICE 'Project credits already exist for project_id %, skipping creation', NEW.id;
      RETURN NEW;
    END IF;
    
    -- Calculate credits based on project category
    CASE NEW.category
      WHEN 'Forestry' THEN credits_amount := 1000;
      WHEN 'Renewable Energy' THEN credits_amount := 500;
      WHEN 'Blue Carbon' THEN credits_amount := 800;
      WHEN 'Energy Efficiency' THEN credits_amount := 300;
      WHEN 'Waste Management' THEN credits_amount := 400;
      ELSE credits_amount := 500;
    END CASE;
    
    -- Determine base price based on category
    CASE NEW.category
      WHEN 'Forestry' THEN base_price := 15.00;
      WHEN 'Renewable Energy' THEN base_price := 20.00;
      WHEN 'Blue Carbon' THEN base_price := 18.00;
      WHEN 'Energy Efficiency' THEN base_price := 12.00;
      WHEN 'Waste Management' THEN base_price := 14.00;
      ELSE base_price := 15.00;
    END CASE;
    
    -- Insert project credits (only if they don't exist)
    INSERT INTO project_credits (
      project_id,
      total_credits,
      available_credits,
      price_per_credit
    ) VALUES (
      NEW.id,
      credits_amount,
      credits_amount,
      base_price
    );
    
    -- Create initial marketplace listing if it doesn't exist
    INSERT INTO credit_listings (
      project_credit_id,
      seller_id,
      quantity,
      price_per_credit,
      status
    ) 
    SELECT 
      pc.id,
      NEW.user_id,
      pc.available_credits,
      pc.price_per_credit,
      'active'
    FROM project_credits pc
    WHERE pc.project_id = NEW.id
    ON CONFLICT (project_credit_id) DO NOTHING;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER trigger_generate_project_credits
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION generate_project_credits();

SELECT '✅ Done! Duplicates removed, constraints added, and trigger fixed!' AS final_status;

