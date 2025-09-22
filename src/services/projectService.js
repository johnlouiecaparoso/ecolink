import { getSupabase } from '@/services/supabaseClient'

export class ProjectService {
  constructor() {
    // Don't initialize supabase in constructor to avoid timing issues
  }

  get supabase() {
    const client = getSupabase()
    if (!client) {
      throw new Error(
        'Supabase client not available. Please check your environment variables and try refreshing the page.',
      )
    }
    return client
  }

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @param {string} projectData.title - Project title
   * @param {string} projectData.description - Project description
   * @param {string} projectData.category - Project category
   * @param {string} projectData.location - Project location
   * @param {string} projectData.expected_impact - Expected impact
   * @returns {Promise<Object>} Created project
   */
  async createProject(projectData) {
    const { title, description, category, location, expected_impact } = projectData

    // Validate required fields
    if (!title || !description || !category || !location || !expected_impact) {
      throw new Error('All fields are required')
    }

    try {
      const { data, error } = await this.supabase
        .from('projects')
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
            category: category.trim(),
            location: location.trim(),
            expected_impact: expected_impact.trim(),
            status: 'pending',
          },
        ])
        .select()
        .single()

      if (error) {
        throw new Error(error.message || 'Failed to create project')
      }

      return data
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  }

  /**
   * Get all projects for the current user
   * @returns {Promise<Array>} User's projects
   */
  async getUserProjects() {
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
      console.error('Error fetching user projects:', error)
      throw error
    }
  }

  /**
   * Get a specific project by ID
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Project data
   */
  async getProject(projectId) {
    if (!projectId) {
      throw new Error('Project ID missing')
    }

    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) {
        throw new Error(error.message || 'Failed to fetch project')
      }

      return data
    } catch (error) {
      console.error('Error fetching project:', error)
      throw error
    }
  }

  /**
   * Update a project (only if status is pending)
   * @param {string} projectId - Project ID
   * @param {Object} updates - Project updates
   * @returns {Promise<Object>} Updated project
   */
  async updateProject(projectId, updates) {
    if (!projectId) {
      throw new Error('Project ID missing')
    }

    try {
      // First check if project exists and is pending
      const project = await this.getProject(projectId)
      if (project.status !== 'pending') {
        throw new Error('Only pending projects can be updated')
      }

      const { data, error } = await this.supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single()

      if (error) {
        throw new Error(error.message || 'Failed to update project')
      }

      return data
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  }

  /**
   * Delete a project (only if status is pending)
   * @param {string} projectId - Project ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteProject(projectId) {
    if (!projectId) {
      throw new Error('Project ID missing')
    }

    try {
      // First check if project exists and is pending
      const project = await this.getProject(projectId)
      if (project.status !== 'pending') {
        throw new Error('Only pending projects can be deleted')
      }

      const { error } = await this.supabase.from('projects').delete().eq('id', projectId)

      if (error) {
        throw new Error(error.message || 'Failed to delete project')
      }

      return true
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  }

  /**
   * Get all projects (admin/verifier only)
   * @param {Object} filters - Filter options
   * @param {string} filters.status - Filter by status
   * @param {string} filters.category - Filter by category
   * @param {number} filters.limit - Limit results
   * @param {number} filters.offset - Offset for pagination
   * @returns {Promise<Object>} Projects with pagination info
   */
  async getAllProjects(filters = {}) {
    try {
      let query = this.supabase
        .from('projects')
        .select(
          `
          *,
          profiles!projects_user_id_fkey (
            full_name,
            role
          )
        `,
        )
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(error.message || 'Failed to fetch projects')
      }

      return {
        projects: data || [],
        total: data?.length || 0,
      }
    } catch (error) {
      console.error('Error fetching all projects:', error)
      throw error
    }
  }

  /**
   * Update project status (verifier/admin only)
   * @param {string} projectId - Project ID
   * @param {string} status - New status
   * @param {string} verificationNotes - Verification notes
   * @returns {Promise<Object>} Updated project
   */
  async updateProjectStatus(projectId, status, verificationNotes = '') {
    if (!projectId) {
      throw new Error('Project ID missing')
    }

    if (!['pending', 'under_review', 'approved', 'rejected'].includes(status)) {
      throw new Error('Invalid status')
    }

    try {
      const { data, error } = await this.supabase
        .from('projects')
        .update({
          status,
          verification_notes: verificationNotes,
          verified_by: status === 'approved' || status === 'rejected' ? 'current_user()' : null,
          verified_at:
            status === 'approved' || status === 'rejected' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single()

      if (error) {
        throw new Error(error.message || 'Failed to update project status')
      }

      return data
    } catch (error) {
      console.error('Error updating project status:', error)
      throw error
    }
  }

  /**
   * Get project statistics
   * @returns {Promise<Object>} Project statistics
   */
  async getProjectStats() {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('status, category, created_at')

      if (error) {
        throw new Error(error.message || 'Failed to fetch project statistics')
      }

      const stats = {
        total: data.length,
        byStatus: {},
        byCategory: {},
        recent: 0,
      }

      // Calculate statistics
      data.forEach((project) => {
        // By status
        stats.byStatus[project.status] = (stats.byStatus[project.status] || 0) + 1

        // By category
        stats.byCategory[project.category] = (stats.byCategory[project.category] || 0) + 1

        // Recent projects (last 7 days)
        const projectDate = new Date(project.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        if (projectDate > weekAgo) {
          stats.recent++
        }
      })

      return stats
    } catch (error) {
      console.error('Error fetching project statistics:', error)
      throw error
    }
  }

  /**
   * Get available project categories
   * @returns {Array} List of categories
   */
  getProjectCategories() {
    return [
      'Renewable Energy',
      'Environmental Conservation',
      'Waste Management',
      'Water Conservation',
      'Air Quality',
      'Biodiversity',
      'Sustainable Agriculture',
      'Green Technology',
      'Climate Action',
      'Community Development',
      'Education',
      'Health & Wellness',
      'Other',
    ]
  }

  /**
   * Get project status options
   * @returns {Array} List of status options
   */
  getProjectStatuses() {
    return [
      { value: 'pending', label: 'Pending', color: 'yellow' },
      { value: 'under_review', label: 'Under Review', color: 'blue' },
      { value: 'approved', label: 'Approved', color: 'green' },
      { value: 'rejected', label: 'Rejected', color: 'red' },
    ]
  }
}

// Export singleton instance
export const projectService = new ProjectService()

// Export individual functions for convenience (bound to service instance)
export const createProject = projectService.createProject.bind(projectService)
export const getUserProjects = projectService.getUserProjects.bind(projectService)
export const getProject = projectService.getProject.bind(projectService)
export const updateProject = projectService.updateProject.bind(projectService)
export const deleteProject = projectService.deleteProject.bind(projectService)
export const getAllProjects = projectService.getAllProjects.bind(projectService)
export const updateProjectStatus = projectService.updateProjectStatus.bind(projectService)
export const getProjectStats = projectService.getProjectStats.bind(projectService)
export const getProjectCategories = projectService.getProjectCategories.bind(projectService)
export const getProjectStatuses = projectService.getProjectStatuses.bind(projectService)
