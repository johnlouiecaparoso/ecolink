-- Add all missing fields to projects table
-- Run this in your Supabase SQL Editor

-- ═══════════════════════════════════════════════════════════════════════════
-- Add credit estimation and price fields
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_credits INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS credit_price DECIMAL(10,2);

-- ═══════════════════════════════════════════════════════════════════════════
-- Add project image fields
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_image TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_type TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_size INTEGER;

-- ═══════════════════════════════════════════════════════════════════════════
-- Add data validation constraints
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  -- Add estimated_credits constraint
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
    RAISE NOTICE '✅ Added check_estimated_credits constraint';
  END IF;

  -- Add credit_price constraint
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
    RAISE NOTICE '✅ Added check_credit_price constraint';
  END IF;
END$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Add comments to document the new fields
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON COLUMN projects.estimated_credits IS 'Estimated number of carbon credits this project will generate';
COMMENT ON COLUMN projects.credit_price IS 'Price per credit in PHP (Philippine Pesos)';
COMMENT ON COLUMN projects.project_image IS 'Base64 encoded project image for display in marketplace';
COMMENT ON COLUMN projects.image_name IS 'Original filename of the uploaded image';
COMMENT ON COLUMN projects.image_type IS 'MIME type of the uploaded image (image/jpeg, image/png, etc.)';
COMMENT ON COLUMN projects.image_size IS 'File size of the uploaded image in bytes';

-- ═══════════════════════════════════════════════════════════════════════════
-- Add index for better performance when filtering by image presence
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_projects_has_image ON projects((project_image IS NOT NULL));

-- ═══════════════════════════════════════════════════════════════════════════
-- Verify all columns were added
-- ═══════════════════════════════════════════════════════════════════════════

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('estimated_credits', 'credit_price', 'project_image', 'image_name', 'image_type', 'image_size')
ORDER BY column_name;

-- ═══════════════════════════════════════════════════════════════════════════
-- Success message
-- ═══════════════════════════════════════════════════════════════════════════

SELECT '✅ All project fields added successfully!' AS result;


















