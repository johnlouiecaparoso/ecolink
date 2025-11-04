-- Fix credit_purchases foreign key to add CASCADE delete
-- Run this in your Supabase SQL Editor

-- This will allow deleting credit_listings and credit_purchases records
-- when the parent listing is deleted

-- 1. Drop existing foreign key constraint
ALTER TABLE credit_purchases 
DROP CONSTRAINT IF EXISTS credit_purchases_listing_id_fkey;

-- 2. Re-add foreign key with CASCADE
ALTER TABLE credit_purchases
ADD CONSTRAINT credit_purchases_listing_id_fkey 
FOREIGN KEY (listing_id) 
REFERENCES credit_listings(id) 
ON DELETE CASCADE;

-- 3. Verify the constraint was created
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    CASE 
        WHEN rc.delete_rule = 'CASCADE' THEN '✅ CASCADE enabled'
        ELSE '❌ ' || rc.delete_rule
    END as cascade_status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'credit_purchases'
  AND kcu.column_name = 'listing_id';

-- 4. Success message
SELECT '✅ Foreign key constraint updated with CASCADE delete!' AS result;




