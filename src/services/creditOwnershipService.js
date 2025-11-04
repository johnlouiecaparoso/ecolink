/**
 * Credit Ownership Service
 * Manages user credit ownership, portfolio, and transactions
 */

import { getSupabase } from '@/services/supabaseClient'
import { logUserAction } from '@/services/auditService'

export class CreditOwnershipService {
  constructor() {
    // Don't initialize supabase here - it might not be ready yet
    // Get it dynamically in each method to ensure it's initialized
  }
  
  get supabase() {
    const client = getSupabase()
    if (!client) {
      throw new Error('Supabase client not initialized. Please wait for app initialization.')
    }
    return client
  }

  /**
   * Get user's credit portfolio
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User's credit portfolio
   */
  async getUserCreditPortfolio(userId) {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    try {
      console.log('🔍 Fetching credit portfolio for user:', userId)

      // Get user's credit ownership with project details
      const { data: ownership, error: ownershipError } = await this.supabase
        .from('credit_ownership')
        .select(
          `
          *,
          projects!inner(
            id,
            title,
            description,
            category,
            location,
            project_image,
            image_name,
            image_type
          )
        `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (ownershipError) {
        console.error('❌ Error fetching credit ownership:', ownershipError)
        throw ownershipError
      }

      console.log('✅ Found', ownership?.length || 0, 'credit ownership records')

      // Transform the data for frontend
      const portfolio =
        ownership?.map((record) => ({
          id: record.id,
          project_id: record.project_id,
          project_title: record.projects?.title || 'Unknown Project',
          project_description: record.projects?.description || '',
          project_category: record.projects?.category || 'Unknown',
          project_location: record.projects?.location || 'Unknown',
          project_image: record.projects?.project_image,
          image_name: record.projects?.image_name,
          image_type: record.projects?.image_type,
          quantity: record.quantity,
          ownership_type: record.ownership_type,
          created_at: record.created_at,
          updated_at: record.updated_at,
          // Add status for frontend display
          ownership_status: record.ownership_type === 'retired' ? 'retired' : 'owned',
        })) || []

      return portfolio
    } catch (error) {
      console.error('❌ Error in getUserCreditPortfolio:', error)
      return []
    }
  }

  /**
   * Add credits to user's portfolio
   * @param {string} userId - User ID
   * @param {string} projectId - Project ID
   * @param {number} quantity - Number of credits to add
   * @param {string} ownershipType - Type of ownership (purchased, earned, etc.)
   * @param {string} transactionId - Associated transaction ID
   * @returns {Promise<Object>} Updated ownership record
   */
  async addCreditsToPortfolio(
    userId,
    projectId,
    quantity,
    ownershipType = 'purchased',
    transactionId = null,
  ) {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    try {
      console.log('➕ Adding credits to portfolio:', { userId, projectId, quantity, ownershipType })

      // Check if user already owns credits for this project
      const { data: existingOwnership, error: checkError } = await this.supabase
        .from('credit_ownership')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .single()

      let result

      if (existingOwnership && !checkError) {
        // Update existing ownership
        const newQuantity = existingOwnership.quantity + quantity

        const { data: updatedOwnership, error: updateError } = await this.supabase
          .from('credit_ownership')
          .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingOwnership.id)
          .select()
          .single()

        if (updateError) {
          throw new Error(`Failed to update credit ownership: ${updateError.message}`)
        }

        result = updatedOwnership
        console.log('✅ Updated existing credit ownership')
      } else {
        // Create new ownership record
        const { data: newOwnership, error: createError } = await this.supabase
          .from('credit_ownership')
          .insert({
            user_id: userId,
            project_id: projectId,
            quantity: quantity,
            ownership_type: ownershipType,
            transaction_id: transactionId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (createError) {
          throw new Error(`Failed to create credit ownership: ${createError.message}`)
        }

        result = newOwnership
        console.log('✅ Created new credit ownership')
      }

      // Log the action
      await logUserAction('CREDITS_ADDED', 'credit_ownership', userId, result.id, {
        project_id: projectId,
        quantity: quantity,
        ownership_type: ownershipType,
        transaction_id: transactionId,
      })

      return result
    } catch (error) {
      console.error('❌ Error adding credits to portfolio:', error)
      throw error
    }
  }

  /**
   * Remove credits from user's portfolio (for retirement)
   * @param {string} userId - User ID
   * @param {string} projectId - Project ID
   * @param {number} quantity - Number of credits to remove
   * @param {string} reason - Reason for removal
   * @returns {Promise<Object>} Updated ownership record
   */
  async removeCreditsFromPortfolio(userId, projectId, quantity, reason = 'retired') {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    try {
      console.log('➖ Removing credits from portfolio:', { userId, projectId, quantity, reason })

      // Check if user has enough credits
      const { data: ownership, error: ownershipError } = await this.supabase
        .from('credit_ownership')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .single()

      if (ownershipError || !ownership) {
        throw new Error('Credit ownership not found')
      }

      if (ownership.quantity < quantity) {
        throw new Error('Insufficient credits to remove')
      }

      const newQuantity = ownership.quantity - quantity

      // Update ownership record
      const { data: updatedOwnership, error: updateError } = await this.supabase
        .from('credit_ownership')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ownership.id)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to update credit ownership: ${updateError.message}`)
      }

      // Create retirement record
      const { data: retirement, error: retirementError } = await this.supabase
        .from('credit_retirements')
        .insert({
          user_id: userId,
          project_id: projectId,
          quantity: quantity,
          reason: reason,
          retired_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (retirementError) {
        console.warn('⚠️ Failed to create retirement record:', retirementError)
        // Continue - ownership was updated successfully
      }

      // Log the action
      await logUserAction('CREDITS_REMOVED', 'credit_ownership', userId, retirement?.id, {
        project_id: projectId,
        quantity: quantity,
        reason: reason,
        retirement_id: retirement?.id,
      })

      console.log('✅ Credits removed from portfolio')
      return updatedOwnership
    } catch (error) {
      console.error('❌ Error removing credits from portfolio:', error)
      throw error
    }
  }

  /**
   * Get user's credit statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Credit statistics
   */
  async getUserCreditStats(userId) {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    try {
      // Get total owned credits
      const { data: ownedCredits, error: ownedError } = await this.supabase
        .from('credit_ownership')
        .select('quantity')
        .eq('user_id', userId)

      if (ownedError) {
        throw new Error(`Failed to fetch owned credits: ${ownedError.message}`)
      }

      // Get total retired credits
      const { data: retiredCredits, error: retiredError } = await this.supabase
        .from('credit_retirements')
        .select('quantity')
        .eq('user_id', userId)

      if (retiredError) {
        throw new Error(`Failed to fetch retired credits: ${retiredError.message}`)
      }

      const totalOwned = ownedCredits?.reduce((sum, record) => sum + record.quantity, 0) || 0
      const totalRetired = retiredCredits?.reduce((sum, record) => sum + record.quantity, 0) || 0

      return {
        total_owned: totalOwned,
        total_retired: totalRetired,
        total_credits: totalOwned + totalRetired,
        projects_count: ownedCredits?.length || 0,
      }
    } catch (error) {
      console.error('❌ Error fetching credit stats:', error)
      return {
        total_owned: 0,
        total_retired: 0,
        total_credits: 0,
        projects_count: 0,
      }
    }
  }

  /**
   * Get user's transaction history
   * @param {string} userId - User ID
   * @param {number} limit - Number of transactions to fetch
   * @returns {Promise<Array>} Transaction history
   */
  async getUserTransactionHistory(userId, limit = 50) {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    try {
      // Get credit purchases
      const { data: purchases, error: purchasesError } = await this.supabase
        .from('credit_purchases')
        .select(
          `
          *,
          projects!inner(
            id,
            title,
            category,
            location
          )
        `,
        )
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (purchasesError) {
        console.error('❌ Error fetching purchases:', purchasesError)
      }

      // Get credit retirements
      const { data: retirements, error: retirementsError } = await this.supabase
        .from('credit_retirements')
        .select(
          `
          *,
          projects!inner(
            id,
            title,
            category,
            location
          )
        `,
        )
        .eq('user_id', userId)
        .order('retired_at', { ascending: false })
        .limit(limit)

      if (retirementsError) {
        console.error('❌ Error fetching retirements:', retirementsError)
      }

      // Combine and sort transactions
      const transactions = [
        ...(purchases || []).map((p) => ({
          id: p.id,
          type: 'purchase',
          project_title: p.projects?.title || 'Unknown Project',
          project_category: p.projects?.category || 'Unknown',
          project_location: p.projects?.location || 'Unknown',
          quantity: p.credits_amount,
          amount: p.total_amount,
          currency: p.currency,
          status: p.status,
          created_at: p.created_at,
          description: `Purchased ${p.credits_amount} credits from ${p.projects?.title}`,
        })),
        ...(retirements || []).map((r) => ({
          id: r.id,
          type: 'retirement',
          project_title: r.projects?.title || 'Unknown Project',
          project_category: r.projects?.category || 'Unknown',
          project_location: r.projects?.location || 'Unknown',
          quantity: r.quantity,
          amount: 0,
          currency: 'PHP',
          status: 'completed',
          created_at: r.retired_at,
          description: `Retired ${r.quantity} credits from ${r.projects?.title}`,
        })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      return transactions.slice(0, limit)
    } catch (error) {
      console.error('❌ Error fetching transaction history:', error)
      return []
    }
  }
}

// Export singleton instance
export const creditOwnershipService = new CreditOwnershipService()




