-- Clear all marketplace and project data for testing
-- Run this in your Supabase SQL Editor

-- Clear all data in reverse dependency order
DELETE FROM certificates;
DELETE FROM credit_transactions;
DELETE FROM credit_ownership;
DELETE FROM receipts;
DELETE FROM credit_listings;
DELETE FROM project_credits;
DELETE FROM projects;
DELETE FROM profiles WHERE role != 'admin'; -- Keep admin users

-- Reset sequences if they exist
-- Note: Supabase uses UUIDs, so no sequences to reset

-- Verify cleanup
SELECT 
  'Cleanup Complete' as status,
  (SELECT COUNT(*) FROM projects) as projects_count,
  (SELECT COUNT(*) FROM project_credits) as project_credits_count,
  (SELECT COUNT(*) FROM credit_listings) as credit_listings_count,
  (SELECT COUNT(*) FROM credit_transactions) as transactions_count;
