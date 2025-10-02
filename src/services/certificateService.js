import { getSupabase } from '@/services/supabaseClient'
import { logUserAction } from '@/services/auditService'
import { USE_DATABASE } from '@/config/database'

/**
 * Generate a project certificate after verification
 */
export async function generateProjectCertificate(projectId, verificationData) {
  const supabase = getSupabase()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      throw new Error('Project not found')
    }

    // Generate certificate
    const certificateData = {
      project_id: projectId,
      project_title: project.title,
      project_category: project.category,
      project_location: project.location,
      verification_standard: verificationData.standard || 'EcoLink Standard',
      verifier_id: verificationData.verifier_id,
      verification_date: verificationData.verification_date,
      verifier_notes: verificationData.verifier_notes,
      certificate_number: generateCertificateNumber(),
      status: 'issued',
      issued_at: new Date().toISOString(),
    }

    const { data: certificate, error: certError } = await supabase
      .from('project_certificates')
      .insert(certificateData)
      .select()
      .single()

    if (certError) {
      console.error('Error creating project certificate:', certError)
      throw new Error('Failed to create project certificate')
    }

    // Log the action
    await logUserAction('CERTIFICATE_GENERATED', 'project_certificate', user.id, certificate.id, {
      project_id: projectId,
      certificate_number: certificate.certificate_number,
    })

    return certificate
  } catch (error) {
    console.error('Error in generateProjectCertificate:', error)
    throw error
  }
}

/**
 * Generate a credit certificate after purchase
 */
export async function generateCreditCertificate(transactionId, type = 'purchase') {
  const supabase = getSupabase()

  try {
    // Get transaction details
    const { data: transaction, error: transactionError } = await supabase
      .from('credit_transactions')
      .select(
        `
        *,
        project_credits!inner(
          *,
          projects!inner(*)
        )
      `,
      )
      .eq('id', transactionId)
      .single()

    if (transactionError || !transaction) {
      throw new Error('Transaction not found')
    }

    // Generate certificate
    const certificateData = {
      transaction_id: transactionId,
      buyer_id: transaction.buyer_id,
      project_id: transaction.project_credits.project_id,
      project_title: transaction.project_credits.projects.title,
      project_category: transaction.project_credits.projects.category,
      project_location: transaction.project_credits.projects.location,
      credits_purchased: transaction.quantity,
      price_per_credit: transaction.price_per_credit,
      total_amount: transaction.total_amount,
      currency: transaction.currency,
      certificate_type: type,
      certificate_number: generateCertificateNumber(),
      status: 'issued',
      issued_at: new Date().toISOString(),
    }

    const { data: certificate, error: certError } = await supabase
      .from('credit_certificates')
      .insert(certificateData)
      .select()
      .single()

    if (certError) {
      console.error('Error creating credit certificate:', certError)
      throw new Error('Failed to create credit certificate')
    }

    // Log the action
    await logUserAction(
      'CREDIT_CERTIFICATE_GENERATED',
      'credit_certificate',
      transaction.buyer_id,
      certificate.id,
      {
        transaction_id: transactionId,
        certificate_number: certificate.certificate_number,
      },
    )

    return certificate
  } catch (error) {
    console.error('Error in generateCreditCertificate:', error)
    throw error
  }
}

/**
 * Get certificates for a user
 */
export async function getUserCertificates(userId) {
  // Skip database calls if disabled
  if (!USE_DATABASE) {
    console.log('Database disabled, using sample data for certificates')
    return [
      {
        id: 'demo-cert-1',
        type: 'project_verification',
        title: 'Amazon Rainforest Protection',
        issued_at: new Date().toISOString(),
        status: 'active',
        credits: 1000,
        project_name: 'Amazon Rainforest Protection Initiative',
        verification_standard: 'VCS',
        vintage_year: 2024,
      },
      {
        id: 'demo-cert-2',
        type: 'credit_purchase',
        title: 'Solar Energy Credits',
        issued_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        credits: 500,
        project_name: 'Solar Energy Initiative',
        verification_standard: 'Gold Standard',
        vintage_year: 2024,
      },
    ]
  }

  const supabase = getSupabase()

  try {
    const { data, error } = await supabase
      .from('credit_certificates')
      .select('*')
      .eq('buyer_id', userId)
      .order('issued_at', { ascending: false })

    if (error) {
      console.error('Error fetching user certificates:', error)
      throw new Error('Failed to fetch certificates')
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserCertificates:', error)
    throw error
  }
}

/**
 * Download certificate as PDF (placeholder - would integrate with PDF generation service)
 */
export async function downloadCertificate(certificateId) {
  const supabase = getSupabase()

  try {
    const { data: certificate, error } = await supabase
      .from('credit_certificates')
      .select('*')
      .eq('id', certificateId)
      .single()

    if (error || !certificate) {
      throw new Error('Certificate not found')
    }

    // In a real implementation, this would generate a PDF
    // For now, we'll return the certificate data
    console.log('Generating PDF for certificate:', certificate.certificate_number)

    // Simulate PDF generation
    const pdfData = {
      certificateNumber: certificate.certificate_number,
      projectTitle: certificate.project_title,
      creditsPurchased: certificate.credits_purchased,
      issuedDate: certificate.issued_at,
      // ... other certificate details
    }

    return pdfData
  } catch (error) {
    console.error('Error in downloadCertificate:', error)
    throw error
  }
}

/**
 * Generate a unique certificate number
 */
function generateCertificateNumber() {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `ECL-${timestamp}-${random}`.toUpperCase()
}
