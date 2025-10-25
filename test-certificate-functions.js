// Test Certificate Functions - Run this in browser console
console.log('🧪 Testing Certificate Functions...')

async function testCertificateFunctions() {
  try {
    // Force import the certificate service
    const certificateService = await import('/src/services/certificateService.js?v=' + Date.now())

    console.log('✅ Certificate service loaded')
    console.log('Available exports:', Object.keys(certificateService))

    // Check each function individually
    console.log('')
    console.log('Checking individual functions:')

    // Check generateProjectCertificate
    if (typeof certificateService.generateProjectCertificate === 'function') {
      console.log('✅ generateProjectCertificate: Available')
    } else {
      console.log('❌ generateProjectCertificate: Missing')
      console.log('Type:', typeof certificateService.generateProjectCertificate)
    }

    // Check uploadProjectCertificate
    if (typeof certificateService.uploadProjectCertificate === 'function') {
      console.log('✅ uploadProjectCertificate: Available')
    } else {
      console.log('❌ uploadProjectCertificate: Missing')
      console.log('Type:', typeof certificateService.uploadProjectCertificate)
    }

    // Check getProjectCertificates
    if (typeof certificateService.getProjectCertificates === 'function') {
      console.log('✅ getProjectCertificates: Available')
    } else {
      console.log('❌ getProjectCertificates: Missing')
      console.log('Type:', typeof certificateService.getProjectCertificates)
    }

    // Check other functions
    console.log('')
    console.log('Other functions:')
    console.log('generateCreditCertificate:', typeof certificateService.generateCreditCertificate)
    console.log('getUserCertificates:', typeof certificateService.getUserCertificates)
    console.log('getCertificate:', typeof certificateService.getCertificate)
    console.log('verifyCertificate:', typeof certificateService.verifyCertificate)

    // If functions are missing, try to access them directly
    console.log('')
    console.log('Trying to access functions directly:')
    try {
      const { generateProjectCertificate } = await import(
        '/src/services/certificateService.js?v=' + Date.now()
      )
      console.log(
        '✅ Direct import of generateProjectCertificate:',
        typeof generateProjectCertificate,
      )
    } catch (e) {
      console.log('❌ Direct import failed:', e.message)
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testCertificateFunctions()









