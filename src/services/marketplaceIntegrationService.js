/**
 * Marketplace Integration Service
 * Handles automatic creation of marketplace listings for approved projects
 */

import { getSupabase } from '@/services/supabaseClient'
import { logUserAction } from '@/services/auditService'

export class MarketplaceIntegrationService {
  constructor() {
    this.supabase = getSupabase()
  }

  /**
   * Create marketplace listing for approved project
   * @param {string} projectId - Project ID
   * @param {Object} listingData - Listing configuration
   * @returns {Promise<Object>} Created listing
   */
  async createProjectListing(projectId, listingData = {}) {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    try {
      // Get project details including credit information
      const { data: project, error: projectError } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('status', 'approved')
        .single()

      if (projectError || !project) {
        throw new Error('Project not found or not approved')
      }

      // First, ensure we have a project_credit record
      let projectCreditId = null

      // Check if project_credit exists
      const { data: existingProjectCredit, error: projectCreditError } = await this.supabase
        .from('project_credits')
        .select('id')
        .eq('project_id', projectId)
        .limit(1)
        .single()

      // Check if marketplace listing already exists for this project
      const { data: existingListing, error: listingCheckError } = await this.supabase
        .from('credit_listings')
        .select('id')
        .eq('project_id', projectId)
        .eq('status', 'active')
        .limit(1)
        .single()

      if (existingListing && !listingCheckError) {
        console.log('⚠️ Marketplace listing already exists for project:', project.title)
        return existingListing // Return existing listing instead of creating duplicate
      }

      // Additional check: if we have a project_credit_id, check for existing listings by that ID too
      if (projectCreditId) {
        const { data: existingByCreditId, error: creditIdCheckError } = await this.supabase
          .from('credit_listings')
          .select('id')
          .eq('project_credit_id', projectCreditId)
          .eq('status', 'active')
          .limit(1)
          .single()

        if (existingByCreditId && !creditIdCheckError) {
          console.log(
            '⚠️ Marketplace listing already exists for project_credit_id:',
            projectCreditId,
          )
          return existingByCreditId // Return existing listing instead of creating duplicate
        }
      }

      if (projectCreditError || !existingProjectCredit) {
        // Create project_credit record if it doesn't exist
        // Use project's credit data if available, otherwise use defaults
        const estimatedCredits = project.estimated_credits || listingData.quantity || 1000
        const creditPrice = project.credit_price || listingData.pricePerCredit || 15.0

        const { data: newProjectCredit, error: createProjectCreditError } = await this.supabase
          .from('project_credits')
          .insert({
            project_id: projectId,
            total_credits: estimatedCredits,
            credits_available: estimatedCredits,
            price_per_credit: creditPrice,
            status: 'active',
            vintage_year: new Date().getFullYear(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single()

        if (createProjectCreditError) {
          throw new Error(`Failed to create project_credit: ${createProjectCreditError.message}`)
        }

        projectCreditId = newProjectCredit.id
      } else {
        projectCreditId = existingProjectCredit.id
      }

      // Create credit listing with values that match the actual table structure
      // Use project's credit data if available
      const estimatedCredits = project.estimated_credits || listingData.quantity || 1000
      const creditPrice = project.credit_price || listingData.pricePerCredit || 15.0

      const defaultListing = {
        project_id: projectId,
        project_credit_id: projectCreditId, // This is required and NOT NULL
        seller_id: project.user_id,
        quantity: estimatedCredits, // Use project's estimated credits
        price_per_credit: creditPrice, // Use project's credit price
        currency: 'USD',
        listing_type: 'sell',
        status: 'active',
        title: project.title ? `${project.title} - Carbon Credits` : 'Carbon Credits',
        description:
          project.description ||
          `Verified carbon credits from ${project.title || 'Project'} in ${project.location || 'Unknown Location'}`,
        category: project.category || 'Renewable Energy',
        location: project.location || 'Unknown Location',
        vintage_year: new Date().getFullYear(),
        verification_standard: 'EcoLink Standard',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        listed_at: new Date().toISOString(),
      }

      // Insert into credit_listings table
      const { data: listing, error: listingError } = await this.supabase
        .from('credit_listings')
        .insert([defaultListing])
        .select()
        .single()

      if (listingError) {
        throw new Error(`Failed to create marketplace listing: ${listingError.message}`)
      }

      // Log the action
      await logUserAction(
        'MARKETPLACE_LISTING_CREATED',
        'credit_listing',
        project.user_id,
        listing.id,
        {
          project_id: projectId,
          project_title: project.title,
          price_per_credit: defaultListing.price_per_credit,
          quantity: defaultListing.available_quantity,
        },
      )

      console.log('✅ Marketplace listing created for project:', project.title)
      return listing
    } catch (error) {
      console.error('Error creating marketplace listing:', error)
      throw error
    }
  }

  /**
   * Update project status and create marketplace listing if approved
   * @param {string} projectId - Project ID
   * @param {string} status - New status
   * @param {string} verificationNotes - Verification notes
   * @param {Object} listingData - Optional listing configuration
   * @returns {Promise<Object>} Updated project and created listing (if approved)
   */
  async updateProjectStatusWithMarketplace(
    projectId,
    status,
    verificationNotes = '',
    listingData = {},
  ) {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    try {
      // Get current user ID first
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      const currentUserId = user?.id

      // Update project status
      const { data: updatedProject, error: updateError } = await this.supabase
        .from('projects')
        .update({
          status,
          verification_notes: verificationNotes,
          verified_by: status === 'approved' || status === 'rejected' ? currentUserId : null,
          verified_at:
            status === 'approved' || status === 'rejected' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to update project status: ${updateError.message}`)
      }

      let marketplaceListing = null

      // If approved, create marketplace listing
      if (status === 'approved') {
        try {
          marketplaceListing = await this.createProjectListing(projectId, listingData)
          console.log('✅ Project approved and marketplace listing created')
        } catch (listingError) {
          console.error('⚠️ Project approved but marketplace listing failed:', listingError)
          // Don't fail the entire operation if marketplace listing fails
        }
      }

      return {
        project: updatedProject,
        marketplaceListing,
      }
    } catch (error) {
      console.error('Error updating project status with marketplace:', error)
      throw error
    }
  }

  /**
   * Get marketplace listings for a specific project
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} Project listings
   */
  async getProjectListings(projectId) {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    try {
      const { data: listings, error } = await this.supabase
        .from('credit_listings')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch project listings: ${error.message}`)
      }

      return listings || []
    } catch (error) {
      console.error('Error fetching project listings:', error)
      throw error
    }
  }
}

// Export singleton instance
export const marketplaceIntegrationService = new MarketplaceIntegrationService()
