'use server'

import { createClient } from '@/lib/supabase/server'
import { checkPermission, checkIsRoot } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import type { LmsContent } from './lms-actions'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LmsCourse {
  id: string
  title: string
  description: string | null
  category: string | null
  cover_url: string | null
  is_published: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface LmsCourseTopic {
  id: string
  course_id: string
  title: string
  description: string | null
  sort_order: number
  topic_type: 'content' | 'survey'
  content_id: string | null
  survey_id: string | null
  is_required: boolean
  created_at: string
  updated_at: string
  // Expandidos en getCourse()
  lms_content?: Pick<LmsContent, 'id' | 'title' | 'content_type' | 'is_published'> | null
  form_surveys?: { id: string; name: string; status: string } | null
}

export interface LmsCourseWithTopics extends LmsCourse {
  topics: LmsCourseTopic[]
}

export interface LmsTopicProgress {
  id: string
  topic_id: string
  course_id: string
  started_at: string
  completed_at: string | null
  quiz_score: number | null
  survey_run_id: string | null
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

async function assertManage(): Promise<{ error: string } | null> {
  const [canManage, isRoot] = await Promise.all([
    checkPermission('capacitacion.manage'),
    checkIsRoot(),
  ])
  if (!canManage && !isRoot) return { error: 'Sin permiso para gestionar cursos.' }
  return null
}

async function assertEditOrManage(): Promise<{ error: string } | null> {
  const [canManage, canEdit, isRoot] = await Promise.all([
    checkPermission('capacitacion.manage'),
    checkPermission('capacitacion.edit'),
    checkIsRoot(),
  ])
  if (!canManage && !canEdit && !isRoot) return { error: 'Sin permiso para editar cursos.' }
  return null
}

async function assertDeleteOrManage(): Promise<{ error: string } | null> {
  const [canManage, canDelete, isRoot] = await Promise.all([
    checkPermission('capacitacion.manage'),
    checkPermission('capacitacion.delete'),
    checkIsRoot(),
  ])
  if (!canManage && !canDelete && !isRoot) return { error: 'Sin permiso para eliminar cursos.' }
  return null
}

// ── Cursos ────────────────────────────────────────────────────────────────────

export async function getCourses(onlyPublished = false): Promise<ActionResult<LmsCourse[]>> {
  const supabase = await createClient()
  let query = supabase
    .from('lms_courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (onlyPublished) query = query.eq('is_published', true)

  const { data, error } = await query
  if (error) return { success: false, error: error.message }
  return { success: true, data: (data ?? []) as LmsCourse[] }
}

export async function getCourse(id: string): Promise<ActionResult<LmsCourseWithTopics>> {
  const supabase = await createClient()

  const { data: course, error: courseError } = await supabase
    .from('lms_courses')
    .select('*')
    .eq('id', id)
    .single()

  if (courseError || !course) return { success: false, error: 'Curso no encontrado.' }

  const { data: topics, error: topicsError } = await supabase
    .from('lms_course_topics')
    .select(`
      *,
      lms_content ( id, title, content_type, is_published ),
      form_surveys ( id, name, status )
    `)
    .eq('course_id', id)
    .order('sort_order', { ascending: true })

  if (topicsError) return { success: false, error: topicsError.message }

  return {
    success: true,
    data: {
      ...(course as LmsCourse),
      topics: (topics ?? []) as LmsCourseTopic[],
    },
  }
}

export async function createCourse(data: {
  title: string
  description?: string | null
  category?: string | null
  cover_url?: string | null
  is_published?: boolean
}): Promise<ActionResult<{ id: string }>> {
  const err = await assertManage()
  if (err) return { success: false, error: err.error }

  const supabase = await createClient()
  const userId = await getCurrentUserId()

  const { data: inserted, error } = await supabase
    .from('lms_courses')
    .insert({ ...data, created_by: userId })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/capacitacion')
  return { success: true, data: { id: inserted.id } }
}

export async function updateCourse(
  id: string,
  data: Partial<Omit<LmsCourse, 'id' | 'created_by' | 'created_at' | 'updated_at'>>,
): Promise<ActionResult> {
  const err = await assertEditOrManage()
  if (err) return { success: false, error: err.error }

  const supabase = await createClient()
  const { error } = await supabase.from('lms_courses').update(data).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/capacitacion')
  revalidatePath(`/capacitacion/${id}`)
  return { success: true }
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  const err = await assertDeleteOrManage()
  if (err) return { success: false, error: err.error }

  const supabase = await createClient()
  const { error } = await supabase.from('lms_courses').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/capacitacion')
  return { success: true }
}

// ── Temas del temario ─────────────────────────────────────────────────────────

export async function createCourseTopic(data: {
  course_id: string
  title: string
  description?: string | null
  sort_order?: number
  topic_type: 'content' | 'survey'
  content_id?: string | null
  survey_id?: string | null
  is_required?: boolean
}): Promise<ActionResult<{ id: string }>> {
  const err = await assertManage()
  if (err) return { success: false, error: err.error }

  const supabase = await createClient()
  const { data: inserted, error } = await supabase
    .from('lms_course_topics')
    .insert(data)
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/capacitacion/${data.course_id}`)
  return { success: true, data: { id: inserted.id } }
}

export async function updateCourseTopic(
  id: string,
  data: Partial<Omit<LmsCourseTopic, 'id' | 'course_id' | 'created_at' | 'updated_at' | 'lms_content' | 'form_surveys'>>,
): Promise<ActionResult> {
  const err = await assertEditOrManage()
  if (err) return { success: false, error: err.error }

  const supabase = await createClient()
  const { error } = await supabase.from('lms_course_topics').update(data).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/capacitacion')
  return { success: true }
}

export async function deleteCourseTopic(id: string): Promise<ActionResult> {
  const err = await assertDeleteOrManage()
  if (err) return { success: false, error: err.error }

  // Obtener course_id para revalidar
  const supabase = await createClient()
  const { data: topic } = await supabase
    .from('lms_course_topics')
    .select('course_id')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('lms_course_topics').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  if (topic?.course_id) revalidatePath(`/capacitacion/${topic.course_id}`)
  return { success: true }
}

export async function reorderCourseTopics(
  courseId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  const err = await assertEditOrManage()
  if (err) return { success: false, error: err.error }

  const supabase = await createClient()

  // Actualizar sort_order de cada tema según su posición en el array
  const updates = orderedIds.map((topicId, index) =>
    supabase
      .from('lms_course_topics')
      .update({ sort_order: index })
      .eq('id', topicId)
      .eq('course_id', courseId),
  )

  const results = await Promise.all(updates)
  const firstError = results.find(r => r.error)
  if (firstError?.error) return { success: false, error: firstError.error.message }

  revalidatePath(`/capacitacion/${courseId}`)
  return { success: true }
}

// ── Progreso ──────────────────────────────────────────────────────────────────

export async function getMyCourseProgress(courseId: string): Promise<ActionResult<LmsTopicProgress[]>> {
  const supabase = await createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { success: false, error: 'No autenticado.' }

  const { data, error } = await supabase
    .from('lms_course_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)

  if (error) return { success: false, error: error.message }
  return { success: true, data: (data ?? []) as LmsTopicProgress[] }
}

export async function startTopic(courseId: string, topicId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { success: false, error: 'No autenticado.' }

  const { error } = await supabase
    .from('lms_course_progress')
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        topic_id: topicId,
        started_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,topic_id', ignoreDuplicates: true },
    )

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function completeTopic(
  courseId: string,
  topicId: string,
  opts?: { quizScore?: number; surveyRunId?: string },
): Promise<ActionResult> {
  const supabase = await createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { success: false, error: 'No autenticado.' }

  const { error } = await supabase
    .from('lms_course_progress')
    .update({
      completed_at: new Date().toISOString(),
      quiz_score: opts?.quizScore ?? null,
      survey_run_id: opts?.surveyRunId ?? null,
    })
    .eq('user_id', userId)
    .eq('topic_id', topicId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/capacitacion/${courseId}`)
  return { success: true }
}
