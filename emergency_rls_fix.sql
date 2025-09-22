-- EMERGENCY FIX: Completely Disable RLS and Rebuild
-- Run this in Supabase SQL Editor to completely fix the recursion issue

-- 1. COMPLETELY DISABLE RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL policies (force drop everything)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON profiles';
    END LOOP;
END $$;

-- 3. Ensure all users have profiles (with RLS disabled, this will work)
INSERT INTO profiles (id, full_name, role, kyc_level, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', 'User') as full_name,
    'user' as role,
    0 as kyc_level,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- 4. Grant full permissions to authenticated users
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- 5. Test that profiles can be accessed
SELECT 'RLS disabled - testing profile access' as status;

-- 6. Check if we can access profiles now
SELECT 
    u.id,
    u.email,
    p.id as profile_id,
    p.full_name,
    p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;

-- 7. Show current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 8. Show that no policies exist
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

SELECT 'Emergency fix completed - RLS is disabled and profiles should be accessible' as final_status;
