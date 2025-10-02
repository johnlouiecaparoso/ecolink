import { getSupabase } from '@/services/supabaseClient'

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(userEmail, userName) {
  // In a real implementation, this would integrate with an email service like SendGrid, AWS SES, etc.
  console.log(`Sending welcome email to ${userEmail} for user ${userName}`)

  // For now, we'll just log the action
  return {
    success: true,
    messageId: `welcome_${Date.now()}`,
    email: userEmail,
    type: 'welcome',
  }
}

/**
 * Notify user when their project is approved
 */
export async function notifyProjectApproved(projectId, userId, verifierNotes) {
  try {
    // Get project and user details
    const supabase = getSupabase()

    const { data: project } = await supabase
      .from('projects')
      .select('title, category, location')
      .eq('id', projectId)
      .single()

    const { data: user } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (!project || !user) {
      throw new Error('Project or user not found')
    }

    const emailData = {
      to: user.email,
      subject: `🎉 Your Project "${project.title}" Has Been Approved!`,
      template: 'project_approved',
      data: {
        userName: user.full_name,
        projectTitle: project.title,
        projectCategory: project.category,
        projectLocation: project.location,
        verifierNotes: verifierNotes,
        approvalDate: new Date().toLocaleDateString(),
      },
    }

    console.log('Sending project approval email:', emailData)
    return {
      success: true,
      messageId: `approval_${projectId}_${Date.now()}`,
      email: user.email,
      type: 'project_approved',
    }
  } catch (error) {
    console.error('Error sending project approval email:', error)
    throw error
  }
}

/**
 * Notify user when their project is rejected
 */
export async function notifyProjectRejected(
  projectId,
  userId,
  verifierNotes,
  improvementSuggestions,
) {
  try {
    // Get project and user details
    const supabase = getSupabase()

    const { data: project } = await supabase
      .from('projects')
      .select('title, category, location')
      .eq('id', projectId)
      .single()

    const { data: user } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (!project || !user) {
      throw new Error('Project or user not found')
    }

    const emailData = {
      to: user.email,
      subject: `Project Review: "${project.title}" Requires Updates`,
      template: 'project_rejected',
      data: {
        userName: user.full_name,
        projectTitle: project.title,
        projectCategory: project.category,
        projectLocation: project.location,
        verifierNotes: verifierNotes,
        improvementSuggestions: improvementSuggestions,
        rejectionDate: new Date().toLocaleDateString(),
      },
    }

    console.log('Sending project rejection email:', emailData)
    return {
      success: true,
      messageId: `rejection_${projectId}_${Date.now()}`,
      email: user.email,
      type: 'project_rejected',
    }
  } catch (error) {
    console.error('Error sending project rejection email:', error)
    throw error
  }
}

/**
 * Notify user when they purchase credits
 */
export async function notifyCreditPurchased(transactionId, userId) {
  try {
    // Get transaction and user details
    const supabase = getSupabase()

    const { data: transaction } = await supabase
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

    const { data: user } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (!transaction || !user) {
      throw new Error('Transaction or user not found')
    }

    const emailData = {
      to: user.email,
      subject: `✅ Carbon Credits Purchased Successfully!`,
      template: 'credit_purchased',
      data: {
        userName: user.full_name,
        projectTitle: transaction.project_credits.projects.title,
        projectCategory: transaction.project_credits.projects.category,
        projectLocation: transaction.project_credits.projects.location,
        creditsPurchased: transaction.quantity,
        pricePerCredit: transaction.price_per_credit,
        totalAmount: transaction.total_amount,
        currency: transaction.currency,
        purchaseDate: new Date(transaction.created_at).toLocaleDateString(),
        transactionId: transaction.id,
      },
    }

    console.log('Sending credit purchase email:', emailData)
    return {
      success: true,
      messageId: `purchase_${transactionId}_${Date.now()}`,
      email: user.email,
      type: 'credit_purchased',
    }
  } catch (error) {
    console.error('Error sending credit purchase email:', error)
    throw error
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(userEmail) {
  console.log(`Sending password reset email to ${userEmail}`)

  return {
    success: true,
    messageId: `reset_${Date.now()}`,
    email: userEmail,
    type: 'password_reset',
  }
}

/**
 * Send email verification
 */
export async function sendEmailVerification(userEmail, userName) {
  console.log(`Sending email verification to ${userEmail} for user ${userName}`)

  return {
    success: true,
    messageId: `verify_${Date.now()}`,
    email: userEmail,
    type: 'email_verification',
  }
}

/**
 * Notify when a project is submitted for review
 */
export async function notifyProjectSubmitted(projectId, userId) {
  console.log(`Notifying project submission for project ${projectId} by user ${userId}`)

  // In a real implementation, this would send an email to the project submitter
  return {
    success: true,
    messageId: `project_submitted_${Date.now()}`,
    projectId,
    userId,
    type: 'project_submitted',
  }
}

/**
 * Get user email preferences
 */
export async function getUserEmailPreferences(userId) {
  console.log('Getting email preferences for user:', userId)

  // Return default preferences
  return {
    marketing: true,
    projectUpdates: true,
    priceAlerts: true,
    systemNotifications: true,
    weeklyDigest: false,
  }
}

/**
 * Update user email preferences
 */
export async function updateUserEmailPreferences(userId, preferences) {
  console.log('Updating email preferences for user:', userId, preferences)

  // In a real implementation, this would save to database
  return {
    success: true,
    preferences,
  }
}
