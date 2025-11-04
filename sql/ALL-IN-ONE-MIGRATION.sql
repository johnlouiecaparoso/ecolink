-- ═══════════════════════════════════════════════════════════════════════════
-- ALL-IN-ONE MIGRATION SCRIPT
-- Run this ONE file in Supabase SQL Editor to fix all authentication issues
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: ADD VERIFIER HELPER FUNCTION
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
-- STEP 2: FIX WALLET_TRANSACTIONS SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════

-- Add user_id column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'wallet_transactions' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.wallet_transactions ADD COLUMN user_id UUID;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'wallet_transactions_user_id_fkey'
        ) THEN
            ALTER TABLE public.wallet_transactions
            ADD CONSTRAINT wallet_transactions_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        END IF;
        
        RAISE NOTICE 'Added user_id column to wallet_transactions';
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3: SET UP ALL RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- PROJECTS
DROP POLICY IF EXISTS "Anyone can view approved projects" ON projects;
DROP POLICY IF EXISTS "Verifiers can view pending projects" ON projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
DROP POLICY IF EXISTS "Admins can update any project" ON projects;
DROP POLICY IF EXISTS "Verifiers can update project status" ON projects;
DROP POLICY IF EXISTS "Projects SELECT Policy" ON projects;
DROP POLICY IF EXISTS "Projects INSERT Policy" ON projects;
DROP POLICY IF EXISTS "Projects UPDATE Policy" ON projects;
DROP POLICY IF EXISTS "Projects DELETE Policy" ON projects;

CREATE POLICY "Projects SELECT Policy" ON projects FOR SELECT 
    USING (status = 'approved' OR user_id = auth.uid() OR public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));

CREATE POLICY "Projects INSERT Policy" ON projects FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Projects UPDATE Policy" ON projects FOR UPDATE 
    USING (public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));

CREATE POLICY "Projects DELETE Policy" ON projects FOR DELETE 
    USING (public.is_admin(auth.uid()));

-- PROJECT_CREDITS
DROP POLICY IF EXISTS "Verifiers can view project credits" ON project_credits;
DROP POLICY IF EXISTS "Verifiers can create project credits" ON project_credits;
DROP POLICY IF EXISTS "Project Credits SELECT Policy" ON project_credits;
DROP POLICY IF EXISTS "Project Credits INSERT Policy" ON project_credits;
DROP POLICY IF EXISTS "Project Credits UPDATE Policy" ON project_credits;

CREATE POLICY "Project Credits SELECT Policy" ON project_credits FOR SELECT USING (true);
CREATE POLICY "Project Credits INSERT Policy" ON project_credits FOR INSERT 
    WITH CHECK (public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));
CREATE POLICY "Project Credits UPDATE Policy" ON project_credits FOR UPDATE 
    USING (public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));

-- CREDIT_LISTINGS
DROP POLICY IF EXISTS "Anyone can view active listings" ON credit_listings;
DROP POLICY IF EXISTS "Verifiers can view credit listings" ON credit_listings;
DROP POLICY IF EXISTS "Verifiers can create credit listings" ON credit_listings;
DROP POLICY IF EXISTS "Credit Listings SELECT Policy" ON credit_listings;
DROP POLICY IF EXISTS "Credit Listings INSERT Policy" ON credit_listings;
DROP POLICY IF EXISTS "Credit Listings UPDATE Policy" ON credit_listings;

CREATE POLICY "Credit Listings SELECT Policy" ON credit_listings FOR SELECT USING (true);
CREATE POLICY "Credit Listings INSERT Policy" ON credit_listings FOR INSERT 
    WITH CHECK (public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));
CREATE POLICY "Credit Listings UPDATE Policy" ON credit_listings FOR UPDATE 
    USING (public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));

-- CREDIT_OWNERSHIP
DROP POLICY IF EXISTS "Users can view their own ownership" ON credit_ownership;
DROP POLICY IF EXISTS "Users can insert their own ownership" ON credit_ownership;
DROP POLICY IF EXISTS "Credit Ownership SELECT Policy" ON credit_ownership;
DROP POLICY IF EXISTS "Credit Ownership INSERT Policy" ON credit_ownership;
DROP POLICY IF EXISTS "Credit Ownership UPDATE Policy" ON credit_ownership;

