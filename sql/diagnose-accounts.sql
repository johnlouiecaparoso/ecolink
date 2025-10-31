-- Account Diagnosis Script
-- This will show us exactly what's in your database

-- =====================================================
-- STEP 1: Check if accounts exist in auth.users
-- =====================================================
SELECT 
  'AUTH USERS' as check_type,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email IN (
  'admin@ecolink.test',
  'developer@ecolink.test', 
  'verifier@ecolink.test',
  'user@ecolink.test'
)
ORDER BY email;

-- =====================================================
-- STEP 2: Check if profiles exist
-- =====================================================
SELECT 
  'PROFILES' as check_type,
  id,
  full_name,
  role,
  created_at
FROM profiles 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN (
    'admin@ecolink.test',
    'developer@ecolink.test', 
    'verifier@ecolink.test',
    'user@ecolink.test'
  )
)
ORDER BY role;

-- =====================================================
-- STEP 3: Check all users in auth.users (to see what exists)
-- =====================================================
SELECT 
  'ALL AUTH USERS' as check_type,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- STEP 4: Check all profiles (to see what exists)
-- =====================================================
SELECT 
  'ALL PROFILES' as check_type,
  full_name,
  role,
  created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 10;








