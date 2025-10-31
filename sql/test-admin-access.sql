-- Quick test to verify admin access is working
-- ⚠️ IMPORTANT: Run create-is-admin-function-only.sql FIRST!
-- Then run this file to test if everything is working

-- ============================================
-- 1. Check if is_admin function exists
-- ============================================
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
      AND p.proname = 'is_admin'
    ) THEN '✅ is_admin function EXISTS'
    ELSE '❌ is_admin function MISSING - Run fix-admin-rls-policies.sql'
  END as function_check;

-- ============================================
-- 2. Check what roles exist in your database
-- ============================================
SELECT 
  'Roles in database' as info,
  role,
  COUNT(*) as user_count
FROM profiles
GROUP BY role
ORDER BY user_count DESC;

-- ============================================
-- 3. Test is_admin function for your current user
-- ============================================
-- First check if function exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'is_admin'
  ) THEN
    -- Function exists, test it
    PERFORM 1; -- Placeholder, actual check below
  ELSE
    RAISE NOTICE '⚠️ is_admin function does not exist. Run fix-admin-rls-policies.sql first!';
  END IF;
END $$;

-- Now try to use the function (only works if it exists)
SELECT 
  auth.uid() as current_user_id,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'is_admin'
    ) THEN public.is_admin(auth.uid())
    ELSE NULL
  END as is_admin_result,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'is_admin'
    ) THEN '❌ Function does not exist - run fix-admin-rls-policies.sql'
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'is_admin'
    ) AND public.is_admin(auth.uid()) THEN '✅ You ARE recognized as admin'
    ELSE '❌ You are NOT recognized as admin'
  END as admin_status;

-- ============================================
-- 4. Check your current user's role
-- ============================================
SELECT 
  p.id,
  p.role as actual_role,
  au.email,
  CASE 
    WHEN p.role IN ('admin', 'super_admin', 'Administrator', 'Admin') THEN '✅ Should be admin'
    ELSE '⚠️ Role might not match admin check'
  END as role_match
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.id = auth.uid();

-- ============================================
-- 5. Check if admin RLS policies exist
-- ============================================
SELECT 
  tablename,
  policyname,
  CASE 
    WHEN policyname LIKE '%Admin%' THEN '✅ Admin policy found'
    ELSE 'Other policy'
  END as policy_type
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'projects', 'project_credits')
  AND policyname LIKE '%Admin%'
ORDER BY tablename, policyname;

-- ============================================
-- 6. Test querying profiles as current user
-- ============================================
-- This should return all profiles if you're admin and RLS is set up correctly
SELECT 
  'Profile access test' as test_name,
  COUNT(*) as accessible_profiles,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Can access profiles'
    ELSE '❌ Cannot access profiles - RLS is blocking'
  END as access_status
FROM profiles;

-- If this shows 0 profiles but you have users, RLS policies are blocking access

