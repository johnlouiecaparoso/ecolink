-- Create Test Accounts in Supabase Database (Fixed Version)
-- This script handles existing users and avoids duplicate email errors
-- Run this in your Supabase SQL Editor

-- Function to safely upsert users by email
CREATE OR REPLACE FUNCTION upsert_test_user(
  user_id UUID,
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  user_role TEXT,
  kyc_level INTEGER
) RETURNS UUID AS $$
DECLARE
  existing_user_id UUID;
  final_user_id UUID;
BEGIN
  -- Check if user already exists by email
  SELECT id INTO existing_user_id 
  FROM auth.users 
  WHERE lower(email) = lower(user_email) 
  AND (is_sso_user IS NOT TRUE);
  
  IF existing_user_id IS NOT NULL THEN
    -- Update existing user
    UPDATE auth.users SET
      encrypted_password = crypt(user_password, gen_salt('bf')),
      email_confirmed_at = NOW(),
      updated_at = NOW(),
      raw_app_meta_data = '{"provider": "email", "providers": ["email"]}',
      raw_user_meta_data = json_build_object('name', user_name),
      is_super_admin = false,
      role = 'authenticated'
    WHERE id = existing_user_id;
    
    final_user_id := existing_user_id;
  ELSE
    -- Insert new user
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at, 
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, 
      is_super_admin, role
    ) VALUES (
      user_id, user_email, crypt(user_password, gen_salt('bf')), 
      NOW(), NOW(), NOW(), 
      '{"provider": "email", "providers": ["email"]}', 
      json_build_object('name', user_name), 
      false, 'authenticated'
    );
    
    final_user_id := user_id;
  END IF;
  
  -- Upsert profile
  INSERT INTO profiles (
    id, full_name, email, role, kyc_level, created_at, updated_at
  ) VALUES (
    final_user_id, user_name, user_email, user_role, kyc_level, NOW(), NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    kyc_level = EXCLUDED.kyc_level,
    updated_at = NOW();
  
  -- Upsert wallet
  INSERT INTO wallets (user_id, balance, currency, created_at, updated_at)
  VALUES (final_user_id, 1000.00, 'USD', NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    balance = EXCLUDED.balance,
    updated_at = NOW();
  
  RETURN final_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create all test accounts using the safe function
DO $$
DECLARE
  admin_id UUID;
  verifier_id UUID;
  user_id UUID;
  developer_id UUID;
BEGIN
  -- Create Admin Account
  SELECT upsert_test_user(
    '11111111-1111-1111-1111-111111111111',
    'admin@ecolink.test',
    'admin123',
    'Admin User',
    'admin',
    3
  ) INTO admin_id;
  
  -- Create Verifier Account
  SELECT upsert_test_user(
    '22222222-2222-2222-2222-222222222222',
    'verifier@ecolink.test',
    'verifier123',
    'Verifier User',
    'verifier',
    2
  ) INTO verifier_id;
  
  -- Create General User Account
  SELECT upsert_test_user(
    '33333333-3333-3333-3333-333333333333',
    'user@ecolink.test',
    'user123',
    'General User',
    'general_user',
    0
  ) INTO user_id;
  
  -- Create Project Developer Account
  SELECT upsert_test_user(
    '44444444-4444-4444-4444-444444444444',
    'developer@ecolink.test',
    'developer123',
    'Project Developer',
    'project_developer',
    1
  ) INTO developer_id;
  
  RAISE NOTICE 'Test accounts created successfully!';
  RAISE NOTICE 'Admin ID: %', admin_id;
  RAISE NOTICE 'Verifier ID: %', verifier_id;
  RAISE NOTICE 'User ID: %', user_id;
  RAISE NOTICE 'Developer ID: %', developer_id;
END $$;

-- Clean up the function
DROP FUNCTION upsert_test_user(UUID, TEXT, TEXT, TEXT, TEXT, INTEGER);

-- Success message
SELECT 'Test accounts created successfully!' as status,
       'You can now login with any of the test accounts' as message;

