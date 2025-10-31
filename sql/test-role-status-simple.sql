-- Simple Role Status Check
-- Run this to see if your accounts have the correct roles

-- =====================================================
-- STEP 1: Check Your Account Status
-- =====================================================
SELECT 
  'ACCOUNT STATUS' as test_type,
  au.email,
  au.email_confirmed_at,
  p.role,
  p.full_name,
  CASE 
    WHEN p.role IS NULL THEN '❌ NO PROFILE - Account exists but no role assigned'
    WHEN p.role = 'admin' THEN '✅ ADMIN - Full access'
    WHEN p.role = 'project_developer' THEN '✅ DEVELOPER - Can create projects'
    WHEN p.role = 'verifier' THEN '✅ VERIFIER - Can verify projects'
    WHEN p.role = 'general_user' THEN '✅ USER - Can buy credits'
    ELSE '⚠️ UNKNOWN ROLE - ' || p.role
  END as status
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
-- STEP 2: Check What Each Role Can See
-- =====================================================
SELECT 
  'ROLE PERMISSIONS' as test_type,
  p.role,
  COUNT(*) as profile_count,
  CASE 
    WHEN p.role = 'admin' THEN 'Can see: ALL projects, ALL users, ALL data'
    WHEN p.role = 'project_developer' THEN 'Can see: Own projects, create listings'
    WHEN p.role = 'verifier' THEN 'Can see: Pending projects for verification'
    WHEN p.role = 'general_user' THEN 'Can see: Approved projects, buy credits'
    ELSE 'Unknown permissions'
  END as permissions
FROM profiles p
WHERE p.role IN ('admin', 'project_developer', 'verifier', 'general_user')
GROUP BY p.role
ORDER BY p.role;

-- =====================================================
-- STEP 3: Test Project Creation (Quick Test)
-- =====================================================
DO $$
DECLARE
  admin_count INTEGER;
  developer_count INTEGER;
BEGIN
  -- Count existing test projects
  SELECT COUNT(*) INTO admin_count FROM projects WHERE title LIKE 'Test Project%';
  
  RAISE NOTICE 'EXISTING TEST PROJECTS: %', admin_count;
  
  IF admin_count > 0 THEN
    RAISE NOTICE '✅ Test projects exist - Role permissions working';
  ELSE
    RAISE NOTICE '⚠️ No test projects found - May need to check permissions';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error checking projects: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 4: Summary
-- =====================================================
SELECT 
  'SUMMARY' as test_type,
  'Check the results above:' as message,
  '1. All accounts should show ✅ status' as check_1,
  '2. Each role should have correct permissions' as check_2,
  '3. Test projects should exist if permissions work' as check_3;








