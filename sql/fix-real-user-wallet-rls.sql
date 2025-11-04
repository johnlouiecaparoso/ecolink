-- ═══════════════════════════════════════════════════════════════════════════
-- FIX WALLET RLS FOR REAL USERS
-- Allow users to create their own wallet accounts
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Wallet Accounts INSERT Policy" ON wallet_accounts;
DROP POLICY IF EXISTS "Wallet Transactions INSERT Policy" ON wallet_transactions;

-- Wallet Accounts: Users can insert their own account
CREATE POLICY "Wallet Accounts INSERT Policy" ON wallet_accounts
    FOR INSERT 
    WITH CHECK (
        user_id = auth.uid()
    );

-- Wallet Transactions: Users can insert transactions for their accounts
CREATE POLICY "Wallet Transactions INSERT Policy" ON wallet_transactions
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.wallet_accounts wa 
            WHERE wa.id = account_id 
            AND wa.user_id = (SELECT auth.uid())
        )
    );

-- Verification
SELECT 'Wallet policies updated for real users' AS status;

