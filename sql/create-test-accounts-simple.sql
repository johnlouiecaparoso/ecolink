-- Create Test Accounts in Supabase Database (Simple Version)
-- This script checks for existing users first to avoid conflicts
-- Run this in your Supabase SQL Editor

-- Check existing users first
SELECT 'Checking for existing users...' as status;

SELECT 
  email, 
  CASE WHEN id IS NOT NULL THEN 'EXISTS' ELSE 'NOT FOUND' END as status
FROM (
  VALUES 
    ('admin@ecolink.test'),
    ('verifier@ecolink.test'),
    ('user@ecolink.test'),
    ('developer@ecolink.test')
) AS emails(email)
LEFT JOIN auth.users ON lower(auth.users.email) = lower(emails.email);

-- Create Admin Account (only if doesn't exist)
DO $$
DECLARE
  admin_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM auth.users 
    WHERE lower(email) = lower('admin@ecolink.test')
  ) INTO admin_exists;
  
  IF NOT admin_exists THEN
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at, 
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, 
      is_super_admin, role
    ) VALUES (
      '11111111-1111-1111-1111-111111111111',
      'admin@ecolink.test',
      crypt('admin123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin User"}',
      false, 'authenticated'
    );
    
    RAISE NOTICE 'Admin account created';
  ELSE
    RAISE NOTICE 'Admin account already exists, skipping';
  END IF;
END $$;

-- Create Verifier Account (only if doesn't exist)
DO $$
DECLARE
  verifier_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM auth.users 
    WHERE lower(email) = lower('verifier@ecolink.test')
  ) INTO verifier_exists;
  
  IF NOT verifier_exists THEN
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at, 
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, 
      is_super_admin, role
    ) VALUES (
      '22222222-2222-2222-2222-222222222222',
      'verifier@ecolink.test',
      crypt('verifier123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Verifier User"}',
      false, 'authenticated'
    );
    
    RAISE NOTICE 'Verifier account created';
  ELSE
    RAISE NOTICE 'Verifier account already exists, skipping';
  END IF;
END $$;

-- Create General User Account (only if doesn't exist)
DO $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM auth.users 
    WHERE lower(email) = lower('user@ecolink.test')
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at, 
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, 
      is_super_admin, role
    ) VALUES (
      '33333333-3333-3333-3333-333333333333',
      'user@ecolink.test',
      crypt('user123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "General User"}',
      false, 'authenticated'
    );
    
    RAISE NOTICE 'General user account created';
  ELSE
    RAISE NOTICE 'General user account already exists, skipping';
  END IF;
END $$;

-- Create Project Developer Account (only if doesn't exist)
DO $$
DECLARE
  developer_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM auth.users 
    WHERE lower(email) = lower('developer@ecolink.test')
  ) INTO developer_exists;
  
  IF NOT developer_exists THEN
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at, 
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, 
      is_super_admin, role
    ) VALUES (
      '44444444-4444-4444-4444-444444444444',
      'developer@ecolink.test',
      crypt('developer123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Project Developer"}',
      false, 'authenticated'
    );
    
    RAISE NOTICE 'Project developer account created';
  ELSE
    RAISE NOTICE 'Project developer account already exists, skipping';
  END IF;
END $$;

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

-- Success message
SELECT 'Test accounts setup completed!' as status,
       'Check the notices above to see which accounts were created' as message;

