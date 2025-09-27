import { getSupabase } from '@/services/supabaseClient'

/**
 * Email notification service for EcoLink platform
 * Handles sending emails for various platform events
 */

// Email templates
const EMAIL_TEMPLATES = {
  // Project-related emails
  PROJECT_SUBMITTED: {
    subject: 'Project Submitted Successfully - EcoLink',
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 2rem; text-align: center;">
          <h1 style="margin: 0; font-size: 2rem;">🌱 EcoLink</h1>
          <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Environmental Impact Platform</p>
        </div>

        <div style="padding: 2rem; background: #f8fafc;">
          <h2 style="color: #1f2937; margin: 0 0 1rem 0;">Project Submitted Successfully!</h2>

          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 1.5rem 0;">
            Hello ${data.userName},
          </p>

          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 1.5rem 0;">
            Your project "<strong>${data.projectTitle}</strong>" has been successfully submitted for verification.
          </p>

          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0;">
            <h3 style="color: #1f2937; margin: 0 0 1rem 0; font-size: 1.1rem;">Project Details</h3>
            <p style="margin: 0.5rem 0; color: #4b5563;"><strong>Title:</strong> ${data.projectTitle}</p>
            <p style="margin: 0.5rem 0; color: #4b5563;"><strong>Category:</strong> ${data.projectCategory}</p>
            <p style="margin: 0.5rem 0; color: #4b5563;"><strong>Location:</strong> ${data.projectLocation}</p>
            <p style="margin: 0.5rem 0; color: #4b5563;"><strong>Status:</strong> Under Review</p>
          </div>

          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 1.5rem 0;">
            Our verification team will review your project and you'll be notified of the outcome within 5-7 business days.
          </p>

          <div style="text-align: center; margin: 2rem 0;">
            <a href="${data.dashboardUrl}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              View Project Status
            </a>
          </div>
        </div>

        <div style="background: #f3f4f6; padding: 1.5rem; text-align: center; color: #6b7280; font-size: 0.9rem;">
          <p style="margin: 0;">© 2024 EcoLink. All rights reserved.</p>
          <p style="margin: 0.5rem 0 0 0;">This email was sent to ${data.userEmail}</p>
        </div>
      </div>
    `,
  },

  PROJECT_APPROVED: {
    subject: '🎉 Project Approved - EcoLink',
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 2rem; text-align: center;">
          <h1 style="margin: 0; font-size: 2rem;">🎉 Congratulations!</h1>
          <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Your project has been approved</p>
        </div>

        <div style="padding: 2rem; background: #f8fafc;">
          <h2 style="color: #1f2937; margin: 0 0 1rem 0;">Project Approved Successfully!</h2>

          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 1.5rem 0;">
            Hello ${data.userName},
          </p>

          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 1.5rem 0;">
            Great news! Your project "<strong>${data.projectTitle}</strong>" has been approved by our verification team.
          </p>

          <div style="background: #d1fae5; border: 1px solid #10B981; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0;">
            <h3 style="color: #065f46; margin: 0 0 1rem 0; font-size: 1.1rem;">✅ Project Approved</h3>
            <p style="margin: 0.5rem 0; color: #065f46;"><strong>Credits Generated:</strong> ${data.creditsGenerated}</p>
            <p style="margin: 0.5rem 0; color: #065f46;"><strong>Certificate:</strong> Available for download</p>
            <p style="margin: 0.5rem 0; color: #065f46;"><strong>Verification Notes:</strong> ${data.verificationNotes}</p>
          </div>

          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 1.5rem 0;">
            Your project is now live on the marketplace and carbon credits are available for purchase.
          </p>

          <div style="text-align: center; margin: 2rem 0;">
            <a href="${data.projectUrl}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; margin-right: 1rem;">
              View Project
            </a>
            <a href="${data.certificatesUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Download Certificate
            </a>
          </div>
        </div>

        <div style="background: #f3f4f6; padding: 1.5rem; text-align: center; color: #6b7280; font-size: 0.9rem;">
          <p style="margin: 0;">© 2024 EcoLink. All rights reserved.</p>
          <p style="margin: 0.5rem 0 0 0;">This email was sent to ${data.userEmail}</p>
        </div>
      </div>
    `,
  },

  PROJECT_REJECTED: {
    subject: 'Project Update - EcoLink',
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 2rem; text-align: center;">
          <h1 style="margin: 0; font-size: 2rem;">📋 Project Update</h1>
          <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Verification Results</p>
        </div>

        <div style="padding: 2rem; background: #f8fafc;">
          <h2 style="color: #1f2937; margin: 0 0 1rem 0;">Project Verification Update</h2>

          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 1.5rem 0;">
            Hello ${data.userName},
          </p>

          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 1.5rem 0;">
            After careful review, we regret to inform you that your project "<strong>${data.projectTitle}</strong>" did not meet our verification standards.
          </p>

          <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0;">
            <h3 style="color: #991b1b; margin: 0 0 1rem 0; font-size: 1.1rem;">📝 Feedback</h3>
            <p style="margin: 0.5rem 0; color: #991b1b;"><strong>Reason:</strong> ${data.rejectionReason}</p>
            <p style="margin: 0.5rem 0; color: #991b1b;"><strong>Suggestions:</strong> ${data.suggestions}</p>
          </div>

          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 1.5rem 0;">
            You can resubmit your project after addressing the feedback provided. We're here to help you succeed!
          </p>

          <div style="text-align: center; margin: 2rem 0;">
            <a href="${data.resubmitUrl}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Resubmit Project
            </a>
          </div>
        </div>

        <div style="background: #f3f4f6; padding: 1.5rem; text-align: center; color: #6b7280; font-size: 0.9rem;">
          <p style="margin: 0;">© 2024 EcoLink. All rights reserved.</p>
          <p style="margin: 0.5rem 0 0 0;">This email was sent to ${data.userEmail}</p>
        </div>
      </div>
    `,
  },

  // Credit-related emails
  CREDIT_PURCHASED: {
    subject: 'Carbon Credits Purchased - EcoLink',
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 2rem; text-align: center;">
          <h1 style="margin: 0; font-size: 2rem;">🌍 Thank You!</h1>
          <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Your carbon credit purchase</p>
        </div>

        <div style="padding: 2rem; background: #f8fafc;">
          <h2 style="color: #1f2937; margin: 0 0 1rem 0;">Carbon Credits Purchased Successfully!</h2>

          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 1.5rem 0;">
            Hello ${data.userName},
          </p>

          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 1.5rem 0;">
            Thank you for your contribution to environmental sustainability! Your carbon credit purchase has been completed successfully.
          </p>

          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0;">
            <h3 style="color: #1f2937; margin: 0 0 1rem 0; font-size: 1.1rem;">Purchase Details</h3>
            <p style="margin: 0.5rem 0; color: #4b5563;"><strong>Project:</strong> ${data.projectTitle}</p>
            <p style="margin: 0.5rem 0; color: #4b5563;"><strong>Credits Purchased:</strong> ${data.creditsQuantity}</p>
            <p style="margin: 0.5rem 0; color: #4b5563;"><strong>Total Amount:</strong> ${data.totalAmount} ${data.currency}</p>
            <p style="margin: 0.5rem 0; color: #4b5563;"><strong>Transaction ID:</strong> ${data.transactionId}</p>
          </div>

          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 1.5rem 0;">
            Your certificate is ready for download and your credits are now in your portfolio.
          </p>

          <div style="text-align: center; margin: 2rem 0;">
            <a href="${data.certificatesUrl}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; margin-right: 1rem;">
              Download Certificate
            </a>
            <a href="${data.portfolioUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              View Portfolio
            </a>
          </div>
        </div>

        <div style="background: #f3f4f6; padding: 1.5rem; text-align: center; color: #6b7280; font-size: 0.9rem;">
          <p style="margin: 0;">© 2024 EcoLink. All rights reserved.</p>
          <p style="margin: 0.5rem 0 0 0;">This email was sent to ${data.userEmail}</p>
        </div>
      </div>
    `,
  },

  // System emails
  WELCOME: {
    subject: 'Welcome to EcoLink - Start Making an Impact!',
    template: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 2rem; text-align: center;">
          <h1 style="margin: 0; font-size: 2rem;">🌱 Welcome to EcoLink!</h1>
          <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Your journey to environmental impact starts here</p>
        </div>

        <div style="padding: 2rem; background: #f8fafc;">
          <h2 style="color: #1f2937; margin: 0 0 1rem 0;">Welcome to the EcoLink Community!</h2>

          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 1.5rem 0;">
            Hello ${data.userName},
          </p>

          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 1.5rem 0;">
            Welcome to EcoLink! We're excited to have you join our community of environmental changemakers.
          </p>

          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0;">
            <h3 style="color: #1f2937; margin: 0 0 1rem 0; font-size: 1.1rem;">What you can do:</h3>
            <ul style="color: #4b5563; line-height: 1.6; margin: 0; padding-left: 1.5rem;">
              <li>Submit environmental projects for verification</li>
              <li>Purchase carbon credits to offset your footprint</li>
              <li>Browse verified projects and their impact</li>
              <li>Track your environmental contributions</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 2rem 0;">
            <a href="${data.dashboardUrl}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Get Started
            </a>
          </div>
        </div>

        <div style="background: #f3f4f6; padding: 1.5rem; text-align: center; color: #6b7280; font-size: 0.9rem;">
          <p style="margin: 0;">© 2024 EcoLink. All rights reserved.</p>
          <p style="margin: 0.5rem 0 0 0;">This email was sent to ${data.userEmail}</p>
        </div>
      </div>
    `,
  },
}

/**
 * Send email notification
 */
export async function sendEmailNotification(type, recipientEmail, data) {
  const supabase = getSupabase()

  try {
    const template = EMAIL_TEMPLATES[type]
    if (!template) {
      throw new Error(`Email template not found for type: ${type}`)
    }

    // For now, we'll use Supabase's built-in email function
    // In production, you'd integrate with SendGrid, Mailgun, or similar
    const { data: result, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: recipientEmail,
        subject: template.subject,
        html: template.template(data),
        type: type,
      },
    })

    if (error) {
      console.error('Error sending email:', error)
      throw new Error('Failed to send email notification')
    }

    return result
  } catch (error) {
    console.error('Error in sendEmailNotification:', error)
    throw error
  }
}

/**
 * Send project submission notification
 */
export async function notifyProjectSubmitted(projectId, userId) {
  try {
    const supabase = getSupabase()

    // Get project and user details
    const [projectResult, userResult] = await Promise.all([
      supabase.from('projects').select('title, category, location').eq('id', projectId).single(),
      supabase.from('profiles').select('name, email').eq('id', userId).single(),
    ])

    if (projectResult.error || userResult.error) {
      throw new Error('Failed to fetch project or user details')
    }

    const data = {
      userName: userResult.data.name,
      userEmail: userResult.data.email,
      projectTitle: projectResult.data.title,
      projectCategory: projectResult.data.category,
      projectLocation: projectResult.data.location,
      dashboardUrl: `${window.location.origin}/projects`,
    }

    await sendEmailNotification('PROJECT_SUBMITTED', userResult.data.email, data)
    console.log('Project submission notification sent')
  } catch (error) {
    console.error('Error sending project submission notification:', error)
    // Don't throw - email failures shouldn't break the main flow
  }
}

/**
 * Send project approval notification
 */
export async function notifyProjectApproved(projectId, userId, verificationNotes) {
  try {
    const supabase = getSupabase()

    // Get project and user details
    const [projectResult, userResult, creditsResult] = await Promise.all([
      supabase.from('projects').select('title, category, location').eq('id', projectId).single(),
      supabase.from('profiles').select('name, email').eq('id', userId).single(),
      supabase.from('project_credits').select('total_credits').eq('project_id', projectId).single(),
    ])

    if (projectResult.error || userResult.error) {
      throw new Error('Failed to fetch project or user details')
    }

    const data = {
      userName: userResult.data.name,
      userEmail: userResult.data.email,
      projectTitle: projectResult.data.title,
      creditsGenerated: creditsResult.data?.total_credits || 0,
      verificationNotes: verificationNotes || 'Project meets all verification standards.',
      projectUrl: `${window.location.origin}/projects/${projectId}`,
      certificatesUrl: `${window.location.origin}/certificates`,
    }

    await sendEmailNotification('PROJECT_APPROVED', userResult.data.email, data)
    console.log('Project approval notification sent')
  } catch (error) {
    console.error('Error sending project approval notification:', error)
  }
}

/**
 * Send project rejection notification
 */
export async function notifyProjectRejected(projectId, userId, rejectionReason, suggestions) {
  try {
    const supabase = getSupabase()

    // Get project and user details
    const [projectResult, userResult] = await Promise.all([
      supabase.from('projects').select('title, category, location').eq('id', projectId).single(),
      supabase.from('profiles').select('name, email').eq('id', userId).single(),
    ])

    if (projectResult.error || userResult.error) {
      throw new Error('Failed to fetch project or user details')
    }

    const data = {
      userName: userResult.data.name,
      userEmail: userResult.data.email,
      projectTitle: projectResult.data.title,
      rejectionReason: rejectionReason || 'Project did not meet verification standards.',
      suggestions: suggestions || 'Please review the project requirements and resubmit.',
      resubmitUrl: `${window.location.origin}/projects/${projectId}/edit`,
    }

    await sendEmailNotification('PROJECT_REJECTED', userResult.data.email, data)
    console.log('Project rejection notification sent')
  } catch (error) {
    console.error('Error sending project rejection notification:', error)
  }
}

/**
 * Send credit purchase notification
 */
export async function notifyCreditPurchased(transactionId, userId) {
  try {
    const supabase = getSupabase()

    // Get transaction and user details
    const [transactionResult, userResult] = await Promise.all([
      supabase
        .from('credit_transactions')
        .select(
          `
          quantity,
          total_amount,
          currency,
          credit_listings (
            projects (
              title
            )
          )
        `,
        )
        .eq('id', transactionId)
        .single(),
      supabase.from('profiles').select('name, email').eq('id', userId).single(),
    ])

    if (transactionResult.error || userResult.error) {
      throw new Error('Failed to fetch transaction or user details')
    }

    const transaction = transactionResult.data
    const projectTitle = transaction.credit_listings?.projects?.title || 'Unknown Project'

    const data = {
      userName: userResult.data.name,
      userEmail: userResult.data.email,
      projectTitle: projectTitle,
      creditsQuantity: transaction.quantity,
      totalAmount: transaction.total_amount,
      currency: transaction.currency,
      transactionId: transactionId,
      certificatesUrl: `${window.location.origin}/certificates`,
      portfolioUrl: `${window.location.origin}/wallet`,
    }

    await sendEmailNotification('CREDIT_PURCHASED', userResult.data.email, data)
    console.log('Credit purchase notification sent')
  } catch (error) {
    console.error('Error sending credit purchase notification:', error)
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(userId) {
  try {
    const supabase = getSupabase()

    // Get user details
    const { data: user, error } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', userId)
      .single()

    if (error || !user) {
      throw new Error('Failed to fetch user details')
    }

    const data = {
      userName: user.name,
      userEmail: user.email,
      dashboardUrl: `${window.location.origin}/dashboard`,
    }

    await sendEmailNotification('WELCOME', user.email, data)
    console.log('Welcome email sent')
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}

/**
 * Send bulk notifications (for admin use)
 */
export async function sendBulkNotification(recipients, subject, message) {
  try {
    const results = []

    for (const recipient of recipients) {
      try {
        await sendEmailNotification('CUSTOM', recipient.email, {
          userName: recipient.name,
          userEmail: recipient.email,
          subject: subject,
          message: message,
        })
        results.push({ email: recipient.email, status: 'sent' })
      } catch (error) {
        results.push({ email: recipient.email, status: 'failed', error: error.message })
      }
    }

    return results
  } catch (error) {
    console.error('Error sending bulk notifications:', error)
    throw error
  }
}

/**
 * Get email notification preferences for a user
 */
export async function getUserEmailPreferences(userId) {
  const supabase = getSupabase()

  try {
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('email_notifications')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw new Error('Failed to fetch email preferences')
    }

    // Return default preferences if none exist
    return (
      preferences?.email_notifications || {
        project_updates: true,
        credit_purchases: true,
        system_notifications: true,
        marketing_emails: false,
      }
    )
  } catch (error) {
    console.error('Error fetching email preferences:', error)
    throw error
  }
}

/**
 * Update email notification preferences
 */
export async function updateUserEmailPreferences(userId, preferences) {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        email_notifications: preferences,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error('Failed to update email preferences')
    }

    return data
  } catch (error) {
    console.error('Error updating email preferences:', error)
    throw error
  }
}


