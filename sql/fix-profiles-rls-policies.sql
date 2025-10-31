-- Fix RLS Policies for Profiles Table
-- This allows profile creation for authenticated users and handles edge cases

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view any profile for marketplace" ON profiles;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 3: Users can insert their own profile (when id matches auth user)
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Policy 4: Allow viewing profiles for marketplace/social features (optional)
-- This allows users to see other users' public profiles
CREATE POLICY "Users can view any profile for marketplace" ON profiles
    FOR SELECT 
    USING (true);  -- Allow viewing all profiles (for marketplace listings, etc.)

-- Note: If you want to restrict profile viewing to only own profile,
-- you can remove Policy 4 or modify it to only show public profiles.

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Success message
SELECT 'Profiles RLS policies updated successfully!' as status;


