-- Quick script to create profiles for test users
-- Run this AFTER creating users in Supabase Auth UI
-- Copy and paste into Supabase SQL Editor

-- Get user IDs and create profiles with correct roles
WITH user_data AS (
  SELECT id, email
  FROM auth.users
  WHERE email IN (
    'admin@ecolink.test',
    'verifier@ecolink.test', 
    'user@ecolink.test',
    'developer@ecolink.test'
  )
)
INSERT INTO profiles (id, full_name, email, role, kyc_level, notification_preferences)
SELECT 
  id,
  CASE email
    WHEN 'admin@ecolink.test' THEN 'Admin User'
    WHEN 'verifier@ecolink.test' THEN 'Verifier User'
    WHEN 'user@ecolink.test' THEN 'General User'
    WHEN 'developer@ecolink.test' THEN 'Project Developer'
  END as full_name,
  email,
  CASE email
    WHEN 'admin@ecolink.test' THEN 'admin'
    WHEN 'verifier@ecolink.test' THEN 'verifier'
    WHEN 'user@ecolink.test' THEN 'general_user'
    WHEN 'developer@ecolink.test' THEN 'project_developer'
  END as role,
  0 as kyc_level,
  '{
    "emailNotifications": { "enabled": true },
    "projectUpdates": { "enabled": true },
    "marketAlerts": { "enabled": false },
    "newsletter": { "enabled": true }
  }'::jsonb as notification_preferences
FROM user_data
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email;

-- Verify profiles were created
SELECT '✅ Test profiles created!' as status;
SELECT id, full_name, email, role 
FROM profiles 
WHERE email LIKE '%@ecolink.test'
ORDER BY email;


