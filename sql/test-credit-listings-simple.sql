-- Simple test for credit_listings table structure
-- Run this in your Supabase SQL Editor

-- 1. Check what columns actually exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'credit_listings'
ORDER BY ordinal_position;

-- 2. Check if we can insert a basic record
INSERT INTO credit_listings (
  seller_id,
  price_per_credit,
  available_quantity,
  status
) VALUES (
  (SELECT id FROM profiles WHERE role = 'project_developer' LIMIT 1),
  15.00,
  1000,
  'active'
) ON CONFLICT DO NOTHING;

-- 3. Check if the record was created
SELECT 
  id,
  seller_id,
  price_per_credit,
  available_quantity,
  status,
  created_at
FROM credit_listings 
ORDER BY created_at DESC 
LIMIT 3;









