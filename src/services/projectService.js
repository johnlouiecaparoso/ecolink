import { getSupabase } from '@/services/supabaseClient'

export async function createProject(projectData) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        developer_id: projectData.developer_id,
        title: projectData.title,
        location: projectData.location,
        methodology: projectData.methodology,
        docs_url: projectData.docs_url,
        status: projectData.status || 'draft',
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to create project')
  }
  return data
}

export async function getUserProjects(userId) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('developer_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Failed to fetch projects')
  }
  return data || []
}

export async function getProjectById(projectId) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).single()

  if (error) {
    throw new Error(error.message || 'Failed to fetch project')
  }
  return data
}

export async function updateProject(projectId, updates) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to update project')
  }
  return data
}

export async function deleteProject(projectId) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  const { error } = await supabase.from('projects').delete().eq('id', projectId)

  if (error) {
    throw new Error(error.message || 'Failed to delete project')
  }
  return true
}
