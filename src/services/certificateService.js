import { getSupabase } from '@/services/supabaseClient'
import { logUserAction } from '@/services/auditService'

/**
 * Generate a credit certificate for a transaction
 */
export async function generateCreditCertificate(transactionId, type = 'purchase') {
  const supabase = getSupabase()

  if (!supabase) {
    console.warn('Supabase client not available, skipping certificate generation')
    return null
  }

  try {
    // Get transaction details
    const { data: transaction, error: transactionError } = await supabase
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
      .eq('id', transactionId)
      .single()

    if (transactionError || !transaction) {
      throw new Error('Transaction not found')
    }

    // Generate certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create certificate record
    const { data: certificate, error: certificateError } = await supabase
      .from('certificates')
      .insert({
        user_id: transaction.buyer_id,
        transaction_id: transactionId,
        certificate_number: certificateNumber,
        project_title: transaction.project_credits.projects.title,
        project_category: transaction.project_credits.projects.category,
        project_location: transaction.project_credits.projects.location,
        credits_quantity: transaction.quantity,
        vintage_year: transaction.project_credits.vintage_year,
        verification_standard: transaction.project_credits.verification_standard,
        issued_at: new Date().toISOString(),
        status: 'active',
      })
      .select()
      .single()

    if (certificateError) {
      console.error('Error creating certificate:', certificateError)
      throw new Error('Failed to create certificate')
    }

    // Log the action
    await logUserAction(
      'CERTIFICATE_GENERATED',
      'certificate',
      transaction.buyer_id,
      certificate.id,
      {
        transaction_id: transactionId,
        certificate_number: certificateNumber,
        type: type,
      },
    )

    console.log('Certificate generated successfully:', certificateNumber)
    return certificate
  } catch (error) {
    console.error('Error generating certificate:', error)
    throw error
  }
}

/**
 * Get user's certificates
 */
export async function getUserCertificates(userId) {
  const supabase = getSupabase()

  if (!supabase) {
    console.warn('Supabase client not available')
    return []
  }

  try {
    const { data: certificates, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false })

    if (error) {
      console.error('Error fetching certificates:', error)
      return []
    }

    return certificates || []
  } catch (error) {
    console.error('Error in getUserCertificates:', error)
    return []
  }
}

/**
 * Get certificate by ID
 */
export async function getCertificate(certificateId) {
  const supabase = getSupabase()

  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  try {
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', certificateId)
      .single()

    if (error) {
      throw new Error('Certificate not found')
    }

    return certificate
  } catch (error) {
    console.error('Error fetching certificate:', error)
    throw error
  }
}

/**
 * Verify certificate
 */
export async function verifyCertificate(certificateNumber) {
  const supabase = getSupabase()

  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  try {
    const { data: certificate, error } = await supabase
      .from('certificates')
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
      .eq('certificate_number', certificateNumber)
      .eq('status', 'active')
      .single()

    if (error || !certificate) {
      throw new Error('Certificate not found or invalid')
    }

    return certificate
  } catch (error) {
    console.error('Error verifying certificate:', error)
    throw error
  }
}
