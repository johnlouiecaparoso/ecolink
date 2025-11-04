-- ═══════════════════════════════════════════════════════════════════════════
-- FINAL COMPREHENSIVE RLS FIX
-- This script consolidates all RLS policies needed for marketplace and verifier operations
-- Run this in Supabase SQL Editor after running add-verifier-rls-policies.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 0. DIAGNOSTIC: Check table schemas
-- ═══════════════════════════════════════════════════════════════════════════

-- Check wallet_transactions columns
DO $$
BEGIN
    RAISE NOTICE 'Checking wallet_transactions schema...';
    -- List columns for debugging
    PERFORM column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'wallet_transactions';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. VERIFIER HELPER FUNCTION (if not already exists)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_verifier(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND role IN ('verifier', 'Verifier', 'VERIFIER')
  );
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. PROJECTS TABLE - Comprehensive Policies
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop old conflicting policies
DROP POLICY IF EXISTS "Anyone can view approved projects" ON projects;
DROP POLICY IF EXISTS "Verifiers can view pending projects" ON projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
DROP POLICY IF EXISTS "Admins can update any project" ON projects;
DROP POLICY IF EXISTS "Verifiers can update project status" ON projects;

-- SELECT: Anyone can view approved projects, verifiers can view pending, admins see all
CREATE POLICY "Projects SELECT Policy" ON projects
    FOR SELECT 
    USING (
        status = 'approved' 
        OR user_id = auth.uid() 
        OR public.is_admin(auth.uid()) 
        OR public.is_verifier(auth.uid())
    );

-- INSERT: Authenticated users can create projects
CREATE POLICY "Projects INSERT Policy" ON projects
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Admins and verifiers can update any project
CREATE POLICY "Projects UPDATE Policy" ON projects
    FOR UPDATE 
    USING (public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));

