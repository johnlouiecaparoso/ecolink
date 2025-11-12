-- Debug: Check if project fields exist and their values
-- Run this in your Supabase SQL Editor

-- Check if columns exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'projects'
AND column_name IN ('estimated_credits', 'credit_price', 'project_image', 'image_name', 'image_type', 'image_size')
ORDER BY column_name;

-- Check current projects and their credit data
SELECT 
    id,
    title,
    status,
    estimated_credits,
    credit_price,
    category,
    created_at
FROM projects
ORDER BY created_at DESC
LIMIT 10;

-- Check if project_credits table has currency field
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'project_credits'
AND column_name = 'currency';

-- Check current project_credits data
SELECT 
    id,
    project_id,
    price_per_credit,
    currency,
    total_credits,
    available_credits,
    created_at
FROM project_credits
ORDER BY created_at DESC
LIMIT 10;


















