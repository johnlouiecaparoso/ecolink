-- Fix certificates foreign key to add CASCADE delete
-- Run this in your Supabase SQL Editor

-- This will allow deleting credit_transactions and certificate records
-- when the parent transaction is deleted

-- 1. Drop existing foreign key constraint on certificates
ALTER TABLE certificates 
DROP CONSTRAINT IF EXISTS certificates_transaction_id_fkey;

-- 2. Re-add foreign key with CASCADE
ALTER TABLE certificates
ADD CONSTRAINT certificates_transaction_id_fkey 
FOREIGN KEY (transaction_id) 
REFERENCES credit_transactions(id) 
ON DELETE CASCADE;

-- 3. Also check receipts table if it has similar constraint
-- First check if receipts table exists and has transaction_id column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'receipts'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'receipts' 
            AND column_name = 'transaction_id'
        ) THEN
            -- Drop existing foreign key constraint on receipts
            ALTER TABLE receipts 
            DROP CONSTRAINT IF EXISTS receipts_transaction_id_fkey;
            
            -- Re-add foreign key with CASCADE
            ALTER TABLE receipts
            ADD CONSTRAINT receipts_transaction_id_fkey 
            FOREIGN KEY (transaction_id) 
            REFERENCES credit_transactions(id) 
            ON DELETE CASCADE;
            
            RAISE NOTICE 'Updated receipts table foreign key with CASCADE';
        END IF;
    END IF;
END $$;

-- 4. Verify all CASCADE constraints were created correctly
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    rc.delete_rule,
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
  AND rc.constraint_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name IN ('credit_listings', 'credit_transactions')
  AND tc.table_name IN ('certificates', 'receipts', 'credit_purchases')
ORDER BY tc.table_name, kcu.column_name;

-- 5. Success message
SELECT '✅ All foreign key constraints updated with CASCADE delete!' AS result;




