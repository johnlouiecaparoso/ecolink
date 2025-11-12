import { getSupabase, getSupabaseAsync } from '@/services/supabaseClient'
import { updateUserRole } from '@/services/roleService'
import { sendRoleApplicationApprovalEmail } from '@/services/emailService'

export const ROLE_APPLICATION_TABLE = 'role_applications'

export const ROLE_APPLICATION_ROLES = Object.freeze({
  PROJECT_DEVELOPER: 'project_developer',
  VERIFIER: 'verifier',
})

export const ROLE_APPLICATION_STATUS = Object.freeze({
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
})

export const ROLE_APPLICATION_STATUS_LABELS = Object.freeze({
  [ROLE_APPLICATION_STATUS.PENDING]: 'Pending',
  [ROLE_APPLICATION_STATUS.UNDER_REVIEW]: 'Under Review',
  [ROLE_APPLICATION_STATUS.APPROVED]: 'Approved',
  [ROLE_APPLICATION_STATUS.REJECTED]: 'Rejected',
  [ROLE_APPLICATION_STATUS.CANCELLED]: 'Cancelled',
})

export const ROLE_APPLICATION_ERRORS = Object.freeze({
  SUPABASE_NOT_INITIALIZED: 'SUPABASE_NOT_INITIALIZED',
  INVALID_ROLE: 'INVALID_ROLE_SELECTION',
  DUPLICATE_PENDING: 'ROLE_APPLICATION_ALREADY_EXISTS',
})

const ROLE_ALIASES = {
  project_developer: ROLE_APPLICATION_ROLES.PROJECT_DEVELOPER,
  'project-developer': ROLE_APPLICATION_ROLES.PROJECT_DEVELOPER,
  developer: ROLE_APPLICATION_ROLES.PROJECT_DEVELOPER,
  builders: ROLE_APPLICATION_ROLES.PROJECT_DEVELOPER,
  verifier: ROLE_APPLICATION_ROLES.VERIFIER,
  verification: ROLE_APPLICATION_ROLES.VERIFIER,
  qa: ROLE_APPLICATION_ROLES.VERIFIER,
}

function sanitizeString(value) {
  if (value === undefined || value === null) return null
  const trimmed = String(value).trim()
  return trimmed.length ? trimmed : null
}

const VALID_STATUSES = new Set(Object.values(ROLE_APPLICATION_STATUS))

export function normalizeRequestedRole(role) {
  if (!role) return null
  const key = String(role).toLowerCase().replace(/\s+/g, '_')
  return ROLE_ALIASES[key] || null
}

async function ensureSupabase() {
  let supabase = getSupabase()
  if (!supabase) {
    supabase = await getSupabaseAsync()
  }
  if (!supabase) {
    const error = new Error('Supabase client not initialized')
    error.code = ROLE_APPLICATION_ERRORS.SUPABASE_NOT_INITIALIZED
    throw error
  }
  return supabase
}

/**
 * Submit a role application request.
 * @param {Object} application
 * @param {string} application.role - Requested role (project_developer | verifier)
 * @param {string} application.fullName - Applicant full name
 * @param {string} application.email - Applicant contact email
 * @param {string} [application.company] - Optional company or organization
 * @param {string} [application.website] - Optional website or portfolio link
 * @param {string} [application.experience] - Summary of relevant experience
 * @param {string} [application.motivation] - Motivation statement
 * @param {string} [application.supportingDocuments] - Any supporting links
 * @param {string} [application.userId] - Authenticated user ID
 * @param {Object} [application.metadata] - Additional metadata to store (JSON)
 * @returns {Promise<Object>} Inserted role application record
 */
