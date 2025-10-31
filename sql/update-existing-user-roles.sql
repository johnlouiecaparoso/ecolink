-- Update Existing User Roles in Supabase
-- This script shows how to update roles for existing users
-- Run this in Supabase SQL Editor

-- First, let's see what users you currently have
SELECT 'Current users and their roles:' as step;

SELECT 
  au.email,
  p.role,
  p.full_name,
  p.kyc_level,
  CASE WHEN p.id IS NOT NULL THEN 'Has Profile' ELSE 'No Profile' END as profile_status
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
ORDER BY au.email;

-- Now let's update specific users to specific roles
-- Replace the email addresses with your actual user emails

-- Example 1: Set a user to Project Developer role
-- Replace 'your-email@example.com' with the actual email
UPDATE profiles 
SET 
  role = 'project_developer',
  kyc_level = 1,
  updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users 
  WHERE lower(email) = lower('your-email@example.com')
);

-- Example 2: Set a user to Admin role
-- Replace 'admin-email@example.com' with the actual email
UPDATE profiles 
SET 
  role = 'admin',
  kyc_level = 3,
  updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users 
  WHERE lower(email) = lower('admin-email@example.com')
);

-- Example 3: Set a user to Verifier role
-- Replace 'verifier-email@example.com' with the actual email
UPDATE profiles 
SET 
  role = 'verifier',
  kyc_level = 2,
  updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users 
  WHERE lower(email) = lower('verifier-email@example.com')
);

-- Example 4: Set a user to General User role
-- Replace 'user-email@example.com' with the actual email
UPDATE profiles 
SET 
  role = 'general_user',
  kyc_level = 0,
  updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users 
  WHERE lower(email) = lower('user-email@example.com')
);

-- If a user doesn't have a profile yet, create one
-- Replace 'new-user@example.com' with the actual email
INSERT INTO profiles (id, full_name, email, role, kyc_level, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', 'User'),
  au.email,
  'general_user', -- default role
  0, -- default kyc level
  NOW(),
  NOW()
FROM auth.users au
WHERE lower(au.email) = lower('new-user@example.com')
AND NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
);

-- Create wallet for users who don't have one
INSERT INTO wallets (user_id, balance, currency, created_at, updated_at)
SELECT 
  au.id,
  1000.00,
  'USD',
  NOW(),
  NOW()
FROM auth.users au
WHERE lower(au.email) = lower('new-user@example.com')
AND NOT EXISTS (
  SELECT 1 FROM wallets w WHERE w.user_id = au.id
);

-- Show updated roles
SELECT 'Updated user roles:' as step;

SELECT 
  au.email,
  p.role,
  p.full_name,
  p.kyc_level,
  w.balance
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN wallets w ON w.user_id = au.id
ORDER BY au.email;

-- Success message
SELECT 'User roles updated successfully!' as result;

