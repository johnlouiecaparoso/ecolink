import { getSupabase } from '@/services/supabaseClient'

const NOTIFICATION_TABLE = 'system_notifications'

const ROLE_CANONICAL_MAP = Object.freeze({
  admin: 'admin',
  administrator: 'admin',
  super_admin: 'admin',
  superadmin: 'admin',
  verifier: 'verifier',
  verification: 'verifier',
  qa: 'verifier',
  project_developer: 'project_developer',
  projectdeveloper: 'project_developer',
  developer: 'project_developer',
  buyer_investor: 'buyer_investor',
  buyerinvestor: 'buyer_investor',
  investor: 'buyer_investor',
  general_user: 'general_user',
  generaluser: 'general_user',
  user: 'general_user',
})

function normalizeRole(role) {
  return typeof role === 'string' ? role.trim().toLowerCase() : ''
}

function canonicalizeRole(role) {
  const normalized = normalizeRole(role).replace(/[\s-]+/g, '_')
  if (!normalized) return ''
  return ROLE_CANONICAL_MAP[normalized] || normalized
}

function normalizeRoles(roles = []) {
  return Array.from(new Set((roles || []).map((role) => canonicalizeRole(role)).filter(Boolean)))
}

function isMissingTableError(error) {
  const message = String(error?.message || '').toLowerCase()
  return (
    message.includes('does not exist') ||
    message.includes('relation') ||
    error?.code === '42P01'
  )
}

async function getExistingNotificationRecipients(userIds = []) {
  const supabase = getSupabase()
  if (!supabase) return []

  const normalizedUserIds = Array.from(
    new Set((userIds || []).filter(Boolean).map((id) => String(id))),
  )

  if (!normalizedUserIds.length) return []

  const { data, error } = await supabase.from('profiles').select('id').in('id', normalizedUserIds)

  if (error) {
    throw new Error(error.message || 'Failed to verify notification recipients')
  }

  return (data || []).map((record) => String(record.id))
}

export async function getUserNotifications(userId, limit = 25) {
  const supabase = getSupabase()
  if (!supabase || !userId) return []

  const { data, error } = await supabase
    .from(NOTIFICATION_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    if (isMissingTableError(error)) {
      console.warn('Notifications table not found. Apply latest migration to enable in-app notifications.')
      return []
    }
    throw new Error(error.message || 'Failed to fetch notifications')
  }

  return data || []
}

export async function markNotificationAsRead(notificationId, userId) {
  const supabase = getSupabase()
  if (!supabase || !notificationId || !userId) return

  const { error } = await supabase
    .from(NOTIFICATION_TABLE)
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId)

  if (error && !isMissingTableError(error)) {
    throw new Error(error.message || 'Failed to mark notification as read')
  }
}

export async function markAllNotificationsAsRead(userId) {
  const supabase = getSupabase()
  if (!supabase || !userId) return

  const { error } = await supabase
    .from(NOTIFICATION_TABLE)
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error && !isMissingTableError(error)) {
    throw new Error(error.message || 'Failed to mark notifications as read')
  }
}

async function getUserIdsByRoles(roles = [], excludedUserIds = []) {
  const supabase = getSupabase()
  if (!supabase) return []

  const normalizedRoles = normalizeRoles(roles)
  if (!normalizedRoles.length) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('id, role')
    .not('role', 'is', null)

  if (error) {
    throw new Error(error.message || 'Failed to resolve notification recipients')
  }

  const excluded = new Set((excludedUserIds || []).map((id) => String(id)))
  const targetRoles = new Set(normalizedRoles)

  return (data || [])
    .filter((record) => targetRoles.has(canonicalizeRole(record.role)))
    .map((record) => record.id)
    .filter((id) => id && !excluded.has(String(id)))
}

export async function createNotificationsForUsers(userIds = [], payload = {}) {
  const supabase = getSupabase()
  if (!supabase) return []

  const verifiedRecipients = await getExistingNotificationRecipients(userIds)
  const recipients = Array.from(new Set(verifiedRecipients))
  if (!recipients.length) return []

  const title = payload.title?.trim()
  const message = payload.message?.trim()
  if (!title || !message) return []

  const rows = recipients.map((userId) => ({
    user_id: userId,
    type: payload.type || 'system',
    title,
    message,
    link: payload.link || null,
    metadata: payload.metadata || {},
    is_read: false,
  }))

  const { data, error } = await supabase.from(NOTIFICATION_TABLE).insert(rows).select('id')

  if (error) {
    if (isMissingTableError(error)) {
      console.warn('Notifications table not found. Apply latest migration to enable in-app notifications.')
      return []
    }
    throw new Error(error.message || 'Failed to create notifications')
  }

  return data || []
}

export async function createNotificationsForRoles(roles = [], payload = {}, options = {}) {
  const recipients = await getUserIdsByRoles(roles, options.excludeUserIds || [])
  return createNotificationsForUsers(recipients, payload)
}

export async function notifyProjectSubmittedForReview(project) {
  if (!project?.id) return

  await createNotificationsForRoles(
    ['verifier'],
    {
      type: 'project_submission',
      title: 'New project submitted for verification',
      message: `Project "${project.title || 'Untitled Project'}" is waiting for review.`,
      link: '/verifier',
      metadata: {
        project_id: project.id,
        status: project.status || 'pending',
      },
    },
    {
      excludeUserIds: [project.user_id],
    },
  )
}