export async function submitRoleApplication(application) {
  const supabase = await ensureSupabase()

  const normalizedRole = normalizeRequestedRole(application.role)
  if (!normalizedRole) {
    const error = new Error('Please choose a valid role to apply for.')
    error.code = ROLE_APPLICATION_ERRORS.INVALID_ROLE
    throw error
  }

  const fullName = sanitizeString(application.fullName)
  if (!fullName) {
    throw new Error('Full name is required.')
  }

  const email = sanitizeString(application.email)?.toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Enter a valid contact email address.')
  }

  const company = sanitizeString(application.company)
  const website = sanitizeString(application.website)
  const experience = sanitizeString(application.experience)
  const motivation = sanitizeString(application.motivation)
  const supportingDocuments = sanitizeString(application.supportingDocuments)

  const submittedFromPath =
    application.metadata?.submitted_from_path ||
    (typeof window !== 'undefined' ? window.location.pathname : null)

  const userAgent =
    application.metadata?.user_agent ||
    (typeof window !== 'undefined' ? window.navigator.userAgent : null)

  const metadata = {
    source: application.metadata?.source || 'web_form',
    submitted_from_path: submittedFromPath,
    user_agent: userAgent,
    additional: application.metadata?.additional || null,
  }

  const normalizedUserId = sanitizeString(application.userId)
  const record = {
    user_id: normalizedUserId,
    applicant_full_name: fullName,
    email,
    company,
    website,
    role_requested: normalizedRole,
    experience_summary: experience,
    motivation,
    supporting_documents: supportingDocuments,
    metadata,
    status: ROLE_APPLICATION_STATUS.PENDING,
  }

  let data
  let error

  if (normalizedUserId) {
    ;({ data, error } = await supabase
      .from(ROLE_APPLICATION_TABLE)
      .insert([record])
      .select()
      .single())
  } else {
    ;({ data, error } = await supabase
      .from(ROLE_APPLICATION_TABLE)
      .insert([record], { returning: 'minimal' }))
  }

  if (error) {
    if (error.code === '23505') {
      const duplicateError = new Error(
        'You already have a pending application for this role. Our team will review it shortly.',
      )
      duplicateError.code = ROLE_APPLICATION_ERRORS.DUPLICATE_PENDING
      throw duplicateError
    }

    throw new Error(error.message || 'Failed to submit role application. Please try again.')
  }

  if (data) {
    return data
  }

  return {
    ...record,
    id: null,
  }
}

export function getRoleApplicationStatusLabel(status) {
  return ROLE_APPLICATION_STATUS_LABELS[status] || 'Unknown'
}

function sanitizeSearchTerm(term) {
  if (!term) return null
  return term.replace(/[%"]/g, '').trim()
}

export async function fetchRoleApplications(options = {}) {
  const supabase = await ensureSupabase()

  const { status, limit, offset, search } = options
  let query = supabase.from(ROLE_APPLICATION_TABLE).select('*', { count: 'exact' })

  if (status && status !== 'all' && VALID_STATUSES.has(status)) {
    query = query.eq('status', status)
  }

  const searchTerm = sanitizeSearchTerm(search)
  if (searchTerm) {
    query = query.or(
      `email.ilike.%${searchTerm}%,applicant_full_name.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`,
    )
  }

  query = query.order('created_at', { ascending: false })

  if (typeof limit === 'number' && limit > 0) {
    const rangeStart = Math.max(offset || 0, 0)
    const rangeEnd = rangeStart + limit - 1
    query = query.range(rangeStart, rangeEnd)
  }

  const { data, error } = await query
  if (error) {
    throw new Error(error.message || 'Failed to load role applications.')
  }

  return data || []
}

export async function getRoleApplicationById(id) {
  const supabase = await ensureSupabase()

  const { data, error } = await supabase
    .from(ROLE_APPLICATION_TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message || 'Role application not found.')
  }

  return data
}

export async function updateRoleApplicationStatus(id, status, options = {}) {
  const supabase = await ensureSupabase()

  if (!VALID_STATUSES.has(status)) {
    throw new Error('Invalid status value.')
  }

  const { data: existing, error: fetchError } = await supabase
    .from(ROLE_APPLICATION_TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    throw new Error(fetchError?.message || 'Application not found.')
  }

  const updatePayload = {
    status,
    admin_notes: sanitizeString(options.notes),
    decision_reason: sanitizeString(options.decisionReason),
    reviewed_by: sanitizeString(options.adminId) || null,
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from(ROLE_APPLICATION_TABLE)
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to update application status.')
  }

  let roleUpdated = false
  let roleUpdateError = null
  if (
    status === ROLE_APPLICATION_STATUS.APPROVED &&
    options.assignRole !== false &&
    existing.user_id
  ) {
    try {
      await updateUserRole(existing.user_id, existing.role_requested)
      roleUpdated = true
    } catch (err) {
      roleUpdateError = err
      console.error('Failed to assign role during approval:', err)
    }
  }

  let notificationInfo = null
  if (status === ROLE_APPLICATION_STATUS.APPROVED) {
    try {
      const emailResult = await sendRoleApplicationApprovalEmail({
        email: existing.email,
        applicantName: existing.applicant_full_name,
        role: existing.role_requested,
        hasAccount: !!existing.user_id,
        approvedAt: updatePayload.reviewed_at,
      })
      notificationInfo = { sent: true, hasAccount: !!existing.user_id, response: emailResult }
    } catch (notificationError) {
      console.error('Failed to send role application approval email:', notificationError)
      notificationInfo = { sent: false, error: notificationError }
    }
  }

  return {
    application: data,
    roleUpdated,
    roleUpdateError,
    notificationInfo,
  }
}
