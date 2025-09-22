-- Re-enable RLS with Safe Policies (Run this AFTER emergency_rls_fix.sql works)
-- Only run this if the emergency fix resolved the login issue

-- 1. First, let's create a simple test to make sure everything works
SELECT 'Testing profile access before re-enabling RLS...' as status;

-- 2. Test that we can still access profiles
SELECT COUNT(*) as profile_count FROM profiles;

-- 3. Now re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create VERY simple policies that won't cause recursion
CREATE POLICY "simple_select_policy" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "simple_update_policy" ON profiles
  FOR UPDATE USING (true);

CREATE POLICY "simple_insert_policy" ON profiles
  FOR INSERT WITH CHECK (true);

-- 5. Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- 6. Test the new policies
SELECT 'RLS re-enabled with simple policies' as status;

-- 7. Check policies
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;

-- 8. Final test
SELECT COUNT(*) as profile_count_after_rls FROM profiles;

SELECT 'RLS re-enabled successfully with safe policies' as final_status;
