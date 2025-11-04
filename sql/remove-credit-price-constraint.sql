-- Remove or modify the check_credit_price and check_estimated_credits constraints on the projects table
-- This allows unlimited credit prices and credit limits when submitting projects

-- First, let's check if the constraints exist and what they do
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.projects'::regclass
    AND (conname = 'check_credit_price' OR conname = 'check_estimated_credits');

-- Drop the existing constraints if they exist
ALTER TABLE public.projects 
DROP CONSTRAINT IF EXISTS check_credit_price;

ALTER TABLE public.projects 
DROP CONSTRAINT IF EXISTS check_estimated_credits;

-- Add new constraints that only check for positive values (no upper limit)
-- This ensures values must be greater than 0 but have no maximum
ALTER TABLE public.projects
ADD CONSTRAINT check_credit_price_positive 
CHECK (credit_price IS NULL OR credit_price > 0);

ALTER TABLE public.projects
ADD CONSTRAINT check_estimated_credits_positive 
CHECK (estimated_credits IS NULL OR estimated_credits > 0);

-- Verify the constraints were updated
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.projects'::regclass
    AND (conname LIKE '%credit_price%' OR conname LIKE '%estimated_credits%');

