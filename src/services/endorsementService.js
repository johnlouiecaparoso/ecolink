import { getSupabase } from '@/services/supabaseClient'
import { getCurrentUserId } from '@/utils/authHelper'
import { logUserAction } from '@/services/auditService'

/**
 * Host (LGU) endorsement service. LGUs review community projects and record an
 * endorsement or decline — a "project host endorsements system".
 */

function client() {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase client not available')
  return supabase
}

/**
 * Validated community projects an LGU can endorse, with the current user's
 * endorsement (if any) attached.
 */
export async function getCommunityProjects() {
  const supabase = client()
  const uid = await getCurrentUserId()

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, title, category, location, municipality, status, user_id, created_at')
    .eq('status', 'validated')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message || 'Failed to load projects')
  if (!projects || projects.length === 0) return []

  const projectIds = projects.map((p) => p.id)
  const { data: endorsements } = await supabase
    .from('project_endorsements')
    .select('*')
    .in('project_id', projectIds)

  return projects.map((p) => {
    const all = (endorsements || []).filter((e) => e.project_id === p.id)
    const mine = all.find((e) => e.lgu_user_id === uid) || null
    return {
      ...p,
      endorsement_count: all.filter((e) => e.decision === 'endorsed').length,
      my_endorsement: mine,
    }
  })
}

/**
 * Record (or update) the current LGU user's endorsement decision for a project.
 */
export async function endorseProject(projectId, decision, notes = '') {
  const supabase = client()
  const uid = await getCurrentUserId()
  if (!uid) throw new Error('User not authenticated')
  if (!['endorsed', 'declined'].includes(decision)) {
    throw new Error('Invalid decision')
  }

  const { data, error } = await supabase
    .from('project_endorsements')
    .upsert(
      {
        project_id: projectId,
        lgu_user_id: uid,
        decision,
        notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id,lgu_user_id' },
    )
    .select()
    .single()

  if (error) throw new Error(error.message || 'Failed to record endorsement')

  try {
    await logUserAction(
      decision === 'endorsed' ? 'PROJECT_ENDORSED' : 'PROJECT_ENDORSEMENT_DECLINED',
      'project_endorsement',
      uid,
      data.id,
      { project_id: projectId },
    )
  } catch {
    /* non-critical */
  }
  return data
}

/**
 * Endorsements for a single project (e.g. shown to the project owner).
 */
export async function getProjectEndorsements(projectId) {
  const supabase = client()
  const { data, error } = await supabase
    .from('project_endorsements')
    .select('*')
    .eq('project_id', projectId)
  if (error) throw new Error(error.message || 'Failed to load endorsements')
  return data || []
}
