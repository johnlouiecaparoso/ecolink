-- ═══════════════════════════════════════════════════════════════════════════
-- FIX DUPLICATE MARKETPLACE LISTINGS
-- This script removes duplicate credit_listings entries
-- ═══════════════════════════════════════════════════════════════════════════

-- Step 1: Find duplicate listings
SELECT 
    project_credit_id,
    COUNT(*) as duplicate_count,
    array_agg(id) as listing_ids
FROM credit_listings
GROUP BY project_credit_id
HAVING COUNT(*) > 1;

-- Step 2: Delete duplicates, keeping only the most recent one
WITH duplicates AS (
    SELECT 
        id,
        project_credit_id,
        ROW_NUMBER() OVER (
            PARTITION BY project_credit_id 
            ORDER BY created_at DESC
        ) as row_num
    FROM credit_listings
)
DELETE FROM credit_listings
WHERE id IN (
    SELECT id FROM duplicates WHERE row_num > 1
);

-- Step 3: Verify no more duplicates
SELECT 
    'Remaining duplicates: ' || COUNT(*)::text as result
FROM (
    SELECT project_credit_id
    FROM credit_listings
    GROUP BY project_credit_id
    HAVING COUNT(*) > 1
) duplicate_check;

-- Step 4: Show final listing count
SELECT COUNT(*) as total_listings FROM credit_listings;

