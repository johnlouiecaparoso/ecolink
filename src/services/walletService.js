import { getSupabase } from '@/services/supabaseClient'

export async function getWalletBalance(userId) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  const { data, error } = await supabase
    .from('wallet_accounts')
    .select('current_balance, currency')
    .eq('user_id', userId)
    .single()

  if (error) {
    // If no wallet exists, create one
    if (error.code === 'PGRST116') {
      return await createWallet(userId)
    }
    throw new Error(error.message || 'Failed to fetch wallet balance')
  }
  return data
}

export async function createWallet(userId) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  const { data, error } = await supabase
    .from('wallet_accounts')
    .insert([
      {
        user_id: userId,
        current_balance: 0,
        currency: 'PHP',
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to create wallet')
  }
  return data
}

export async function getTransactions(userId, limit = 50) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  // First get the wallet account for this user
  const { data: walletAccount, error: walletError } = await supabase
    .from('wallet_accounts')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (walletError || !walletAccount) {
    return []
  }

  // Then get transactions for this account
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('account_id', walletAccount.id)
    .limit(limit)

  if (error) {
    throw new Error(error.message || 'Failed to fetch transactions')
  }
  return data || []
}

export async function createTransaction(transactionData) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  const { data, error } = await supabase
    .from('wallet_transactions')
    .insert([transactionData])
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to create transaction')
  }
  return data
}

export async function updateWalletBalance(userId, amount, transactionType = 'topup') {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  // Get current balance
  const { data: wallet, error: walletError } = await supabase
    .from('wallet_accounts')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (walletError) {
    throw new Error('Failed to fetch current balance')
  }

  // Calculate new balance
  const currentBalance = wallet.balance || 0
  const newBalance = transactionType === 'topup' ? currentBalance + amount : currentBalance - amount

  if (newBalance < 0) {
    throw new Error('Insufficient balance for withdrawal')
  }

  // Update wallet balance
  const { data, error } = await supabase
    .from('wallet_accounts')
    .update({ balance: newBalance })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to update wallet balance')
  }

  return data
}

// Payment gateway integration functions
export async function initiateTopUp(userId, amount, paymentMethod = 'gcash') {
  try {
    // Create pending transaction
    const transaction = await createTransaction({
      user_id: userId,
      amount: amount,
      type: 'topup',
      status: 'pending',
      payment_method: paymentMethod,
      description: `Top-up via ${paymentMethod.toUpperCase()}`,
      reference_id: generateReferenceId(),
    })

    // In a real implementation, this would call the payment gateway API
    // For now, we'll simulate a successful payment after 2 seconds
    setTimeout(async () => {
      try {
        await updateWalletBalance(userId, amount, 'topup')
        await updateTransactionStatus(transaction.id, 'completed')
      } catch (error) {
        console.error('Payment processing error:', error)
        await updateTransactionStatus(transaction.id, 'failed')
      }
    }, 2000)

    return transaction
  } catch (error) {
    throw new Error(error.message || 'Failed to initiate top-up')
  }
}

export async function initiateWithdrawal(userId, amount, paymentMethod = 'gcash') {
  try {
    // Check balance first
    const wallet = await getWalletBalance(userId)
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance for withdrawal')
    }

    // Create pending transaction
    const transaction = await createTransaction({
      user_id: userId,
      amount: amount,
      type: 'withdrawal',
      status: 'pending',
      payment_method: paymentMethod,
      description: `Withdrawal to ${paymentMethod.toUpperCase()}`,
      reference_id: generateReferenceId(),
    })

    // In a real implementation, this would call the payment gateway API
    // For now, we'll simulate processing after 3 seconds
    setTimeout(async () => {
      try {
        await updateWalletBalance(userId, amount, 'withdrawal')
        await updateTransactionStatus(transaction.id, 'completed')
      } catch (error) {
        console.error('Withdrawal processing error:', error)
        await updateTransactionStatus(transaction.id, 'failed')
      }
    }, 3000)

    return transaction
  } catch (error) {
    throw new Error(error.message || 'Failed to initiate withdrawal')
  }
}

async function updateTransactionStatus(transactionId, status) {
  const supabase = getSupabase()
  if (!supabase) return

  await supabase
    .from('wallet_transactions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', transactionId)
}

function generateReferenceId() {
  return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}
