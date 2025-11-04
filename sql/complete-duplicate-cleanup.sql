-- ═══════════════════════════════════════════════════════════════════════════
-- COMPLETE DUPLICATE CLEANUP - ALL TABLES
-- This fixes duplicates in both project_credits AND credit_listings
-- ═══════════════════════════════════════════════════════════════════════════

-- ============================================================================
-- PART 1: Fix project_credits duplicates
-- ============================================================================

-- Show duplicate project_credits
SELECT 
    'Step 1 - Duplicate project_credits analysis:' AS step,
    project_id,
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as credit_ids,
    STRING_AGG(created_at::text, ', ') as created_dates
FROM project_credits
GROUP BY project_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Delete duplicate project_credits (keep oldest, delete newer ones)
WITH ranked_credits AS (
    SELECT 
        id,
        project_id,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY project_id 
            ORDER BY created_at ASC  -- Keep oldest
        ) as row_num
    FROM project_credits
)
DELETE FROM project_credits
WHERE id IN (
    SELECT id FROM ranked_credits WHERE row_num > 1
);

-- Add unique constraint to project_credits (prevent future duplicates)
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'project_credits_project_id_unique'
    ) THEN
        ALTER TABLE project_credits 
        DROP CONSTRAINT project_credits_project_id_unique;
        RAISE NOTICE 'Dropped existing unique constraint on project_credits';
    END IF;
    
    -- Add unique constraint on project_id
    ALTER TABLE project_credits
    ADD CONSTRAINT project_credits_project_id_unique 
    UNIQUE (project_id);
    
    RAISE NOTICE 'Added unique constraint on project_credits.project_id';
END $$;

-- ============================================================================
-- PART 2: Fix credit_listings duplicates  
-- ============================================================================

-- Show duplicate credit_listings
SELECT 
    'Step 2 - Duplicate credit_listings analysis:' AS step,
    project_credit_id,
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as listing_ids,
    STRING_AGG(created_at::text, ', ') as created_dates
FROM credit_listings
WHERE status = 'active'
GROUP BY project_credit_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Delete duplicate credit_listings (keep oldest)
WITH ranked_listings AS (
    SELECT 
        id,
        project_credit_id,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY project_credit_id 
            ORDER BY created_at ASC  -- Keep oldest
        ) as row_num
    FROM credit_listings
    WHERE status = 'active'
)
DELETE FROM credit_listings
WHERE id IN (
    SELECT id FROM ranked_listings WHERE row_num > 1
);

-- Ensure unique constraint on credit_listings
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'credit_listings_project_credit_id_unique'
    ) THEN
        ALTER TABLE credit_listings 
        DROP CONSTRAINT credit_listings_project_credit_id_unique;
        RAISE NOTICE 'Dropped existing unique constraint on credit_listings';
    END IF;
    
    -- Add unique constraint on project_credit_id
    ALTER TABLE credit_listings
    ADD CONSTRAINT credit_listings_project_credit_id_unique 
    UNIQUE (project_credit_id);
    
    RAISE NOTICE 'Added unique constraint on credit_listings.project_credit_id';
END $$;

-- ============================================================================
-- PART 3: Verify cleanup
-- ============================================================================

-- Verify project_credits cleanup
SELECT 
    'Verification - project_credits:' AS step,
    COUNT(DISTINCT project_id) as unique_projects,
    COUNT(*) as total_credits,
    COUNT(*) - COUNT(DISTINCT project_id) as remaining_duplicates
FROM project_credits;

-- Verify credit_listings cleanup
SELECT 
    'Verification - credit_listings:' AS step,
    COUNT(DISTINCT project_credit_id) as unique_credits,
    COUNT(*) as total_listings,
    COUNT(*) - COUNT(DISTINCT project_credit_id) as remaining_duplicates
FROM credit_listings
WHERE status = 'active';

-- Show constraint status
SELECT 
    'Constraint verification:' AS step,
    cl.relname AS table_name,
    c.conname AS constraint_name,
    c.contype AS constraint_type
FROM pg_constraint c
JOIN pg_class cl ON c.conrelid = cl.oid
WHERE cl.relname IN ('project_credits', 'credit_listings')
AND c.contype = 'u';  -- 'u' = unique constraint

-- Final relationship check
SELECT 
    'Final relationship check:' AS step,
    COUNT(DISTINCT p.id) as total_projects,
    COUNT(DISTINCT pc.id) as total_project_credits,
    COUNT(DISTINCT cl.id) as total_listings,
    COUNT(DISTINCT p.id) as projects_with_credits,
    COUNT(DISTINCT pc.id) as credits_with_listings
FROM projects p
LEFT JOIN project_credits pc ON pc.project_id = p.id
LEFT JOIN credit_listings cl ON cl.project_credit_id = pc.id AND cl.status = 'active'
WHERE p.status = 'approved';

SELECT '✅ Complete cleanup finished! All duplicates removed and constraints enforced.' AS status;

