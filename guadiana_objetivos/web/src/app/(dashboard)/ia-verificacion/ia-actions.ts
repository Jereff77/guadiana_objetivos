'use server'

import { createClient } from '@/lib/supabase/server'
import { checkPermission, checkIsRoot } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AiPrompt {
  id: string
  name: string
  context: string
  system_prompt: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AiAnalysisLog {
  id: string
  deliverable_id: string
  deliverable_title?: string
  objective_title?: string
  evidence_ids: string[]
  verdict: string
  confidence: number | null
  summary: string | null
  findings: { positive: string[]; negative: string[] } | null
  prompt_used: string | null
  model_used: string | null
  human_verdict: string | null
  reviewed_by: string | null
  reviewer_name?: string | null
  reviewed_at: string | null
  created_at: string
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ── Prompts ────────────────────────────────────────────────────────────────────

export async function getAiPrompts(): Promise<ActionResult<AiPrompt[]>> {
  const canView = await checkPermission('ia.view')
  const canConfigure = await checkPermission('ia.configure')
  const isRoot = await checkIsRoot()
  if (!canView && !canConfigure && !isRoot) {
    return { success: false, error: 'Sin permiso para ver prompts de IA.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ai_prompts')
    .select('*')
    .order('context')
    .order('created_at')

  if (error) return { success: false, error: error.message }
  return { success: true, data: data ?? [] }
}

export async function updateAiPrompt(
  id: string,
  updates: { name?: string; system_prompt?: string; is_active?: boolean },
): Promise<ActionResult> {
  const canConfigure = await checkPermission('ia.configure')
  const isRoot = await checkIsRoot()
  if (!canConfigure && !isRoot) {
    return { success: false, error: 'Sin permiso para configurar prompts de IA.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('ai_prompts')
    .update(updates)
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/ia-verificacion')
  return { success: true }
}

export async function createAiPrompt(data: {
  name: string
  context: 'verification' | 'lms_chat'
  system_prompt: string
}): Promise<ActionResult<{ id: string }>> {
  const canConfigure = await checkPermission('ia.configure')
  const isRoot = await checkIsRoot()
  if (!canConfigure && !isRoot) {
    return { success: false, error: 'Sin permiso para crear prompts de IA.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: created, error } = await supabase
    .from('ai_prompts')
    .insert({ ...data, created_by: user?.id ?? null })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/ia-verificacion')
  return { success: true, data: { id: created.id } }
}

// ── Log de análisis ────────────────────────────────────────────────────────────

export async function getAiAnalysisLog(
  limit = 50,
): Promise<ActionResult<AiAnalysisLog[]>> {
  const canView = await checkPermission('ia.view')
  const isRoot = await checkIsRoot()
  if (!canView && !isRoot) {
    return { success: false, error: 'Sin permiso para ver el log de análisis IA.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ai_analysis_results')
    .select(`
      *,
      objective_deliverables (
        title,
        objectives ( title )
      ),
      reviewer:profiles!ai_analysis_results_reviewed_by_fkey ( full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return { success: false, error: error.message }

  const logs: AiAnalysisLog[] = (data ?? []).map((row) => {
    const deliverable = row.objective_deliverables as {
      title: string
      objectives: { title: string } | null
    } | null

    const rawFindings = row.findings as { positive?: string[]; negative?: string[] } | null

    return {
      id: row.id,
      deliverable_id: row.deliverable_id,
      deliverable_title: deliverable?.title,
      objective_title: deliverable?.objectives?.title,
      evidence_ids: row.evidence_ids ?? [],
      verdict: row.verdict,
      confidence: row.confidence,
      summary: row.summary,
      findings: rawFindings
        ? { positive: rawFindings.positive ?? [], negative: rawFindings.negative ?? [] }
        : null,
      prompt_used: row.prompt_used,
      model_used: row.model_used,
      human_verdict: row.human_verdict,
      reviewed_by: row.reviewed_by,
      reviewer_name: (row.reviewer as { full_name: string } | null)?.full_name ?? null,
      reviewed_at: row.reviewed_at,
      created_at: row.created_at,
    }
  })

  return { success: true, data: logs }
}

export async function submitHumanReview(
  analysisId: string,
  humanVerdict: 'approved' | 'rejected',
): Promise<ActionResult> {
  const canReview = await checkPermission('objetivos.review')
  const isRoot = await checkIsRoot()
  if (!canReview && !isRoot) {
    return { success: false, error: 'Sin permiso para revisar análisis de IA.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('ai_analysis_results')
    .update({
      human_verdict: humanVerdict,
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', analysisId)

  if (error) return { success: false, error: error.message }
  revalidatePath('/ia-verificacion')
  return { success: true }
}
