-- Fix Row Level Security Policy for Projects Table
-- This allows project_developer role to insert and manage their own projects

-- First, let's check if RLS is enabled on the projects table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'projects';

-- Enable RLS on projects table if not already enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Create policy for project_developer to insert their own projects
CREATE POLICY "project_developer_can_insert_projects" ON projects
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'project_developer'
        )
    );

-- Create policy for project_developer to view their own projects
CREATE POLICY "project_developer_can_view_own_projects" ON projects
    FOR SELECT 
    TO authenticated
    USING (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'project_developer'
        )
    );

-- Create policy for project_developer to update their own projects
CREATE POLICY "project_developer_can_update_own_projects" ON projects
    FOR UPDATE 
    TO authenticated
    USING (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'project_developer'
        )
    )
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'project_developer'
        )
    );

-- Create policy for project_developer to delete their own projects
CREATE POLICY "project_developer_can_delete_own_projects" ON projects
    FOR DELETE 
    TO authenticated
    USING (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'project_developer'
        )
    );

-- Create policy for verifiers and admins to view all projects
CREATE POLICY "verifiers_admins_can_view_all_projects" ON projects
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('verifier', 'admin')
        )
    );

-- Create policy for verifiers and admins to update all projects
CREATE POLICY "verifiers_admins_can_update_all_projects" ON projects
    FOR UPDATE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('verifier', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('verifier', 'admin')
        )
    );

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY policyname;









