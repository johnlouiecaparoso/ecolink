-- Prevent duplicate marketplace listings
-- This script adds database constraints to prevent duplicate credit_listings

-- 1. Add unique constraint on project_credit_id to prevent multiple active listings for same project credit
-- First, let's see if there are any existing duplicates
SELECT 
    project_credit_id,
    COUNT(*) as duplicate_count
FROM credit_listings 
WHERE status = 'active'
GROUP BY project_credit_id 
HAVING COUNT(*) > 1;

-- 2. Clean up any existing duplicates first (keep the most recent)
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

-- 3. Add unique constraint to prevent future duplicates
-- This will prevent multiple active listings for the same project_credit_id
DO $$
BEGIN
    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE t.relname = 'credit_listings'
          AND n.nspname = 'public'
          AND c.conname = 'unique_active_project_credit_listing'
    ) THEN
        ALTER TABLE public.credit_listings
          ADD CONSTRAINT unique_active_project_credit_listing
          UNIQUE (project_credit_id) 
          WHERE status = 'active';
    END IF;
END$$;

-- 4. Add index for better performance on duplicate checks
CREATE INDEX IF NOT EXISTS idx_credit_listings_project_credit_status 
ON credit_listings (project_credit_id, status) 
WHERE status = 'active';

-- 5. Verify the constraint was added
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'credit_listings'::regclass
  AND conname = 'unique_active_project_credit_listing';

-- 6. Test the constraint (this should fail if duplicates exist)
-- SELECT 'Constraint test passed - no duplicates found' as result;




