-- Fix Verifier Approval Getting Stuck
-- This will help diagnose and fix the approval process issue

-- =====================================================
-- STEP 1: Check Current Project Status
-- =====================================================
SELECT 
  'CURRENT PROJECT STATUS' as check_type,
  p.title,
  p.status,
  p.verification_notes,
  p.verified_by,
  p.verified_at,
  p.updated_at
FROM projects p
WHERE p.status IN ('pending', 'under_review', 'approved', 'rejected')
ORDER BY p.updated_at DESC;

-- =====================================================
-- STEP 2: Check Verifier Users
-- =====================================================
SELECT 
  'VERIFIER USERS' as check_type,
  id,
  full_name,
  role,
  created_at
FROM profiles 
WHERE role = 'verifier'
ORDER BY created_at DESC;

-- =====================================================
-- STEP 3: Test Project Status Update (Manual)
-- =====================================================
DO $$
DECLARE
  test_project_id UUID;
  verifier_id UUID;
  update_result RECORD;
BEGIN
  -- Get a pending project
  SELECT id INTO test_project_id FROM projects WHERE status = 'pending' LIMIT 1;
  
  -- Get a verifier
  SELECT id INTO verifier_id FROM profiles WHERE role = 'verifier' LIMIT 1;
  
  IF test_project_id IS NOT NULL AND verifier_id IS NOT NULL THEN
    -- Test manual project status update
    UPDATE projects 
    SET 
      status = 'approved',
      verification_notes = 'Test approval - manual update',
      verified_by = verifier_id,
      verified_at = NOW(),
      updated_at = NOW()
    WHERE id = test_project_id
    RETURNING * INTO update_result;
    
    RAISE NOTICE '✅ Manual approval test successful:';
    RAISE NOTICE '   - Project ID: %', test_project_id;
    RAISE NOTICE '   - Verifier ID: %', verifier_id;
    RAISE NOTICE '   - Status updated to: %', update_result.status;
    
    -- Revert the test
    UPDATE projects 
    SET 
      status = 'pending',
      verification_notes = NULL,
      verified_by = NULL,
      verified_at = NULL,
      updated_at = NOW()
    WHERE id = test_project_id;
    
    RAISE NOTICE '✅ Test reverted - project back to pending';
  ELSE
    RAISE NOTICE '❌ No pending project or verifier found for test';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Manual approval test failed: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 4: Check Project Credits Table Structure
-- =====================================================
SELECT 
  'PROJECT CREDITS TABLE STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'project_credits' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- STEP 5: Check Credit Listings Table Structure
-- =====================================================
SELECT 
  'CREDIT LISTINGS TABLE STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'credit_listings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- STEP 6: Summary and Diagnosis
-- =====================================================
SELECT 
  'VERIFIER APPROVAL DIAGNOSIS' as check_type,
  'Issue identified in frontend code' as diagnosis,
  'marketplaceIntegrationService.updateProjectStatusWithMarketplace' as problem_function,
  'verified_by: current_user() should be actual user ID' as specific_issue,
  'Need to fix frontend service to pass correct user ID' as fix_needed;








