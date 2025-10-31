-- Fix RLS policies to allow admin access to view all data
-- This file adds admin-specific policies for profiles, projects, and related tables

-- Helper function to check if user is admin
-- This function bypasses RLS using SECURITY DEFINER to avoid circular dependencies
-- Using SQL language instead of plpgsql for better compatibility

-- Note: We use CREATE OR REPLACE instead of DROP
-- DROP would fail if RLS policies depend on it
-- DROP FUNCTION IF EXISTS public.is_admin(UUID);  -- Commented out

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND role IN ('admin', 'super_admin', 'Administrator', 'Admin')
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;

-- Verify function was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'is_admin'
  ) THEN
    RAISE NOTICE '✅ is_admin function created successfully';
  ELSE
    RAISE WARNING '❌ Failed to create is_admin function';
  END IF;
END $$;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILES TABLE - Admin Access
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id  -- Users can view their own
    OR 
    public.is_admin(auth.uid())  -- Admins can view all
  );

-- Admin can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    auth.uid() = id  -- Users can update their own
    OR 
    public.is_admin(auth.uid())  -- Admins can update all
  );

-- ============================================
-- PROJECTS TABLE - Admin Access
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Admins can update all projects" ON projects;
DROP POLICY IF EXISTS "Anyone can view active projects" ON projects;

-- Anyone can view approved projects (for marketplace)
CREATE POLICY "Anyone can view approved projects" ON projects
  FOR SELECT USING (status = 'approved');

-- Users can view their own projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all projects
CREATE POLICY "Admins can view all projects" ON projects
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Admins can update all projects
CREATE POLICY "Admins can update all projects" ON projects
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- ============================================
-- PROJECT_CREDITS TABLE - Admin Access
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all project credits" ON project_credits;

-- Users can view their own project credits
CREATE POLICY "Users can view own project credits" ON project_credits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_credits.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Admins can view all project credits
CREATE POLICY "Admins can view all project credits" ON project_credits
  FOR SELECT USING (public.is_admin(auth.uid()));

-- ============================================
-- CREDIT_TRANSACTIONS TABLE - Admin Access
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all credit transactions" ON credit_transactions;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (
    buyer_id = auth.uid()
    OR seller_id = auth.uid()
  );

-- Admins can view all transactions
CREATE POLICY "Admins can view all credit transactions" ON credit_transactions
  FOR SELECT USING (public.is_admin(auth.uid()));

-- ============================================
-- CREDIT_OWNERSHIP TABLE - Admin Access
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all credit ownership" ON credit_ownership;

-- Users can view their own credit ownership
CREATE POLICY "Users can view own credit ownership" ON credit_ownership
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all credit ownership
CREATE POLICY "Admins can view all credit ownership" ON credit_ownership
  FOR SELECT USING (public.is_admin(auth.uid()));

-- ============================================
-- CREDIT_LISTINGS TABLE - Admin Access
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all credit listings" ON credit_listings;

-- Anyone can view active listings (for marketplace)
CREATE POLICY "Anyone can view active listings" ON credit_listings
  FOR SELECT USING (status = 'active');

-- Users can view their own listings
CREATE POLICY "Users can view own listings" ON credit_listings
  FOR SELECT USING (seller_id = auth.uid());

-- Admins can view all listings
CREATE POLICY "Admins can view all credit listings" ON credit_listings
  FOR SELECT USING (public.is_admin(auth.uid()));

-- ============================================
-- Verify the policies were created
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'projects', 'project_credits', 'credit_transactions', 'credit_ownership', 'credit_listings')
ORDER BY tablename, policyname;

-- Success message
SELECT 'Admin RLS policies created successfully!' as status;

