-- Create REAL test user accounts in Supabase (with actual auth.users records)
-- This makes test accounts work with Supabase persistence
-- Run this in Supabase SQL Editor AFTER running complete-ecolink-setup.sql

-- ═══════════════════════════════════════════════════════════════
-- IMPORTANT: This creates REAL users in auth.users table
-- They will work with full Supabase persistence!
-- ═══════════════════════════════════════════════════════════════

-- NOTE: You can't directly INSERT into auth.users table
-- You must create them via Supabase Auth UI or REST API
-- This script will CREATE profiles for existing auth.users OR
-- you can manually create them in Supabase Dashboard

-- ───────────────────────────────────────────────────────────────
-- OPTION 1: Create via Supabase Auth UI (RECOMMENDED)
-- ───────────────────────────────────────────────────────────────

-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" for each test account:
--    - Email: admin@ecolink.test | Password: admin123
--    - Email: verifier@ecolink.test | Password: verifier123
--    - Email: user@ecolink.test | Password: user123
--    - Email: developer@ecolink.test | Password: developer123

-- 3. After creating auth.users, run the profile insertion below
--    (It will use the IDs from auth.users)

-- ───────────────────────────────────────────────────────────────
-- OPTION 2: Create profiles for existing auth.users
-- ───────────────────────────────────────────────────────────────

-- If you already have auth.users with the test emails, this will
-- create/update their profiles

-- First, let's check if auth.users with these emails exist
DO $$ 
DECLARE
    admin_id UUID;
    verifier_id UUID;
    user_id UUID;
    developer_id UUID;
BEGIN
    -- Get IDs from auth.users if they exist
    SELECT id INTO admin_id 
    FROM auth.users 
    WHERE email = 'admin@ecolink.test' 
    LIMIT 1;
    
    SELECT id INTO verifier_id 
    FROM auth.users 
    WHERE email = 'verifier@ecolink.test' 
    LIMIT 1;
    
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = 'user@ecolink.test' 
    LIMIT 1;
    
    SELECT id INTO developer_id 
    FROM auth.users 
    WHERE email = 'developer@ecolink.test' 
    LIMIT 1;
    
    -- Insert or update admin profile
    IF admin_id IS NOT NULL THEN
        INSERT INTO profiles (id, full_name, email, role, company, location, bio, kyc_level)
        VALUES (admin_id, 'Admin User', 'admin@ecolink.test', 'admin', '', '', '', 0)
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            full_name = 'Admin User';
        RAISE NOTICE '✅ Admin profile created/updated for %', admin_id;
    ELSE
        RAISE NOTICE '⚠️ No auth.users found for admin@ecolink.test - create user first!';
    END IF;
    
    -- Insert or update verifier profile
    IF verifier_id IS NOT NULL THEN
        INSERT INTO profiles (id, full_name, email, role, company, location, bio, kyc_level)
        VALUES (verifier_id, 'Verifier User', 'verifier@ecolink.test', 'verifier', '', '', '', 0)
        ON CONFLICT (id) DO UPDATE SET
            role = 'verifier',
            full_name = 'Verifier User';
        RAISE NOTICE '✅ Verifier profile created/updated for %', verifier_id;
    ELSE
        RAISE NOTICE '⚠️ No auth.users found for verifier@ecolink.test - create user first!';
    END IF;
    
    -- Insert or update general user profile
    IF user_id IS NOT NULL THEN
        INSERT INTO profiles (id, full_name, email, role, company, location, bio, kyc_level)
        VALUES (user_id, 'General User', 'user@ecolink.test', 'general_user', '', '', '', 0)
        ON CONFLICT (id) DO UPDATE SET
            role = 'general_user',
            full_name = 'General User';
        RAISE NOTICE '✅ General User profile created/updated for %', user_id;
    ELSE
        RAISE NOTICE '⚠️ No auth.users found for user@ecolink.test - create user first!';
    END IF;
    
    -- Insert or update developer profile
    IF developer_id IS NOT NULL THEN
        INSERT INTO profiles (id, full_name, email, role, company, location, bio, kyc_level)
        VALUES (developer_id, 'Project Developer', 'developer@ecolink.test', 'project_developer', '', '', '', 0)
        ON CONFLICT (id) DO UPDATE SET
            role = 'project_developer',
            full_name = 'Project Developer';
        RAISE NOTICE '✅ Project Developer profile created/updated for %', developer_id;
    ELSE
        RAISE NOTICE '⚠️ No auth.users found for developer@ecolink.test - create user first!';
    END IF;
END $$;

-- ───────────────────────────────────────────────────────────────
-- Success message
-- ───────────────────────────────────────────────────────────────

SELECT '✅ Test user profiles check complete. Use Supabase Auth UI to create users.' as status;


