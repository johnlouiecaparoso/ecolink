-- ═══════════════════════════════════════════════════════════════════════════
-- ADD USER_ID TO WALLET_TRANSACTIONS (if missing)
-- ═══════════════════════════════════════════════════════════════════════════

-- Add user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'wallet_transactions' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.wallet_transactions 
        ADD COLUMN user_id UUID;
        
        -- Add foreign key if not exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'wallet_transactions_user_id_fkey'
        ) THEN
            ALTER TABLE public.wallet_transactions
            ADD CONSTRAINT wallet_transactions_user_id_fkey 
            FOREIGN KEY (user_id) 
            REFERENCES public.profiles(id) 
            ON DELETE CASCADE;
        END IF;
        
        RAISE NOTICE 'Added user_id column to wallet_transactions';
    ELSE
        RAISE NOTICE 'user_id column already exists in wallet_transactions';
    END IF;
END $$;

-- Verification
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'wallet_transactions'
ORDER BY ordinal_position;

