-- Test Profiles Setup for EcoLink
-- This script creates test user profiles that correspond to the test accounts

-- Insert test profiles with proper UUIDs
INSERT INTO profiles (id, full_name, email, role, company, location, bio, kyc_level, created_at, updated_at) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Admin User',
    'admin@ecolink.test',
    'admin',
    'EcoLink Admin',
    'San Francisco, CA',
    'System administrator with full access to all features.',
    3,
    NOW(),
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Verifier User',
    'verifier@ecolink.test',
    'verifier',
    'EcoLink Verification',
    'New York, NY',
    'Certified verifier responsible for project validation.',
    2,
    NOW(),
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'General User',
    'user@ecolink.test',
    'general_user',
    'Caraga State University',
    'Butuan City',
    'Regular user exploring carbon credit marketplace.',
    1,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  company = EXCLUDED.company,
  location = EXCLUDED.location,
  bio = EXCLUDED.bio,
  kyc_level = EXCLUDED.kyc_level,
  updated_at = NOW();

-- Create wallets for test users
INSERT INTO wallets (user_id, balance, currency, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 10000.00, 'USD', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 5000.00, 'USD', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 1000.00, 'USD', NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET
  balance = EXCLUDED.balance,
  updated_at = NOW();

-- Verify the test profiles were created
SELECT 
  id,
  full_name,
  email,
  role,
  company,
  location
FROM profiles 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
)
ORDER BY role;

-- Success message
SELECT 'Test profiles setup completed successfully!' as status;













