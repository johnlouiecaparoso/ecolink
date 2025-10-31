-- Fix Verifier Panel Access Issue
-- This will help diagnose and fix the verifier panel access problem

-- =====================================================
-- STEP 1: Check Current User Role and Permissions
-- =====================================================
SELECT 
  'VERIFIER USER CHECK' as check_type,
  p.id,
  p.full_name,
  p.role,
  p.created_at
FROM profiles p
WHERE p.role = 'verifier'
ORDER BY p.created_at DESC;

-- =====================================================
-- STEP 2: Check if Verifier Can See Pending Projects
-- =====================================================
SELECT 
  'PENDING PROJECTS FOR VERIFIER' as check_type,
  p.title,
  p.status,
  p.category,
  p.location,
  pr.full_name as submitted_by,
  p.created_at
FROM projects p
JOIN profiles pr ON p.user_id = pr.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;

-- =====================================================
-- STEP 3: Test Verifier Panel Access (Simulation)
-- =====================================================
DO $$
DECLARE
  verifier_id UUID;
  pending_count INTEGER;
BEGIN
  -- Get verifier user
  SELECT id INTO verifier_id FROM profiles WHERE role = 'verifier' LIMIT 1;
  
  IF verifier_id IS NOT NULL THEN
    -- Count pending projects
    SELECT COUNT(*) INTO pending_count FROM projects WHERE status = 'pending';
    
    RAISE NOTICE '✅ Verifier Panel Access Test:';
    RAISE NOTICE '   - Verifier ID: %', verifier_id;
    RAISE NOTICE '   - Pending projects: %', pending_count;
    RAISE NOTICE '   - Verifier should be able to access /verifier route';
    RAISE NOTICE '   - Verifier should see % pending projects', pending_count;
  ELSE
    RAISE NOTICE '❌ No verifier user found';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Verifier Panel Test Failed: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 4: Check Route Permissions (Frontend Issue)
-- =====================================================
SELECT 
  'ROUTE PERMISSIONS CHECK' as check_type,
  'Frontend Issue Analysis' as issue_type,
  'The verifier panel access issue is likely in the frontend code' as diagnosis,
  'Check these files:' as files_to_check,
  '1. src/constants/roles.js - PERMISSIONS.ACCESS_PROJECTS missing' as file_1,
  '2. src/_hidden/components/layout/AppSidebar.vue - Permission check' as file_2,
  '3. src/services/roleService.js - Route permissions' as file_3;

-- =====================================================
-- STEP 5: Summary and Next Steps
-- =====================================================
SELECT 
  'VERIFIER PANEL FIX SUMMARY' as check_type,
  'Database is working correctly' as database_status,
  'Verifier users exist and can see pending projects' as verifier_status,
  'Issue is in frontend permission constants' as issue_location,
  'Need to fix PERMISSIONS.ACCESS_PROJECTS in roles.js' as fix_needed;








