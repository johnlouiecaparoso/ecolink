-- This SQL file helps you verify the actual user count in your Supabase database
-- Run this in your Supabase SQL Editor to see the real data

-- ============================================
-- 1. COUNT USERS FROM AUTH.USERS (Real user accounts)
-- ============================================
SELECT 
  'Total Auth Users' as description,
  COUNT(*) as count
FROM auth.users;

-- ============================================
-- 2. COUNT USERS FROM PROFILES TABLE
-- ============================================
SELECT 
  'Total Profiles' as description,
  COUNT(*) as count
FROM profiles;

-- ============================================
-- 3. DETAILED USER BREAKDOWN
-- ============================================
SELECT 
  p.role,
  COUNT(*) as user_count
FROM profiles p
GROUP BY p.role
ORDER BY user_count DESC;

-- ============================================
-- 4. USERS WITH EMAILS (Detailed view)
-- ============================================
SELECT 
  p.id,
  p.full_name,
  p.role,
  au.email,
  au.email_confirmed_at,
  p.created_at as profile_created,
  au.created_at as auth_created
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC
LIMIT 20;

-- ============================================
-- 5. CHECK FOR MISSING PROFILES
-- ============================================
-- Users in auth.users but not in profiles
SELECT 
  'Missing Profiles' as description,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- ============================================
-- 6. CHECK RLS POLICIES ON PROFILES
-- ============================================
SELECT 
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
  AND tablename = 'profiles'
ORDER BY policyname;

-- ============================================
-- 7. TEST ADMIN ACCESS (Run as admin user)
-- ============================================
-- This should return all profiles if you're admin and RLS is set up correctly
SELECT 
  'Admin Profile Access Test' as test_name,
  COUNT(*) as accessible_profiles
FROM profiles;

-- If this returns 0 when you have 5 users, the RLS policies are blocking admin access
-- You need to run fix-admin-rls-policies.sql

-- ============================================
-- 8. VERIFY ADMIN ROLE CHECK FUNCTION
-- ============================================
-- Check if is_admin function exists and works
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
      AND p.proname = 'is_admin'
    ) THEN '✅ is_admin function exists'
    ELSE '❌ is_admin function MISSING - Run fix-admin-rls-policies.sql'
  END as function_status;

-- ============================================
-- 9. CURRENT USER INFO (if logged in)
-- ============================================
-- This shows your current authenticated user's profile
SELECT 
  p.id,
  p.full_name,
  p.role,
  CASE 
    WHEN p.role IN ('admin', 'super_admin') THEN '✅ Is Admin'
    ELSE '❌ Not Admin'
  END as admin_status,
  au.email
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.id = auth.uid();  -- Current logged-in user

-- ============================================
-- SUMMARY
-- ============================================
-- If you see:
-- 1. auth.users COUNT = 5 ✅
-- 2. profiles COUNT = 0 ❌ → Profiles table is empty or RLS is blocking
-- 3. profiles COUNT = 5 ✅ → Profiles table has data
-- 4. Admin access test = 0 ❌ → Need to fix RLS policies
-- 5. Admin access test = 5 ✅ → RLS policies are correct





