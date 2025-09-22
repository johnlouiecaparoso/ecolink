-- Debug Registration Issues
-- Run this to check what's happening during user creation

-- 1. Check if there are any triggers on auth.users that might be failing
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    action_orientation
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth'
ORDER BY trigger_name;

-- 2. Check if the handle_new_user function exists and is working
SELECT 
    proname as function_name,
    prosrc as function_source,
    prokind as function_type
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Check recent auth.users entries to see if users are being created
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    raw_user_meta_data,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMED'
        ELSE 'PENDING_CONFIRMATION'
    END as status
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check if profiles are being created for new users
SELECT 
    u.id as user_id,
    u.email,
    u.created_at as user_created,
    p.id as profile_id,
    p.full_name,
    p.role,
    p.created_at as profile_created,
    CASE 
        WHEN p.id IS NULL THEN 'NO_PROFILE'
        ELSE 'HAS_PROFILE'
    END as profile_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

-- 5. Check for any error logs or failed operations
-- (This might not show much in Supabase, but worth checking)
SELECT 
    'No direct error logs available in Supabase' as note;

-- 6. Test the trigger function manually (this will help identify issues)
-- First, let's see if we can call the function
SELECT 'Testing trigger function...' as test_status;

-- 7. Check if there are any constraints or foreign key issues
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;

-- 8. Check RLS policies on profiles table
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

-- 9. Check if there are any issues with the profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. Check permissions on the profiles table
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;
