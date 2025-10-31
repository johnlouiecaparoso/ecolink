-- Complete Project Workflow Test
-- Test: Developer Submit → Verifier Approve → Marketplace
-- Then clean up test data for real integration

-- =====================================================
-- STEP 1: Clean up existing test data first
-- =====================================================
DO $$
BEGIN
  DELETE FROM credit_listings WHERE title LIKE 'Test%';
  DELETE FROM project_credits WHERE project_id IN (
    SELECT id FROM projects WHERE title LIKE 'Test Project%'
  );
  DELETE FROM projects WHERE title LIKE 'Test Project%';
  RAISE NOTICE '✅ Cleaned up existing test data';
END $$;

-- =====================================================
-- STEP 2: Developer submits a new project
-- =====================================================
DO $$
DECLARE
  developer_id UUID;
  new_project_id UUID;
BEGIN
  -- Get developer account
  SELECT id INTO developer_id FROM profiles WHERE role = 'project_developer' LIMIT 1;
  
  IF developer_id IS NOT NULL THEN
    -- Developer submits a project
    INSERT INTO projects (
      title,
      description,
      category,
      location,
      status,
      user_id,
      created_at,
      updated_at
    ) VALUES (
      'Solar Farm Project - Real Test',
      'A real solar farm project for testing the complete workflow',
      'Renewable Energy',
      'Philippines',
      'pending',
      developer_id,
      NOW(),
      NOW()
    ) RETURNING id INTO new_project_id;
    
    RAISE NOTICE '✅ Developer submitted project: % (ID: %)', 'Solar Farm Project - Real Test', new_project_id;
  ELSE
    RAISE NOTICE '❌ No developer account found';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error creating project: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 3: Check if verifier can see pending projects
-- =====================================================
SELECT 
  'VERIFIER CAN SEE PENDING' as test_step,
  p.title,
  p.status,
  p.location,
  p.category,
  pr.full_name as submitted_by,
  p.created_at
FROM projects p
JOIN profiles pr ON p.user_id = pr.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;

-- =====================================================
-- STEP 4: Verifier approves the project
-- =====================================================
DO $$
DECLARE
  verifier_id UUID;
  project_to_approve UUID;
BEGIN
  -- Get verifier account
  SELECT id INTO verifier_id FROM profiles WHERE role = 'verifier' LIMIT 1;
  
  -- Get the pending project
  SELECT id INTO project_to_approve FROM projects 
  WHERE status = 'pending' 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF verifier_id IS NOT NULL AND project_to_approve IS NOT NULL THEN
    -- Verifier approves the project
    UPDATE projects 
    SET 
      status = 'approved',
      verified_by = verifier_id,
      updated_at = NOW()
    WHERE id = project_to_approve;
    
    RAISE NOTICE '✅ Verifier approved project: %', project_to_approve;
  ELSE
    RAISE NOTICE '❌ Missing verifier or project to approve';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error approving project: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 5: Check if approved project appears in marketplace
-- =====================================================
SELECT 
  'MARKETPLACE VISIBLE' as test_step,
  p.title,
  p.status,
  p.location,
  p.category,
  pr.full_name as project_owner,
  p.created_at,
  p.updated_at
FROM projects p
JOIN profiles pr ON p.user_id = pr.id
WHERE p.status = 'approved'
ORDER BY p.updated_at DESC;

-- =====================================================
-- STEP 6: Create project credits for marketplace
-- =====================================================
DO $$
DECLARE
  approved_project_id UUID;
  project_credit_id UUID;
BEGIN
  -- Get the approved project
  SELECT id INTO approved_project_id FROM projects 
  WHERE status = 'approved' 
  ORDER BY updated_at DESC 
  LIMIT 1;
  
  IF approved_project_id IS NOT NULL THEN
    -- Create project credits for marketplace
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
      approved_project_id,
      5000, -- Total credits
      5000, -- Available for sale
      25.00, -- Price per credit
      'active',
      EXTRACT(YEAR FROM NOW())::int,
      NOW(),
      NOW()
    ) RETURNING id INTO project_credit_id;
    
    RAISE NOTICE '✅ Created project credits: % for project: %', project_credit_id, approved_project_id;
  ELSE
    RAISE NOTICE '❌ No approved project found';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error creating project credits: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 7: Create marketplace listing
-- =====================================================
DO $$
DECLARE
  project_id UUID;
  project_credit_id UUID;
  developer_id UUID;
BEGIN
  -- Get the approved project and its credits
  SELECT p.id, pc.id, p.user_id 
  INTO project_id, project_credit_id, developer_id
  FROM projects p
  JOIN project_credits pc ON p.id = pc.project_id
  WHERE p.status = 'approved'
  ORDER BY p.updated_at DESC
  LIMIT 1;
  
  IF project_id IS NOT NULL AND project_credit_id IS NOT NULL AND developer_id IS NOT NULL THEN
    -- Create marketplace listing
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
      project_id,
      project_credit_id,
      developer_id,
      1000, -- Quantity for sale
      25.00, -- Price per credit
      'USD',
      'sell',
      'active',
      'Solar Farm Credits - Available Now',
      'High-quality solar farm carbon credits from verified renewable energy project',
      'Renewable Energy',
      'Philippines',
      EXTRACT(YEAR FROM NOW())::int,
      'EcoLink Standard'
    );
    
    RAISE NOTICE '✅ Created marketplace listing for project: %', project_id;
  ELSE
    RAISE NOTICE '❌ Missing data for marketplace listing';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error creating marketplace listing: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 8: Verify complete workflow
-- =====================================================
SELECT 
  'COMPLETE WORKFLOW VERIFICATION' as test_step,
  p.title as project_title,
  p.status as project_status,
  pc.total_credits,
  pc.credits_available,
  pc.price_per_credit,
  cl.title as listing_title,
  cl.status as listing_status,
  cl.quantity as listing_quantity
FROM projects p
JOIN project_credits pc ON p.id = pc.project_id
LEFT JOIN credit_listings cl ON p.id = cl.project_id
WHERE p.status = 'approved'
ORDER BY p.updated_at DESC;

-- =====================================================
-- STEP 9: Final Status Check
-- =====================================================
SELECT 
  'FINAL STATUS' as test_step,
  'Workflow Test Complete' as status,
  'Check results above to verify:' as instructions,
  '1. Developer submitted project (pending_verification)' as step_1,
  '2. Verifier can see pending projects' as step_2,
  '3. Verifier approved project (approved)' as step_3,
  '4. Project appears in marketplace' as step_4,
  '5. Credits and listings created' as step_5;