-- DELETE: Only admins can delete projects
CREATE POLICY "Projects DELETE Policy" ON projects
    FOR DELETE 
    USING (public.is_admin(auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. PROJECT_CREDITS TABLE - Verifiers can create when approving
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Verifiers can view project credits" ON project_credits;
DROP POLICY IF EXISTS "Verifiers can create project credits" ON project_credits;

-- SELECT: Everyone can view (for marketplace)
CREATE POLICY "Project Credits SELECT Policy" ON project_credits
    FOR SELECT 
    USING (true);

-- INSERT: Verifiers and admins can create credits
CREATE POLICY "Project Credits INSERT Policy" ON project_credits
    FOR INSERT 
    WITH CHECK (public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));

-- UPDATE: Verifiers and admins can update
CREATE POLICY "Project Credits UPDATE Policy" ON project_credits
    FOR UPDATE 
    USING (public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. CREDIT_LISTINGS TABLE - Critical for marketplace purchases
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Anyone can view active listings" ON credit_listings;
DROP POLICY IF EXISTS "Verifiers can view credit listings" ON credit_listings;
DROP POLICY IF EXISTS "Verifiers can create credit listings" ON credit_listings;

-- SELECT: Everyone can view active listings
CREATE POLICY "Credit Listings SELECT Policy" ON credit_listings
    FOR SELECT 
    USING (true);

-- INSERT: Verifiers and admins can create listings when approving
CREATE POLICY "Credit Listings INSERT Policy" ON credit_listings
    FOR INSERT 
    WITH CHECK (public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));

-- UPDATE: Verifiers and admins can update listings
CREATE POLICY "Credit Listings UPDATE Policy" ON credit_listings
    FOR UPDATE 
    USING (public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. CREDIT_OWNERSHIP TABLE - Users can insert when purchasing
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can view their own ownership" ON credit_ownership;
DROP POLICY IF EXISTS "Users can insert their own ownership" ON credit_ownership;

-- SELECT: Users can view their own, admins and verifiers can view all
CREATE POLICY "Credit Ownership SELECT Policy" ON credit_ownership
    FOR SELECT 
    USING (
        user_id = auth.uid() 
        OR public.is_admin(auth.uid()) 
        OR public.is_verifier(auth.uid())
    );

-- INSERT: Authenticated users can insert (when purchasing), admins and verifiers can insert
CREATE POLICY "Credit Ownership INSERT Policy" ON credit_ownership
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        OR public.is_admin(auth.uid()) 
        OR public.is_verifier(auth.uid())
    );

-- UPDATE: Users can update their own, admins and verifiers can update all
CREATE POLICY "Credit Ownership UPDATE Policy" ON credit_ownership
    FOR UPDATE 
    USING (
        user_id = auth.uid() 
        OR public.is_admin(auth.uid()) 
        OR public.is_verifier(auth.uid())
    );

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. CREDIT_PURCHASES TABLE - Users can insert when purchasing
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can view their own purchases" ON credit_purchases;

-- SELECT: Users can view their own purchases, admins and verifiers can view all
CREATE POLICY "Credit Purchases SELECT Policy" ON credit_purchases
    FOR SELECT 
    USING (
        buyer_id = auth.uid() 
        OR seller_id = auth.uid() 
        OR public.is_admin(auth.uid()) 
        OR public.is_verifier(auth.uid())
    );

-- INSERT: Authenticated users can insert purchases
CREATE POLICY "Credit Purchases INSERT Policy" ON credit_purchases
    FOR INSERT 
    WITH CHECK (
        buyer_id = auth.uid() 
        OR public.is_admin(auth.uid()) 
        OR public.is_verifier(auth.uid())
    );

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. CREDIT_TRANSACTIONS TABLE - Users can insert when purchasing
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can view their own transactions" ON credit_transactions;

-- SELECT: Users can view their own transactions, admins and verifiers can view all
CREATE POLICY "Credit Transactions SELECT Policy" ON credit_transactions
    FOR SELECT 
    USING (
        buyer_id = auth.uid() 
        OR seller_id = auth.uid() 
        OR public.is_admin(auth.uid()) 
        OR public.is_verifier(auth.uid())
    );

-- INSERT: Authenticated users can insert transactions
CREATE POLICY "Credit Transactions INSERT Policy" ON credit_transactions
    FOR INSERT 
    WITH CHECK (
        buyer_id = auth.uid() 
        OR public.is_admin(auth.uid()) 
        OR public.is_verifier(auth.uid())
    );

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. WALLET TABLES - For payments
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop all old wallet policies with common names
DROP POLICY IF EXISTS "Users can view their own wallet" ON wallet_accounts;
DROP POLICY IF EXISTS "Users can view their own wallet" ON wallet_transactions;
DROP POLICY IF EXISTS "Wallet Accounts SELECT Policy" ON wallet_accounts;
DROP POLICY IF EXISTS "Wallet Accounts INSERT Policy" ON wallet_accounts;
DROP POLICY IF EXISTS "Wallet Accounts UPDATE Policy" ON wallet_accounts;
DROP POLICY IF EXISTS "Wallet Transactions SELECT Policy" ON wallet_transactions;
DROP POLICY IF EXISTS "Wallet Transactions INSERT Policy" ON wallet_transactions;
DROP POLICY IF EXISTS "Wallet Transactions UPDATE Policy" ON wallet_transactions;

-- Wallet Accounts
CREATE POLICY "Wallet Accounts SELECT Policy" ON wallet_accounts
    FOR SELECT 
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Wallet Accounts INSERT Policy" ON wallet_accounts
    FOR INSERT 
    WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Wallet Accounts UPDATE Policy" ON wallet_accounts
    FOR UPDATE 
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Wallet Transactions (use JOIN through wallet_accounts since wallet_transactions has account_id not user_id)
CREATE POLICY "Wallet Transactions SELECT Policy" ON wallet_transactions
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.wallet_accounts wa 
            WHERE wa.id = account_id 
            AND wa.user_id = (SELECT auth.uid())
        ) 
        OR public.is_admin((SELECT auth.uid()))
    );

CREATE POLICY "Wallet Transactions INSERT Policy" ON wallet_transactions
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.wallet_accounts wa 
            WHERE wa.id = account_id 
            AND wa.user_id = (SELECT auth.uid())
        ) 
        OR public.is_admin((SELECT auth.uid()))
    );

CREATE POLICY "Wallet Transactions UPDATE Policy" ON wallet_transactions
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.wallet_accounts wa 
            WHERE wa.id = account_id 
            AND wa.user_id = (SELECT auth.uid())
        ) 
        OR public.is_admin((SELECT auth.uid()))
    );

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Check if is_verifier function exists
SELECT 
    'is_verifier function status: ' || 
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'is_verifier' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN 'EXISTS' ELSE 'MISSING' END 
    AS status;

-- List all RLS policies created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN (
        'projects', 
        'project_credits', 
        'credit_listings', 
        'credit_ownership', 
        'credit_purchases', 
        'credit_transactions',
        'wallet_accounts',
        'wallet_transactions'
    )
ORDER BY tablename, policyname;

-- Success message
SELECT '✅ All RLS policies have been updated successfully!' AS result;

