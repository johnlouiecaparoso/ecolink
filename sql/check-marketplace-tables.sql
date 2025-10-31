-- Check Marketplace Tables Structure
-- Run this in your Supabase SQL Editor

-- 1. Check if credit_listings table exists
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'credit_listings'
ORDER BY ordinal_position;

-- 2. Check if projects table has the right structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- 3. Check if there are any projects with 'pending' status
SELECT 
  id,
  title,
  status,
  user_id,
  created_at
FROM projects 
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check if there are any projects with 'approved' status
SELECT 
  id,
  title,
  status,
  user_id,
  created_at
FROM projects 
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check if credit_listings table has any data
SELECT 
  id,
  project_id,
  seller_id,
  title,
  status,
  created_at
FROM credit_listings 
ORDER BY created_at DESC
LIMIT 10;









