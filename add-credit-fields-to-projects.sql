-- Add credit estimation fields to projects table
-- Run this in your Supabase SQL Editor

-- Add estimated credits and price fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_credits INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS credit_price DECIMAL(10,2);

-- Add comments to document the new fields
COMMENT ON COLUMN projects.estimated_credits IS 'Estimated number of carbon credits this project will generate';
COMMENT ON COLUMN projects.credit_price IS 'Price per credit in USD';

-- Add constraints for data validation (only if they don't exist)
DO $$
BEGIN
  -- Add estimated_credits constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE t.relname = 'projects'
      AND n.nspname = 'public'
      AND c.conname = 'check_estimated_credits'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT check_estimated_credits
      CHECK (estimated_credits IS NULL OR (estimated_credits > 0 AND estimated_credits <= 1000000));
  END IF;

  -- Add credit_price constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE t.relname = 'projects'
      AND n.nspname = 'public'
      AND c.conname = 'check_credit_price'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT check_credit_price
      CHECK (credit_price IS NULL OR (credit_price > 0 AND credit_price <= 1000));
  END IF;
END$$;
