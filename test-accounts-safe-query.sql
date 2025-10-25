-- Safe Test Accounts Setup Query for Supabase
-- This version handles foreign key constraints properly
-- Run this in Supabase SQL Editor as project owner

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

-- Create auth users first (only if they don't exist)
-- Note: These require service role permissions

-- Admin Account
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

-- Verifier Account
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

-- General User Account
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

-- Project Developer Account
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

-- Verify auth users were created
SELECT 'Verifying auth users were created...' as step;

SELECT id, email FROM auth.users
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);

-- Now create profiles using the actual auth.users IDs
-- This approach uses the auth.users as the source of truth
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

-- Create wallets using the actual auth.users IDs
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

-- Final verification - show created accounts
SELECT 'Final verification - Test accounts:' as status;

SELECT 
  p.full_name,
  p.email,
  p.role,
  w.balance,
  CASE WHEN au.id IS NOT NULL THEN 'Auth User Exists' ELSE 'Auth User Missing' END as auth_status
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

