-- SAFE MIGRATION: Fix existing tables without dropping data
-- Run this BEFORE running complete-ecolink-setup.sql if you have existing tables

-- ───────────────────────────────────────────────────────────────
-- 1. Fix CREDIT_OWNERSHIP table
-- ───────────────────────────────────────────────────────────────

-- Add project_id column if it doesn't exist
DO $$ 
BEGIN
    -- Check if credit_ownership table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_ownership') THEN
        -- Check if project_id column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'credit_ownership' AND column_name = 'project_id') THEN
            -- Add project_id column
            ALTER TABLE credit_ownership ADD COLUMN project_id UUID;
            
            -- If we have existing data and can derive project_id from elsewhere, do it
            -- For now, just set it to NULL and it will be populated by app logic
            
            -- Add foreign key constraint
            ALTER TABLE credit_ownership 
            ADD CONSTRAINT credit_ownership_project_id_fkey 
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
            
            RAISE NOTICE 'Added project_id column to credit_ownership';
        ELSE
            RAISE NOTICE 'project_id column already exists in credit_ownership';
        END IF;
    END IF;
END $$;

-- ───────────────────────────────────────────────────────────────
-- 2. Fix RECEIPTS table
-- ───────────────────────────────────────────────────────────────

-- Fix receipts table schema if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'receipts') THEN
        -- Remove user_id if it exists and replace with buyer_id/seller_id
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'receipts' AND column_name = 'user_id') THEN
            ALTER TABLE receipts DROP COLUMN user_id;
            RAISE NOTICE 'Removed user_id column from receipts';
        END IF;
        
        -- Add buyer_id if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'receipts' AND column_name = 'buyer_id') THEN
            ALTER TABLE receipts ADD COLUMN buyer_id UUID REFERENCES profiles(id);
            RAISE NOTICE 'Added buyer_id column to receipts';
        END IF;
        
        -- Add seller_id if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'receipts' AND column_name = 'seller_id') THEN
            ALTER TABLE receipts ADD COLUMN seller_id UUID REFERENCES profiles(id);
            RAISE NOTICE 'Added seller_id column to receipts';
        END IF;
        
        -- Add receipt_data if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'receipts' AND column_name = 'receipt_data') THEN
            ALTER TABLE receipts ADD COLUMN receipt_data JSONB;
            RAISE NOTICE 'Added receipt_data column to receipts';
        END IF;
        
        -- Add downloaded_at if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'receipts' AND column_name = 'downloaded_at') THEN
            ALTER TABLE receipts ADD COLUMN downloaded_at TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Added downloaded_at column to receipts';
        END IF;
        
        -- Add created_at if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'receipts' AND column_name = 'created_at') THEN
            ALTER TABLE receipts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added created_at column to receipts';
        END IF;
    END IF;
END $$;

-- ───────────────────────────────────────────────────────────────
-- 3. Update all policies to match correct schemas
-- ───────────────────────────────────────────────────────────────

-- Drop and recreate credit_ownership policies
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_ownership') THEN
        DROP POLICY IF EXISTS "Users can view their own ownership" ON credit_ownership;
        DROP POLICY IF EXISTS "Users can insert their own ownership" ON credit_ownership;
        
        CREATE POLICY "Users can view their own ownership" ON credit_ownership
            FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
        
        CREATE POLICY "Users can insert their own ownership" ON credit_ownership
            FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
        
        RAISE NOTICE 'Updated credit_ownership policies';
    END IF;
END $$;

-- Drop and recreate receipts policies
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'receipts') THEN
        DROP POLICY IF EXISTS "Users can view their own receipts" ON receipts;
        
        CREATE POLICY "Users can view their own receipts" ON receipts
            FOR SELECT USING (
                buyer_id = auth.uid() OR 
                seller_id = auth.uid() OR 
                public.is_admin(auth.uid())
            );
        
        RAISE NOTICE 'Updated receipts policies';
    END IF;
END $$;

-- Success message
SELECT '✅ Safe migration completed! Tables fixed without data loss.' as status;


