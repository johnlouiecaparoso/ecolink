-- Fix existing credit_listings table (Minimal approach)
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

-- 3. Add other missing columns that we need for marketplace
ALTER TABLE public.credit_listings 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS currency varchar(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS vintage_year integer DEFAULT EXTRACT(YEAR FROM NOW()),
ADD COLUMN IF NOT EXISTS verification_standard text DEFAULT 'EcoLink Standard',
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT NOW();

-- 4. Populate project_id from project_credits table
UPDATE public.credit_listings 
SET project_id = pc.project_id 
FROM public.project_credits pc 
WHERE public.credit_listings.project_credit_id = pc.id 
  AND public.credit_listings.project_id IS NULL;

-- 5. Add foreign key constraint for project_id (only if absent)
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

-- 6. Create indexes for better performance (only for columns that exist)
CREATE INDEX IF NOT EXISTS idx_credit_listings_project_id ON credit_listings(project_id);
CREATE INDEX IF NOT EXISTS idx_credit_listings_seller_id ON credit_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_credit_listings_status ON credit_listings(status);

-- Only create category index if category column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'credit_listings' 
    AND column_name = 'category'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_credit_listings_category ON credit_listings(category);
  END IF;
END;
$$;

-- 7. Enable RLS on credit_listings table
ALTER TABLE credit_listings ENABLE ROW LEVEL SECURITY;

-- 8. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "public_select_active_credit_listings" ON credit_listings;
DROP POLICY IF EXISTS "sellers_manage_own_listings" ON credit_listings;
DROP POLICY IF EXISTS "admins_manage_all_listings" ON credit_listings;
DROP POLICY IF EXISTS "Anyone can view active credit listings" ON credit_listings;
DROP POLICY IF EXISTS "Sellers can manage their own listings" ON credit_listings;
DROP POLICY IF EXISTS "Admins can manage all credit listings" ON credit_listings;

-- 9. Create RLS policies for credit_listings
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

-- 10. Create function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_credit_listings_updated_at ON credit_listings;

-- 12. Create trigger to automatically update updated_at (only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'credit_listings' 
    AND column_name = 'updated_at'
  ) THEN
    CREATE TRIGGER update_credit_listings_updated_at 
      BEFORE UPDATE ON credit_listings 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

-- 13. Verify the table structure
SELECT 
  'credit_listings table updated successfully' as status,
  COUNT(*) as existing_records,
  COUNT(project_id) as records_with_project_id
FROM credit_listings;

-- 14. Show final structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'credit_listings'
ORDER BY ordinal_position;









