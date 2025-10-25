-- Cleanup duplicate marketplace listings
-- Run this in your Supabase SQL Editor

-- First, let's see what we have
SELECT 
  project_id,
  COUNT(*) as listing_count,
  array_agg(id) as listing_ids,
  array_agg(price_per_credit) as prices
FROM credit_listings 
WHERE status = 'active'
GROUP BY project_id
HAVING COUNT(*) > 1
ORDER BY listing_count DESC;

-- Remove duplicate listings, keeping only the most recent one per project
WITH ranked_listings AS (
  SELECT 
    id,
    project_id,
    ROW_NUMBER() OVER (
      PARTITION BY project_id 
      ORDER BY created_at DESC
    ) as rn
  FROM credit_listings 
  WHERE status = 'active'
)
DELETE FROM credit_listings 
WHERE id IN (
  SELECT id 
  FROM ranked_listings 
  WHERE rn > 1
);

-- Verify cleanup
SELECT 
  project_id,
  COUNT(*) as listing_count
FROM credit_listings 
WHERE status = 'active'
GROUP BY project_id
ORDER BY listing_count DESC;




