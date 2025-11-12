-- VERIFY TRIGGER IS FIXED
-- This will show:
-- 1. Whether the trigger exists and uses project fields
-- 2. Current data state
-- 3. Whether trigger will work on next approval

SELECT 
  '🔍 STEP 1: Check if trigger exists' as step;

SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_generate_project_credits';

SELECT 
  '🔍 STEP 2: Check project data for pricing fields' as step;

SELECT 
  id,
  title,
  estimated_credits,
  credit_price,
  category,
  status,
  created_at
FROM projects
ORDER BY created_at DESC
LIMIT 10;

SELECT 
  '🔍 STEP 3: Check if project_credits and credit_listings match projects pricing' as step;

SELECT 
  p.id as project_id,
  p.title,
  p.estimated_credits as project_credits,
  p.credit_price as project_price,
  pc.total_credits as credit_total,
  pc.price_per_credit as credit_price,
  cl.quantity as listing_quantity,
  cl.price_per_credit as listing_price
FROM projects p
LEFT JOIN project_credits pc ON pc.project_id = p.id
LEFT JOIN credit_listings cl ON cl.project_credit_id = pc.id
ORDER BY p.created_at DESC
LIMIT 10;

SELECT 
  '🔍 STEP 4: Check function definition' as step;

SELECT 
  prosrc
FROM pg_proc 
WHERE proname = 'generate_project_credits';

















