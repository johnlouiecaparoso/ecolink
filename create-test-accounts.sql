-- Create Test Accounts in Supabase Database
-- This script creates all 4 test accounts with proper roles and profiles
-- Run this in your Supabase SQL Editor

-- 1. Create Admin Account
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'admin@ecolink.test',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin User"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = NOW();

-- Create Admin Profile
INSERT INTO profiles (
  id,
  full_name,
  email,
  role,
  kyc_level,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Admin User',
  'admin@ecolink.test',
  'admin',
  3,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  kyc_level = EXCLUDED.kyc_level,
  updated_at = NOW();

-- 2. Create Verifier Account
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'verifier@ecolink.test',
  crypt('verifier123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Verifier User"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = NOW();

-- Create Verifier Profile
INSERT INTO profiles (
  id,
  full_name,
  email,
  role,
  kyc_level,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Verifier User',
  'verifier@ecolink.test',
  'verifier',
  2,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  kyc_level = EXCLUDED.kyc_level,
  updated_at = NOW();

-- 3. Create Project Developer Account
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  'developer@ecolink.test',
  crypt('developer123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Project Developer"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = NOW();

-- Create Project Developer Profile
INSERT INTO profiles (
  id,
  full_name,
  email,
  role,
  kyc_level,
  created_at,
  updated_at
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Project Developer',
  'developer@ecolink.test',
  'project_developer',
  1,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  kyc_level = EXCLUDED.kyc_level,
  updated_at = NOW();

-- 4. Create General User Account
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'user@ecolink.test',
  crypt('user123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "General User"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = NOW();

-- Create General User Profile
INSERT INTO profiles (
  id,
  full_name,
  email,
  role,
  kyc_level,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'General User',
  'user@ecolink.test',
  'general_user',
  0,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  kyc_level = EXCLUDED.kyc_level,
  updated_at = NOW();

-- 5. Create wallets for all users
INSERT INTO wallets (user_id, balance, currency, created_at, updated_at)
SELECT 
  id,
  1000.00, -- Starting balance for testing
  'USD',
  NOW(),
  NOW()
FROM profiles 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
)
ON CONFLICT (user_id) DO UPDATE SET
  balance = EXCLUDED.balance,
  updated_at = NOW();

-- 6. Success message
SELECT 'Test accounts created successfully!' as status,
       'You can now login with any of the test accounts' as message;

