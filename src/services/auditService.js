import { getSupabase } from '@/services/supabaseClient'

/**
 * Audit Service for logging user actions and system events
 */
export class AuditService {
  constructor() {
    this.supabase = getSupabase()
  }

  /**
   * Log a user action
   * @param {string} action - The action performed (e.g., 'LOGIN', 'CREATE_PROJECT', 'UPDATE_WALLET')
   * @param {string} resourceType - The type of resource affected (e.g., 'user', 'project', 'wallet')
   * @param {string} resourceId - The ID of the resource affected
   * @param {Object} oldValues - Previous values (for updates)
   * @param {Object} newValues - New values (for creates/updates)
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<string>} - The audit log ID
   */
  async logUserAction(
    action,
    resourceType,
    resourceId = null,
    oldValues = null,
    newValues = null,
    metadata = {},
  ) {
    try {
      if (!this.supabase) {
        console.warn('Supabase client not available for audit logging')
        return null
      }

      const { data, error } = await this.supabase.rpc('log_user_action', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_old_values: oldValues ? JSON.stringify(oldValues) : null,
        p_new_values: newValues ? JSON.stringify(newValues) : null,
        p_metadata: JSON.stringify(metadata),
      })

      if (error) {
        console.error('Failed to log user action:', error)
        return null
      }

      console.log('User action logged:', action, resourceType, resourceId)
      return data
    } catch (error) {
      console.error('Error logging user action:', error)
      return null
    }
  }

  /**
   * Log a system event
   * @param {string} action - The system action (e.g., 'SYSTEM_STARTUP', 'CACHE_CLEARED')
   * @param {string} resourceType - The type of resource affected
   * @param {string} resourceId - The ID of the resource affected
   * @param {Object} oldValues - Previous values
   * @param {Object} newValues - New values
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<string>} - The audit log ID
   */
  async logSystemEvent(
    action,
    resourceType,
    resourceId = null,
    oldValues = null,
    newValues = null,
    metadata = {},
  ) {
    try {
      if (!this.supabase) {
        console.warn('Supabase client not available for audit logging')
        return null
      }

      const { data, error } = await this.supabase.rpc('log_system_event', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_old_values: oldValues ? JSON.stringify(oldValues) : null,
        p_new_values: newValues ? JSON.stringify(newValues) : null,
        p_metadata: JSON.stringify(metadata),
      })

      if (error) {
        console.error('Failed to log system event:', error)
        return null
      }

      console.log('System event logged:', action, resourceType, resourceId)
      return data
    } catch (error) {
      console.error('Error logging system event:', error)
      return null
    }
  }

  /**
   * Get recent audit logs
   * @param {number} limit - Number of logs to retrieve
   * @param {string} userId - Optional user ID to filter by
   * @returns {Promise<Array>} - Array of audit logs
   */
  async getRecentAuditLogs(limit = 50, userId = null) {
    try {
      if (!this.supabase) {
        console.warn('Supabase client not available for audit logging')
        return []
      }

      let query = this.supabase
        .from('recent_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to fetch audit logs:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      return []
    }
  }

  /**
   * Get user activity summary
   * @param {string} userId - User ID to get summary for
   * @returns {Promise<Object>} - User activity summary
   */
  async getUserActivitySummary(userId = null) {
    try {
      if (!this.supabase) {
        console.warn('Supabase client not available for audit logging')
        return null
      }

      let query = this.supabase.from('user_activity_summary').select('*')

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to fetch user activity summary:', error)
        return null
      }

      return data?.[0] || null
    } catch (error) {
      console.error('Error fetching user activity summary:', error)
      return null
    }
  }

  /**
   * Get audit logs by action type
   * @param {string} action - Action type to filter by
   * @param {number} limit - Number of logs to retrieve
   * @returns {Promise<Array>} - Array of audit logs
   */
  async getAuditLogsByAction(action, limit = 50) {
    try {
      if (!this.supabase) {
        console.warn('Supabase client not available for audit logging')
        return []
      }

      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('action', action)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Failed to fetch audit logs by action:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching audit logs by action:', error)
      return []
    }
  }

  /**
   * Get audit logs by resource type
   * @param {string} resourceType - Resource type to filter by
   * @param {number} limit - Number of logs to retrieve
   * @returns {Promise<Array>} - Array of audit logs
   */
  async getAuditLogsByResourceType(resourceType, limit = 50) {
    try {
      if (!this.supabase) {
        console.warn('Supabase client not available for audit logging')
        return []
      }

      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('resource_type', resourceType)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Failed to fetch audit logs by resource type:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching audit logs by resource type:', error)
      return []
    }
  }

  /**
   * Search audit logs
   * @param {Object} filters - Search filters
   * @param {string} filters.action - Action to filter by
   * @param {string} filters.resourceType - Resource type to filter by
   * @param {string} filters.userId - User ID to filter by
   * @param {Date} filters.startDate - Start date for filtering
   * @param {Date} filters.endDate - End date for filtering
   * @param {number} limit - Number of logs to retrieve
   * @returns {Promise<Array>} - Array of audit logs
   */
  async searchAuditLogs(filters = {}, limit = 50) {
    try {
      if (!this.supabase) {
        console.warn('Supabase client not available for audit logging')
        return []
      }

      let query = this.supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (filters.action) {
        query = query.eq('action', filters.action)
      }

      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType)
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString())
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString())
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to search audit logs:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error searching audit logs:', error)
      return []
    }
  }
}

// Create singleton instance
export const auditService = new AuditService()

// Export convenience functions
export const logUserAction = (action, resourceType, resourceId, oldValues, newValues, metadata) =>
  auditService.logUserAction(action, resourceType, resourceId, oldValues, newValues, metadata)

export const logSystemEvent = (action, resourceType, resourceId, oldValues, newValues, metadata) =>
  auditService.logSystemEvent(action, resourceType, resourceId, oldValues, newValues, metadata)

export const getRecentAuditLogs = (limit, userId) => auditService.getRecentAuditLogs(limit, userId)

export const getUserActivitySummary = (userId) => auditService.getUserActivitySummary(userId)

export const getAuditLogsByAction = (action, limit) =>
  auditService.getAuditLogsByAction(action, limit)

export const getAuditLogsByResourceType = (resourceType, limit) =>
  auditService.getAuditLogsByResourceType(resourceType, limit)

export const searchAuditLogs = (filters, limit) => auditService.searchAuditLogs(filters, limit)
