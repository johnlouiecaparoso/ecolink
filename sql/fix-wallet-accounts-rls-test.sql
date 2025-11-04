-- ═══════════════════════════════════════════════════════════════════════════
-- QUICK FIX: Allow wallet_accounts inserts without auth check
-- For test accounts that don't have real Supabase auth
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop existing policy
DROP POLICY IF EXISTS "Wallet Accounts INSERT Policy" ON wallet_accounts;

-- Create new policy that allows authenticated users OR anyone to insert
-- This is temporary for test accounts - in production, you'd use service role
CREATE POLICY "Wallet Accounts INSERT Policy" ON wallet_accounts
    FOR INSERT 
    WITH CHECK (true);

-- Also update wallet_transactions INSERT policy
DROP POLICY IF EXISTS "Wallet Transactions INSERT Policy" ON wallet_transactions;

CREATE POLICY "Wallet Transactions INSERT Policy" ON wallet_transactions
    FOR INSERT 
    WITH CHECK (true);

-- Verification
SELECT 'Wallet policies updated to allow test account inserts' AS status;

