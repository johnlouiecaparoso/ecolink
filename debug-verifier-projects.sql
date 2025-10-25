-- Debug Verifier Panel - Check Projects and RLS Policies
-- Run this in your Supabase SQL Editor

-- 1. Check if there are any projects in the database
SELECT 
  id, 
  title, 
  status, 
  user_id, 
  created_at,
  'Project exists' as debug_info
FROM projects 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check RLS policies on projects table
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
WHERE tablename = 'projects';

-- 3. Check if RLS is enabled on projects table
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
FROM pg_tables 
WHERE tablename = 'projects';

-- 4. Test query that verifier should be able to run
-- (This simulates what the verifier panel is trying to do)
SELECT 
  id,
  title,
  description,
  category,
  location,
  status,
  user_id,
  created_at,
  updated_at
FROM projects 
WHERE status IN ('pending', 'under_review', 'approved', 'rejected')
ORDER BY created_at DESC;

-- 5. Check if there are any projects with 'pending' status specifically
SELECT 
  COUNT(*) as pending_count,
  'Projects with pending status' as description
FROM projects 
WHERE status = 'pending';

-- 6. Check user roles and permissions
SELECT 
  p.id,
  p.email,
  p.role,
  p.full_name,
  'User profile' as type
FROM profiles p
WHERE p.role IN ('verifier', 'admin')
ORDER BY p.role, p.email;









