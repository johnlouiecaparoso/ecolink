-- ULTIMATE DIAGNOSTIC - Run this NOW!
-- This will tell us EXACTLY what's wrong

-- =================================================================
-- STEP 1: Check if columns exist
-- =================================================================
SELECT 
    'STEP 1: Column Check' as diagnostic_step,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'projects'
AND column_name IN ('estimated_credits', 'credit_price', 'project_image')
ORDER BY column_name;

-- =================================================================
-- STEP 2: Check your recent project
-- =================================================================
SELECT 
    'STEP 2: Recent Project Data' as diagnostic_step,
    id,
    title,
    status,
    estimated_credits,
    credit_price,
    project_image IS NOT NULL as has_image,
    created_at
FROM projects
WHERE title LIKE '%should display%' 
   OR title LIKE '%new projects%'
ORDER BY created_at DESC
LIMIT 5;

-- =================================================================
-- STEP 3: Check if listing got created with wrong price
-- =================================================================
SELECT 
    'STEP 3: Listing Price Check' as diagnostic_step,
    cl.id,
    cl.price_per_credit as listing_price,
    p.title,
    p.credit_price as project_credit_price,
    CASE 
        WHEN cl.price_per_credit = p.credit_price THEN '✅ CORRECT'
        WHEN p.credit_price IS NULL THEN '❌ Project has NULL price'
        WHEN p.estimated_credits IS NULL THEN '❌ Project has NULL credits'
        ELSE '❌ MISMATCH!'
    END as diagnostic_result,
    cl.created_at
FROM credit_listings cl
LEFT JOIN project_credits pc ON pc.id = cl.project_credit_id
LEFT JOIN projects p ON p.id = pc.project_id
WHERE p.title LIKE '%should display%' 
   OR p.title LIKE '%new projects%'
ORDER BY cl.created_at DESC;

-- =================================================================
-- STEP 4: Full data flow check
-- =================================================================
SELECT 
    'STEP 4: Data Flow Check' as diagnostic_step,
    p.id as project_id,
    p.title,
    p.estimated_credits,
    p.credit_price as project_price,
    pc.id as credit_id,
    pc.price_per_credit as credit_price,
    cl.id as listing_id,
    cl.price_per_credit as listing_price,
    CASE 
        WHEN p.estimated_credits IS NULL OR p.credit_price IS NULL THEN 'STOP: Missing project data'
        WHEN pc.price_per_credit != p.credit_price THEN 'STOP: Credit mismatch'
        WHEN cl.price_per_credit != p.credit_price THEN 'STOP: Listing mismatch'
        ELSE '✅ ALL GOOD'
    END as flow_diagnostic
FROM projects p
LEFT JOIN project_credits pc ON pc.project_id = p.id
LEFT JOIN credit_listings cl ON cl.project_credit_id = pc.id
WHERE p.title LIKE '%should display%' 
   OR p.title LIKE '%new projects%'
ORDER BY p.created_at DESC
LIMIT 5;




