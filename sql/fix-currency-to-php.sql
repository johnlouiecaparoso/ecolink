-- Fix currency to PHP for credit_listings and project_credits tables
-- Run this in your Supabase SQL Editor

-- 1. Update existing credit_listings to PHP
UPDATE credit_listings 
SET currency = 'PHP'
WHERE currency = 'USD' OR currency IS NULL;

-- 2. Update existing project_credits to PHP
UPDATE project_credits
SET currency = 'PHP'
WHERE currency = 'USD' OR currency IS NULL;

-- 3. Alter the default value for future inserts on credit_listings
ALTER TABLE credit_listings 
ALTER COLUMN currency SET DEFAULT 'PHP';

-- 4. Alter the default value for future inserts on project_credits
-- First, check if the column exists and has a default
DO $$
BEGIN
    -- Check if project_credits table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_credits') THEN
        -- Check if currency column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_credits' AND column_name = 'currency') THEN
            ALTER TABLE project_credits 
            ALTER COLUMN currency SET DEFAULT 'PHP';
        END IF;
    END IF;
END $$;

-- 5. Verify the changes
SELECT 
    'credit_listings USD records updated' as status,
    COUNT(*) as records_found
FROM credit_listings 
WHERE currency = 'PHP';

SELECT 
    'project_credits USD records updated' as status,
    COUNT(*) as records_found
FROM project_credits
WHERE currency = 'PHP';




