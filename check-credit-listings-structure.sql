-- Check the actual structure of credit_listings table
-- Run this in your Supabase SQL Editor

-- 1. Check all columns in credit_listings table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'credit_listings'
ORDER BY ordinal_position;

-- 2. Check if the table exists and get basic info
SELECT 
  table_name,
  table_type,
  is_insertable_into
FROM information_schema.tables 
WHERE table_name = 'credit_listings';

-- 3. Check existing data structure
SELECT 
  *
FROM credit_listings 
LIMIT 3;









