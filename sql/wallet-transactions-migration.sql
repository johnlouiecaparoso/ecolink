-- Safe Wallet Transactions Migration
-- This script safely migrates existing wallet_transactions data and adds constraints
-- Run this in your Supabase SQL Editor

-- 1. DIAGNOSTIC: Check current type values (for reference)
-- Uncomment these lines to see what types exist before migration:
-- SELECT DISTINCT type FROM wallet_transactions;
-- SELECT id, account_id, type FROM wallet_transactions WHERE type NOT IN ('deposit','withdrawal','purchase','sale','refund') OR type IS NULL LIMIT 100;

-- 2. SAFE MIGRATION SEQUENCE

-- Step A: Temporarily expand the constraint to allow both old and new values
-- This prevents any INSERT/UPDATE failures during migration
ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_type_check;
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_type_check CHECK (type IN (
  'topup', 'deposit', 'withdrawal', 'payment', 'purchase', 'sale', 'refund', 'fee'
));

-- Step B: Migrate existing data to new type values
-- Map existing values to new taxonomy
UPDATE wallet_transactions SET type = 'deposit' WHERE type = 'topup';
UPDATE wallet_transactions SET type = 'purchase' WHERE type = 'payment';
UPDATE wallet_transactions SET type = 'sale' WHERE type = 'fee';
-- Keep 'withdrawal' and 'refund' as they are already in the new set

-- Step C: Handle any NULL values by setting a default
UPDATE wallet_transactions SET type = 'deposit' WHERE type IS NULL;

-- Step D: Now we can safely tighten the constraint to only allow new values
ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_type_check;
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_type_check CHECK (type IN (
  'deposit', 'withdrawal', 'purchase', 'sale', 'refund'
));

-- 3. Add other missing columns if they don't exist
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS amount DECIMAL(12,2);
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS reference_id UUID;
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 4. Add status constraint
ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_status_check;
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_status_check CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));

-- 5. VERIFICATION: Check that migration was successful
-- Uncomment these lines to verify the migration worked:
-- SELECT DISTINCT type FROM wallet_transactions;
-- SELECT 'Wallet transactions migration completed successfully!' as status;

-- 6. Success message
SELECT 'Wallet transactions migration completed! All constraint violations resolved.' as status;

