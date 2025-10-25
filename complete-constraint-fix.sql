-- Complete Constraint Fix for EcoLink Database
-- This script safely handles all existing constraints and migrates data
-- Run this in your Supabase SQL Editor

-- 1. DIAGNOSTIC: Check all existing constraints (for reference)
-- Uncomment these lines to see what constraints exist:
-- SELECT conname, pg_get_constraintdef(c.oid) AS def 
-- FROM pg_constraint c 
-- JOIN pg_class t ON c.conrelid = t.oid 
-- WHERE t.relname = 'profiles' AND c.contype = 'c';
-- 
-- SELECT conname, pg_get_constraintdef(c.oid) AS def 
-- FROM pg_constraint c 
-- JOIN pg_class t ON c.conrelid = t.oid 
-- WHERE t.relname = 'wallet_transactions' AND c.contype = 'c';

-- 2. SAFE MIGRATION FOR PROFILES ROLES

-- Step A: Drop ALL existing role constraints (regardless of name)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT conname 
        FROM pg_constraint c 
        JOIN pg_class t ON c.conrelid = t.oid 
        WHERE t.relname = 'profiles' 
        AND c.contype = 'c'
        AND pg_get_constraintdef(c.oid) LIKE '%role%'
    LOOP
        EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT IF EXISTS %I', r.conname);
    END LOOP;
END $$;

-- Step B: Temporarily allow both old and new role values
ALTER TABLE profiles ADD CONSTRAINT profiles_role_temp_check CHECK (role IN (
  'user', 'super_admin', 'admin', 'verifier', 'project_developer', 'buyer_investor', 'general_user'
) OR role IS NULL);

-- Step C: Migrate existing data to new role values
UPDATE profiles SET role = 'general_user' WHERE role = 'user';
UPDATE profiles SET role = 'admin' WHERE role = 'super_admin';
UPDATE profiles SET role = 'general_user' WHERE role IS NULL;

-- Step D: Update column default
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'general_user';

-- Step E: Replace with final constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_temp_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN (
  'admin', 'verifier', 'project_developer', 'buyer_investor', 'general_user'
));

-- 3. SAFE MIGRATION FOR WALLET_TRANSACTIONS TYPES

-- Step A: Drop ALL existing type constraints (regardless of name)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT conname 
        FROM pg_constraint c 
        JOIN pg_class t ON c.conrelid = t.oid 
        WHERE t.relname = 'wallet_transactions' 
        AND c.contype = 'c'
        AND (pg_get_constraintdef(c.oid) LIKE '%type%' OR pg_get_constraintdef(c.oid) LIKE '%topup%' OR pg_get_constraintdef(c.oid) LIKE '%payment%')
    LOOP
        EXECUTE format('ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS %I', r.conname);
    END LOOP;
END $$;

-- Step B: Temporarily allow both old and new type values
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_type_temp_check CHECK (type IN (
  'topup', 'deposit', 'withdrawal', 'payment', 'purchase', 'sale', 'refund', 'fee'
) OR type IS NULL);

-- Step C: Migrate existing data to new type values
UPDATE wallet_transactions SET type = 'deposit' WHERE type = 'topup';
UPDATE wallet_transactions SET type = 'purchase' WHERE type = 'payment';
UPDATE wallet_transactions SET type = 'sale' WHERE type = 'fee';
UPDATE wallet_transactions SET type = 'deposit' WHERE type IS NULL;

-- Step D: Replace with final constraint
ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_type_temp_check;
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_type_check CHECK (type IN (
  'deposit', 'withdrawal', 'purchase', 'sale', 'refund'
));

-- 4. Add other missing columns and constraints

-- Add kyc_level constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_kyc_level_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_kyc_level_check CHECK (kyc_level >= 0 AND kyc_level <= 3);

-- Add wallet_transactions status constraint
ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_status_check;
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_status_check CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));

-- 5. Update projects table to match expected schema
ALTER TABLE projects ADD COLUMN IF NOT EXISTS expected_impact TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS assigned_verifier_id UUID REFERENCES profiles(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'pending';

-- Add status constraint for projects
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'active'));

-- 6. Update project_credits table to match expected schema
ALTER TABLE project_credits ADD COLUMN IF NOT EXISTS vintage_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW());
ALTER TABLE project_credits ADD COLUMN IF NOT EXISTS verification_standard TEXT DEFAULT 'EcoLink Standard';
ALTER TABLE project_credits ADD COLUMN IF NOT EXISTS total_credits INTEGER;
ALTER TABLE project_credits ADD COLUMN IF NOT EXISTS available_credits INTEGER;
ALTER TABLE project_credits ADD COLUMN IF NOT EXISTS price_per_credit DECIMAL(10,2) DEFAULT 15.00;
ALTER TABLE project_credits ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE project_credits ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add status constraint for project_credits
ALTER TABLE project_credits DROP CONSTRAINT IF EXISTS project_credits_status_check;
ALTER TABLE project_credits ADD CONSTRAINT project_credits_status_check CHECK (status IN ('active', 'sold_out', 'retired'));

-- 7. Update credit_listings table to match expected schema
ALTER TABLE credit_listings ADD COLUMN IF NOT EXISTS listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add status constraint for credit_listings
ALTER TABLE credit_listings DROP CONSTRAINT IF EXISTS credit_listings_status_check;
ALTER TABLE credit_listings ADD CONSTRAINT credit_listings_status_check CHECK (status IN ('active', 'sold_out', 'cancelled'));

-- 8. Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  project_credit_id UUID REFERENCES project_credits(id),
  listing_id UUID REFERENCES credit_listings(id),
  quantity INTEGER NOT NULL,
  price_per_credit DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT DEFAULT 'wallet',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'retired')),
  platform_fee_percentage DECIMAL(5,2) DEFAULT 2.5,
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_ownership (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  transaction_id UUID REFERENCES credit_transactions(id),
  project_credit_id UUID REFERENCES project_credits(id),
  quantity INTEGER NOT NULL,
  ownership_status TEXT DEFAULT 'owned' CHECK (ownership_status IN ('owned', 'retired', 'transferred')),
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  retired_at TIMESTAMP WITH TIME ZONE,
  retirement_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  resource_type TEXT,
  user_id UUID REFERENCES profiles(id),
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) UNIQUE,
  balance DECIMAL(12,2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  transaction_id UUID REFERENCES credit_transactions(id),
  certificate_number TEXT UNIQUE NOT NULL,
  project_title TEXT,
  project_category TEXT,
  project_location TEXT,
  credits_quantity INTEGER,
  vintage_year INTEGER,
  verification_standard TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  transaction_id UUID REFERENCES credit_transactions(id),
  receipt_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'sent', 'delivered')),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. VERIFICATION: Check that migration was successful
-- Uncomment these lines to verify the migration worked:
-- SELECT role, COUNT(*) FROM profiles GROUP BY role ORDER BY COUNT(*) DESC;
-- SELECT type, COUNT(*) FROM wallet_transactions GROUP BY type ORDER BY COUNT(*) DESC;
-- SELECT 'Complete constraint fix completed successfully!' as status;

-- 10. Success message
SELECT 'Complete constraint fix completed! All constraint violations resolved and database schema aligned.' as status;

