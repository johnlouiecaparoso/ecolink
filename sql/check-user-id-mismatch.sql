-- Check the user ID mismatch issue
-- The user store is using a test UUID instead of the real Supabase user ID

-- Check what's in auth.users for developer@ecolink.test
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'developer@ecolink.test';

-- Check what's in profiles for developer@ecolink.test  
SELECT id, full_name, email, role, kyc_level 
FROM profiles 
WHERE email = 'developer@ecolink.test';

-- Check if the test UUID exists in auth.users (it shouldn't)
SELECT id, email, created_at 
FROM auth.users 
WHERE id = '44444444-4444-4444-4444-444444444444';

-- Check if the test UUID exists in profiles (it shouldn't)
SELECT id, full_name, email, role, kyc_level 
FROM profiles 
WHERE id = '44444444-4444-4444-4444-444444444444';









