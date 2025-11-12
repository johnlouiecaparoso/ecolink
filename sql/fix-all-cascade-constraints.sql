-- Fix ALL missing CASCADE delete constraints in the database
-- Run this in your Supabase SQL Editor to fix admin delete issues

-- This comprehensive script fixes all foreign key constraints that need CASCADE delete
-- to allow proper deletion of parent records

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. CREDIT_PURCHASES → CREDIT_LISTINGS
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE credit_purchases 
DROP CONSTRAINT IF EXISTS credit_purchases_listing_id_fkey;

ALTER TABLE credit_purchases
ADD CONSTRAINT credit_purchases_listing_id_fkey 
FOREIGN KEY (listing_id) 
REFERENCES credit_listings(id) 
ON DELETE CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. CERTIFICATES → CREDIT_TRANSACTIONS
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE certificates 
DROP CONSTRAINT IF EXISTS certificates_transaction_id_fkey;

ALTER TABLE certificates
ADD CONSTRAINT certificates_transaction_id_fkey 
FOREIGN KEY (transaction_id) 
REFERENCES credit_transactions(id) 
ON DELETE CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. RECEIPTS → CREDIT_TRANSACTIONS (if table exists)
-- ═══════════════════════════════════════════════════════════════════════════

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
            ALTER TABLE receipts 
            DROP CONSTRAINT IF EXISTS receipts_transaction_id_fkey;
            
            ALTER TABLE receipts
            ADD CONSTRAINT receipts_transaction_id_fkey 
            FOREIGN KEY (transaction_id) 
            REFERENCES credit_transactions(id) 
            ON DELETE CASCADE;
            
            RAISE NOTICE '✅ Updated receipts table foreign key with CASCADE';
        END IF;
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. CREDIT_TRANSACTIONS → PROJECT_CREDITS (if needed)
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
    -- Check if credit_transactions has project_credit_id foreign key
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_transactions' 
        AND column_name = 'project_credit_id'
    ) THEN
        ALTER TABLE credit_transactions 
        DROP CONSTRAINT IF EXISTS credit_transactions_project_credit_id_fkey;
        
        ALTER TABLE credit_transactions
        ADD CONSTRAINT credit_transactions_project_credit_id_fkey 
        FOREIGN KEY (project_credit_id) 
        REFERENCES project_credits(id) 
        ON DELETE CASCADE;
        
        RAISE NOTICE '✅ Updated credit_transactions.project_credit_id with CASCADE';
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. VERIFICATION: Show all foreign key constraints and their CASCADE status
-- ═══════════════════════════════════════════════════════════════════════════

SELECT 
    tc.table_name as child_table,
    kcu.column_name as child_column,
    ccu.table_name AS parent_table,
    rc.delete_rule,
    CASE 
        WHEN rc.delete_rule = 'CASCADE' THEN '✅ CASCADE'
        WHEN rc.delete_rule = 'RESTRICT' THEN '⚠️  RESTRICT'
        WHEN rc.delete_rule = 'SET NULL' THEN '🔸 SET NULL'
        WHEN rc.delete_rule = 'NO ACTION' THEN '❌ NO ACTION'
        ELSE '❓ ' || COALESCE(rc.delete_rule, 'UNKNOWN')
    END as status
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
  AND tc.table_schema = 'public'
  AND (
    tc.table_name IN ('certificates', 'receipts', 'credit_purchases', 'credit_transactions', 'credit_listings')
    OR ccu.table_name IN ('certificates', 'receipts', 'credit_purchases', 'credit_transactions', 'credit_listings', 'projects', 'project_credits')
  )
ORDER BY tc.table_name, kcu.column_name;

-- ═══════════════════════════════════════════════════════════════════════════
-- SUCCESS MESSAGE
-- ═══════════════════════════════════════════════════════════════════════════

SELECT '✅ All CASCADE delete constraints have been fixed successfully!' AS result;
















