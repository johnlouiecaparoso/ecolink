-- Comprehensive RLS Fix for Projects Table
-- This will definitely work for project submission

-- Step 1: Disable RLS temporarily to test
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "authenticated_users_can_insert_projects" ON projects;
DROP POLICY IF EXISTS "authenticated_users_can_view_own_projects" ON projects;
DROP POLICY IF EXISTS "authenticated_users_can_update_own_projects" ON projects;
DROP POLICY IF EXISTS "authenticated_users_can_delete_own_projects" ON projects;
DROP POLICY IF EXISTS "admins_verifiers_can_view_all_projects" ON projects;
DROP POLICY IF EXISTS "admins_verifiers_can_update_all_projects" ON projects;
DROP POLICY IF EXISTS "project_developer_can_insert_projects" ON projects;
DROP POLICY IF EXISTS "project_developer_can_view_own_projects" ON projects;
DROP POLICY IF EXISTS "project_developer_can_update_own_projects" ON projects;
DROP POLICY IF EXISTS "project_developer_can_delete_own_projects" ON projects;
DROP POLICY IF EXISTS "verifiers_admins_can_view_all_projects" ON projects;
DROP POLICY IF EXISTS "verifiers_admins_can_update_all_projects" ON projects;

-- Step 3: Re-enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, working policies
-- Allow authenticated users to insert projects (they must provide their own user_id)
CREATE POLICY "allow_authenticated_insert" ON projects
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to view their own projects
CREATE POLICY "allow_authenticated_select_own" ON projects
    FOR SELECT 
    TO authenticated
    USING (user_id = auth.uid());

-- Allow authenticated users to update their own projects
CREATE POLICY "allow_authenticated_update_own" ON projects
    FOR UPDATE 
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to delete their own projects
CREATE POLICY "allow_authenticated_delete_own" ON projects
    FOR DELETE 
    TO authenticated
    USING (user_id = auth.uid());

-- Allow admins and verifiers to view all projects
CREATE POLICY "allow_admins_verifiers_select_all" ON projects
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'verifier')
        )
    );

-- Allow admins and verifiers to update all projects
CREATE POLICY "allow_admins_verifiers_update_all" ON projects
    FOR UPDATE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'verifier')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'verifier')
        )
    );

-- Step 5: Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY policyname;









