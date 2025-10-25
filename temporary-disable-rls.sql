-- TEMPORARY SOLUTION: Disable RLS completely for testing
-- This will allow project submission to work immediately
-- WARNING: This removes all security, only use for testing!

-- Disable RLS on projects table
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
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

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'projects';

-- This should show rowsecurity = false









