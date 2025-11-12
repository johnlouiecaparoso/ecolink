-- Fix database trigger to use project's custom estimated_credits and credit_price
-- This is the REAL fix for the pricing issue!

-- Drop existing trigger
DROP TRIGGER IF EXISTS trigger_generate_project_credits ON projects;

-- Create improved trigger function that uses project's custom pricing
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
    
    -- Use project's custom estimated_credits and credit_price if available, otherwise calculate from category
    IF NEW.estimated_credits IS NOT NULL THEN
      credits_amount := NEW.estimated_credits;
    ELSE
      -- Calculate credits based on project category (fallback)
      CASE NEW.category
        WHEN 'Forestry' THEN credits_amount := 1000;
        WHEN 'Renewable Energy' THEN credits_amount := 500;
        WHEN 'Blue Carbon' THEN credits_amount := 800;
        WHEN 'Energy Efficiency' THEN credits_amount := 300;
        WHEN 'Waste Management' THEN credits_amount := 400;
        ELSE credits_amount := 500;
      END CASE;
    END IF;
    
    -- Use project's custom credit_price if available, otherwise calculate from category
    IF NEW.credit_price IS NOT NULL THEN
      base_price := NEW.credit_price;
    ELSE
      -- Determine base price based on category (fallback)
      CASE NEW.category
        WHEN 'Forestry' THEN base_price := 15.00;
        WHEN 'Renewable Energy' THEN base_price := 20.00;
        WHEN 'Blue Carbon' THEN base_price := 18.00;
        WHEN 'Energy Efficiency' THEN base_price := 12.00;
        WHEN 'Waste Management' THEN base_price := 14.00;
        ELSE base_price := 15.00;
      END CASE;
    END IF;
    
    -- Insert project credits with currency
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
    
    -- Create initial marketplace listing if it doesn't exist
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

-- Recreate trigger
CREATE TRIGGER trigger_generate_project_credits
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION generate_project_credits();

-- Verify trigger was created
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_generate_project_credits';

SELECT '✅ Trigger fixed to use project custom pricing!' AS result;
















