-- Test Accounts Setup for Existing Users
-- This version only creates profiles and wallets for existing auth users
-- Run this in Supabase SQL Editor

-- First, check what users already exist
SELECT 'Checking existing users...' as step;

SELECT 
  emails.email, 
  CASE WHEN au.id IS NOT NULL THEN 'EXISTS' ELSE 'NOT FOUND' END as status,
  au.id
FROM (
  VALUES 
    ('admin@ecolink.test'),
    ('verifier@ecolink.test'),
    ('user@ecolink.test'),
    ('developer@ecolink.test')
) AS emails(email)
LEFT JOIN auth.users au ON lower(au.email) = lower(emails.email);

-- Create profiles for existing users only
-- This will work even if some users don't exist
INSERT INTO profiles (id, full_name, email, role, kyc_level, created_at, updated_at)
SELECT 
  u.id,
  CASE u.email
    WHEN 'admin@ecolink.test' THEN 'Admin User'
    WHEN 'verifier@ecolink.test' THEN 'Verifier User'
    WHEN 'user@ecolink.test' THEN 'General User'
    WHEN 'developer@ecolink.test' THEN 'Project Developer'
  END,
  u.email,
  CASE u.email
    WHEN 'admin@ecolink.test' THEN 'admin'
    WHEN 'verifier@ecolink.test' THEN 'verifier'
    WHEN 'user@ecolink.test' THEN 'general_user'
    WHEN 'developer@ecolink.test' THEN 'project_developer'
  END,
  CASE u.email
    WHEN 'admin@ecolink.test' THEN 3
    WHEN 'verifier@ecolink.test' THEN 2
    WHEN 'user@ecolink.test' THEN 0
    WHEN 'developer@ecolink.test' THEN 1
  END,
  NOW(), NOW()
FROM auth.users u
WHERE lower(u.email) IN (
  'admin@ecolink.test',
  'verifier@ecolink.test',
  'user@ecolink.test',
  'developer@ecolink.test'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  kyc_level = EXCLUDED.kyc_level,
  updated_at = NOW();

-- Create wallets for existing users only
INSERT INTO wallets (user_id, balance, currency, created_at, updated_at)
SELECT 
  u.id,
  1000.00,
  'USD',
  NOW(),
  NOW()
FROM auth.users u
WHERE lower(u.email) IN (
  'admin@ecolink.test',
  'verifier@ecolink.test',
  'user@ecolink.test',
  'developer@ecolink.test'
)
ON CONFLICT (user_id) DO UPDATE SET
  balance = EXCLUDED.balance,
  updated_at = NOW();

-- Show results
SELECT 'Profiles and wallets created for existing users:' as status;

SELECT 
  p.full_name,
  p.email,
  p.role,
  w.balance,
  'Profile Created' as status
FROM profiles p
LEFT JOIN wallets w ON w.user_id = p.id
WHERE p.email IN (
  'admin@ecolink.test',
  'verifier@ecolink.test', 
  'user@ecolink.test',
  'developer@ecolink.test'
)
ORDER BY p.role;

-- Success message
SELECT 'Test accounts setup completed for existing users!' as result;

