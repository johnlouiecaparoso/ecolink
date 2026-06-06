import { getSupabase } from '@/services/supabaseClient'
import { getCurrentUserId } from '@/utils/authHelper'
import { logUserAction } from '@/services/auditService'

/**
 * TOTP Multi-Factor Authentication (Supabase Auth MFA).
 *
 * Enrollment (Profile → Security): enroll() returns a QR code + secret the user
 * scans into an authenticator app, then verifyEnrollment() confirms a code.
 * Login: after sign-in, isMfaRequired() reports whether the session is still at
 * aal1 with a verified factor; LoginForm then prompts for a code and calls
 * challengeAndVerify() to step up to aal2.
 */

function client() {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  return supabase
}

/**
 * All enrolled factors.
 */
export async function listFactors() {
  const supabase = client()
  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error) throw new Error(error.message || 'Failed to list MFA factors')
  return data
}

/**
 * The first verified TOTP factor, or null.
 */
export async function getVerifiedTotpFactor() {
  try {
    const data = await listFactors()
    const totp = (data?.totp || []).find((f) => f.status === 'verified')
    return totp || null
  } catch (err) {
    console.warn('Could not read MFA factors:', err?.message)
    return null
  }
}

/**
 * Whether the user currently has MFA enabled (a verified TOTP factor).
 */
export async function isMfaEnabled() {
  return (await getVerifiedTotpFactor()) !== null
}

/**
 * After login: returns { required, factorId }. Required when the session is at
 * aal1 but the user has a verified factor (nextLevel aal2).
 */
export async function isMfaRequired() {
  const supabase = client()
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (error) return { required: false, factorId: null }
    if (data?.currentLevel === 'aal1' && data?.nextLevel === 'aal2') {
      const factor = await getVerifiedTotpFactor()
      return { required: !!factor, factorId: factor?.id || null }
    }
    return { required: false, factorId: null }
  } catch (err) {
    // Fail open on API errors so users are never locked out by a transient fault.
    console.warn('MFA assurance check failed:', err?.message)
    return { required: false, factorId: null }
  }
}

/**
 * Start TOTP enrollment. Returns { factorId, qrCode, secret, uri }.
 */
export async function enroll() {
  const supabase = client()
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
  if (error) throw new Error(error.message || 'Failed to start MFA enrollment')
  return {
    factorId: data.id,
    qrCode: data.totp?.qr_code,
    secret: data.totp?.secret,
    uri: data.totp?.uri,
  }
}

/**
 * Confirm enrollment by verifying a code from the authenticator app.
 */
export async function verifyEnrollment(factorId, code) {
  const supabase = client()
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
  if (challengeError) throw new Error(challengeError.message || 'Failed to start MFA challenge')

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  })
  if (verifyError) throw new Error(verifyError.message || 'Invalid verification code')

  try {
    const uid = await getCurrentUserId()
    await logUserAction('MFA_ENROLLED', 'user', uid, uid, { factor_id: factorId })
  } catch {
    /* non-critical */
  }
  return true
}

/**
 * Verify a TOTP code at login (step up aal1 → aal2).
 */
export async function challengeAndVerify(factorId, code) {
  const supabase = client()
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
  if (challengeError) throw new Error(challengeError.message || 'Failed to start MFA challenge')

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  })
  if (verifyError) {
    try {
      const uid = await getCurrentUserId()
      await logUserAction('MFA_VERIFICATION_FAILED', 'user', uid, uid, {})
    } catch {
      /* non-critical */
    }
    throw new Error(verifyError.message || 'Invalid verification code')
  }

  try {
    const uid = await getCurrentUserId()
    await logUserAction('MFA_VERIFIED', 'user', uid, uid, {})
  } catch {
    /* non-critical */
  }
  return true
}

/**
 * Disable MFA by unenrolling a factor.
 */
export async function unenroll(factorId) {
  const supabase = client()
  const { error } = await supabase.auth.mfa.unenroll({ factorId })
  if (error) throw new Error(error.message || 'Failed to disable MFA')

  try {
    const uid = await getCurrentUserId()
    await logUserAction('MFA_DISABLED', 'user', uid, uid, { factor_id: factorId })
  } catch {
    /* non-critical */
  }
  return true
}
