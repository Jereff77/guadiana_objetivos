'use server'

import { createClient } from '@/lib/supabase/server'
import { checkPermission, checkIsRoot } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MentoringPair {
  id: string
  mentor_id: string
  mentee_id: string
  start_date: string
  end_date: string | null
  is_active: boolean
  objectives: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // joined
  mentor_name?: string
  mentee_name?: string
  sessions_count?: number
  completed_sessions?: number
}

export interface MentoringSession {
  id: string
  pair_id: string
  scheduled_at: string
  completed_at: string | null
  modality: string
  agenda: string | null
  topics_covered: string[] | null
  commitments: string | null
  mentor_rating: number | null
  mentor_notes: string | null
  mentee_rating: number | null
  mentee_feedback: string | null
  objective_id: string | null
  objective_title?: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface CreatePairData {
  mentor_id: string
  mentee_id: string
  start_date: string
  end_date?: string | null
  objectives?: string | null
}

export interface CreateSessionData {
  pair_id: string
  scheduled_at: string
  modality?: string
  agenda?: string | null
  objective_id?: string | null
}

export interface CompleteSessionData {
  topics_covered?: string[]
  commitments?: string | null
  mentor_rating?: number | null
  mentor_notes?: string | null
}

export interface MenteeSessionFeedback {
  mentee_rating?: number | null
  mentee_feedback?: string | null
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// ── Pares ─────────────────────────────────────────────────────────────────────

export async function getMentoringPairs(onlyActive = false): Promise<ActionResult<MentoringPair[]>> {
  const supabase = await createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { success: false, error: 'No autenticado.' }

  const canView = await checkPermission('mentoring.view')
  const isRoot = await checkIsRoot()

  let query = supabase
    .from('mentoring_pairs')
    .select(`
      *,
      mentor:profiles!mentoring_pairs_mentor_id_fkey ( full_name ),
      mentee:profiles!mentoring_pairs_mentee_id_fkey ( full_name ),
      mentoring_sessions ( id, status )
    `)
    .order('created_at', { ascending: false })

  if (onlyActive) query = query.eq('is_active', true)

  // Si no tiene permiso global, solo ver sus propios pares
  if (!canView && !isRoot) {
    query = query.or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
  }

  const { data, error } = await query
  if (error) return { success: false, error: error.message }

  const pairs: MentoringPair[] = (data ?? []).map((row) => {
    const sessions = (row.mentoring_sessions as { id: string; status: string }[]) ?? []
    return {
      ...row,
      mentor_name: (row.mentor as { full_name: string } | null)?.full_name,
      mentee_name: (row.mentee as { full_name: string } | null)?.full_name,
      sessions_count: sessions.length,
      completed_sessions: sessions.filter((s) => s.status === 'completed').length,
    }
  })

  return { success: true, data: pairs }
}

export async function getMentoringPair(pairId: string): Promise<ActionResult<MentoringPair>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mentoring_pairs')
    .select(`
      *,
      mentor:profiles!mentoring_pairs_mentor_id_fkey ( full_name ),
      mentee:profiles!mentoring_pairs_mentee_id_fkey ( full_name )
    `)
    .eq('id', pairId)
    .single()

  if (error || !data) return { success: false, error: 'Par de mentoring no encontrado.' }

  return {
    success: true,
    data: {
      ...data,
      mentor_name: (data.mentor as { full_name: string } | null)?.full_name,
      mentee_name: (data.mentee as { full_name: string } | null)?.full_name,
    },
  }
}

export async function createMentoringPair(formData: CreatePairData): Promise<ActionResult<{ id: string }>> {
  const canManage = await checkPermission('mentoring.manage')
  const isRoot = await checkIsRoot()
  if (!canManage && !isRoot) return { success: false, error: 'Sin permiso para crear pares de mentoring.' }

  if (formData.mentor_id === formData.mentee_id) {
    return { success: false, error: 'El mentor y el mentee no pueden ser la misma persona.' }
  }

  const supabase = await createClient()
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('mentoring_pairs')
    .insert({ ...formData, created_by: userId })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Ya existe un par activo entre este mentor y mentee.' }
    return { success: false, error: error.message }
  }

