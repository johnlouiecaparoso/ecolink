import { getSupabase } from '@/services/supabaseClient'
import { USE_DATABASE } from '@/config/database'

/**
 * Log user actions for audit trail
 */
export async function logUserAction(action, entityType, userId, entityId, metadata = {}) {
  // Skip audit logging if database is disabled
  if (!USE_DATABASE) {
    console.log('Database disabled, skipping audit log:', { action, entityType, userId })
    return null
  }

  // Skip audit logging if no user ID
  if (!userId) {
    console.warn('Skipping audit log - no user ID provided')
    return null
  }

  const supabase = getSupabase()

  try {
    const { data, error } = await supabase.from('audit_logs').insert({
      action: action,
      entity_type: entityType,
      user_id: userId,
      entity_id: entityId,
      metadata: metadata,
      timestamp: new Date().toISOString(),
      ip_address: getClientIP(), // Would get from request in real implementation
      user_agent: getUserAgent(), // Would get from request in real implementation
    })

    if (error) {
      console.error('Error logging user action:', error)
      // Don't throw error for audit logging failures
    }

    return data
  } catch (error) {
    console.error('Error in logUserAction:', error)
    // Don't throw error for audit logging failures
  }
}

/**
 * Log system events
 */
export async function logSystemEvent(event, entityType, entityId, metadata = {}) {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase.from('audit_logs').insert({
      action: event,
      entity_type: entityType,
      user_id: null, // System event, no user
      entity_id: entityId,
      metadata: metadata,
      timestamp: new Date().toISOString(),
      ip_address: 'system',
      user_agent: 'system',
    })

    if (error) {
      console.error('Error logging system event:', error)
    }

    return data
  } catch (error) {
    console.error('Error in logSystemEvent:', error)
  }
}

/**
 * Get audit logs for a specific entity
 */
export async function getAuditLogs(entityType, entityId, limit = 50) {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(
        `
        *,
        profiles!audit_logs_user_id_fkey(full_name, email)
      `,
      )
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching audit logs:', error)
      throw new Error('Failed to fetch audit logs')
    }

    return data || []
  } catch (error) {
    console.error('Error in getAuditLogs:', error)
    throw error
  }
}

/**
 * Get user activity logs
 */
export async function getUserActivityLogs(userId, limit = 100) {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching user activity logs:', error)
      throw new Error('Failed to fetch user activity logs')
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserActivityLogs:', error)
    throw error
  }
}

/**
 * Get system-wide audit logs (admin only)
 */
export async function getSystemAuditLogs(filters = {}, limit = 100) {
  const supabase = getSupabase()

  try {
    let query = supabase
      .from('audit_logs')
      .select(
        `
        *,
        profiles!audit_logs_user_id_fkey(full_name, email)
      `,
      )
      .order('timestamp', { ascending: false })
      .limit(limit)

    // Apply filters
    if (filters.action) {
      query = query.eq('action', filters.action)
    }

    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType)
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters.startDate) {
      query = query.gte('timestamp', filters.startDate)
    }

    if (filters.endDate) {
      query = query.lte('timestamp', filters.endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching system audit logs:', error)
      throw new Error('Failed to fetch system audit logs')
    }

    return data || []
  } catch (error) {
    console.error('Error in getSystemAuditLogs:', error)
    throw error
  }
}

/**
 * Get client IP address (placeholder)
 */
function getClientIP() {
  // In a real implementation, this would extract IP from request headers
  return '127.0.0.1'
}

/**
 * Get user agent (placeholder)
 */
function getUserAgent() {
  // In a real implementation, this would extract from request headers
  return typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
}

/**
 * Search audit logs with filters
 */
export async function searchAuditLogs(filters = {}) {
  console.log('Searching audit logs with filters:', filters)

  // In a real implementation, this would query the database
  return {
    logs: [],
    total: 0,
    page: filters.page || 1,
    limit: filters.limit || 50,
  }
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(userId) {
  console.log('Getting user activity summary for user:', userId)

  // In a real implementation, this would aggregate user activity data
  return {
    totalActions: 0,
    lastActivity: null,
    activityByType: {},
    recentActions: [],
  }
}

/**
 * Get recent audit logs
 */
export async function getRecentAuditLogs(limit = 50) {
  console.log('Getting recent audit logs, limit:', limit)

  // In a real implementation, this would query the database
  return {
    logs: [],
    total: 0,
    limit,
  }
}
