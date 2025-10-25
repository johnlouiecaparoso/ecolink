-- Check project_credits table structure and data
-- Run this in your Supabase SQL Editor

-- 1. Check project_credits table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'project_credits'
ORDER BY ordinal_position;

-- 2. Check if project_credits table has data
SELECT 
  COUNT(*) as total_project_credits,
  COUNT(DISTINCT project_id) as unique_projects
FROM project_credits;

-- 3. Check sample data from project_credits
SELECT 
  id,
  project_id,
  created_at
FROM project_credits 
LIMIT 5;

-- 4. Check if there are any project_credits for existing projects
SELECT 
  p.id as project_id,
  p.title,
  p.status,
  pc.id as project_credit_id
FROM projects p
LEFT JOIN project_credits pc ON p.id = pc.project_id
LIMIT 10;









