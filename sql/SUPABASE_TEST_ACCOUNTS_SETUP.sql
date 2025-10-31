-- EcoLink Test Accounts Setup for Supabase
-- Run these queries in your Supabase SQL Editor to create test accounts with proper roles

-- IMPORTANT: Run these queries in order!

-- =====================================================
-- STEP 1: Create the test users in Supabase Auth
-- =====================================================
-- You need to create these users in Supabase Auth Dashboard first:
-- Go to Authentication > Users > Add User

-- User 1 (Admin):
-- Email: admin@ecolink.test
-- Password: admin123
-- Email Confirmed: YES

-- User 2 (Verifier):
-- Email: verifier@ecolink.test
-- Password: verifier123
-- Email Confirmed: YES

-- User 3 (General User):
-- Email: user@ecolink.test
-- Password: user123
-- Email Confirmed: YES

-- =====================================================
-- STEP 2: Check your current profiles table structure
-- =====================================================
-- Run this first to see what columns your profiles table actually has
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- STEP 3: Get the User IDs (Run this query after creating users)
-- =====================================================
-- This query will show you the UUIDs of your test users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email IN (
  'admin@ecolink.test',
  'verifier@ecolink.test', 
  'user@ecolink.test'
)
ORDER BY email;

-- =====================================================
-- STEP 4: Create/Update Profiles with Roles
-- =====================================================
-- OPTION A: If your profiles table has an 'email' column (run Step 2 to check)
-- INSERT INTO profiles (id, full_name, email, role, created_at, updated_at)
-- SELECT 
--   au.id,
--   CASE 
--     WHEN au.email = 'admin@ecolink.test' THEN 'Admin User'
--     WHEN au.email = 'verifier@ecolink.test' THEN 'Verifier User'
--     WHEN au.email = 'user@ecolink.test' THEN 'General User'
--   END as full_name,
--   au.email,
--   CASE 
--     WHEN au.email = 'admin@ecolink.test' THEN 'admin'
--     WHEN au.email = 'verifier@ecolink.test' THEN 'verifier'
--     WHEN au.email = 'user@ecolink.test' THEN 'user'
--   END as role,
--   NOW() as created_at,
--   NOW() as updated_at
-- FROM auth.users au
-- WHERE au.email IN ('admin@ecolink.test', 'verifier@ecolink.test', 'user@ecolink.test')
-- ON CONFLICT (id) DO UPDATE SET
--   full_name = EXCLUDED.full_name,
--   email = EXCLUDED.email,
--   role = EXCLUDED.role,
--   updated_at = NOW();

-- OPTION B: If your profiles table does NOT have an 'email' column (RECOMMENDED - try this first)
-- This works with the standard profiles schema (id, full_name, role, created_at, updated_at)
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
SELECT 
  au.id,
  CASE 
    WHEN au.email = 'admin@ecolink.test' THEN 'Admin User'
    WHEN au.email = 'verifier@ecolink.test' THEN 'Verifier User'
    WHEN au.email = 'user@ecolink.test' THEN 'General User'
  END as full_name,
  CASE 
    WHEN au.email = 'admin@ecolink.test' THEN 'admin'
    WHEN au.email = 'verifier@ecolink.test' THEN 'verifier'
    WHEN au.email = 'user@ecolink.test' THEN 'user'
  END as role,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
WHERE au.email IN ('admin@ecolink.test', 'verifier@ecolink.test', 'user@ecolink.test')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- =====================================================
-- STEP 5: Verify the test accounts were created correctly
-- =====================================================
-- OPTION A: If your profiles table has an 'email' column
-- SELECT 
--   p.id,
--   p.full_name,
--   p.email,
--   p.role,
--   au.email_confirmed_at,
--   p.created_at,
--   p.updated_at
-- FROM profiles p
-- JOIN auth.users au ON p.id = au.id
-- WHERE p.email IN (
--   'admin@ecolink.test',
--   'verifier@ecolink.test',
--   'user@ecolink.test'
-- )
-- ORDER BY 
--   CASE p.role
--     WHEN 'admin' THEN 1
--     WHEN 'verifier' THEN 2
--     WHEN 'user' THEN 3
--     ELSE 4
--   END;

-- OPTION B: If your profiles table does NOT have an 'email' column (RECOMMENDED)
-- This query will show all test accounts with their roles
SELECT 
  p.id,
  p.full_name,
  au.email,
  p.role,
  au.email_confirmed_at,
  p.created_at,
  p.updated_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email IN (
  'admin@ecolink.test',
  'verifier@ecolink.test',
  'user@ecolink.test'
)
ORDER BY 
  CASE p.role
    WHEN 'admin' THEN 1
    WHEN 'verifier' THEN 2
    WHEN 'user' THEN 3
    ELSE 4
  END;

-- =====================================================
-- STEP 5: Test Role-Based Access (Optional)
-- =====================================================
-- These queries help you verify role-based functionality

-- Check admin users
SELECT * FROM profiles WHERE role = 'admin';

-- Check verifier users  
SELECT * FROM profiles WHERE role = 'verifier';

-- Check general users
SELECT * FROM profiles WHERE role = 'user';

-- Get user role by email (useful for testing)
SELECT 
  au.email,
  p.role,
  p.full_name,
  CASE p.role
    WHEN 'admin' THEN 'Full system access'
    WHEN 'verifier' THEN 'Project verification access'
    WHEN 'user' THEN 'Standard user access'
    ELSE 'Unknown role'
  END as access_level
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email = 'admin@ecolink.test'; -- Change email to test different accounts

-- =====================================================
-- STEP 6: Create Sample Data for Testing (Optional)
-- =====================================================
-- Add some sample projects and credits for testing different role functionalities

-- Sample projects (if not already exist)
INSERT INTO projects (title, description, category, location, status) VALUES
('Test Admin Project', 'Project for admin testing', 'Renewable Energy', 'Test Location', 'active'),
('Test Verifier Project', 'Project for verifier testing', 'Forestry', 'Test Location', 'pending'),
('Test User Project', 'Project for user testing', 'Blue Carbon', 'Test Location', 'active')
ON CONFLICT DO NOTHING;

-- =====================================================
-- TROUBLESHOOTING QUERIES
-- =====================================================

-- If you need to delete test accounts and start over:
-- DELETE FROM profiles WHERE id IN (
--   SELECT au.id FROM auth.users au 
--   WHERE au.email IN ('admin@ecolink.test', 'verifier@ecolink.test', 'user@ecolink.test')
-- );

-- If you need to update just the roles:
-- UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@ecolink.test');
-- UPDATE profiles SET role = 'verifier' WHERE id = (SELECT id FROM auth.users WHERE email = 'verifier@ecolink.test');  
-- UPDATE profiles SET role = 'user' WHERE id = (SELECT id FROM auth.users WHERE email = 'user@ecolink.test');

-- Check if users exist in auth.users but not in profiles:
-- SELECT au.id, au.email 
-- FROM auth.users au 
-- LEFT JOIN profiles p ON au.id = p.id 
-- WHERE au.email IN ('admin@ecolink.test', 'verifier@ecolink.test', 'user@ecolink.test')
-- AND p.id IS NULL;
