-- Create a new verifier user
-- This will create a user account and set them as verifier

-- 1. First, create the user in auth.users (you'll need to do this through Supabase Auth UI)
-- Go to Authentication > Users > Add User
-- Or use the Supabase Auth API

-- 2. After creating the user, get their ID and run this:
-- Replace 'new-verifier-user-id' with the actual user ID

INSERT INTO profiles (id, full_name, role, kyc_level, created_at, updated_at)
VALUES (
    'new-verifier-user-id',  -- Replace with actual user ID
    'Verifier User',         -- Replace with actual name
    'verifier',              -- Set as verifier
    0,                       -- KYC level
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    role = 'verifier',
    updated_at = NOW();

-- 3. Verify the verifier user was created
SELECT 
    p.id,
    p.full_name,
    p.role,
    u.email
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.role = 'verifier';

-- 4. Optional: Create multiple verifiers at once
-- You can uncomment and modify this section to create multiple verifiers

/*
INSERT INTO profiles (id, full_name, role, kyc_level, created_at, updated_at)
VALUES 
    ('verifier-1-id', 'John Verifier', 'verifier', 0, NOW(), NOW()),
    ('verifier-2-id', 'Jane Verifier', 'verifier', 0, NOW(), NOW()),
    ('verifier-3-id', 'Mike Verifier', 'verifier', 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    role = 'verifier',
    updated_at = NOW();
*/

