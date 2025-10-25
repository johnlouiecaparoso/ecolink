-- Test Accounts Setup Query for Supabase
-- Run this single query in Supabase SQL Editor

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

-- Create Admin Account (with conflict handling)
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, 
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, 
  is_super_admin, role
) 
SELECT 
  '11111111-1111-1111-1111-111111111111',
  'admin@ecolink.test',
  crypt('admin123', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin User"}',
  false, 'authenticated'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE lower(auth.users.email) = lower('admin@ecolink.test')
);

-- Create Verifier Account (with conflict handling)
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, 
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, 
  is_super_admin, role
) 
SELECT 
  '22222222-2222-2222-2222-222222222222',
  'verifier@ecolink.test',
  crypt('verifier123', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Verifier User"}',
  false, 'authenticated'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE lower(auth.users.email) = lower('verifier@ecolink.test')
);

-- Create General User Account (with conflict handling)
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, 
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, 
  is_super_admin, role
) 
SELECT 
  '33333333-3333-3333-3333-333333333333',
  'user@ecolink.test',
  crypt('user123', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "General User"}',
  false, 'authenticated'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE lower(auth.users.email) = lower('user@ecolink.test')
);

-- Create Project Developer Account (with conflict handling)
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, 
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, 
  is_super_admin, role
) 
SELECT 
  '44444444-4444-4444-4444-444444444444',
  'developer@ecolink.test',
  crypt('developer123', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Project Developer"}',
  false, 'authenticated'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE lower(auth.users.email) = lower('developer@ecolink.test')
);

-- Create/Update Profiles for all accounts
INSERT INTO profiles (id, full_name, email, role, kyc_level, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin@ecolink.test', 'admin', 3, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Verifier User', 'verifier@ecolink.test', 'verifier', 2, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'General User', 'user@ecolink.test', 'general_user', 0, NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'Project Developer', 'developer@ecolink.test', 'project_developer', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  kyc_level = EXCLUDED.kyc_level,
  updated_at = NOW();

-- Create/Update Wallets for all accounts
INSERT INTO wallets (user_id, balance, currency, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 1000.00, 'USD', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 1000.00, 'USD', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 1000.00, 'USD', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 1000.00, 'USD', NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET
  balance = EXCLUDED.balance,
  updated_at = NOW();

-- Final verification - show created accounts
SELECT 'Final verification - Test accounts:' as status;

SELECT 
  p.full_name,
  p.email,
  p.role,
  w.balance,
  CASE WHEN au.id IS NOT NULL THEN 'Auth User Created' ELSE 'Auth User Exists' END as auth_status
FROM profiles p
LEFT JOIN wallets w ON w.user_id = p.id
LEFT JOIN auth.users au ON au.id = p.id
WHERE p.email IN (
  'admin@ecolink.test',
  'verifier@ecolink.test', 
  'user@ecolink.test',
  'developer@ecolink.test'
)
ORDER BY p.role;

-- Success message
SELECT 'Test accounts setup completed successfully!' as result;
