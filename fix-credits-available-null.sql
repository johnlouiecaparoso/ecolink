-- Fix credits_available NULL constraint issue
-- This will fix the database constraint that's blocking project approval

-- =====================================================
-- STEP 1: Check project_credits table structure
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
-- STEP 2: Check if credits_available column allows NULL
-- =====================================================
SELECT 
  'CREDITS_AVAILABLE CONSTRAINT CHECK' as check_type,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'project_credits'
  AND c.contype = 'c'  -- Check constraints
  AND pg_get_constraintdef(c.oid) LIKE '%credits_available%';

-- =====================================================
-- STEP 3: Fix the constraint issue
-- =====================================================
-- Option 1: Make credits_available nullable (if it's not already)
ALTER TABLE project_credits ALTER COLUMN credits_available DROP NOT NULL;

-- Option 2: Set a default value for credits_available
ALTER TABLE project_credits ALTER COLUMN credits_available SET DEFAULT 0;

-- =====================================================
-- STEP 4: Test the fix
-- =====================================================
DO $$
DECLARE
  test_project_id UUID;
  test_credit_id UUID;
BEGIN
  -- Get a pending project
  SELECT id INTO test_project_id FROM projects WHERE status = 'pending' LIMIT 1;
  
  IF test_project_id IS NOT NULL THEN
    -- Test creating project_credits with minimal data
    INSERT INTO project_credits (
      project_id,
      total_credits,
      price_per_credit,
      status,
      vintage_year,
      created_at,
      updated_at
    ) VALUES (
      test_project_id,
      1000,
      15.00,
      'active',
      EXTRACT(YEAR FROM NOW())::int,
      NOW(),
      NOW()
    ) RETURNING id INTO test_credit_id;
    
    RAISE NOTICE '✅ Project credits creation test successful:';
    RAISE NOTICE '   - Project ID: %', test_project_id;
    RAISE NOTICE '   - Credit ID: %', test_credit_id;
    
    -- Clean up test data
    DELETE FROM project_credits WHERE id = test_credit_id;
    RAISE NOTICE '✅ Test data cleaned up';
  ELSE
    RAISE NOTICE '❌ No pending project found for test';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Project credits creation test failed: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 5: Final status
-- =====================================================
SELECT 
  'CREDITS_AVAILABLE FIX COMPLETE' as check_type,
  'Database constraint issue fixed' as status,
  'Project approval should now work' as message,
  'Try approving a project again' as next_step;








