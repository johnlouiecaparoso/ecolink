import { getSupabase } from '@/services/supabaseClient'

/**
 * Generate a receipt for a credit purchase transaction
 */
export async function generateReceipt(transactionId) {
  const supabase = getSupabase()

  try {
    // Get transaction details with all related data
    const { data: transaction, error: transactionError } = await supabase
      .from('credit_transactions')
      .select(
        `
        *,
        project_credits!inner(
          *,
          projects!inner(title, category, location, description)
        ),
        buyer:profiles!credit_transactions_buyer_id_fkey(full_name, email),
        seller:profiles!credit_transactions_seller_id_fkey(full_name, email)
      `,
      )
      .eq('id', transactionId)
      .single()

    if (transactionError || !transaction) {
      throw new Error('Transaction not found')
    }

    // Generate receipt data
    const receipt = {
      receiptNumber: generateReceiptNumber(transactionId),
      transactionId: transaction.id,
      issueDate: new Date().toISOString(),
      buyer: {
        name: transaction.buyer.full_name,
        email: transaction.buyer.email,
      },
      seller: {
        name: transaction.seller.full_name,
        email: transaction.seller.email,
      },
      project: {
        title: transaction.project_credits.projects.title,
        category: transaction.project_credits.projects.category,
        location: transaction.project_credits.projects.location,
        description: transaction.project_credits.projects.description,
        vintageYear: transaction.project_credits.vintage_year,
        verificationStandard: transaction.project_credits.verification_standard,
      },
      purchase: {
        creditsPurchased: transaction.quantity,
        pricePerCredit: transaction.price_per_credit,
        subtotal: transaction.quantity * transaction.price_per_credit,
        platformFeePercentage: transaction.platform_fee_percentage || 2.5,
        platformFee:
          transaction.quantity *
          transaction.price_per_credit *
          ((transaction.platform_fee_percentage || 2.5) / 100),
        totalAmount: transaction.total_amount,
        currency: transaction.currency,
        paymentMethod: transaction.payment_method,
        status: transaction.status,
      },
      environmentalImpact: {
        co2Offset: transaction.quantity, // Assuming 1 credit = 1 tonne CO2
        equivalentTreesPlanted: Math.round(transaction.quantity * 0.5), // Rough estimate
        equivalentCarsOffRoad: Math.round(transaction.quantity / 4.6), // Rough estimate
      },
      certification: {
        certificateNumber: transaction.certificate_number,
        issuedDate: transaction.completed_at,
        verificationBody: 'EcoLink Verification Services',
      },
    }

    // Save receipt to database
    const { data: savedReceipt, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        transaction_id: transactionId,
        receipt_number: receipt.receiptNumber,
        buyer_id: transaction.buyer_id,
        seller_id: transaction.seller_id,
        receipt_data: receipt,
        status: 'issued',
        issued_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (receiptError) {
      console.error('Error saving receipt:', receiptError)
      // Don't throw error, receipt generation can continue without saving
    }

    return receipt
  } catch (error) {
    console.error('Error in generateReceipt:', error)
    throw error
  }
}

/**
 * Get receipts for a user
 */
export async function getUserReceipts(userId) {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase
      .from('receipts')
      .select(
        `
        *,
        credit_transactions!inner(
          *,
          project_credits!inner(
            *,
            projects!inner(title, category, location)
          )
        )
      `,
      )
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('issued_at', { ascending: false })

    if (error) {
      console.error('Error fetching user receipts:', error)
      throw new Error('Failed to fetch receipts')
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserReceipts:', error)
    throw error
  }
}

/**
 * Download receipt as PDF (placeholder)
 */
export async function downloadReceipt(receiptId) {
  const supabase = getSupabase()

  try {
    const { data: receipt, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', receiptId)
      .single()

    if (error || !receipt) {
      throw new Error('Receipt not found')
    }

    // In a real implementation, this would generate a PDF
    console.log('Generating PDF for receipt:', receipt.receipt_number)

    // Return receipt data for PDF generation
    return receipt.receipt_data
  } catch (error) {
    console.error('Error in downloadReceipt:', error)
    throw error
  }
}

/**
 * Generate carbon impact report for a user
 */
export async function generateCarbonImpactReport(userId) {
  const supabase = getSupabase()

  try {
    // Get all completed transactions for the user
    const { data: transactions, error } = await supabase
      .from('credit_transactions')
      .select(
        `
        *,
        project_credits!inner(
          *,
          projects!inner(title, category, location)
        )
      `,
      )
      .eq('buyer_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching user transactions:', error)
      throw new Error('Failed to fetch transactions')
    }

    // Calculate impact metrics
    const totalCreditsPurchased = transactions.reduce((sum, t) => sum + t.quantity, 0)
    const totalAmountSpent = transactions.reduce((sum, t) => sum + t.total_amount, 0)

    // Group by category
    const categoryBreakdown = transactions.reduce((acc, transaction) => {
      const category = transaction.project_credits.projects.category
      if (!acc[category]) {
        acc[category] = {
          credits: 0,
          amount: 0,
          projects: new Set(),
        }
      }
      acc[category].credits += transaction.quantity
      acc[category].amount += transaction.total_amount
      acc[category].projects.add(transaction.project_credits.projects.title)

      return acc
    }, {})

    // Convert Sets to Arrays
    Object.keys(categoryBreakdown).forEach((category) => {
      categoryBreakdown[category].projects = Array.from(categoryBreakdown[category].projects)
    })

    const impactReport = {
      userId,
      generatedAt: new Date().toISOString(),
      summary: {
        totalCreditsPurchased,
        totalAmountSpent,
        totalTransactions: transactions.length,
        averagePricePerCredit: totalAmountSpent / totalCreditsPurchased,
      },
      environmentalImpact: {
        co2OffsetTonnes: totalCreditsPurchased,
        equivalentTreesPlanted: Math.round(totalCreditsPurchased * 0.5),
        equivalentCarsOffRoad: Math.round(totalCreditsPurchased / 4.6),
        equivalentHomesPowered: Math.round(totalCreditsPurchased / 16), // Rough estimate
      },
      categoryBreakdown,
      recentPurchases: transactions.slice(0, 10).map((t) => ({
        date: t.completed_at,
        project: t.project_credits.projects.title,
        category: t.project_credits.projects.category,
        credits: t.quantity,
        amount: t.total_amount,
        currency: t.currency,
      })),
    }

    return impactReport
  } catch (error) {
    console.error('Error in generateCarbonImpactReport:', error)
    throw error
  }
}

/**
 * Generate a unique receipt number
 */
function generateReceiptNumber(transactionId) {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 4)
  return `RCP-${timestamp}-${random}`.toUpperCase()
}


