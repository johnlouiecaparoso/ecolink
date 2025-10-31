-- Fix RLS Policies for Verifier Panel
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what RLS policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY policyname;

-- 2. Drop existing policies that might be blocking verifiers
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- 3. Create comprehensive RLS policies for projects table
-- Allow verifiers and admins to see all projects
CREATE POLICY "Verifiers and admins can view all projects" ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('verifier', 'admin')
    )
  );

-- Allow project developers to see their own projects
CREATE POLICY "Project developers can view their own projects" ON projects
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('project_developer', 'admin')
    )
  );

-- Allow project developers to insert their own projects
CREATE POLICY "Project developers can insert their own projects" ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('project_developer', 'admin')
    )
  );

-- Allow verifiers and admins to update project status
CREATE POLICY "Verifiers and admins can update projects" ON projects
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

-- Allow project developers to update their own projects (for basic edits)
CREATE POLICY "Project developers can update their own projects" ON projects
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() AND
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('project_developer', 'admin')
    )
  )
  WITH CHECK (
    user_id = auth.uid() AND
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('project_developer', 'admin')
    )
  );

-- Allow admins to delete projects
CREATE POLICY "Admins can delete projects" ON projects
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 4. Ensure RLS is enabled on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 5. Test the policies by checking if verifier can see projects
-- (This should work after the policies are created)
SELECT 
  'Testing verifier access' as test_name,
  COUNT(*) as project_count
FROM projects;









