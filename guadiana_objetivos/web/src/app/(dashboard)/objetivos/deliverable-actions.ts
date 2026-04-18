'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { calculateObjectiveProgress } from './objective-actions'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface DeliverableData {
  title: string
  description?: string
  due_date?: string | null
  assignee_id?: string | null
}

export interface EvidenceData {
  storage_path?: string
  evidence_url?: string
  text_content?: string
  run_id?: string | null
  notes?: string
}

export interface Deliverable {
  id: string
  objective_id: string
  title: string
  description: string | null
  due_date: string | null
  assignee_id: string | null
  assignee_name: string | null
  status: string
  created_at: string
  evidences?: Evidence[]
  latest_review?: Review | null
}

export interface Evidence {
  id: string
  deliverable_id: string
  submitted_by: string
  submitter_name: string | null
  storage_path: string | null
  evidence_url: string | null
  text_content: string | null
  run_id: string | null
  submitted_at: string
  notes: string | null
}

export interface Review {
  id: string
  deliverable_id: string
  reviewer_id: string
  reviewer_name: string | null
  verdict: string
  comment: string | null
  reviewed_at: string
}

// Los permisos de escritura los maneja RLS basado en el organigrama

// ─── Lectura ──────────────────────────────────────────────────────────────────

export async function getDeliverablesByObjective(objectiveId: string): Promise<Deliverable[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('objective_deliverables')
    .select(`
      id, objective_id, title, description, due_date, assignee_id, status, created_at,
      profiles(full_name)
    `)
    .eq('objective_id', objectiveId)
    .order('created_at')

  if (!data) return []

  return data.map((d) => {
    const assignee = d.profiles
    return {
      id: d.id,
      objective_id: d.objective_id,
      title: d.title,
      description: d.description,
      due_date: d.due_date,
      assignee_id: d.assignee_id,
      assignee_name:
        assignee && typeof assignee === 'object' && 'full_name' in assignee
          ? (assignee as { full_name: string | null }).full_name
          : null,
      status: d.status,
      created_at: d.created_at,
    }
  })
}

export async function getDeliverableWithDetail(id: string): Promise<Deliverable | null> {
  const supabase = await createClient()

  const { data: d } = await supabase
    .from('objective_deliverables')
    .select(`
      id, objective_id, title, description, due_date, assignee_id, status, created_at,
      profiles(full_name),
      objective_evidences(
        id, deliverable_id, submitted_by, storage_path, evidence_url,
        text_content, run_id, submitted_at, notes,
        profiles(full_name)
      ),
      objective_reviews(
        id, deliverable_id, reviewer_id, verdict, comment, reviewed_at,
        profiles(full_name)
      )
    `)
    .eq('id', id)
    .single()

  if (!d) return null

  const assignee = d.profiles
  const evidences: Evidence[] = ((d.objective_evidences as unknown[]) ?? []).map((e) => {
    const ev = e as Record<string, unknown>
    const sub = ev.profiles as Record<string, unknown> | null
    return {
      id: ev.id as string,
      deliverable_id: ev.deliverable_id as string,
      submitted_by: ev.submitted_by as string,
      submitter_name: sub ? (sub.full_name as string | null) : null,
      storage_path: ev.storage_path as string | null,
      evidence_url: ev.evidence_url as string | null,
      text_content: ev.text_content as string | null,
      run_id: ev.run_id as string | null,
      submitted_at: ev.submitted_at as string,
      notes: ev.notes as string | null,
    }
  })

  const reviews: Review[] = ((d.objective_reviews as unknown[]) ?? []).map((r) => {
    const rv = r as Record<string, unknown>
    const rev = rv.profiles as Record<string, unknown> | null
    return {
      id: rv.id as string,
      deliverable_id: rv.deliverable_id as string,
      reviewer_id: rv.reviewer_id as string,
      reviewer_name: rev ? (rev.full_name as string | null) : null,
      verdict: rv.verdict as string,
      comment: rv.comment as string | null,
      reviewed_at: rv.reviewed_at as string,
    }
  })

  return {
    id: d.id,
    objective_id: d.objective_id,
    title: d.title,
    description: d.description,
    due_date: d.due_date,
    assignee_id: d.assignee_id,
    assignee_name:
      assignee && typeof assignee === 'object' && 'full_name' in assignee
        ? (assignee as { full_name: string | null }).full_name
        : null,
    status: d.status,
    created_at: d.created_at,
    evidences,
    latest_review: reviews.length > 0 ? reviews[reviews.length - 1] : null,
  }
}

// ─── Escritura ────────────────────────────────────────────────────────────────

export async function createDeliverable(
  objectiveId: string,
  data: DeliverableData
): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient()

  const { data: deliv, error } = await supabase
    .from('objective_deliverables')
    .insert({
      objective_id: objectiveId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      due_date: data.due_date || null,
      assignee_id: data.assignee_id || null,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '42501') return { error: 'No tienes permiso para crear entregables en este objetivo' }
    return { error: error.message }
  }

  revalidatePath('/objetivos')
  return { id: deliv.id }
}

