-- Database Status Check Script
-- Run this in Supabase SQL Editor to diagnose the current state

-- 1. Check if profiles table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'profiles' AND table_schema = 'public'
        ) 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as profiles_table_status;

-- 2. Check profiles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if RLS is enabled on profiles
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 4. Check RLS policies on profiles
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;

-- 5. Check if triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 6. Check current profiles data
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as user_profiles,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_profiles,
    COUNT(CASE WHEN role = 'verifier' THEN 1 END) as verifier_profiles
FROM profiles;

-- 7. Check auth.users table
SELECT 
    COUNT(*) as total_auth_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users
FROM auth.users;

-- 8. Check if there are users without profiles
SELECT 
    u.id,
    u.email,
    u.created_at as auth_created_at,
    p.id as profile_id,
    p.full_name,
    p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC
LIMIT 10;

-- 9. Check recent auth.users entries
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 10. Test if we can insert into profiles (this will show any permission issues)
-- This is a dry run - it won't actually insert
SELECT 'Testing insert permissions...' as test_status;

-- 11. Check if the create_profile_for_new_user function exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'create_profile_for_new_user'
        ) 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as trigger_function_status;

-- 12. Check if the trigger exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'create_profile_on_user_creation'
        ) 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as trigger_status;
