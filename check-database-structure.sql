-- Check Database Structure for EcoLink
-- Run this in your Supabase SQL Editor to see the current table structure

-- 1. Check if all required tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('profiles', 'projects', 'project_credits', 'credit_listings', 'credit_transactions', 'credit_ownership', 'audit_logs', 'wallets', 'wallet_transactions', 'certificates', 'receipts') 
    THEN '✅ Required' 
    ELSE '⚠️ Optional' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'profiles', 'projects', 'project_credits', 'credit_listings', 
  'credit_transactions', 'credit_ownership', 'audit_logs', 
  'wallets', 'wallet_transactions', 'certificates', 'receipts'
)
ORDER BY table_name;

-- 2. Check profiles table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Check projects table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'projects'
ORDER BY ordinal_position;

-- 4. Check project_credits table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'project_credits'
ORDER BY ordinal_position;

-- 5. Check credit_listings table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'credit_listings'
ORDER BY ordinal_position;

-- 6. Check wallet_transactions table structure (if exists)
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'wallet_transactions'
ORDER BY ordinal_position;

-- 7. Check foreign key constraints
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN ('profiles', 'projects', 'project_credits', 'credit_listings', 'credit_transactions', 'credit_ownership', 'audit_logs', 'wallets', 'wallet_transactions', 'certificates', 'receipts')
ORDER BY tc.table_name, kcu.column_name;

-- 8. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'projects', 'project_credits', 'credit_listings', 'credit_transactions', 'credit_ownership', 'audit_logs', 'wallets', 'wallet_transactions', 'certificates', 'receipts')
ORDER BY tablename, policyname;