export async function updateDeliverable(
  id: string,
  data: Partial<DeliverableData>
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('objective_deliverables')
    .update({
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
      ...(data.due_date !== undefined ? { due_date: data.due_date || null } : {}),
      ...(data.assignee_id !== undefined ? { assignee_id: data.assignee_id || null } : {}),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/objetivos')
  return {}
}

/**
 * Subir evidencia a un entregable. Cualquier usuario autenticado asignado puede hacerlo.
 */
export async function submitEvidence(
  deliverableId: string,
  evidenceData: EvidenceData
): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Cambiar estado del entregable a 'submitted'
  await supabase
    .from('objective_deliverables')
    .update({ status: 'submitted' })
    .eq('id', deliverableId)

  const { data: evid, error } = await supabase
    .from('objective_evidences')
    .insert({
      deliverable_id: deliverableId,
      submitted_by: user.id,
      storage_path: evidenceData.storage_path || null,
      evidence_url: evidenceData.evidence_url || null,
      text_content: evidenceData.text_content || null,
      run_id: evidenceData.run_id || null,
      notes: evidenceData.notes || null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/objetivos')
  return { id: evid.id }
}

/**
 * Subir archivo de evidencia a Supabase Storage
 */
export async function uploadEvidenceFile(
  file: File,
  deliverableId: string
): Promise<{ error?: string; storage_path?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Generar path único: evidences/YYYY/MM/deliverableId_timestamp_filename
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `evidences/${year}/${month}/${deliverableId}_${timestamp}_${sanitizedName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('objective-evidences')
    .upload(path, file, { upsert: false })

  if (uploadError) return { error: uploadError.message }

  return { storage_path: uploadData.path }
}

/**
 * Aprobar o rechazar un entregable. Requiere objetivos.review.
 * El rechazo devuelve el entregable a estado 'pending'.
 */
export async function reviewDeliverable(
  deliverableId: string,
  verdict: 'approved' | 'rejected',
  comment?: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const newStatus = verdict === 'approved' ? 'approved' : 'pending'

  // Actualizar estado del entregable
  const { error: updErr } = await supabase
    .from('objective_deliverables')
    .update({ status: newStatus })
    .eq('id', deliverableId)

  if (updErr) return { error: updErr.message }

  // Registrar la revisión
  const { error: revErr } = await supabase
    .from('objective_reviews')
    .insert({
      deliverable_id: deliverableId,
      reviewer_id: user.id,
      verdict,
      comment: comment?.trim() || null,
    })

  if (revErr) return { error: revErr.message }

  // Recalcular progreso del objetivo padre
  const { data: deliv } = await supabase
    .from('objective_deliverables')
    .select('objective_id')
    .eq('id', deliverableId)
    .single()

  if (deliv) {
    await calculateObjectiveProgress(deliv.objective_id)
  }

  revalidatePath('/objetivos')
  return {}
}

// ─── IA: Disparar análisis (T-040) ───────────────────────────────────────────

export interface AiAnalysisResult {
  analysis_id: string
  verdict: string
  confidence: number
  summary: string
  findings: { positive: string[]; negative: string[] }
}

export async function requestAiAnalysis(
  deliverableId: string,
  notifyWhatsapp = false,
): Promise<{ data?: AiAnalysisResult; error?: string }> {

  const aiServiceUrl = process.env.PYTHON_AI_SERVICE_URL
  const aiServiceKey = process.env.PYTHON_AI_SERVICE_API_KEY

  if (!aiServiceUrl || !aiServiceKey) {
    return { error: 'Servicio de IA no configurado. Revisa las variables de entorno.' }
  }

  const supabase = await createClient()

  // Obtener entregable con su objetivo
  const { data: deliverable, error: dErr } = await supabase
    .from('objective_deliverables')
    .select(`
      id, title, description,
      objectives ( title, description ),
      objective_evidences ( id )
    `)
    .eq('id', deliverableId)
    .single()

  if (dErr || !deliverable) {
    return { error: 'Entregable no encontrado.' }
  }

  const objectiveRaw = deliverable.objectives as { title: string; description: string | null } | { title: string; description: string | null }[] | null
  const objective = Array.isArray(objectiveRaw) ? (objectiveRaw[0] ?? null) : objectiveRaw
  const evidenceIds = (deliverable.objective_evidences as { id: string }[]).map((e) => e.id)

  if (evidenceIds.length === 0) {
    return { error: 'El entregable no tiene evidencias para analizar.' }
  }

  try {
    const response = await fetch(`${aiServiceUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': aiServiceKey,
      },
      body: JSON.stringify({
        deliverable_id: deliverableId,
        objective_title: objective?.title ?? '',
        objective_description: objective?.description ?? null,
        deliverable_title: deliverable.title,
        deliverable_description: deliverable.description ?? null,
        evidence_ids: evidenceIds,
        notify_whatsapp: notifyWhatsapp,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { error: `Error del servicio IA: ${response.status} — ${errorText.slice(0, 200)}` }
    }

    const result = await response.json() as AiAnalysisResult
    revalidatePath('/objetivos')
    revalidatePath('/ia-verificacion')
    return { data: result }
  } catch (err) {
    return { error: `No se pudo conectar con el servicio de IA: ${(err as Error).message}` }
  }
}
