-- Test credit_listings table structure after fix
-- Run this in your Supabase SQL Editor after running the fix script

-- 1. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'credit_listings'
ORDER BY ordinal_position;

-- 2. Check if project_id column exists and has data
SELECT 
  'project_id column check' as test,
  COUNT(*) as total_records,
  COUNT(project_id) as records_with_project_id,
  COUNT(project_credit_id) as records_with_project_credit_id
FROM credit_listings;

-- 3. Check foreign key constraints
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
  AND tc.table_name = 'credit_listings';

-- 4. Check RLS policies
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'credit_listings'
ORDER BY policyname;

-- 5. Test inserting a sample record
-- This will only work if you have projects in your database
INSERT INTO credit_listings (
  project_id,
  seller_id,
  title,
  description,
  category,
  location,
  price_per_credit,
  available_quantity,
  status
) VALUES (
  (SELECT id FROM projects LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'project_developer' LIMIT 1),
  'Test Carbon Credits - Fixed',
  'Test description for marketplace listing after fix',
  'Renewable Energy',
  'Test Location',
  15.00,
  1000,
  'active'
) ON CONFLICT DO NOTHING;

-- 6. Check if the test record was created
SELECT 
  id,
  title,
  project_id,
  project_credit_id,
  status,
  price_per_credit,
  available_quantity,
  created_at
FROM credit_listings 
ORDER BY created_at DESC 
LIMIT 5;









