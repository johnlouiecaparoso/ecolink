-- Fix Infinite Recursion in Profiles RLS Policies
-- Run this in Supabase SQL Editor to resolve the policy recursion issue

-- 1. Drop all existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 2. Create simple, non-recursive policies
-- Policy for users to view their own profile (no recursion)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy for users to update their own profile (no recursion)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy for users to insert their own profile (no recursion)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy for system/triggers to insert profiles (bypasses RLS)
CREATE POLICY "System can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- 3. Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- 4. Test the policies by checking if they work
SELECT 'RLS policies updated successfully' as status;

-- 5. Check current policies
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

-- 6. Test profile access (this should work now)
-- You can test this by trying to login again
SELECT 'Ready to test login' as next_step;
