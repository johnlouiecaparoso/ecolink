-- Projects Table Setup for EcoLink
-- Run these commands in your Supabase SQL Editor

-- 1. Create the projects table
CREATE TABLE IF NOT EXISTS projects (
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

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies

-- Policy 1: Users can view their own projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own projects
CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own projects (only if pending)
CREATE POLICY "Users can update their own pending projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Policy 4: Users can delete their own projects (only if pending)
CREATE POLICY "Users can delete their own pending projects" ON projects
  FOR DELETE USING (auth.uid() = user_id AND status = 'pending');

-- Policy 5: Verifiers can view all projects
CREATE POLICY "Verifiers can view all projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('verifier', 'admin', 'super_admin')
    )
  );

-- Policy 6: Verifiers can update project status and verification details
CREATE POLICY "Verifiers can update project verification" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('verifier', 'admin', 'super_admin')
    )
  );

-- Policy 7: Admins can view all projects
CREATE POLICY "Admins can view all projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policy 8: Admins can update all projects
CREATE POLICY "Admins can update all projects" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policy 9: Admins can delete any project
CREATE POLICY "Admins can delete any project" ON projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- 5. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_projects_updated_at();

-- 7. Create function to set verified_by and verified_at when status changes
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

-- 8. Create trigger for verification details
DROP TRIGGER IF EXISTS update_verification_details ON projects;
CREATE TRIGGER update_verification_details
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_verification_details();

-- 9. Insert some sample projects for testing (optional)
-- Uncomment the following lines if you want sample data

/*
INSERT INTO projects (user_id, title, description, category, location, expected_impact, status) VALUES
(
  (SELECT id FROM auth.users LIMIT 1),
  'Solar Panel Installation',
  'Install solar panels on community center to reduce electricity costs and carbon footprint',
  'Renewable Energy',
  'Manila, Philippines',
  'Reduce electricity costs by 40% and carbon emissions by 2 tons annually',
  'pending'
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Tree Planting Initiative',
  'Plant 1000 trees in urban areas to improve air quality and create green spaces',
  'Environmental Conservation',
  'Quezon City, Philippines',
  'Improve air quality and create 5 new green spaces for the community',
  'pending'
);
*/

-- 10. Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- 11. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY policyname;

-- 12. Test the table (run this after creating some projects)
-- SELECT 
--     p.id,
--     p.title,
--     p.status,
--     p.created_at,
--     pr.full_name as user_name,
--     u.email as user_email
-- FROM projects p
-- LEFT JOIN profiles pr ON p.user_id = pr.id
-- LEFT JOIN auth.users u ON p.user_id = u.id
-- ORDER BY p.created_at DESC;
