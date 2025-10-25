-- Fix duplicate marketplace listings
-- This script will identify and clean up duplicate credit_listings

-- First, let's see what duplicates exist
SELECT 
    project_credit_id,
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as listing_ids
FROM credit_listings 
WHERE status = 'active'
GROUP BY project_credit_id 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Show the duplicate listings with details
SELECT 
    cl.id,
    cl.project_credit_id,
    cl.quantity,
    cl.price_per_credit,
    cl.status,
    cl.created_at,
    pc.project_id,
    p.title as project_title
FROM credit_listings cl
JOIN project_credits pc ON cl.project_credit_id = pc.id
JOIN projects p ON pc.project_id = p.id
WHERE cl.project_credit_id IN (
    SELECT project_credit_id
    FROM credit_listings 
    WHERE status = 'active'
    GROUP BY project_credit_id 
    HAVING COUNT(*) > 1
)
ORDER BY cl.project_credit_id, cl.created_at;

-- Delete duplicate listings, keeping only the most recent one
DELETE FROM credit_listings 
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY project_credit_id 
                   ORDER BY created_at DESC
               ) as rn
        FROM credit_listings 
        WHERE status = 'active'
    ) ranked
    WHERE rn > 1
);

-- Verify the cleanup
SELECT 
    'Cleanup Complete' as status,
    (SELECT COUNT(*) FROM credit_listings WHERE status = 'active') as active_listings,
    (SELECT COUNT(DISTINCT project_credit_id) FROM credit_listings WHERE status = 'active') as unique_project_credits;




