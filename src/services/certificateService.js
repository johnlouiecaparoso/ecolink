import { getSupabase } from '@/services/supabaseClient'

/**
 * Generate a certificate for a project after verification
 */
export async function generateProjectCertificate(projectId, verificationData) {
  const supabase = getSupabase()

  try {
    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(
        `
        id,
        title,
        description,
        category,
        location,
        status,
        created_at,
        profiles!projects_user_id_fkey (
          name,
          email
        )
      `,
      )
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      throw new Error('Project not found')
    }

    // Get credit information
    const { data: credits } = await supabase
      .from('project_credits')
      .select('total_credits, price_per_credit')
      .eq('project_id', projectId)
      .single()

    // Generate certificate data
    const certificateData = {
      project_id: projectId,
      title: `${project.category} Certificate - ${project.title}`,
      description: `Environmental impact certificate for ${project.description}`,
      type: 'project_verification',
      status: 'active',
      credits_issued: credits?.total_credits || 0,
      verification_standard: verificationData?.standard || 'EcoLink Standard',
      verification_date: new Date().toISOString(),
      issued_to: project.profiles?.name || 'Project Owner',
      issued_to_email: project.profiles?.email,
      certificate_number: generateCertificateNumber(),
      metadata: {
        project_title: project.title,
        project_category: project.category,
        project_location: project.location,
        verification_data: verificationData,
        carbon_offset: credits?.total_credits || 0,
        price_per_credit: credits?.price_per_credit || 0,
      },
    }

    // Insert certificate into database
    const { data: certificate, error: insertError } = await supabase
      .from('certificates')
      .insert(certificateData)
      .select()
      .single()

    if (insertError) {
      throw new Error('Failed to generate certificate')
    }

    return certificate
  } catch (error) {
    console.error('Error generating project certificate:', error)
    throw new Error('Failed to generate project certificate')
  }
}

/**
 * Generate a certificate for credit purchase/retirement
 */
export async function generateCreditCertificate(transactionId, type = 'purchase') {
  const supabase = getSupabase()

  try {
    // Get transaction details
    const { data: transaction, error: transactionError } = await supabase
      .from('credit_transactions')
      .select(
        `
        id,
        quantity,
        total_amount,
        currency,
        created_at,
        status,
        buyer_id,
        profiles!credit_transactions_buyer_id_fkey (
          name,
          email
        ),
        credit_listings (
          project_id,
          projects (
            title,
            category,
            description,
            location
          )
        )
      `,
      )
      .eq('id', transactionId)
      .single()

    if (transactionError || !transaction) {
      throw new Error('Transaction not found')
    }

    const project = transaction.credit_listings?.projects
    if (!project) {
      throw new Error('Project information not found')
    }

    // Generate certificate data
    const certificateData = {
      transaction_id: transactionId,
      title:
        type === 'retirement'
          ? `Carbon Credit Retirement Certificate`
          : `Carbon Credit Purchase Certificate`,
      description:
        type === 'retirement'
          ? `Certificate for retiring ${transaction.quantity} carbon credits from ${project.title}`
          : `Certificate for purchasing ${transaction.quantity} carbon credits from ${project.title}`,
      type: type === 'retirement' ? 'credit_retirement' : 'credit_purchase',
      status: 'active',
      credits_issued: transaction.quantity,
      verification_standard: 'EcoLink Standard',
      verification_date: new Date().toISOString(),
      issued_to: transaction.profiles?.name || 'Buyer',
      issued_to_email: transaction.profiles?.email,
      certificate_number: generateCertificateNumber(),
      metadata: {
        project_title: project.title,
        project_category: project.category,
        project_location: project.location,
        transaction_amount: transaction.total_amount,
        transaction_currency: transaction.currency,
        credits_quantity: transaction.quantity,
        certificate_type: type,
      },
    }

    // Insert certificate into database
    const { data: certificate, error: insertError } = await supabase
      .from('certificates')
      .insert(certificateData)
      .select()
      .single()

    if (insertError) {
      throw new Error('Failed to generate certificate')
    }

    return certificate
  } catch (error) {
    console.error('Error generating credit certificate:', error)
    throw new Error('Failed to generate credit certificate')
  }
}

/**
 * Get certificates for a user
 */
export async function getUserCertificates(userId) {
  const supabase = getSupabase()

  try {
    // First check if certificates table exists by trying to fetch user's certificates
    const { data: certificates, error } = await supabase
      .from('certificates')
      .select(
        `
        id,
        title,
        description,
        type,
        status,
        credits_issued,
        verification_standard,
        verification_date,
        issued_to,
        certificate_number,
        metadata,
        created_at
      `,
      )
      .eq('user_id', userId) // Match by user_id instead of email
      .order('created_at', { ascending: false })

    if (error) {
      // If table doesn't exist, return empty array instead of throwing error
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.warn(
          'Certificates table does not exist yet. Please run the certificates setup script.',
        )
        return []
      }
      throw new Error('Failed to fetch certificates')
    }

    return certificates || []
  } catch (error) {
    console.error('Error fetching user certificates:', error)
    // Return empty array instead of throwing error to prevent crashes
    return []
  }
}

/**
 * Get all certificates (admin view)
 */
