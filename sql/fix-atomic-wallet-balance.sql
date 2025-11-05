-- FIX: Atomic Wallet Balance Updates
-- This prevents race conditions when updating wallet balances

-- Create function for atomic balance updates
CREATE OR REPLACE FUNCTION update_wallet_balance_atomic(
  p_user_id UUID,
  p_amount NUMERIC(12,2),
  p_operation TEXT -- 'add' or 'subtract'
)
RETURNS NUMERIC(12,2) AS $$
DECLARE
  v_new_balance NUMERIC(12,2);
BEGIN
  -- Validate operation
  IF p_operation NOT IN ('add', 'subtract') THEN
    RAISE EXCEPTION 'Invalid operation. Must be ''add'' or ''subtract''';
  END IF;

  -- Atomic update using database-level locking
  UPDATE wallet_accounts
  SET 
    current_balance = CASE 
      WHEN p_operation = 'add' THEN current_balance + p_amount
      WHEN p_operation = 'subtract' THEN current_balance - p_amount
    END,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING current_balance INTO v_new_balance;

  -- Check if update succeeded (wallet exists)
  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet account not found for user_id: %', p_user_id;
  END IF;

  -- Check for negative balance (for subtract operations)
  IF v_new_balance < 0 AND p_operation = 'subtract' THEN
    RAISE EXCEPTION 'Insufficient balance. Current: %, Requested: %', 
      (SELECT current_balance FROM wallet_accounts WHERE user_id = p_user_id),
      p_amount;
  END IF;

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_wallet_balance_atomic(UUID, NUMERIC, TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION update_wallet_balance_atomic IS 'Atomically updates wallet balance, preventing race conditions';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_wallet_accounts_user_id ON wallet_accounts(user_id);

SELECT '✅ Atomic wallet balance update function created' AS status;









