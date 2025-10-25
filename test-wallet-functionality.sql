-- Wallet Functionality Test
-- Test: Top-up, Withdrawal, Transaction History, Balance Tracking

-- =====================================================
-- STEP 1: Check if wallet tables exist
-- =====================================================
SELECT 
  'WALLET TABLES CHECK' as test_step,
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('wallet_accounts', 'wallet_transactions', 'transactions')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- =====================================================
-- STEP 2: Check existing wallet accounts
-- =====================================================
SELECT 
  'EXISTING WALLET ACCOUNTS' as test_step,
  wa.user_id,
  p.full_name,
  p.role,
  wa.balance,
  wa.currency,
  wa.created_at
FROM wallet_accounts wa
JOIN profiles p ON wa.user_id = p.id
ORDER BY wa.created_at DESC;

-- =====================================================
-- STEP 3: Create wallet accounts for test users
-- =====================================================
DO $$
DECLARE
  user_record RECORD;
  wallet_created_count INTEGER := 0;
BEGIN
  -- Create wallet accounts for all users who don't have one
  FOR user_record IN 
    SELECT p.id, p.full_name, p.role 
    FROM profiles p 
    WHERE p.id NOT IN (SELECT user_id FROM wallet_accounts)
  LOOP
    INSERT INTO wallet_accounts (
      user_id,
      balance,
      currency,
      status,
      created_at,
      updated_at
    ) VALUES (
      user_record.id,
      0.00, -- Start with zero balance
      'USD',
      'active',
      NOW(),
      NOW()
    );
    
    wallet_created_count := wallet_created_count + 1;
    RAISE NOTICE '✅ Created wallet for % (%)', user_record.full_name, user_record.role;
  END LOOP;
  
  RAISE NOTICE '✅ Created % new wallet accounts', wallet_created_count;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error creating wallets: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 4: Test Top-up Transaction
-- =====================================================
DO $$
DECLARE
  test_user_id UUID;
  transaction_id TEXT;
  new_balance DECIMAL(10,2);
BEGIN
  -- Get a test user (general_user)
  SELECT id INTO test_user_id FROM profiles WHERE role = 'general_user' LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Create top-up transaction
    transaction_id := 'TXN_' || EXTRACT(EPOCH FROM NOW())::TEXT;
    
    INSERT INTO wallet_transactions (
      user_id,
      transaction_id,
      type,
      amount,
      balance_before,
      balance_after,
      description,
      status,
      created_at
    ) VALUES (
      test_user_id,
      transaction_id,
      'top_up',
      100.00,
      0.00,
      100.00,
      'Test top-up transaction',
      'completed',
      NOW()
    );
    
    -- Update wallet balance
    UPDATE wallet_accounts 
    SET 
      balance = 100.00,
      updated_at = NOW()
    WHERE user_id = test_user_id;
    
    RAISE NOTICE '✅ Top-up successful: User % now has $100.00', test_user_id;
  ELSE
    RAISE NOTICE '❌ No test user found for top-up';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error in top-up: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 5: Test Withdrawal Transaction
-- =====================================================
DO $$
DECLARE
  test_user_id UUID;
  transaction_id TEXT;
  current_balance DECIMAL(10,2);
BEGIN
  -- Get a test user with balance
  SELECT wa.user_id, wa.balance 
  INTO test_user_id, current_balance
  FROM wallet_accounts wa
  WHERE wa.balance > 0
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Create withdrawal transaction
    transaction_id := 'TXN_' || EXTRACT(EPOCH FROM NOW())::TEXT;
    
    INSERT INTO wallet_transactions (
      user_id,
      transaction_id,
      type,
      amount,
      balance_before,
      balance_after,
      description,
      status,
      created_at
    ) VALUES (
      test_user_id,
      transaction_id,
      'withdrawal',
      -25.00, -- Negative for withdrawal
      current_balance,
      current_balance - 25.00,
      'Test withdrawal transaction',
      'completed',
      NOW()
    );
    
    -- Update wallet balance
    UPDATE wallet_accounts 
    SET 
      balance = current_balance - 25.00,
      updated_at = NOW()
    WHERE user_id = test_user_id;
    
    RAISE NOTICE '✅ Withdrawal successful: User % withdrew $25.00', test_user_id;
  ELSE
    RAISE NOTICE '❌ No user with balance found for withdrawal';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error in withdrawal: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 6: Test Credit Purchase Transaction
-- =====================================================
DO $$
DECLARE
  test_user_id UUID;
  transaction_id TEXT;
  current_balance DECIMAL(10,2);
  credit_price DECIMAL(10,2) := 25.00;
  credits_purchased INTEGER := 4;
  total_cost DECIMAL(10,2);
BEGIN
  -- Get a test user with balance
  SELECT wa.user_id, wa.balance 
  INTO test_user_id, current_balance
  FROM wallet_accounts wa
  WHERE wa.balance > 0
  LIMIT 1;
  
  total_cost := credit_price * credits_purchased;
  
  IF test_user_id IS NOT NULL AND current_balance >= total_cost THEN
    -- Create credit purchase transaction
    transaction_id := 'TXN_' || EXTRACT(EPOCH FROM NOW())::TEXT;
    
    INSERT INTO wallet_transactions (
      user_id,
      transaction_id,
      type,
      amount,
      balance_before,
      balance_after,
      description,
      status,
      created_at
    ) VALUES (
      test_user_id,
      transaction_id,
      'credit_purchase',
      -total_cost, -- Negative for purchase
      current_balance,
      current_balance - total_cost,
      'Purchased ' || credits_purchased || ' carbon credits at $' || credit_price || ' each',
      'completed',
      NOW()
    );
    
    -- Update wallet balance
    UPDATE wallet_accounts 
    SET 
      balance = current_balance - total_cost,
      updated_at = NOW()
    WHERE user_id = test_user_id;
    
    RAISE NOTICE '✅ Credit purchase successful: User % bought % credits for $%', 
      test_user_id, credits_purchased, total_cost;
  ELSE
    RAISE NOTICE '❌ Insufficient balance or no user found for credit purchase';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error in credit purchase: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 7: Verify Transaction History
-- =====================================================
SELECT 
  'TRANSACTION HISTORY' as test_step,
  wt.user_id,
  p.full_name,
  wt.transaction_id,
  wt.type,
  wt.amount,
  wt.balance_before,
  wt.balance_after,
  wt.description,
  wt.status,
  wt.created_at
FROM wallet_transactions wt
JOIN profiles p ON wt.user_id = p.id
ORDER BY wt.created_at DESC
LIMIT 10;

-- =====================================================
-- STEP 8: Check Final Wallet Balances
-- =====================================================
SELECT 
  'FINAL WALLET BALANCES' as test_step,
  wa.user_id,
  p.full_name,
  p.role,
  wa.balance,
  wa.currency,
  wa.status,
  wa.updated_at
FROM wallet_accounts wa
JOIN profiles p ON wa.user_id = p.id
ORDER BY wa.balance DESC;

-- =====================================================
-- STEP 9: Summary
-- =====================================================
SELECT 
  'WALLET TEST SUMMARY' as test_step,
  'Wallet functionality test complete' as status,
  'Check results above to verify:' as instructions,
  '1. Wallet accounts created for all users' as check_1,
  '2. Top-up transactions working' as check_2,
  '3. Withdrawal transactions working' as check_3,
  '4. Credit purchase transactions working' as check_4,
  '5. Transaction history tracking' as check_5,
  '6. Balance updates correctly' as check_6;








