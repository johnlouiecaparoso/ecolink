-- ═══════════════════════════════════════════════════════════════════════════
-- ADD PROJECT IMAGE COLUMNS
-- Adds image storage columns to the projects table
-- ═══════════════════════════════════════════════════════════════════════════

-- Add image-related columns to projects table if they don't exist
DO $$ 
BEGIN
    -- Add project_image column (base64 or URL)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'project_image') THEN
        ALTER TABLE projects ADD COLUMN project_image TEXT;
        RAISE NOTICE 'Added project_image column to projects table';
    END IF;
    
    -- Add image_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'image_name') THEN
        ALTER TABLE projects ADD COLUMN image_name TEXT;
        RAISE NOTICE 'Added image_name column to projects table';
    END IF;
    
    -- Add image_type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'image_type') THEN
        ALTER TABLE projects ADD COLUMN image_type TEXT;
        RAISE NOTICE 'Added image_type column to projects table';
    END IF;
    
    -- Add image_size column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'image_size') THEN
        ALTER TABLE projects ADD COLUMN image_size BIGINT;
        RAISE NOTICE 'Added image_size column to projects table';
    END IF;
    
    RAISE NOTICE 'Project image columns setup complete';
END $$;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('project_image', 'image_name', 'image_type', 'image_size')
ORDER BY column_name;

