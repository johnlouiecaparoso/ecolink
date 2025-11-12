-- Find projects with default prices
-- This will show you which projects are using old default prices

-- Check all projects with their pricing data
SELECT 
    'Projects' as table_name,
    id,
    title,
    status,
    estimated_credits,
    credit_price,
    CASE 
        WHEN estimated_credits IS NULL THEN '❌ NO ESTIMATED_CREDITS'
        WHEN credit_price IS NULL THEN '❌ NO CREDIT_PRICE'
        WHEN credit_price = 25 THEN '❌ USING DEFAULT ₱25'
        ELSE '✅ CUSTOM PRICE'
    END as status_notes,
    created_at
FROM projects
ORDER BY created_at DESC
LIMIT 20;

-- Check what prices were actually stored in listings
SELECT 
    'Listings' as table_name,
    cl.id as listing_id,
    cl.price_per_credit,
    cl.currency,
    p.title,
    p.credit_price as developer_set_price,
    CASE 
        WHEN cl.price_per_credit = p.credit_price THEN '✅ Matches developer price'
        WHEN p.credit_price IS NULL THEN '❌ Developer price was NULL'
        ELSE '❌ MISMATCH!'
    END as status_notes,
    cl.created_at
FROM credit_listings cl
LEFT JOIN project_credits pc ON pc.id = cl.project_credit_id
LEFT JOIN projects p ON p.id = pc.project_id
ORDER BY cl.created_at DESC
LIMIT 20;

-- Summary
SELECT 
    'Summary' as table_name,
    COUNT(*) as total_projects,
    COUNT(*) FILTER (WHERE estimated_credits IS NOT NULL) as with_credits,
    COUNT(*) FILTER (WHERE credit_price IS NOT NULL) as with_price,
    COUNT(*) FILTER (WHERE credit_price = 25) as using_default_25,
    COUNT(*) FILTER (WHERE credit_price IS NOT NULL AND credit_price != 25) as custom_prices
FROM projects;
















