-- Check current RLS policies on projects table
-- Run this first to see what policies exist

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'projects';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY policyname;

-- Check if the user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'developer@ecolink.test';

-- Check if the user exists in profiles
SELECT id, full_name, email, role, kyc_level 
FROM profiles 
WHERE email = 'developer@ecolink.test';









