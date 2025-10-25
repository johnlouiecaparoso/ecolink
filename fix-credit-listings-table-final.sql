-- Fix existing credit_listings table (Non-destructive) - Final Version
-- Run this in your Supabase SQL Editor

-- 1. First, let's see the current structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'credit_listings'
ORDER BY ordinal_position;

-- 2. Add project_id column if it doesn't exist
ALTER TABLE public.credit_listings 
ADD COLUMN IF NOT EXISTS project_id uuid;

-- 3. Populate project_id from project_credits table
UPDATE public.credit_listings 
SET project_id = pc.project_id 
FROM public.project_credits pc 
WHERE public.credit_listings.project_credit_id = pc.id 
  AND public.credit_listings.project_id IS NULL;

-- 4. Add foreign key constraint for project_id (only if absent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE c.contype = 'f'
      AND n.nspname = 'public'
      AND t.relname = 'credit_listings'
      AND c.conname = 'credit_listings_project_id_fkey'
  ) THEN
    ALTER TABLE public.credit_listings
    ADD CONSTRAINT credit_listings_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
  END IF;
END;
$$;

-- 5. Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_credit_listings_project_id ON credit_listings(project_id);
CREATE INDEX IF NOT EXISTS idx_credit_listings_seller_id ON credit_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_credit_listings_status ON credit_listings(status);
CREATE INDEX IF NOT EXISTS idx_credit_listings_category ON credit_listings(category);

-- 6. Enable RLS on credit_listings table
ALTER TABLE credit_listings ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "public_select_active_credit_listings" ON credit_listings;
DROP POLICY IF EXISTS "sellers_manage_own_listings" ON credit_listings;
DROP POLICY IF EXISTS "admins_manage_all_listings" ON credit_listings;
DROP POLICY IF EXISTS "Anyone can view active credit listings" ON credit_listings;
DROP POLICY IF EXISTS "Sellers can manage their own listings" ON credit_listings;
DROP POLICY IF EXISTS "Admins can manage all credit listings" ON credit_listings;

-- 8. Create RLS policies for credit_listings
-- Allow everyone to view active listings
CREATE POLICY "public_select_active_credit_listings" ON credit_listings
  FOR SELECT
  USING (status = 'active');

-- Allow sellers to manage their own listings
CREATE POLICY "sellers_manage_own_listings" ON credit_listings
  FOR ALL
  USING (seller_id = auth.uid());

-- Allow admins to manage all listings
CREATE POLICY "admins_manage_all_listings" ON credit_listings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 9. Create function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_credit_listings_updated_at ON credit_listings;

-- 11. Create trigger to automatically update updated_at
CREATE TRIGGER update_credit_listings_updated_at 
  BEFORE UPDATE ON credit_listings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 12. Verify the table structure
SELECT 
  'credit_listings table updated successfully' as status,
  COUNT(*) as existing_records,
  COUNT(project_id) as records_with_project_id
FROM credit_listings;

-- 13. Check if foreign key constraint was created
SELECT 
  tc.constraint_name,
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
  AND tc.table_name = 'credit_listings'
  AND tc.constraint_name = 'credit_listings_project_id_fkey';