CREATE POLICY "Credit Ownership SELECT Policy" ON credit_ownership FOR SELECT 
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));
CREATE POLICY "Credit Ownership INSERT Policy" ON credit_ownership FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));
CREATE POLICY "Credit Ownership UPDATE Policy" ON credit_ownership FOR UPDATE 
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));

-- CREDIT_PURCHASES
DROP POLICY IF EXISTS "Users can view their own purchases" ON credit_purchases;
DROP POLICY IF EXISTS "Credit Purchases SELECT Policy" ON credit_purchases;
DROP POLICY IF EXISTS "Credit Purchases INSERT Policy" ON credit_purchases;

CREATE POLICY "Credit Purchases SELECT Policy" ON credit_purchases FOR SELECT 
    USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));
CREATE POLICY "Credit Purchases INSERT Policy" ON credit_purchases FOR INSERT 
    WITH CHECK (buyer_id = auth.uid() OR public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));

-- CREDIT_TRANSACTIONS
DROP POLICY IF EXISTS "Users can view their own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Credit Transactions SELECT Policy" ON credit_transactions;
DROP POLICY IF EXISTS "Credit Transactions INSERT Policy" ON credit_transactions;

CREATE POLICY "Credit Transactions SELECT Policy" ON credit_transactions FOR SELECT 
    USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));
CREATE POLICY "Credit Transactions INSERT Policy" ON credit_transactions FOR INSERT 
    WITH CHECK (buyer_id = auth.uid() OR public.is_admin(auth.uid()) OR public.is_verifier(auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 4: WALLET POLICIES (CRITICAL FOR PURCHASES)
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own wallet" ON wallet_accounts;
DROP POLICY IF EXISTS "Users can view their own wallet" ON wallet_transactions;
DROP POLICY IF EXISTS "Wallet Accounts SELECT Policy" ON wallet_accounts;
DROP POLICY IF EXISTS "Wallet Accounts INSERT Policy" ON wallet_accounts;
DROP POLICY IF EXISTS "Wallet Accounts UPDATE Policy" ON wallet_accounts;
DROP POLICY IF EXISTS "Wallet Transactions SELECT Policy" ON wallet_transactions;
DROP POLICY IF EXISTS "Wallet Transactions INSERT Policy" ON wallet_transactions;
DROP POLICY IF EXISTS "Wallet Transactions UPDATE Policy" ON wallet_transactions;

-- Wallet Accounts
CREATE POLICY "Wallet Accounts SELECT Policy" ON wallet_accounts FOR SELECT 
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Wallet Accounts INSERT Policy" ON wallet_accounts FOR INSERT 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Wallet Accounts UPDATE Policy" ON wallet_accounts FOR UPDATE 
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Wallet Transactions (accounts for both user_id and account_id schemas)
CREATE POLICY "Wallet Transactions SELECT Policy" ON wallet_transactions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.wallet_accounts wa 
            WHERE wa.id = account_id 
            AND wa.user_id = (SELECT auth.uid())
        ) 
        OR public.is_admin((SELECT auth.uid()))
    );

CREATE POLICY "Wallet Transactions INSERT Policy" ON wallet_transactions FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.wallet_accounts wa 
            WHERE wa.id = account_id 
            AND wa.user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "Wallet Transactions UPDATE Policy" ON wallet_transactions FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.wallet_accounts wa 
            WHERE wa.id = account_id 
            AND wa.user_id = (SELECT auth.uid())
        ) 
        OR public.is_admin((SELECT auth.uid()))
    );

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════

SELECT '✅ is_verifier function created' AS status;

SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('projects', 'credit_listings', 'wallet_accounts', 'wallet_transactions')
ORDER BY tablename, policyname;

SELECT '🎉 All migration steps completed successfully!' AS result;

