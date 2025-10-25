-- Add project image fields to the projects table
-- Run this in your Supabase SQL Editor

-- Add image-related columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_image TEXT; -- Base64 encoded image
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_name TEXT; -- Original filename
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_type TEXT; -- MIME type (image/jpeg, etc.)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_size INTEGER; -- File size in bytes

-- Add index for better performance when filtering by image presence
CREATE INDEX IF NOT EXISTS idx_projects_has_image ON projects((project_image IS NOT NULL));

-- Add comment to document the new fields
COMMENT ON COLUMN projects.project_image IS 'Base64 encoded project image for display in marketplace';
COMMENT ON COLUMN projects.image_name IS 'Original filename of the uploaded image';
COMMENT ON COLUMN projects.image_type IS 'MIME type of the uploaded image (image/jpeg, image/png, etc.)';
COMMENT ON COLUMN projects.image_size IS 'File size of the uploaded image in bytes';