export async function getAllCertificates() {
  const supabase = getSupabase()

  try {
    const { data: certificates, error } = await supabase
      .from('certificates')
      .select(
        `
        id,
        title,
        description,
        type,
        status,
        credits_issued,
        verification_standard,
        verification_date,
        issued_to,
        issued_to_email,
        certificate_number,
        metadata,
        created_at
      `,
      )
      .order('created_at', { ascending: false })

    if (error) {
      // If table doesn't exist, return empty array instead of throwing error
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.warn(
          'Certificates table does not exist yet. Please run the certificates setup script.',
        )
        return []
      }
      throw new Error('Failed to fetch certificates')
    }

    return certificates || []
  } catch (error) {
    console.error('Error fetching all certificates:', error)
    // Return empty array instead of throwing error to prevent crashes
    return []
  }
}

/**
 * Get certificate details by ID
 */
export async function getCertificateById(certificateId) {
  const supabase = getSupabase()

  try {
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(
        `
        id,
        title,
        description,
        type,
        status,
        credits_issued,
        verification_standard,
        verification_date,
        issued_to,
        issued_to_email,
        certificate_number,
        metadata,
        project_id,
        transaction_id,
        created_at
      `,
      )
      .eq('id', certificateId)
      .single()

    if (error || !certificate) {
      throw new Error('Certificate not found')
    }

    return certificate
  } catch (error) {
    console.error('Error fetching certificate:', error)
    throw new Error('Failed to fetch certificate')
  }
}

/**
 * Verify certificate authenticity
 */
export async function verifyCertificate(certificateNumber) {
  const supabase = getSupabase()

  try {
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(
        `
        id,
        title,
        description,
        type,
        status,
        credits_issued,
        verification_standard,
        verification_date,
        issued_to,
        certificate_number,
        metadata,
        created_at
      `,
      )
      .eq('certificate_number', certificateNumber)
      .eq('status', 'active')
      .single()

    if (error || !certificate) {
      return { valid: false, message: 'Certificate not found or invalid' }
    }

    return {
      valid: true,
      certificate,
      message: 'Certificate is valid and authentic',
    }
  } catch (error) {
    console.error('Error verifying certificate:', error)
    return { valid: false, message: 'Failed to verify certificate' }
  }
}

/**
 * Generate PDF certificate
 */
export async function generateCertificatePDF(certificateId) {
  try {
    const certificate = await getCertificateById(certificateId)

    // For now, return a data URL for a simple PDF
    // In a real implementation, you'd use a PDF generation library
    const pdfData = generateSimplePDF(certificate)

    return {
      success: true,
      pdfData,
      filename: `certificate-${certificate.certificate_number}.pdf`,
    }
  } catch (error) {
    console.error('Error generating certificate PDF:', error)
    throw new Error('Failed to generate certificate PDF')
  }
}

/**
 * Download certificate as PDF
 */
export function downloadCertificatePDF(certificate, pdfData) {
  try {
    // Create blob and download
    const blob = new Blob([pdfData], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `certificate-${certificate.certificate_number}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading certificate:', error)
    throw new Error('Failed to download certificate')
  }
}

/**
 * Generate a unique certificate number
 */
function generateCertificateNumber() {
  const prefix = 'ECL'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Generate a simple PDF representation (placeholder)
 */
function generateSimplePDF(certificate) {
  // This is a placeholder - in a real implementation you'd use a library like jsPDF
  const pdfContent = `
    CERTIFICATE OF ENVIRONMENTAL IMPACT
    Certificate Number: ${certificate.certificate_number}

    This certifies that:
    ${certificate.issued_to}

    Has successfully contributed to:
    ${certificate.title}

    Description:
    ${certificate.description}

    Credits Issued: ${certificate.credits_issued}
    Verification Standard: ${certificate.verification_standard}
    Date Issued: ${new Date(certificate.verification_date).toLocaleDateString()}

    This certificate is issued by EcoLink Platform and can be verified at our platform.

    Generated on: ${new Date().toLocaleString()}
  `

  // Return a simple text representation for now
  return pdfContent
}

/**
 * Get certificate statistics
 */
export async function getCertificateStats() {
  const supabase = getSupabase()

  try {
    const { data: certificates } = await supabase
      .from('certificates')
      .select('type, status, credits_issued, created_at')

    if (!certificates) {
      return {
        totalCertificates: 0,
        totalCreditsIssued: 0,
        byType: {},
        byStatus: {},
        monthlyIssued: [],
      }
    }

    const totalCertificates = certificates.length
    const totalCreditsIssued = certificates.reduce(
      (sum, cert) => sum + (cert.credits_issued || 0),
      0,
    )

    // Group by type
    const byType = certificates.reduce((acc, cert) => {
      acc[cert.type] = (acc[cert.type] || 0) + 1
      return acc
    }, {})

    // Group by status
    const byStatus = certificates.reduce((acc, cert) => {
      acc[cert.status] = (acc[cert.status] || 0) + 1
      return acc
    }, {})

    // Group by month
    const byMonth = certificates.reduce((acc, cert) => {
      const date = new Date(cert.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!acc[monthKey]) {
        acc[monthKey] = 0
      }
      acc[monthKey]++
      return acc
    }, {})

    const monthlyIssued = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, count]) => ({
        month,
        count,
      }))

    return {
      totalCertificates,
      totalCreditsIssued,
      byType,
      byStatus,
      monthlyIssued,
    }
  } catch (error) {
    console.error('Error fetching certificate stats:', error)
    throw new Error('Failed to fetch certificate statistics')
  }
}
