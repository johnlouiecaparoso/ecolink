-- ═══════════════════════════════════════════════════════════════════════════
-- COMPLETE FIX FOR PRICING ISSUE - ALL IN ONE SCRIPT
-- Run this ONCE in Supabase SQL Editor to fix everything!
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: Add missing project fields
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_credits INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS credit_price DECIMAL(10,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_image TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_type TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_size INTEGER;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2: Add constraints for data validation
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE t.relname = 'projects' AND n.nspname = 'public' AND c.conname = 'check_estimated_credits'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT check_estimated_credits
      CHECK (estimated_credits IS NULL OR (estimated_credits > 0 AND estimated_credits <= 1000000));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE t.relname = 'projects' AND n.nspname = 'public' AND c.conname = 'check_credit_price'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT check_credit_price
      CHECK (credit_price IS NULL OR (credit_price > 0 AND credit_price <= 1000));
  END IF;
END$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3: Fix database trigger to use project's custom pricing ⭐ CRITICAL!
-- ═══════════════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS trigger_generate_project_credits ON projects;

CREATE OR REPLACE FUNCTION generate_project_credits()
RETURNS TRIGGER AS $$
DECLARE
  existing_credit_id UUID;
  credits_amount INTEGER;
  base_price DECIMAL(10,2);
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    SELECT id INTO existing_credit_id
    FROM project_credits
    WHERE project_id = NEW.id
    LIMIT 1;
    
    IF existing_credit_id IS NOT NULL THEN
      RAISE NOTICE 'Project credits already exist for project_id %, skipping creation', NEW.id;
      RETURN NEW;
    END IF;
    
    -- ⭐ USE PROJECT'S CUSTOM VALUES FIRST!
    IF NEW.estimated_credits IS NOT NULL THEN
      credits_amount := NEW.estimated_credits;
    ELSE
      CASE NEW.category
        WHEN 'Forestry' THEN credits_amount := 1000;
        WHEN 'Renewable Energy' THEN credits_amount := 500;
        WHEN 'Blue Carbon' THEN credits_amount := 800;
        WHEN 'Energy Efficiency' THEN credits_amount := 300;
        WHEN 'Waste Management' THEN credits_amount := 400;
        ELSE credits_amount := 500;
      END CASE;
    END IF;
    
    -- ⭐ USE PROJECT'S CUSTOM PRICE FIRST!
    IF NEW.credit_price IS NOT NULL THEN
      base_price := NEW.credit_price;
    ELSE
      CASE NEW.category
        WHEN 'Forestry' THEN base_price := 15.00;
        WHEN 'Renewable Energy' THEN base_price := 20.00;
        WHEN 'Blue Carbon' THEN base_price := 18.00;
        WHEN 'Energy Efficiency' THEN base_price := 12.00;
        WHEN 'Waste Management' THEN base_price := 14.00;
        ELSE base_price := 15.00;
      END CASE;
    END IF;
    
    INSERT INTO project_credits (
      project_id,
      total_credits,
      available_credits,
      price_per_credit,
      currency
    ) VALUES (
      NEW.id,
      credits_amount,
      credits_amount,
      base_price,
      'PHP'
    );
    
    INSERT INTO credit_listings (
      project_credit_id,
      seller_id,
      quantity,
      price_per_credit,
      currency,
      status
    ) 
    SELECT 
      pc.id,
      NEW.user_id,
      pc.available_credits,
      pc.price_per_credit,
      pc.currency,
      'active'
    FROM project_credits pc
    WHERE pc.project_id = NEW.id
      AND NOT EXISTS (
        SELECT 1 FROM credit_listings cl 
        WHERE cl.project_credit_id = pc.id
      )
    LIMIT 1;
    
    RAISE NOTICE 'Generated credits for project_id %: % credits at % price', NEW.id, credits_amount, base_price;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_project_credits
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION generate_project_credits();

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 4: Add index for performance
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_projects_has_image ON projects((project_image IS NOT NULL));

-- ═══════════════════════════════════════════════════════════════════════════
-- Verification
-- ═══════════════════════════════════════════════════════════════════════════

SELECT '✅ Columns added successfully!' AS columns_status
UNION ALL
SELECT '✅ Constraints added successfully!' AS constraints_status
UNION ALL
SELECT '✅ Trigger fixed to use custom pricing!' AS trigger_status;

-- Check trigger was created
SELECT 
  trigger_name,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_generate_project_credits';

SELECT '🎉 ALL FIXES APPLIED! Submit a new project to test!' AS final_status;
















