import { getSupabase } from '@/services/supabaseClient'
import { getCurrentUserId } from '@/utils/authHelper'
import { logUserAction } from '@/services/auditService'

/**
 * Password reset / change service (Supabase Auth).
 *
 * Flow:
 *  - requestPasswordReset(email) sends a recovery email linking to
 *    /reset-password. supabaseClient is configured with detectSessionInUrl,
 *    so opening that link establishes a temporary recovery session.
 *  - On the reset page (or from Profile → Security), updatePassword() sets the
 *    new password on the active session.
 */

function client() {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  return supabase
}

/**
 * Send a password-reset email.
 */
export async function requestPasswordReset(email) {
  const supabase = client()
  if (!email) throw new Error('Email is required')

  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : ''
  const redirectTo = `${origin}/reset-password`

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) throw new Error(error.message || 'Failed to send reset email')

  try {
    await logUserAction('PASSWORD_RESET_REQUESTED', 'user', null, null, { email })
  } catch {
    /* non-critical */
  }
  return true
}

/**
 * Update the current session's password. Used both by the reset-password page
 * (recovery session) and by an authenticated user changing their password.
 */
export async function updatePassword(newPassword) {
  const supabase = client()
  if (!newPassword || newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters')
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message || 'Failed to update password')

  try {
    const uid = await getCurrentUserId()
    await logUserAction('PASSWORD_CHANGED', 'user', uid, uid, {})
  } catch {
    /* non-critical */
  }
  return true
}
