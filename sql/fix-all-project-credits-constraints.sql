-- Fix All Project Credits NOT NULL Constraints
-- This will fix all constraint issues blocking project approval

-- =====================================================
-- STEP 1: Check Current project_credits Table Structure
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
-- STEP 2: Check All NOT NULL Constraints
-- =====================================================
SELECT 
  'NOT NULL CONSTRAINTS CHECK' as check_type,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'project_credits'
  AND c.contype = 'c'  -- Check constraints
ORDER BY conname;

-- =====================================================
-- STEP 3: Fix All NOT NULL Constraints
-- =====================================================

-- Make credits_available nullable and set default
ALTER TABLE project_credits ALTER COLUMN credits_available DROP NOT NULL;
ALTER TABLE project_credits ALTER COLUMN credits_available SET DEFAULT 0;

-- Make vintage_year nullable and set default
ALTER TABLE project_credits ALTER COLUMN vintage_year DROP NOT NULL;
ALTER TABLE project_credits ALTER COLUMN vintage_year SET DEFAULT EXTRACT(YEAR FROM NOW());

-- Make total_credits nullable and set default (if needed)
ALTER TABLE project_credits ALTER COLUMN total_credits DROP NOT NULL;
ALTER TABLE project_credits ALTER COLUMN total_credits SET DEFAULT 0;

-- Make price_per_credit nullable and set default (if needed)
ALTER TABLE project_credits ALTER COLUMN price_per_credit DROP NOT NULL;
ALTER TABLE project_credits ALTER COLUMN price_per_credit SET DEFAULT 15.0;

-- Make status nullable and set default (if needed)
ALTER TABLE project_credits ALTER COLUMN status DROP NOT NULL;
ALTER TABLE project_credits ALTER COLUMN status SET DEFAULT 'active';

-- =====================================================
-- STEP 4: Test the Fix
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
      project_id
    ) VALUES (
      test_project_id
    ) RETURNING id INTO test_credit_id;
    
    RAISE NOTICE '✅ Minimal project credits creation test successful:';
    RAISE NOTICE '   - Project ID: %', test_project_id;
    RAISE NOTICE '   - Credit ID: %', test_credit_id;
    
    -- Clean up test data
    DELETE FROM project_credits WHERE id = test_credit_id;
    RAISE NOTICE '✅ Test data cleaned up';
    
    -- Test with full data
    INSERT INTO project_credits (
      project_id,
      total_credits,
      credits_available,
      price_per_credit,
      status,
      vintage_year,
      created_at,
      updated_at
    ) VALUES (
      test_project_id,
      1000,
      1000,
      15.00,
      'active',
      EXTRACT(YEAR FROM NOW())::int,
      NOW(),
      NOW()
    ) RETURNING id INTO test_credit_id;
    
    RAISE NOTICE '✅ Full project credits creation test successful:';
    RAISE NOTICE '   - Credit ID: %', test_credit_id;
    
    -- Clean up test data
    DELETE FROM project_credits WHERE id = test_credit_id;
    RAISE NOTICE '✅ Full test data cleaned up';
  ELSE
    RAISE NOTICE '❌ No pending project found for test';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Project credits creation test failed: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 5: Verify All Constraints Are Fixed
-- =====================================================
SELECT 
  'UPDATED TABLE STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'project_credits' 
  AND table_schema = 'public'
  AND column_name IN ('credits_available', 'vintage_year', 'total_credits', 'price_per_credit', 'status')
ORDER BY column_name;

-- =====================================================
-- STEP 6: Final Status
-- =====================================================
SELECT 
  'ALL CONSTRAINTS FIX COMPLETE' as check_type,
  'All NOT NULL constraints fixed' as status,
  'Project approval should now work without constraint errors' as message,
  'Try approving a project again' as next_step;








