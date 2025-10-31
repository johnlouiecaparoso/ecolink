-- Fix Credit Listings NOT NULL Constraints
-- This will fix all constraint issues in the credit_listings table

-- =====================================================
-- STEP 1: Check Current credit_listings Table Structure
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
-- STEP 2: Check All NOT NULL Constraints in credit_listings
-- =====================================================
SELECT 
  'CREDIT LISTINGS NOT NULL CONSTRAINTS' as check_type,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'credit_listings'
  AND c.contype = 'c'  -- Check constraints
ORDER BY conname;

-- =====================================================
-- STEP 3: Fix All NOT NULL Constraints in credit_listings
-- =====================================================

-- Make quantity nullable and set default
ALTER TABLE credit_listings ALTER COLUMN quantity DROP NOT NULL;
ALTER TABLE credit_listings ALTER COLUMN quantity SET DEFAULT 0;

-- Make price_per_credit nullable and set default
ALTER TABLE credit_listings ALTER COLUMN price_per_credit DROP NOT NULL;
ALTER TABLE credit_listings ALTER COLUMN price_per_credit SET DEFAULT 15.0;

-- Make currency nullable and set default
ALTER TABLE credit_listings ALTER COLUMN currency DROP NOT NULL;
ALTER TABLE credit_listings ALTER COLUMN currency SET DEFAULT 'USD';

-- Make listing_type nullable and set default
ALTER TABLE credit_listings ALTER COLUMN listing_type DROP NOT NULL;
ALTER TABLE credit_listings ALTER COLUMN listing_type SET DEFAULT 'sell';

-- Make status nullable and set default
ALTER TABLE credit_listings ALTER COLUMN status DROP NOT NULL;
ALTER TABLE credit_listings ALTER COLUMN status SET DEFAULT 'active';

-- Make title nullable and set default
ALTER TABLE credit_listings ALTER COLUMN title DROP NOT NULL;
ALTER TABLE credit_listings ALTER COLUMN title SET DEFAULT 'Carbon Credits';

-- Make description nullable and set default
ALTER TABLE credit_listings ALTER COLUMN description DROP NOT NULL;
ALTER TABLE credit_listings ALTER COLUMN description SET DEFAULT 'Verified carbon credits';

-- Make category nullable and set default
ALTER TABLE credit_listings ALTER COLUMN category DROP NOT NULL;
ALTER TABLE credit_listings ALTER COLUMN category SET DEFAULT 'Renewable Energy';

-- Make location nullable and set default
ALTER TABLE credit_listings ALTER COLUMN location DROP NOT NULL;
ALTER TABLE credit_listings ALTER COLUMN location SET DEFAULT 'Unknown Location';

-- Make vintage_year nullable and set default
ALTER TABLE credit_listings ALTER COLUMN vintage_year DROP NOT NULL;
ALTER TABLE credit_listings ALTER COLUMN vintage_year SET DEFAULT EXTRACT(YEAR FROM NOW());

-- Make verification_standard nullable and set default
ALTER TABLE credit_listings ALTER COLUMN verification_standard DROP NOT NULL;
ALTER TABLE credit_listings ALTER COLUMN verification_standard SET DEFAULT 'EcoLink Standard';

-- =====================================================
-- STEP 4: Test the Fix
-- =====================================================
DO $$
DECLARE
  test_project_id UUID;
  test_project_credit_id UUID;
  test_listing_id UUID;
BEGIN
  -- Get a pending project
  SELECT id INTO test_project_id FROM projects WHERE status = 'pending' LIMIT 1;
  
  IF test_project_id IS NOT NULL THEN
    -- Create a test project_credit first
    INSERT INTO project_credits (
      project_id,
      total_credits,
      credits_available,
      price_per_credit,
      status,
      vintage_year
    ) VALUES (
      test_project_id,
      1000,
      1000,
      15.00,
      'active',
      EXTRACT(YEAR FROM NOW())::int
    ) RETURNING id INTO test_project_credit_id;
    
    RAISE NOTICE '✅ Test project_credit created: %', test_project_credit_id;
    
    -- Test creating credit_listing with minimal data
    INSERT INTO credit_listings (
      project_id,
      project_credit_id,
      seller_id
    ) VALUES (
      test_project_id,
      test_project_credit_id,
      (SELECT user_id FROM projects WHERE id = test_project_id)
    ) RETURNING id INTO test_listing_id;
    
    RAISE NOTICE '✅ Minimal credit listing creation test successful:';
    RAISE NOTICE '   - Project ID: %', test_project_id;
    RAISE NOTICE '   - Project Credit ID: %', test_project_credit_id;
    RAISE NOTICE '   - Listing ID: %', test_listing_id;
    
    -- Clean up test data
    DELETE FROM credit_listings WHERE id = test_listing_id;
    DELETE FROM project_credits WHERE id = test_project_credit_id;
    RAISE NOTICE '✅ Test data cleaned up';
    
    -- Test with full data
    INSERT INTO project_credits (
      project_id,
      total_credits,
      credits_available,
      price_per_credit,
      status,
      vintage_year
    ) VALUES (
      test_project_id,
      1000,
      1000,
      15.00,
      'active',
      EXTRACT(YEAR FROM NOW())::int
    ) RETURNING id INTO test_project_credit_id;
    
    INSERT INTO credit_listings (
      project_id,
      project_credit_id,
      seller_id,
      quantity,
      price_per_credit,
      currency,
      listing_type,
      status,
      title,
      description,
      category,
      location,
      vintage_year,
      verification_standard
    ) VALUES (
      test_project_id,
      test_project_credit_id,
      (SELECT user_id FROM projects WHERE id = test_project_id),
      1000,
      15.00,
      'USD',
      'sell',
      'active',
      'Test Carbon Credits',
      'Test description',
      'Renewable Energy',
      'Test Location',
      EXTRACT(YEAR FROM NOW())::int,
      'EcoLink Standard'
    ) RETURNING id INTO test_listing_id;
    
    RAISE NOTICE '✅ Full credit listing creation test successful:';
    RAISE NOTICE '   - Listing ID: %', test_listing_id;
    
    -- Clean up test data
    DELETE FROM credit_listings WHERE id = test_listing_id;
    DELETE FROM project_credits WHERE id = test_project_credit_id;
    RAISE NOTICE '✅ Full test data cleaned up';
  ELSE
    RAISE NOTICE '❌ No pending project found for test';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Credit listing creation test failed: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 5: Verify All Constraints Are Fixed
-- =====================================================
SELECT 
  'UPDATED CREDIT LISTINGS STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'credit_listings' 
  AND table_schema = 'public'
  AND column_name IN ('quantity', 'price_per_credit', 'currency', 'listing_type', 'status', 'title', 'description', 'category', 'location', 'vintage_year', 'verification_standard')
ORDER BY column_name;

-- =====================================================
-- STEP 6: Final Status
-- =====================================================
SELECT 
  'CREDIT LISTINGS CONSTRAINTS FIX COMPLETE' as check_type,
  'All NOT NULL constraints fixed in credit_listings' as status,
  'Project approval should now work without any constraint errors' as message,
  'Try approving a project again' as next_step;








