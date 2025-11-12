-- SAFE DELETE OLD PROJECTS AND CREDITS TO TEST FRESH
-- This will delete all existing projects and credits to test the fix with a NEW project
-- ⚠️ WARNING: This deletes all data. Only run if you want to start fresh!

-- Step 1: Delete related records (cascading should handle most, but being explicit)
DELETE FROM credit_purchases;
DELETE FROM credit_transactions;
DELETE FROM certificates;
DELETE FROM credit_listings;
DELETE FROM project_credits;
DELETE FROM projects;

-- Step 2: Verify deletion
SELECT 
  (SELECT COUNT(*) FROM projects) as projects_remaining,
  (SELECT COUNT(*) FROM project_credits) as credits_remaining,
  (SELECT COUNT(*) FROM credit_listings) as listings_remaining;

-- Final message
SELECT '✅ All old data deleted. Now submit a NEW project as a developer!' as next_step;

















