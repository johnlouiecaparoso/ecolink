-- Create a new admin user
-- This will create a user account and set them as admin

-- 1. First, create the user in auth.users (you'll need to do this through Supabase Auth UI)
-- Go to Authentication > Users > Add User
-- Or use the Supabase Auth API

-- 2. After creating the user, get their ID and run this:
-- Replace 'new-admin-user-id' with the actual user ID

INSERT INTO profiles (id, full_name, role, kyc_level, created_at, updated_at)
VALUES (
    'new-admin-user-id',  -- Replace with actual user ID
    'Admin User',         -- Replace with actual name
    'admin',              -- Set as admin
    0,                    -- KYC level
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();

-- 3. Verify the admin user was created
SELECT 
    p.id,
    p.full_name,
    p.role,
    u.email
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';
