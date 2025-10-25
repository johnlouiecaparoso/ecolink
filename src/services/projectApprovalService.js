import { getSupabase } from '@/services/supabaseClient'
import { getCurrentUserId } from '@/utils/authHelper'

/**
 * Simplified Project Approval Service
 * Handles project approval and credit generation for immediate functionality
 */
export class ProjectApprovalService {
  constructor() {
    this.supabase = getSupabase()
  }

  /**
   * Approve a project and generate credits immediately
   * @param {string} projectId - Project ID
   * @param {string} notes - Approval notes
   * @returns {Promise<Object>} Approval result
   */
  async approveProject(projectId, notes = '') {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    try {
      // Get current user (should be admin/verifier)
      const {
        data: { user },
      } = await this.supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Update project status to approved
      const { data: updatedProject, error: updateError } = await this.supabase
        .from('projects')
        .update({
          status: 'approved',
          verification_notes: notes,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single()

      if (updateError) {
        throw new Error(updateError.message || 'Failed to approve project')
      }

      // Generate credits manually (in case trigger doesn't work)
      const creditsResult = await this.generateCreditsForProject(projectId)

      return {
        project: updatedProject,
        credits: creditsResult,
        success: true,
      }
    } catch (error) {
      console.error('Error approving project:', error)
      throw error
    }
  }

  /**
   * Generate credits for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Generated credits
   */
  async generateCreditsForProject(projectId) {
    try {
      // Get project details
      const { data: project, error: projectError } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (projectError || !project) {
        throw new Error('Project not found')
      }

      // Calculate credits based on category
      const creditsAmount = this.calculateCreditsAmount(project.category)
      const basePrice = this.calculateBasePrice(project.category)

      // Check if credits already exist
      const { data: existingCredits } = await this.supabase
        .from('project_credits')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (existingCredits) {
        return existingCredits
      }

      // Create project credits
      const { data: credits, error: creditsError } = await this.supabase
        .from('project_credits')
        .insert([
          {
            project_id: projectId,
            total_credits: creditsAmount,
            available_credits: creditsAmount,
            price_per_credit: basePrice,
          },
        ])
        .select()
        .single()

      if (creditsError) {
        throw new Error(creditsError.message || 'Failed to generate project credits')
      }

      // Create marketplace listing
      const { data: listing, error: listingError } = await this.supabase
        .from('credit_listings')
        .insert([
          {
            project_credit_id: credits.id,
            seller_id: project.user_id,
            quantity: creditsAmount,
            price_per_credit: basePrice,
          },
        ])
        .select()
        .single()

      if (listingError) {
        console.error('Error creating marketplace listing:', listingError)
        // Don't fail the entire operation if listing creation fails
      }

      return {
        ...credits,
        listing: listing,
      }
    } catch (error) {
      console.error('Error generating credits:', error)
      throw error
    }
  }

  /**
   * Calculate credits amount based on project category
   * @param {string} category - Project category
   * @returns {number} Credits amount
   */
  calculateCreditsAmount(category) {
    const baseCredits = {
      Forestry: 1000,
      'Renewable Energy': 500,
      'Blue Carbon': 800,
      'Energy Efficiency': 300,
      'Waste Management': 400,
      Agriculture: 600,
    }

    return baseCredits[category] || 500
  }

  /**
   * Calculate base price based on project category
   * @param {string} category - Project category
   * @returns {number} Base price per credit
   */
  calculateBasePrice(category) {
    const basePrices = {
      Forestry: 15.0,
      'Renewable Energy': 20.0,
      'Blue Carbon': 18.0,
      'Energy Efficiency': 12.0,
      'Waste Management': 14.0,
      Agriculture: 16.0,
    }

    return basePrices[category] || 15.0
  }

  /**
   * Get pending projects
   * @returns {Promise<Array>} Pending projects
   */
  async getPendingProjects() {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    try {
      // First get the projects
      const { data: projects, error: projectsError } = await this.supabase
        .from('projects')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (projectsError) {
        throw new Error(projectsError.message || 'Failed to fetch pending projects')
      }

      if (!projects || projects.length === 0) {
        return []
      }

      // Then get the user profiles for each project
      const userIds = [...new Set(projects.map((p) => p.user_id))]
      const { data: profiles, error: profilesError } = await this.supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)

      if (profilesError) {
        console.warn('Could not fetch user profiles:', profilesError.message)
        // Return projects without profile data
        return projects
      }

      // Combine projects with profile data
      const data = projects.map((project) => {
        const profile = profiles?.find((p) => p.id === project.user_id)
        return {
          ...project,
          user_name: profile?.full_name || 'Unknown User',
          user_email: profile?.email || 'unknown@example.com',
        }
      })

      return data
    } catch (error) {
      console.error('Error fetching pending projects:', error)
      throw error
    }
  }

  /**
   * Submit a new project for approval
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>} Submitted project
   */
  async submitProject(projectData, userId = null) {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    try {
      // Use provided userId or try to get from auth
      let finalUserId = userId
      if (!finalUserId) {
        finalUserId = await getCurrentUserId()
      }
      if (!finalUserId) {
        throw new Error('User not authenticated')
      }

      // Prepare project data (exclude documents field as it doesn't exist in DB)
      const { documents, ...projectDataWithoutDocuments } = projectData
      const submitData = {
        ...projectDataWithoutDocuments,
        user_id: finalUserId,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Insert project
      const { data: project, error } = await this.supabase
        .from('projects')
        .insert([submitData])
        .select()
        .single()

      if (error) {
        throw new Error(error.message || 'Failed to submit project')
      }

      return project
    } catch (error) {
      console.error('Error submitting project:', error)
      throw error
    }
  }

  /**
   * Get all projects for testing
   * @returns {Promise<Array>} All projects
   */
  async getAllProjects() {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message || 'Failed to fetch projects')
      }

      return data || []
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error
    }
  }
}

// Export singleton instance
export const projectApprovalService = new ProjectApprovalService()
