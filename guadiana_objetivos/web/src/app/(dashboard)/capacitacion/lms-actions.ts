'use server'

import { createClient } from '@/lib/supabase/server'
import { checkPermission, checkIsRoot } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  question: string
  options: string[]
  correct: number
}

export interface LmsContent {
  id: string
  title: string
  description: string | null
  category: string | null
  content_type: 'pdf' | 'video' | 'text' | 'quiz'
  storage_path: string | null
  video_url: string | null
  text_body: string | null
  is_published: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface LmsQuiz {
  id: string
  content_id: string
  questions: QuizQuestion[]
  min_score: number
  created_at: string
}

export interface LmsPath {
  id: string
  title: string
  description: string | null
  content_ids: string[]
  cert_title: string | null
  is_published: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface LmsProgress {
  id: string
  user_id: string
  content_id: string
  path_id: string | null
  started_at: string
  completed_at: string | null
  quiz_score: number | null
  certified: boolean
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// ── Contenidos ─────────────────────────────────────────────────────────────────

export async function getLmsContents(onlyPublished = false): Promise<ActionResult<LmsContent[]>> {
  const supabase = await createClient()
  let query = supabase
    .from('lms_content')
    .select('*')
    .order('created_at', { ascending: false })

  if (onlyPublished) query = query.eq('is_published', true)

  const { data, error } = await query
  if (error) return { success: false, error: error.message }

  return { success: true, data: (data ?? []) as LmsContent[] }
}

export async function getLmsContent(id: string): Promise<ActionResult<LmsContent & { quiz?: LmsQuiz }>> {
  const supabase = await createClient()

  const { data: content, error } = await supabase
    .from('lms_content')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !content) return { success: false, error: 'Contenido no encontrado.' }

  const { data: quiz } = await supabase
    .from('lms_quizzes')
    .select('*')
    .eq('content_id', id)
    .maybeSingle()

  return {
    success: true,
    data: {
      ...(content as LmsContent),
      quiz: quiz ? (quiz as LmsQuiz) : undefined,
    },
  }
}

export async function createLmsContent(data: {
  title: string
  description?: string | null
  category?: string | null
  content_type: 'pdf' | 'video' | 'text' | 'quiz'
  storage_path?: string | null
  video_url?: string | null
  text_body?: string | null
  is_published?: boolean
}): Promise<ActionResult<{ id: string }>> {
  const canManage = await checkPermission('capacitacion.manage')
  const isRoot = await checkIsRoot()
  if (!canManage && !isRoot) return { success: false, error: 'Sin permiso para crear contenidos.' }

  const supabase = await createClient()
  const userId = await getCurrentUserId()

  const { data: inserted, error } = await supabase
    .from('lms_content')
    .insert({ ...data, created_by: userId })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/capacitacion')
  return { success: true, data: { id: inserted.id } }
}

export async function updateLmsContent(
  id: string,
  data: Partial<Omit<LmsContent, 'id' | 'created_by' | 'created_at' | 'updated_at'>>,
): Promise<ActionResult> {
  const isRoot = await checkIsRoot()
  const canEdit = await checkPermission('capacitacion.edit')
  const canManage = await checkPermission('capacitacion.manage')
  if (!isRoot && !canEdit && !canManage) return { success: false, error: 'Sin permiso para editar contenidos.' }

  const supabase = await createClient()
  const { error } = await supabase.from('lms_content').update(data).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/capacitacion')
  revalidatePath(`/capacitacion/${id}`)
  return { success: true }
}

export async function deleteLmsContent(id: string): Promise<ActionResult> {
  const isRoot = await checkIsRoot()
  const canDelete = await checkPermission('capacitacion.delete')
  const canManage = await checkPermission('capacitacion.manage')
  if (!isRoot && !canDelete && !canManage) return { success: false, error: 'Sin permiso para eliminar contenidos.' }

  const supabase = await createClient()
  const { error } = await supabase.from('lms_content').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/capacitacion')
  return { success: true }
}

export async function upsertLmsQuiz(
  contentId: string,
  questions: QuizQuestion[],
  minScore: number,
): Promise<ActionResult> {
  const canManage = await checkPermission('capacitacion.manage')
  const isRoot = await checkIsRoot()
  if (!canManage && !isRoot) return { success: false, error: 'Sin permiso para gestionar evaluaciones.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('lms_quizzes')
    .upsert(
      { content_id: contentId, questions, min_score: minScore },
      { onConflict: 'content_id' },
    )

  if (error) return { success: false, error: error.message }

  revalidatePath('/capacitacion')
  revalidatePath(`/capacitacion/${contentId}`)
  return { success: true }
}

// ── Rutas de aprendizaje ───────────────────────────────────────────────────────

export async function getLmsPaths(onlyPublished = false): Promise<ActionResult<LmsPath[]>> {
  const supabase = await createClient()
  let query = supabase
    .from('lms_paths')
    .select('*')
    .order('created_at', { ascending: false })

  if (onlyPublished) query = query.eq('is_published', true)

  const { data, error } = await query
  if (error) return { success: false, error: error.message }

  return { success: true, data: (data ?? []) as LmsPath[] }
}

export async function createLmsPath(data: {
  title: string
  description?: string | null
  content_ids: string[]
  cert_title?: string | null
  is_published?: boolean
}): Promise<ActionResult<{ id: string }>> {
  const canManage = await checkPermission('capacitacion.manage')
  const isRoot = await checkIsRoot()
  if (!canManage && !isRoot) return { success: false, error: 'Sin permiso para crear rutas de aprendizaje.' }

  const supabase = await createClient()
  const userId = await getCurrentUserId()

  const { data: inserted, error } = await supabase
    .from('lms_paths')
    .insert({ ...data, created_by: userId })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/capacitacion')
  return { success: true, data: { id: inserted.id } }
}

export async function updateLmsPath(
  id: string,
  data: Partial<Omit<LmsPath, 'id' | 'created_by' | 'created_at' | 'updated_at'>>,
): Promise<ActionResult> {
  const canManage = await checkPermission('capacitacion.manage')
  const isRoot = await checkIsRoot()
  if (!canManage && !isRoot) return { success: false, error: 'Sin permiso para editar rutas de aprendizaje.' }

  const supabase = await createClient()
  const { error } = await supabase.from('lms_paths').update(data).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/capacitacion')
  return { success: true }
}

export async function deleteLmsPath(id: string): Promise<ActionResult> {
  const canManage = await checkPermission('capacitacion.manage')
  const isRoot = await checkIsRoot()
  if (!canManage && !isRoot) return { success: false, error: 'Sin permiso para eliminar rutas de aprendizaje.' }

  const supabase = await createClient()
  const { error } = await supabase.from('lms_paths').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/capacitacion')
  return { success: true }
}

// ── Progreso ───────────────────────────────────────────────────────────────────

export async function getMyProgress(): Promise<ActionResult<LmsProgress[]>> {
  const supabase = await createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { success: false, error: 'No autenticado.' }

  const { data, error } = await supabase
    .from('lms_progress')
    .select('*')
    .eq('user_id', userId)

  if (error) return { success: false, error: error.message }

  return { success: true, data: (data ?? []) as LmsProgress[] }
}

export async function startContent(contentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { success: false, error: 'No autenticado.' }

  const { error } = await supabase
    .from('lms_progress')
    .upsert(
      { user_id: userId, content_id: contentId, started_at: new Date().toISOString() },
      { onConflict: 'user_id,content_id', ignoreDuplicates: true },
    )

  if (error) return { success: false, error: error.message }

  return { success: true }
}

export async function completeContent(contentId: string, quizScore?: number): Promise<ActionResult> {
  const supabase = await createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { success: false, error: 'No autenticado.' }

  let certified = false

  if (quizScore !== undefined) {
    const { data: quiz } = await supabase
      .from('lms_quizzes')
      .select('min_score')
      .eq('content_id', contentId)
      .maybeSingle()

    if (quiz) {
      certified = quizScore >= quiz.min_score
    }
  }

  const { error } = await supabase
    .from('lms_progress')
    .update({
      completed_at: new Date().toISOString(),
      quiz_score: quizScore ?? null,
      certified,
    })
    .eq('user_id', userId)
    .eq('content_id', contentId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/capacitacion')
  return { success: true }
}

// ── Surveys publicados (para selector de evaluaciones en temario) ───────────

export async function getPublishedSurveys(): Promise<ActionResult<{ id: string; name: string; status: string }[]>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('form_surveys')
    .select('id, name, status')
    .eq('status', 'published')
    .order('name', { ascending: true })

  if (error) return { success: false, error: error.message }
  return { success: true, data: (data ?? []) as { id: string; name: string; status: string }[] }
}

// ── Subir PDF a Supabase Storage ────────────────────────────────────────────────

export async function uploadPdfToStorage(
  file: File,
  filename: string,
): Promise<ActionResult<{ storage_path: string }>> {
  const canManage = await checkPermission('capacitacion.manage')
  const isRoot = await checkIsRoot()
  if (!canManage && !isRoot) return { success: false, error: 'Sin permiso para subir archivos.' }

  const supabase = await createClient()

  // Generar path único: pdfs/YYYY/MM/timestamp-filename.pdf
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const timestamp = Date.now()
  const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `pdfs/${year}/${month}/${timestamp}-${sanitizedName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('lms-content')
    .upload(path, file, { upsert: false })

  if (uploadError) return { success: false, error: uploadError.message }

  return { success: true, data: { storage_path: uploadData.path } }
}

// ── Crear contenido LMS desde el editor de temario ───────────────────────────────

export async function createQuickContent(data: {
  title: string
  content_type: 'video' | 'pdf' | 'text'
  video_url?: string
  storage_path?: string
  text_body?: string
}): Promise<ActionResult<{ id: string }>> {
  const canManage = await checkPermission('capacitacion.manage')
  const isRoot = await checkIsRoot()
  if (!canManage && !isRoot) return { success: false, error: 'Sin permiso para crear contenidos.' }

  const supabase = await createClient()
  const userId = await getCurrentUserId()

  const insertData: Record<string, unknown> = {
    title: data.title,
    description: null,
    category: null,
    content_type: data.content_type,
    is_published: true,
    created_by: userId,
  }

  if (data.content_type === 'video' && data.video_url) {
    insertData.video_url = data.video_url
  } else if (data.content_type === 'pdf' && data.storage_path) {
    insertData.storage_path = data.storage_path
  } else if (data.content_type === 'text' && data.text_body) {
    insertData.text_body = data.text_body
  }

  const { data: inserted, error } = await supabase
    .from('lms_content')
    .insert(insertData)
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/capacitacion')
  return { success: true, data: { id: inserted.id } }
}

export async function getPathProgress(
  pathId: string,
): Promise<ActionResult<{ total: number; completed: number; certified: boolean }>> {
  const supabase = await createClient()
  const userId = await getCurrentUserId()
  if (!userId) return { success: false, error: 'No autenticado.' }

  const { data: path, error: pathError } = await supabase
    .from('lms_paths')
    .select('content_ids')
    .eq('id', pathId)
    .single()

  if (pathError || !path) return { success: false, error: 'Ruta no encontrada.' }

  const contentIds: string[] = (path.content_ids as string[]) ?? []
  const total = contentIds.length

  if (total === 0) return { success: true, data: { total: 0, completed: 0, certified: false } }

  const { data: progressRows, error: progressError } = await supabase
    .from('lms_progress')
    .select('content_id, completed_at, certified')
    .eq('user_id', userId)
    .in('content_id', contentIds)
    .not('completed_at', 'is', null)

  if (progressError) return { success: false, error: progressError.message }

  const rows = progressRows ?? []
  const completed = rows.length
  const allCertified = completed === total && rows.every((r) => r.certified === true)

  return { success: true, data: { total, completed, certified: allCertified } }
}
