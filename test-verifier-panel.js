// Test Verifier Panel - Run this in browser console
console.log('🧪 Testing Verifier Panel...')

async function testVerifierPanel() {
  try {
    // 1. Test certificate service imports
    console.log('Step 1: Testing certificate service imports...')

    try {
      const certificateService = await import('/src/services/certificateService.js')
      console.log('✅ Certificate service loaded')
      console.log('Available exports:', Object.keys(certificateService))

      // Check if the required functions exist
      const requiredFunctions = [
        'generateProjectCertificate',
        'uploadProjectCertificate',
        'getProjectCertificates',
      ]

      for (const func of requiredFunctions) {
        if (typeof certificateService[func] === 'function') {
          console.log(`✅ ${func} function available`)
        } else {
          console.log(`❌ ${func} function missing`)
        }
      }
    } catch (e) {
      console.log('❌ Certificate service import failed:', e.message)
      return
    }

    // 2. Test verifier view import
    console.log('Step 2: Testing verifier view...')

    try {
      // This should not crash now
      const { useUserStore } = await import('/src/store/userStore.js')
      const userStore = useUserStore()

      console.log('✅ User store loaded')
      console.log('Current user role:', userStore.role)

      if (userStore.role === 'verifier' || userStore.role === 'admin') {
        console.log('✅ User has verifier access')
      } else {
        console.log('⚠️ User does not have verifier role')
      }
    } catch (e) {
      console.log('❌ Verifier view test failed:', e.message)
    }

    // 3. Test project service
    console.log('Step 3: Testing project service...')

    try {
      const { getAllProjects } = await import('/src/services/projectService.js')
      const result = await getAllProjects()

      console.log('✅ Project service working')
      console.log('Projects found:', result.projects?.length || 0)
    } catch (e) {
      console.log('❌ Project service failed:', e.message)
    }

    console.log('🎉 Verifier panel test completed!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Refresh the page')
    console.log('2. Login as verifier')
    console.log('3. Navigate to /verifier route')
    console.log('4. Should see pending projects now')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testVerifierPanel()









