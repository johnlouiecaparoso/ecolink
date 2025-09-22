-- Setup Test Users with Different Roles
-- Run this in Supabase SQL Editor to create test users for role-based access testing

-- 1. Check current users and their roles
SELECT 
    u.id,
    u.email,
    u.created_at,
    p.full_name,
    p.role,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 2. Update existing users to different roles for testing
-- Replace the user IDs with actual IDs from the query above

-- Example: Update first user to be a project developer
-- UPDATE profiles 
-- SET role = 'project_developer' 
-- WHERE id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1 OFFSET 0);

-- Example: Update second user to be a buyer/investor
-- UPDATE profiles 
-- SET role = 'buyer_investor' 
-- WHERE id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1 OFFSET 1);

-- Example: Update third user to be a verifier
-- UPDATE profiles 
-- SET role = 'verifier' 
-- WHERE id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1 OFFSET 2);

-- Example: Update fourth user to be an admin
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1 OFFSET 3);

-- 3. Create specific test users with known roles
-- Uncomment and modify these to create dedicated test users

/*
-- Create a test project developer
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    gen_random_uuid(),
    'developer@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"name": "Test Developer"}'::jsonb
);

-- Create a test buyer/investor
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    gen_random_uuid(),
    'buyer@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"name": "Test Buyer"}'::jsonb
);

-- Create a test verifier
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    gen_random_uuid(),
    'verifier@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"name": "Test Verifier"}'::jsonb
);

-- Create a test admin
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    gen_random_uuid(),
    'admin@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"name": "Test Admin"}'::jsonb
);
*/

-- 4. Verify the role distribution
SELECT 
    role,
    COUNT(*) as user_count
FROM profiles
GROUP BY role
ORDER BY user_count DESC;

-- 5. Check if all users have profiles
SELECT 
    'Users without profiles' as status,
    COUNT(*) as count
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 6. Test role-based access (this will show what each role can access)
SELECT 
    p.role,
    p.full_name,
    u.email,
    CASE 
        WHEN p.role = 'user' THEN 'Dashboard, Wallet, Certificates'
        WHEN p.role = 'project_developer' THEN 'Projects, Sales Dashboard'
        WHEN p.role = 'buyer_investor' THEN 'Marketplace, Buy Credits, Receipts'
        WHEN p.role = 'verifier' THEN 'Verifier Dashboard'
        WHEN p.role = 'admin' THEN 'Admin Dashboard, Users, Analytics, Database, Tables'
        ELSE 'Unknown role'
    END as expected_access
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.role, p.full_name;