export async function notifyProjectDecision(project, status, notes = '') {
  if (!project?.id || !project?.user_id) return

  const normalizedStatus = normalizeRole(status)
  if (!['approved', 'rejected'].includes(normalizedStatus)) return

  await notifyProjectSubmitterDecision(project, normalizedStatus, notes)

  await createNotificationsForRoles(['admin'], {
    type: 'project_status_admin',
    title: `Project ${normalizedStatus}`,
    message: `Project "${project.title || 'Untitled Project'}" was ${normalizedStatus}.`,
    link: '/admin',
    metadata: {
      project_id: project.id,
      status: normalizedStatus,
    },
  })

  await createNotificationsForRoles(
    ['admin', 'verifier'],
    {
      type: 'project_review_activity',
      title: `Project ${normalizedStatus}`,
      message: `A reviewer marked "${project.title || 'Untitled Project'}" as ${normalizedStatus}.`,
      link: '/verifier',
      metadata: {
        project_id: project.id,
        status: normalizedStatus,
        reviewer_id: project.verified_by || null,
      },
    },
    {
      excludeUserIds: [project.user_id, project.verified_by].filter(Boolean),
    },
  )
}

export async function notifyProjectSubmitterDecision(project, status, notes = '') {
  if (!project?.id || !project?.user_id) return

  const normalizedStatus = normalizeRole(status)
  if (!['approved', 'rejected'].includes(normalizedStatus)) return

  const isApproved = normalizedStatus === 'approved'
  const title = isApproved ? 'Your project was approved' : 'Your project was rejected'
  const noteSuffix = notes?.trim() ? ` Notes: ${notes.trim()}` : ''

  await createNotificationsForUsers([project.user_id], {
    type: 'project_status',
    title,
    message: `Project "${project.title || 'Untitled Project'}" is now ${normalizedStatus}.${noteSuffix}`,
    link: '/developer/projects',
    metadata: {
      project_id: project.id,
      status: normalizedStatus,
    },
  })
}

export async function notifyProjectOwnerMarketplaceLive(project, listing) {
  if (!project?.id || !project?.user_id) return

  await createNotificationsForUsers([project.user_id], {
    type: 'project_marketplace_live',
    title: 'Your project is now live in the marketplace',
    message: `Project "${project.title || 'Untitled Project'}" now has an active marketplace listing.`,
    link: '/developer/projects',
    metadata: {
      project_id: project.id,
      listing_id: listing?.id || null,
    },
  })
}

export async function notifyNewMarketplaceProject(project, listing) {
  if (!project?.id) return

  await createNotificationsForRoles(
    ['general_user', 'buyer_investor', 'project_developer', 'admin'],
    {
      type: 'marketplace_new_project',
      title: 'New project available in marketplace',
      message: `"${project.title || 'Untitled Project'}" is now available for purchase.`,
      link: '/marketplace',
      metadata: {
        project_id: project.id,
        listing_id: listing?.id || null,
      },
    },
    {
      excludeUserIds: [project.user_id],
    },
  )
}

export async function notifyRoleApplicationDecision(application, status) {
  if (!application?.user_id) return []

  const normalizedStatus = normalizeRole(status)
  if (!['approved', 'rejected'].includes(normalizedStatus)) return []

  const isApproved = normalizedStatus === 'approved'
  const roleLabel =
    normalizeRole(application.role_requested) === 'verifier' ? 'Verifier' : 'Project Developer'

  return createNotificationsForUsers([application.user_id], {
    type: 'role_application_status',
    title: isApproved ? 'Your specialist account was approved' : 'Your specialist account was rejected',
    message: isApproved
      ? `Your ${roleLabel} application has been approved. You can now use your verified account features.`
      : `Your ${roleLabel} application was rejected. Please check your email or contact EcoLink support for next steps.`,
    link: '/profile',
    metadata: {
      application_id: application.id,
      requested_role: application.role_requested,
      status: normalizedStatus,
    },
  })
}

export async function notifyReviewersOfRoleApplicationInApp(application) {
  if (!application) return []

  const normalizedRequestedRole = normalizeRole(application.role_requested)
  if (!['verifier', 'project_developer'].includes(normalizedRequestedRole)) return []

  const reviewerRoles = normalizedRequestedRole === 'verifier' ? ['admin'] : ['verifier']

  const roleLabel = normalizedRequestedRole === 'verifier' ? 'Verifier' : 'Project Developer'

  return createNotificationsForRoles(reviewerRoles, {
    type: 'role_application_submission',
    title: `New ${roleLabel} application`,
    message: `${application.applicant_full_name || application.email || 'A new applicant'} submitted a ${roleLabel} application for review.`,
    link: normalizedRequestedRole === 'verifier' ? '/admin' : '/verifier',
    metadata: {
      application_id: application.id || null,
      requested_role: application.role_requested,
      applicant_email: application.email || null,
    },
  })
}

export async function notifyWelcomeUser(userId, fullName = '') {
  if (!userId) return []

  return createNotificationsForUsers([userId], {
    type: 'welcome',
    title: 'Welcome to EcoLink',
    message: fullName
      ? `Welcome to EcoLink, ${fullName}. Your account is ready to use.`
      : 'Welcome to EcoLink. Your account is ready to use.',
    link: '/home',
    metadata: {
      category: 'welcome',
    },
  })
}