  revalidatePath('/mentoring')
  return { success: true, data: { id: data.id } }
}

export async function updateMentoringPair(
  pairId: string,
  updates: Partial<CreatePairData> & { is_active?: boolean },
): Promise<ActionResult> {
  const canManage = await checkPermission('mentoring.manage')
  const isRoot = await checkIsRoot()
  if (!canManage && !isRoot) return { success: false, error: 'Sin permiso para editar pares de mentoring.' }

  const supabase = await createClient()
  const { error } = await supabase.from('mentoring_pairs').update(updates).eq('id', pairId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/mentoring')
  revalidatePath(`/mentoring/${pairId}`)
  return { success: true }
}

export async function deleteMentoringPair(pairId: string): Promise<ActionResult> {
  const canManage = await checkPermission('mentoring.manage')
  const isRoot = await checkIsRoot()
  if (!canManage && !isRoot) return { success: false, error: 'Sin permiso para eliminar pares de mentoring.' }

  const supabase = await createClient()
  const { error } = await supabase.from('mentoring_pairs').delete().eq('id', pairId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/mentoring')
  return { success: true }
}

// ── Sesiones ──────────────────────────────────────────────────────────────────

export async function getSessionsByPair(pairId: string): Promise<ActionResult<MentoringSession[]>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mentoring_sessions')
    .select(`
      *,
      objectives ( title )
    `)
    .eq('pair_id', pairId)
    .order('scheduled_at', { ascending: false })

  if (error) return { success: false, error: error.message }

  const sessions: MentoringSession[] = (data ?? []).map((row) => ({
    ...row,
    topics_covered: row.topics_covered ?? [],
    objective_title: (row.objectives as { title: string } | null)?.title ?? null,
  }))

  return { success: true, data: sessions }
}

export async function createMentoringSession(formData: CreateSessionData): Promise<ActionResult<{ id: string }>> {
  // El mentor puede crear sesiones de su propio par
  const supabase = await createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { success: false, error: 'No autenticado.' }

  // Verificar que sea el mentor o tenga permiso
  const canManage = await checkPermission('mentoring.manage')
  const isRoot = await checkIsRoot()

  if (!canManage && !isRoot) {
    const { data: pair } = await supabase
      .from('mentoring_pairs')
      .select('mentor_id')
      .eq('id', formData.pair_id)
      .single()

    if (!pair || pair.mentor_id !== userId) {
      return { success: false, error: 'Solo el mentor puede crear sesiones.' }
    }
  }

  const { data, error } = await supabase
    .from('mentoring_sessions')
    .insert({
      pair_id: formData.pair_id,
      scheduled_at: formData.scheduled_at,
      modality: formData.modality ?? 'presencial',
      agenda: formData.agenda ?? null,
      objective_id: formData.objective_id ?? null,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/mentoring/${formData.pair_id}`)
  return { success: true, data: { id: data.id } }
}

export async function completeMentoringSession(
  sessionId: string,
  data: CompleteSessionData,
): Promise<ActionResult> {
  const supabase = await createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { success: false, error: 'No autenticado.' }

  // Verificar que sea el mentor del par
  const canManage = await checkPermission('mentoring.manage')
  const isRoot = await checkIsRoot()

  if (!canManage && !isRoot) {
    const { data: session } = await supabase
      .from('mentoring_sessions')
      .select('pair_id, mentoring_pairs!inner ( mentor_id )')
      .eq('id', sessionId)
      .single()

    const rawPair = session?.mentoring_pairs as { mentor_id: string } | { mentor_id: string }[] | null
    const pairData = Array.isArray(rawPair) ? (rawPair[0] ?? null) : rawPair
    if (!pairData || pairData.mentor_id !== userId) {
      return { success: false, error: 'Solo el mentor puede completar la sesión.' }
    }
  }

  const { error } = await supabase
    .from('mentoring_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      topics_covered: data.topics_covered ?? [],
      commitments: data.commitments ?? null,
      mentor_rating: data.mentor_rating ?? null,
      mentor_notes: data.mentor_notes ?? null,
    })
    .eq('id', sessionId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/mentoring')
  return { success: true }
}

export async function submitMenteeFeedback(
  sessionId: string,
  feedback: MenteeSessionFeedback,
): Promise<ActionResult> {
  const supabase = await createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { success: false, error: 'No autenticado.' }

  // Verificar que sea el mentee del par
  const { data: session } = await supabase
    .from('mentoring_sessions')
    .select('status, pair_id, mentoring_pairs!inner ( mentee_id )')
    .eq('id', sessionId)
    .single()

  if (!session) return { success: false, error: 'Sesión no encontrada.' }
  if (session.status !== 'completed') return { success: false, error: 'Solo se puede dar feedback en sesiones completadas.' }

  const rawPairMentee = session.mentoring_pairs as { mentee_id: string } | { mentee_id: string }[] | null
  const pairData = Array.isArray(rawPairMentee) ? (rawPairMentee[0] ?? null) : rawPairMentee
  const isRoot = await checkIsRoot()
  if (!isRoot && pairData?.mentee_id !== userId) {
    return { success: false, error: 'Solo el mentee puede enviar feedback.' }
  }

  const { error } = await supabase
    .from('mentoring_sessions')
    .update({
      mentee_rating: feedback.mentee_rating ?? null,
      mentee_feedback: feedback.mentee_feedback ?? null,
    })
    .eq('id', sessionId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/mentoring')
  return { success: true }
}

export async function cancelMentoringSession(sessionId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { success: false, error: 'No autenticado.' }

  const canManage = await checkPermission('mentoring.manage')
  const isRoot = await checkIsRoot()

  if (!canManage && !isRoot) {
    const { data: session } = await supabase
      .from('mentoring_sessions')
      .select('pair_id, mentoring_pairs!inner ( mentor_id )')
      .eq('id', sessionId)
      .single()

    const rawPairCancel = session?.mentoring_pairs as { mentor_id: string } | { mentor_id: string }[] | null
    const pairData = Array.isArray(rawPairCancel) ? (rawPairCancel[0] ?? null) : rawPairCancel
    if (!pairData || pairData.mentor_id !== userId) {
      return { success: false, error: 'Solo el mentor puede cancelar la sesión.' }
    }
  }

  const { error } = await supabase
    .from('mentoring_sessions')
    .update({ status: 'cancelled' })
    .eq('id', sessionId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/mentoring')
  return { success: true }
}

// ── Reporte mensual ───────────────────────────────────────────────────────────

export async function getMentoringReport(pairId: string): Promise<ActionResult<{
  total_sessions: number
  completed: number
  cancelled: number
  scheduled: number
  avg_mentor_rating: number | null
  avg_mentee_rating: number | null
}>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mentoring_sessions')
    .select('status, mentor_rating, mentee_rating')
    .eq('pair_id', pairId)

  if (error) return { success: false, error: error.message }

  const rows = data ?? []
  const completed = rows.filter((r) => r.status === 'completed')

  const avgRating = (field: 'mentor_rating' | 'mentee_rating') => {
    const vals = completed.map((r) => r[field]).filter((v): v is number => v !== null)
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }

  return {
    success: true,
    data: {
      total_sessions: rows.length,
      completed: completed.length,
      cancelled: rows.filter((r) => r.status === 'cancelled').length,
      scheduled: rows.filter((r) => r.status === 'scheduled').length,
      avg_mentor_rating: avgRating('mentor_rating'),
      avg_mentee_rating: avgRating('mentee_rating'),
    },
  }
}
