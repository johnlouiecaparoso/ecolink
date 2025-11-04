-- SQL Script to Add Verifier RLS Policies to Existing Database
-- Run this in Supabase SQL Editor to fix authentication issues for verifiers

-- ───────────────────────────────────────────────────────────────
-- ADD VERIFIER HELPER FUNCTION
-- ───────────────────────────────────────────────────────────────

-- Helper function to check if user is verifier
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

-- ───────────────────────────────────────────────────────────────
-- ADD VERIFIER POLICIES FOR PROJECTS
-- ───────────────────────────────────────────────────────────────

-- Verifiers can view pending projects
DROP POLICY IF EXISTS "Verifiers can view pending projects" ON projects;
CREATE POLICY "Verifiers can view pending projects" ON projects
    FOR SELECT USING (public.is_verifier(auth.uid()));

-- Verifiers can update project status for approval/rejection
DROP POLICY IF EXISTS "Verifiers can update project status" ON projects;
CREATE POLICY "Verifiers can update project status" ON projects
    FOR UPDATE USING (public.is_verifier(auth.uid()));

-- ───────────────────────────────────────────────────────────────
-- ADD VERIFIER POLICIES FOR PROJECT_CREDITS
-- ───────────────────────────────────────────────────────────────

-- Verifiers can view all project credits
DROP POLICY IF EXISTS "Verifiers can view project credits" ON project_credits;
CREATE POLICY "Verifiers can view project credits" ON project_credits
    FOR SELECT USING (public.is_verifier(auth.uid()));

-- Verifiers can create project credits when approving projects
DROP POLICY IF EXISTS "Verifiers can create project credits" ON project_credits;
CREATE POLICY "Verifiers can create project credits" ON project_credits
    FOR INSERT WITH CHECK (public.is_verifier(auth.uid()));

-- ───────────────────────────────────────────────────────────────
-- ADD VERIFIER POLICIES FOR CREDIT_LISTINGS
-- ───────────────────────────────────────────────────────────────

-- Verifiers can view all credit listings
DROP POLICY IF EXISTS "Verifiers can view credit listings" ON credit_listings;
CREATE POLICY "Verifiers can view credit listings" ON credit_listings
    FOR SELECT USING (public.is_verifier(auth.uid()));

-- Verifiers can create marketplace listings when approving projects
DROP POLICY IF EXISTS "Verifiers can create credit listings" ON credit_listings;
CREATE POLICY "Verifiers can create credit listings" ON credit_listings
    FOR INSERT WITH CHECK (public.is_verifier(auth.uid()));

-- ───────────────────────────────────────────────────────────────
-- VERIFICATION
-- ───────────────────────────────────────────────────────────────

-- Verify the function was created
SELECT 'is_verifier function created successfully' AS status;

-- Verify policies were created
SELECT 
    schemaname, 
    tablename, 
    policyname 
FROM pg_policies 
WHERE tablename IN ('projects', 'project_credits', 'credit_listings')
AND policyname LIKE '%verifier%'
ORDER BY tablename, policyname;


