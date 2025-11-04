-- Check if projects table has pricing columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'projects'
AND column_name IN ('estimated_credits', 'credit_price')
ORDER BY column_name;

-- Check actual projects data
SELECT 
    id,
    title,
    status,
    estimated_credits,
    credit_price,
    category,
    created_at
FROM projects
ORDER BY created_at DESC;

-- Check what project_credits are created
SELECT 
    pc.id,
    pc.project_id,
    pc.price_per_credit,
    pc.currency,
    pc.total_credits,
    pc.created_at,
    p.title AS project_title,
    p.credit_price AS project_credit_price,
    p.estimated_credits AS project_estimated_credits
FROM project_credits pc
LEFT JOIN projects p ON p.id = pc.project_id
ORDER BY pc.created_at DESC
LIMIT 20;

-- Check marketplace listings prices
SELECT 
    cl.id,
    cl.project_credit_id,
    cl.price_per_credit,
    cl.currency,
    cl.quantity,
    cl.status,
    cl.created_at,
    p.title AS project_title,
    p.credit_price AS project_credit_price,
    p.estimated_credits AS project_estimated_credits,
    pc.price_per_credit AS credit_price_per_credit
FROM credit_listings cl
LEFT JOIN project_credits pc ON pc.id = cl.project_credit_id
LEFT JOIN projects p ON p.id = pc.project_id
ORDER BY cl.created_at DESC
LIMIT 20;

