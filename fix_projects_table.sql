-- Fix Projects Table - Drop and Recreate
-- Run this in your Supabase SQL Editor

-- 1. First, let's check what exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- 2. Drop the table if it exists (this will remove all data)
DROP TABLE IF EXISTS projects CASCADE;

-- 3. Drop any existing functions and triggers
DROP FUNCTION IF EXISTS update_projects_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_verification_details() CASCADE;

-- 4. Recreate the projects table with all columns
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  expected_impact TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  verification_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- 6. Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can delete their own pending projects" ON projects
  FOR DELETE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Verifiers can view all projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('verifier', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Verifiers can update project verification" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('verifier', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can view all projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all projects" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete any project" ON projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create trigger for updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_projects_updated_at();

-- 10. Create function for verification details
CREATE OR REPLACE FUNCTION update_verification_details()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changed to approved or rejected, set verification details
    IF OLD.status != NEW.status AND NEW.status IN ('approved', 'rejected') THEN
        NEW.verified_by = auth.uid();
        NEW.verified_at = NOW();
    END IF;
    
    -- If status changed back to pending, clear verification details
    IF OLD.status != NEW.status AND NEW.status = 'pending' THEN
        NEW.verified_by = NULL;
        NEW.verified_at = NULL;
        NEW.verification_notes = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Create trigger for verification details
CREATE TRIGGER update_verification_details
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_verification_details();

-- 12. Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- 13. Test insert (optional - uncomment to test)
/*
INSERT INTO projects (user_id, title, description, category, location, expected_impact) VALUES
(
  (SELECT id FROM auth.users LIMIT 1),
  'Test Solar Project',
  'Test description for solar panel installation',
  'Renewable Energy',
  'Test Location',
  'Test impact description'
);
*/

-- 14. Verify the test data
-- SELECT * FROM projects;
