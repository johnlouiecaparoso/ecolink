-- Test credit_listings table
-- Run this in your Supabase SQL Editor after running the fix script

-- 1. Check if table exists and has correct structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'credit_listings'
ORDER BY ordinal_position;

-- 2. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
FROM pg_tables 
WHERE tablename = 'credit_listings';

-- 3. Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'credit_listings'
ORDER BY policyname;

-- 4. Test inserting a sample record (this should work if everything is set up correctly)
-- Note: This will only work if you have projects and profiles in your database
INSERT INTO credit_listings (
  project_id,
  seller_id,
  title,
  description,
  category,
  location,
  price_per_credit,
  available_quantity
) VALUES (
  (SELECT id FROM projects LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'project_developer' LIMIT 1),
  'Test Carbon Credits',
  'Test description for marketplace listing',
  'Renewable Energy',
  'Test Location',
  15.00,
  1000
) ON CONFLICT DO NOTHING;

-- 5. Check if the test record was created
SELECT 
  id,
  title,
  status,
  price_per_credit,
  available_quantity,
  created_at
FROM credit_listings 
ORDER BY created_at DESC 
LIMIT 5;









