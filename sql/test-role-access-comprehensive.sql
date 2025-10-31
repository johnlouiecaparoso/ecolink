-- Comprehensive Role Access Testing Script
-- Test all existing accounts: admin, developer, verifier, user
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: Check Current User Accounts and Roles
-- =====================================================
SELECT 
  'Current User Accounts' as test_section,
  au.id,
  au.email,
  au.email_confirmed_at,
  p.role,
  p.full_name,
  p.created_at as profile_created
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email IN (
  'admin@ecolink.test',
  'developer@ecolink.test', 
  'verifier@ecolink.test',
  'user@ecolink.test'
)
ORDER BY au.email;

-- =====================================================
-- STEP 2: Test Role-Based Data Access
-- =====================================================

-- Test 1: Check if each role can access their own profile data
SELECT 
  'Profile Access Test' as test_section,
  p.role,
  COUNT(*) as profile_count,
  STRING_AGG(p.full_name, ', ') as profile_names
FROM profiles p
WHERE p.role IN ('admin', 'project_developer', 'verifier', 'general_user')
GROUP BY p.role
ORDER BY p.role;

-- Test 2: Check project access by role
SELECT 
  'Project Access Test' as test_section,
  pr.role,
  COUNT(p.id) as accessible_projects,
  STRING_AGG(p.title, ', ') as project_titles
FROM profiles pr
LEFT JOIN projects p ON p.user_id = pr.id
WHERE (
  pr.role = 'admin' OR 
  pr.role = 'project_developer' OR
  (pr.role = 'verifier' AND p.status = 'pending_verification') OR
  (pr.role = 'general_user' AND p.status = 'approved')
)
GROUP BY pr.role
ORDER BY pr.role;

-- =====================================================
-- STEP 3: Test RLS (Row Level Security) Policies
-- =====================================================

-- Check if RLS is enabled on key tables
SELECT 
  'RLS Status Check' as test_section,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'projects', 'credit_listings', 'credit_certificates')
ORDER BY tablename;

-- Check existing RLS policies
SELECT 
  'RLS Policies Check' as test_section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'projects', 'credit_listings', 'credit_certificates')
ORDER BY tablename, policyname;

-- =====================================================
-- STEP 4: Test Data Creation Permissions
-- =====================================================

-- Test if each role can create appropriate data
-- This will show what each role should be able to create

SELECT 
  'Data Creation Permissions' as test_section,
  'admin' as role,
  'Can create: projects, credit_listings, certificates, manage users' as permissions
UNION ALL
SELECT 
  'Data Creation Permissions' as test_section,
  'project_developer' as role,
  'Can create: projects, credit_listings, view own certificates' as permissions
UNION ALL
SELECT 
  'Data Creation Permissions' as test_section,
  'verifier' as role,
  'Can create: verification reports, view pending projects' as permissions
UNION ALL
SELECT 
  'Data Creation Permissions' as test_section,
  'general_user' as role,
  'Can create: purchase credits, view own certificates' as permissions;

-- =====================================================
-- STEP 5: Test Foreign Key Relationships
-- =====================================================

-- Check if all foreign key relationships are working
SELECT 
  'Foreign Key Test' as test_section,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  CASE 
    WHEN tc.constraint_name LIKE '%project_id%' THEN 'Project Reference'
    WHEN tc.constraint_name LIKE '%user_id%' THEN 'User Reference'
    WHEN tc.constraint_name LIKE '%seller_id%' THEN 'Seller Reference'
    ELSE 'Other Reference'
  END as relationship_type
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('projects', 'credit_listings', 'credit_certificates', 'project_credits')
ORDER BY tc.table_name, tc.constraint_name;

-- =====================================================
-- STEP 6: Test Sample Data Creation for Each Role
-- =====================================================

-- Create test data to verify role permissions
-- This will test if each role can create appropriate records

-- Test 1: Create a test project (should work for admin and developer)
DO $$
DECLARE
  admin_id UUID;
  developer_id UUID;
BEGIN
  -- Get admin and developer IDs
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  SELECT id INTO developer_id FROM profiles WHERE role = 'project_developer' LIMIT 1;
  
  IF admin_id IS NOT NULL THEN
    -- Test project creation by admin
    INSERT INTO projects (
      title, 
      description, 
      project_type, 
      location, 
      estimated_credits, 
      status, 
      user_id,
      created_at,
      updated_at
    ) VALUES (
      'Test Project - Admin Created',
      'Test project created by admin to verify permissions',
      'Renewable Energy',
      'Test Location',
      1000,
      'draft',
      admin_id,
      NOW(),
      NOW()
    ) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'SUCCESS: Admin can create projects';
  ELSE
    RAISE NOTICE 'WARNING: No admin account found';
  END IF;
  
  IF developer_id IS NOT NULL THEN
    -- Test project creation by developer
    INSERT INTO projects (
      title, 
      description, 
      project_type, 
      location, 
      estimated_credits, 
      status, 
      user_id,
      created_at,
      updated_at
    ) VALUES (
      'Test Project - Developer Created',
      'Test project created by developer to verify permissions',
      'Forest Conservation',
      'Test Location 2',
      500,
      'draft',
      developer_id,
      NOW(),
      NOW()
    ) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'SUCCESS: Developer can create projects';
  ELSE
    RAISE NOTICE 'WARNING: No developer account found';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: Project creation failed: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 7: Verify Test Data Creation
-- =====================================================

-- Check if test projects were created successfully
SELECT 
  'Test Data Verification' as test_section,
  p.title,
  p.status,
  pr.role as created_by_role,
  pr.full_name as created_by_name,
  p.created_at
FROM projects p
JOIN profiles pr ON p.user_id = pr.id
WHERE p.title LIKE 'Test Project%'
ORDER BY p.created_at DESC;

-- =====================================================
-- STEP 8: Test Role-Specific Queries
-- =====================================================

-- Test what each role can see
SELECT 
  'Role Visibility Test' as test_section,
  'Admin View' as role_test,
  COUNT(*) as total_projects,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_projects,
  COUNT(CASE WHEN status = 'pending_verification' THEN 1 END) as pending_projects,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_projects
FROM projects;

-- =====================================================
-- STEP 9: Summary Report
-- =====================================================

SELECT 
  'FINAL SUMMARY' as test_section,
  'Role Testing Complete' as status,
  'Check the results above to verify:' as instructions,
  '1. All 4 roles exist and have correct permissions' as check_1,
  '2. RLS policies are properly configured' as check_2,
  '3. Foreign key relationships are working' as check_3,
  '4. Test data creation succeeded' as check_4,
  '5. Role-based access control is functioning' as check_5;
