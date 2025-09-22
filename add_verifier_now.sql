-- Quick script to add a verifier user
-- Follow these steps:

-- STEP 1: Create user in Supabase Auth UI
-- 1. Go to Authentication > Users > Add User
-- 2. Email: verifier@ecolink.com
-- 3. Password: Verifier123!
-- 4. Email Confirm: ✓ (checked)
-- 5. Click "Create User"
-- 6. Copy the User ID from the created user

-- STEP 2: Replace 'YOUR_USER_ID_HERE' with the actual User ID from Step 1
-- Then run this SQL:

INSERT INTO profiles (id, full_name, role, kyc_level, created_at, updated_at)
VALUES (
    'YOUR_USER_ID_HERE',  -- Replace with actual user ID from Step 1
    'EcoLink Verifier',   -- You can change this name
    'verifier',           -- Role is verifier
    0,                    -- KYC level
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    role = 'verifier',
    updated_at = NOW();

-- STEP 3: Verify the verifier was created
SELECT 
    p.id,
    p.full_name,
    p.role,
    u.email,
    p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.role = 'verifier';

-- If you see the verifier user in the results, you're all set!
-- The verifier can now log in and will see only the verifier dashboard.

