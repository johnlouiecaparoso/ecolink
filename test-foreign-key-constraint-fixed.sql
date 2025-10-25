-- Test Foreign Key Constraint - Fixed Version
-- Run this in your Supabase SQL Editor

-- 1. Check if the foreign key constraint exists
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'credit_listings'
ORDER BY tc.constraint_name;

-- 2. Check if project_id column has data
SELECT 
  'project_id column check' as test,
  COUNT(*) as total_records,
  COUNT(project_id) as records_with_project_id,
  COUNT(project_credit_id) as records_with_project_credit_id
FROM credit_listings;

-- 3. First, let's create a project_credit record if it doesn't exist
-- This is needed because project_credit_id is NOT NULL
INSERT INTO project_credits (
  project_id,
  total_credits,
  credits_available,
  price_per_credit,
  status,
  vintage_year,
  created_at,
  updated_at
) 
SELECT 
  p.id,
  1000, -- Default quantity
  1000, -- Default available
  15.00, -- Default price
  'active',
  EXTRACT(YEAR FROM NOW())::int, -- Current year as vintage year
  NOW(),
  NOW()
FROM projects p
WHERE p.id NOT IN (
  SELECT DISTINCT project_id 
  FROM project_credits 
  WHERE project_id IS NOT NULL
)
LIMIT 1
ON CONFLICT DO NOTHING;

-- 4. Now test inserting a sample record with both project_id and project_credit_id
INSERT INTO credit_listings (
  project_id,
  project_credit_id,
  seller_id,
  quantity,
  price_per_credit,
  currency,
  listing_type,
  status,
  title,
  description,
  category,
  location,
  vintage_year,
  verification_standard
) VALUES (
  (SELECT p.id FROM projects p LIMIT 1),
  (SELECT pc.id FROM project_credits pc 
   JOIN projects p ON pc.project_id = p.id 
   LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'project_developer' LIMIT 1),
  1000,
  15.00,
  'USD',
  'sell',
  'active',
  'Test Carbon Credits - Fixed Version',
  'Test description for marketplace listing after fixing project_credit_id',
  'Renewable Energy',
  'Test Location',
  EXTRACT(YEAR FROM NOW()),
  'EcoLink Standard'
) ON CONFLICT DO NOTHING;

-- 5. Check if the test record was created
SELECT 
  id,
  title,
  project_id,
  project_credit_id,
  quantity,
  price_per_credit,
  status,
  created_at
FROM credit_listings 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Test the foreign key constraint by trying to insert invalid project_id
-- This should fail if the constraint is working
-- Note: This is expected to fail - it's testing the constraint
DO $$
BEGIN
  BEGIN
    INSERT INTO credit_listings (
      project_id,
      project_credit_id,
      seller_id,
      quantity,
      price_per_credit,
      currency,
      listing_type,
      status,
      title
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', -- Invalid UUID
      (SELECT pc.id FROM project_credits pc LIMIT 1),
      (SELECT id FROM profiles WHERE role = 'project_developer' LIMIT 1),
      1000,
      15.00,
      'USD',
      'sell',
      'active',
      'Test Invalid Project ID'
    );
    RAISE NOTICE 'ERROR: Foreign key constraint is NOT working - invalid project_id was inserted!';
  EXCEPTION
    WHEN foreign_key_violation THEN
      RAISE NOTICE 'SUCCESS: Foreign key constraint is working correctly - invalid project_id was rejected';
    WHEN OTHERS THEN
      RAISE NOTICE 'ERROR: Unexpected error occurred: %', SQLERRM;
  END;
END $$;

