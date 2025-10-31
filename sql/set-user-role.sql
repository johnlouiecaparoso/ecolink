-- Simple Script to Set User Roles
-- Replace the email addresses with your actual user emails

-- Step 1: See all your current users
SELECT 'Your current users:' as info;
SELECT email, role, full_name FROM profiles ORDER BY email;

-- Step 2: Set specific users to specific roles
-- Just change the email addresses and roles as needed

-- Set someone to Project Developer
UPDATE profiles 
SET role = 'project_developer', kyc_level = 1, updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- Set someone to Admin
UPDATE profiles 
SET role = 'admin', kyc_level = 3, updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');

-- Set someone to Verifier
UPDATE profiles 
SET role = 'verifier', kyc_level = 2, updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'verifier@example.com');

-- Set someone to General User
UPDATE profiles 
SET role = 'general_user', kyc_level = 0, updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');

-- Step 3: Show updated roles
SELECT 'Updated roles:' as info;
SELECT email, role, full_name FROM profiles ORDER BY email;

