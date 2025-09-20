import { getSupabase } from './supabaseClient'

// Generic table operations
export const tableService = {
  // Get all records from a table
  async getTableData(tableName, limit = 100, offset = 0) {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    // Get data without any ordering to avoid column issues
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(error.message || `Failed to fetch ${tableName} data`)
    }
    return data || []
  },

  // Get single record by ID
  async getRecord(tableName, id) {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single()

    if (error) {
      throw new Error(error.message || `Failed to fetch ${tableName} record`)
    }
    return data
  },

  // Create new record
  async createRecord(tableName, recordData) {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase.from(tableName).insert([recordData]).select().single()

    if (error) {
      throw new Error(error.message || `Failed to create ${tableName} record`)
    }
    return data
  },

  // Update record
  async updateRecord(tableName, id, updates) {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message || `Failed to update ${tableName} record`)
    }
    return data
  },

  // Delete record
  async deleteRecord(tableName, id) {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { error } = await supabase.from(tableName).delete().eq('id', id)

    if (error) {
      throw new Error(error.message || `Failed to delete ${tableName} record`)
    }
    return true
  },

  // Search records
  async searchRecords(tableName, searchTerm, searchFields = []) {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    let query = supabase.from(tableName).select('*')

    if (searchFields.length > 0 && searchTerm) {
      const orConditions = searchFields.map((field) => `${field}.ilike.%${searchTerm}%`).join(',')
      query = query.or(orConditions)
    }

    const { data, error } = await query.limit(50)

    if (error) {
      throw new Error(error.message || `Failed to search ${tableName} records`)
    }
    return data || []
  },
}

// Table-specific services
export const walletAccountService = {
  ...tableService,

  async getByUserId(userId) {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from('wallet_accounts')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message || 'Failed to fetch wallet account')
    }
    return data
  },

  async createForUser(userId) {
    return this.createRecord('wallet_accounts', {
      user_id: userId,
      current_balance: 0,
      currency: 'PHP',
    })
  },

  async updateBalance(accountId, newBalance) {
    return this.updateRecord('wallet_accounts', accountId, {
      current_balance: newBalance,
    })
  },
}

export const walletTransactionService = {
  ...tableService,

  async getByUserId(userId, limit = 50) {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .limit(limit)

    if (error) {
      throw new Error(error.message || 'Failed to fetch transactions')
    }
    return data || []
  },

  async createTransaction(transactionData) {
    return this.createRecord('wallet_transactions', transactionData)
  },

  async updateStatus(transactionId, status) {
    return this.updateRecord('wallet_transactions', transactionId, {
      status,
    })
  },
}

export const verificationService = {
  ...tableService,

  async getByProjectId(projectId) {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from('verifications')
      .select('*')
      .eq('project_id', projectId)

    if (error) {
      throw new Error(error.message || 'Failed to fetch verifications')
    }
    return data || []
  },

  async getByVerifierId(verifierId) {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from('verifications')
      .select(
        `
        *,
        projects (
          title,
          location,
          methodology,
          status
        )
      `,
      )
      .eq('verifier_id', verifierId)

    if (error) {
      throw new Error(error.message || 'Failed to fetch verifications')
    }
    return data || []
  },
}

export const listingService = {
  ...tableService,

  async getActiveListings() {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from('listings')
      .select(
        `
        *,
        projects (
          title,
          location,
          methodology
        ),
        profiles!listings_seller_id_fkey (
          full_name
        )
      `,
      )
      .eq('status', 'active')

    if (error) {
      throw new Error(error.message || 'Failed to fetch listings')
    }
    return data || []
  },

  async getBySellerId(sellerId) {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from('listings')
      .select(
        `
        *,
        projects (
          title,
          location
        )
      `,
      )
      .eq('seller_id', sellerId)

    if (error) {
      throw new Error(error.message || 'Failed to fetch seller listings')
    }
    return data || []
  },
}

export const orderService = {
  ...tableService,

  async getByBuyerId(buyerId) {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        listings (
          price,
          available_credits,
          projects (
            title,
            location
          )
        ),
        profiles!orders_seller_id_fkey (
          full_name
        )
      `,
      )
      .eq('buyer_id', buyerId)

    if (error) {
      throw new Error(error.message || 'Failed to fetch orders')
    }
    return data || []
  },

  async getBySellerId(sellerId) {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        listings (
          price,
          available_credits,
          projects (
            title,
            location
          )
        ),
        profiles!orders_buyer_id_fkey (
          full_name
        )
      `,
      )
      .eq('seller_id', sellerId)

    if (error) {
      throw new Error(error.message || 'Failed to fetch seller orders')
    }
    return data || []
  },
}

export const auditLogService = {
  ...tableService,

  async getByUserId(userId, limit = 100) {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .limit(limit)

    if (error) {
      throw new Error(error.message || 'Failed to fetch audit logs')
    }
    return data || []
  },

  async getByAction(action, limit = 100) {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', action)
      .limit(limit)

    if (error) {
      throw new Error(error.message || 'Failed to fetch audit logs')
    }
    return data || []
  },

  async createLog(logData) {
    return this.createRecord('audit_logs', logData)
  },
}
