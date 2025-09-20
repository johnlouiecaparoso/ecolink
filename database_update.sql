-- Update the profiles table to support role-based access control
-- Run these commands in your Supabase SQL Editor

-- 1. First, let's check the current structure of the profiles table
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Add the role column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 3. Add a check constraint to ensure only valid roles are allowed
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'verifier', 'admin', 'super_admin'));

-- 4. Update existing users to have the 'user' role (if they don't have one)
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL OR role = '';

-- 5. Add an index on the role column for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 6. Add updated_at column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 7. Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create a trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Insert a sample admin user (replace with your actual user ID)
-- First, get your user ID from auth.users table
-- SELECT id, email FROM auth.users;

-- Then update your profile to be an admin (replace 'your-user-id-here' with your actual user ID)
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = 'your-user-id-here';

-- 10. Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 11. Check current users and their roles
SELECT 
    p.id,
    p.full_name,
    p.role,
    p.kyc_level,
    p.created_at,
    p.updated_at,
    u.email
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;
