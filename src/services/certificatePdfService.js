/**
 * Generate and download a PDF certificate for a purchase or retirement
 * Note: jsPDF is optional - if not installed, falls back to text download
 */
export async function generateCertificatePDF(certificate, transaction = null) {
  try {
    // Try to import jsPDF dynamically
    let jsPDF
    try {
      jsPDF = (await import('jspdf')).default
    } catch (importError) {
      console.warn('jsPDF not available, using text fallback')
      throw new Error('jsPDF not installed')
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    // Get additional certificate data from certificate_data JSONB or certificate fields
    const certData = certificate.certificate_data || {}
    const projectDescription = certificate.project_description || certData.project_description || ''
    const beneficiaryName = certificate.beneficiary_name || certData.beneficiary_name || 'Unknown'
    const purpose = certificate.purpose || certData.purpose || (certificate.certificate_type === 'retirement' ? 'Carbon Offset' : 'Purchase')
    const tonnesCO2 = certificate.tonnes_co2 || certData.tonnes_co2 || certificate.credits_quantity || 0
    const transactionId = certificate.transaction_id_ref || certData.transaction_id_ref || certificate.transaction_id || ''
    const paymentRef = certificate.payment_reference || certData.payment_reference || transaction?.payment_reference || ''
    const walletAddress = certificate.wallet_address || certData.wallet_address || ''
    // Get purchase date/time - prefer purchase_date, then timestamp, then issued_at
    const purchaseDateTime = certificate.purchase_date || certificate.purchase_datetime || certData.purchase_date || certData.purchase_datetime || certificate.timestamp || certData.timestamp || transaction?.created_at || certificate.issued_at || new Date().toISOString()
    const timestamp = purchaseDateTime

    // Set colors
    const primaryColor = [6, 158, 45] // #069e2d
    const secondaryColor = [16, 185, 129] // #10b981
    const textColor = [26, 32, 44] // #1a202c
    const mutedColor = [113, 128, 150] // #718096

    // Add header with gradient effect
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 297, 50, 'F')

    // Add logo area (you can add actual logo image here)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('EcoLink', 20, 25)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Carbon Credit Certificate', 20, 35)

    // Certificate title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...textColor)
    const certTitle = certificate.certificate_type === 'retirement' 
      ? 'CERTIFICATE OF CARBON CREDIT RETIREMENT'
      : 'CERTIFICATE OF CARBON CREDIT PURCHASE'
    doc.text(certTitle, 148, 70, { align: 'center' })

    // Certificate number
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...mutedColor)
    doc.text(`Certificate Number: ${certificate.certificate_number}`, 148, 85, {
      align: 'center',
    })

    // Main content box
    const contentY = 100
    const contentHeight = 140
    const marginX = 20

    // Draw border
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.rect(marginX, contentY, 257, contentHeight)

    // Certificate details
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...textColor)
    doc.text('This certifies that:', marginX + 10, contentY + 15)

    // Beneficiary Name (YOUR NAME - prominently displayed)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Beneficiary:', marginX + 10, contentY + 25)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...primaryColor)
    doc.text(beneficiaryName, marginX + 50, contentY + 25)
    doc.setTextColor(...textColor)
    let currentY = contentY + 38
    
    // Project Name (prominently displayed)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Project Name:', marginX + 10, currentY)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(certificate.project_title || 'N/A', marginX + 50, currentY)
    currentY += 12

    // Project Description (full description)
    if (projectDescription) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('Project Description:', marginX + 10, currentY)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      // Split long descriptions into multiple lines
      const descLines = doc.splitTextToSize(projectDescription, 200)
      doc.text(descLines, marginX + 50, currentY)
      currentY += descLines.length * 6 + 5
      doc.setFontSize(11)
    } else {
      currentY += 5
    }

    // Tonnes of CO₂ Retired (prominently displayed)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Tonnes of CO₂ Retired:', marginX + 10, currentY)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...primaryColor)
    doc.text(`${tonnesCO2.toLocaleString()} tonnes CO₂`, marginX + 50, currentY)
    doc.setTextColor(...textColor)
    currentY += 12

    // Purpose (for both purchase and retirement certificates)
    if (purpose) {
      const purposeLabel = certificate.certificate_type === 'retirement' 
        ? 'Purpose of Retirement:' 
        : 'Purpose of Purchase:'
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text(purposeLabel, marginX + 10, currentY)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const purposeLines = doc.splitTextToSize(purpose, 200)
      doc.text(purposeLines, marginX + 50, currentY)
      currentY += purposeLines.length * 6 + 5
      doc.setFontSize(11)
    } else if (certificate.certificate_type === 'retirement') {
      // Default purpose for retirement if not specified
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('Purpose of Retirement:', marginX + 10, currentY)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text('Carbon Offset', marginX + 50, currentY)
      currentY += 12
    }

    // Transaction ID with onchain verification (prominently displayed)
    currentY += 5
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.3)
    doc.line(marginX + 10, currentY, marginX + 247, currentY)
    currentY += 8
    
    if (transactionId || paymentRef) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('Transaction ID:', marginX + 10, currentY)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const txId = transactionId || paymentRef
      // Split long transaction IDs if needed
      const txIdLines = doc.splitTextToSize(txId, 200)
      doc.text(txIdLines, marginX + 50, currentY)
      currentY += txIdLines.length * 6 + 5
      
      // Onchain verification (prominently displayed)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...primaryColor)
      doc.text('✓ Onchain Verification:', marginX + 10, currentY)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...mutedColor)
      if (walletAddress) {
        doc.text('This transaction is verified on-chain via wallet address', marginX + 50, currentY)
      } else if (paymentRef) {
        doc.text('This transaction is verified via payment reference', marginX + 50, currentY)
      } else {
        doc.text('Transaction verification available via transaction ID', marginX + 50, currentY)
      }
      currentY += 10
      doc.setTextColor(...textColor)
    } else {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('Transaction ID:', marginX + 10, currentY)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text('N/A', marginX + 50, currentY)
      currentY += 12
    }

    // Purchase Date and Time (prominently displayed)
    currentY += 5
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.3)
    doc.line(marginX + 10, currentY, marginX + 247, currentY)
    currentY += 8
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Purchase Date & Time:', marginX + 10, currentY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...primaryColor)
    doc.text(formatDate(timestamp), marginX + 50, currentY)
    doc.setTextColor(...textColor)
    currentY += 12
    
    // Timestamp (for reference)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...mutedColor)
    doc.text('Certificate Issued:', marginX + 10, currentY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(formatDate(certificate.issued_at || timestamp), marginX + 50, currentY)
    doc.setTextColor(...textColor)
    currentY += 10

    // Wallet Information (prominently displayed)
    if (walletAddress) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('Wallet Address:', marginX + 10, currentY)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      // Split long wallet addresses if needed
      const walletLines = doc.splitTextToSize(walletAddress, 200)
      doc.text(walletLines, marginX + 50, currentY)
      currentY += walletLines.length * 5 + 5
    } else {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('Wallet Address:', marginX + 10, currentY)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...mutedColor)
      doc.text('Not linked to a wallet', marginX + 50, currentY)
      doc.setTextColor(...textColor)
      currentY += 10
    }

    // Additional details (if space allows)
    if (currentY < contentY + contentHeight - 20) {
      currentY += 5
      doc.setFont('helvetica', 'bold')
      doc.text('Additional Details:', marginX + 10, currentY)
      currentY += 10

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      if (certificate.project_category) {
        doc.text(`Category: ${certificate.project_category}`, marginX + 10, currentY)
        currentY += 8
      }
      if (certificate.project_location) {
        doc.text(`Location: ${certificate.project_location}`, marginX + 10, currentY)
        currentY += 8
      }
      if (certificate.vintage_year) {
        doc.text(`Vintage Year: ${certificate.vintage_year}`, marginX + 10, currentY)
        currentY += 8
      }
      if (certificate.verification_standard) {
        doc.text(`Verification Standard: ${certificate.verification_standard}`, marginX + 10, currentY)
        currentY += 8
      }
      
      // Transaction details if available
      if (transaction && certificate.certificate_type !== 'retirement') {
        if (transaction.total_amount) {
          doc.text(
            `Amount: ${transaction.currency || 'PHP'} ${transaction.total_amount.toLocaleString()}`,
            marginX + 10,
            currentY,
          )
          currentY += 8
        }
        if (transaction.payment_method) {
          doc.text(`Payment Method: ${transaction.payment_method.toUpperCase()}`, marginX + 10, currentY)
        }
      }
    }

    // Footer
    const footerY = 250
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.3)
    doc.line(marginX, footerY, 277, footerY)

    doc.setFontSize(9)
    doc.setTextColor(...mutedColor)
    doc.text('This certificate is issued by EcoLink and verifies the ownership/retirement of carbon credits.', 148, footerY + 10, {
      align: 'center',
      maxWidth: 257,
    })
    doc.text(
      'For verification, visit: https://ecolink.com/verify',
      148,
      footerY + 20,
      { align: 'center' },
    )

    // Generate filename
    const filename = `certificate-${certificate.certificate_number}.pdf`

    // Save PDF
    doc.save(filename)

    return filename
  } catch (error) {
    console.error('Error generating certificate PDF:', error)
    throw new Error('Failed to generate certificate PDF')
  }
}

/**
 * Format date for certificate
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

