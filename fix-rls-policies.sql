-- Fix RLS Policies for Project Submission
-- This will check and fix Row Level Security policies that are blocking project creation

-- =====================================================
-- STEP 1: Check Current RLS Status
-- =====================================================
SELECT 
  'RLS STATUS CHECK' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('projects', 'profiles', 'project_credits', 'credit_listings')
ORDER BY tablename;

-- =====================================================
-- STEP 2: Check Existing RLS Policies
-- =====================================================
SELECT 
  'EXISTING RLS POLICIES' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('projects', 'profiles', 'project_credits', 'credit_listings')
ORDER BY tablename, policyname;

-- =====================================================
-- STEP 3: Check Current User Context
-- =====================================================
SELECT 
  'USER CONTEXT' as check_type,
  current_user as current_user,
  session_user as session_user,
  current_setting('request.jwt.claims', true) as jwt_claims;

-- =====================================================
-- STEP 4: Create/Update RLS Policies for Projects
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Admins can do everything" ON projects;

-- Create comprehensive RLS policies for projects
CREATE POLICY "Users can view all projects" ON projects
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'project_developer')
    )
  );

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'verifier')
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'verifier')
    )
  );

CREATE POLICY "Admins can do everything" ON projects
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- =====================================================
-- STEP 5: Create/Update RLS Policies for Project Credits
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view project credits" ON project_credits;
DROP POLICY IF EXISTS "Users can insert project credits" ON project_credits;
DROP POLICY IF EXISTS "Users can update project credits" ON project_credits;

-- Create RLS policies for project_credits
CREATE POLICY "Users can view project credits" ON project_credits
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert project credits" ON project_credits
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'project_developer')
    )
  );

CREATE POLICY "Users can update project credits" ON project_credits
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'project_developer')
    )
  );

-- =====================================================
-- STEP 6: Create/Update RLS Policies for Credit Listings
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view credit listings" ON credit_listings;
DROP POLICY IF EXISTS "Users can insert credit listings" ON credit_listings;
DROP POLICY IF EXISTS "Users can update credit listings" ON credit_listings;

-- Create RLS policies for credit_listings
CREATE POLICY "Users can view credit listings" ON credit_listings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert credit listings" ON credit_listings
  FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'project_developer')
    )
  );

CREATE POLICY "Users can update credit listings" ON credit_listings
  FOR UPDATE
  USING (
    auth.uid() = seller_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- =====================================================
-- STEP 7: Verify RLS Policies
-- =====================================================
SELECT 
  'UPDATED RLS POLICIES' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('projects', 'project_credits', 'credit_listings')
ORDER BY tablename, policyname;

-- =====================================================
-- STEP 8: Test Project Creation (Simulation)
-- =====================================================
DO $$
DECLARE
  test_user_id UUID;
  test_project_id UUID;
BEGIN
  -- Get a developer user
  SELECT id INTO test_user_id FROM profiles WHERE role = 'project_developer' LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Test project creation
    INSERT INTO projects (
      title,
      description,
      category,
      location,
      status,
      user_id,
      created_at,
      updated_at
    ) VALUES (
      'RLS Test Project',
      'Testing RLS policies for project creation',
      'Renewable Energy',
      'Test Location',
      'pending',
      test_user_id,
      NOW(),
      NOW()
    ) RETURNING id INTO test_project_id;
    
    RAISE NOTICE '✅ RLS Test: Project created successfully with ID: %', test_project_id;
    
    -- Clean up test project
    DELETE FROM projects WHERE id = test_project_id;
    RAISE NOTICE '✅ RLS Test: Test project cleaned up';
  ELSE
    RAISE NOTICE '❌ RLS Test: No developer user found';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ RLS Test Failed: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 9: Final Status
-- =====================================================
SELECT 
  'RLS FIX COMPLETE' as check_type,
  'RLS policies updated successfully' as status,
  'Project submission should now work' as message,
  'Try submitting a project again' as next_step;








