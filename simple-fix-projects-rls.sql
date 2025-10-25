-- Simple fix for Projects RLS Policy
-- This allows authenticated users to insert projects (temporary solution)

-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "project_developer_can_insert_projects" ON projects;
DROP POLICY IF EXISTS "project_developer_can_view_own_projects" ON projects;
DROP POLICY IF EXISTS "project_developer_can_update_own_projects" ON projects;
DROP POLICY IF EXISTS "project_developer_can_delete_own_projects" ON projects;
DROP POLICY IF EXISTS "verifiers_admins_can_view_all_projects" ON projects;
DROP POLICY IF EXISTS "verifiers_admins_can_update_all_projects" ON projects;

-- Simple policy: authenticated users can insert projects
CREATE POLICY "authenticated_users_can_insert_projects" ON projects
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Simple policy: authenticated users can view their own projects
CREATE POLICY "authenticated_users_can_view_own_projects" ON projects
    FOR SELECT 
    TO authenticated
    USING (user_id = auth.uid());

-- Simple policy: authenticated users can update their own projects
CREATE POLICY "authenticated_users_can_update_own_projects" ON projects
    FOR UPDATE 
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Simple policy: authenticated users can delete their own projects
CREATE POLICY "authenticated_users_can_delete_own_projects" ON projects
    FOR DELETE 
    TO authenticated
    USING (user_id = auth.uid());

-- Policy for admins and verifiers to view all projects
CREATE POLICY "admins_verifiers_can_view_all_projects" ON projects
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'verifier')
        )
    );

-- Policy for admins and verifiers to update all projects
CREATE POLICY "admins_verifiers_can_update_all_projects" ON projects
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









