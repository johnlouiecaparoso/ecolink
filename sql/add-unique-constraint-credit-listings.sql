-- ═══════════════════════════════════════════════════════════════════════════
-- ADD UNIQUE CONSTRAINT TO PREVENT DUPLICATE LISTINGS
-- This adds a unique constraint on project_credit_id in credit_listings
-- ═══════════════════════════════════════════════════════════════════════════

-- First, delete any existing duplicates (keeping the oldest one)
WITH duplicates AS (
    SELECT 
        id,
        project_credit_id,
        ROW_NUMBER() OVER (
            PARTITION BY project_credit_id 
            ORDER BY created_at ASC  -- Keep oldest
        ) as row_num
    FROM credit_listings
)
DELETE FROM credit_listings
WHERE id IN (
    SELECT id FROM duplicates WHERE row_num > 1
);

-- Check if unique constraint already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'credit_listings_project_credit_id_unique'
    ) THEN
        -- Add unique constraint
        ALTER TABLE credit_listings
        ADD CONSTRAINT credit_listings_project_credit_id_unique 
        UNIQUE (project_credit_id);
        
        RAISE NOTICE 'Added unique constraint on project_credit_id';
    ELSE
        RAISE NOTICE 'Unique constraint already exists';
    END IF;
END $$;

-- Verify the constraint
SELECT 
    'Unique constraint added successfully!' AS status,
    COUNT(DISTINCT project_credit_id) as unique_project_credits,
    COUNT(*) as total_listings
FROM credit_listings;










