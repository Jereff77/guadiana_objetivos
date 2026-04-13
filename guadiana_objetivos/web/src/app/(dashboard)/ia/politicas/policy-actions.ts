'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import type { ActionResult, AIPolicy, AIPolicyInput } from '@/lib/ai/types'

interface AIPolicyRow {
  id: string
  title: string
  description: string | null
  policy_type: 'privacy' | 'access_control' | 'behavior' | 'compliance'
  content: string
  severity: 'critical' | 'high' | 'medium'
  trigger_contexts: string[]
  is_active: boolean
  priority: number
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

function mapPolicy(row: AIPolicyRow): AIPolicy {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    policyType: row.policy_type,
    content: row.content,
    severity: row.severity,
    triggerContexts: row.trigger_contexts ?? [],
    isActive: row.is_active,
    priority: row.priority,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getPolicies(): Promise<ActionResult<AIPolicy[]>> {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { error: 'Usuario no autenticado' }

    const { data: canConfigure } = await supabase.rpc('has_permission', { permission_key: 'ia.configure' })

    const query = supabase
      .from('ai_policies')
      .select('*')
      .order('severity', { ascending: true })   // critical primero
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    const { data, error } = await (canConfigure ? query : query.eq('is_active', true))
    if (error) return { error: error.message }
    return { data: (data as AIPolicyRow[]).map(mapPolicy) }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al obtener políticas' }
  }
}

export async function createPolicy(input: AIPolicyInput): Promise<ActionResult<AIPolicy>> {
  await requirePermission('ia.configure')
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { error: 'Usuario no autenticado' }

    const { data, error } = await supabase
      .from('ai_policies')
      .insert({
        title: input.title,
        description: input.description || null,
        policy_type: input.policyType,
        content: input.content,
        severity: input.severity,
        trigger_contexts: input.triggerContexts,
        is_active: input.isActive,
        priority: input.priority,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) return { error: error.message }
    revalidatePath('/ia/politicas')
    return { data: mapPolicy(data as AIPolicyRow) }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al crear política' }
  }
}

export async function updatePolicy(id: string, input: Partial<AIPolicyInput>): Promise<ActionResult<AIPolicy>> {
  await requirePermission('ia.configure')
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { error: 'Usuario no autenticado' }

    const payload: Record<string, unknown> = { updated_by: user.id }
    if (input.title !== undefined)           payload.title = input.title
    if (input.description !== undefined)     payload.description = input.description
    if (input.policyType !== undefined)      payload.policy_type = input.policyType
    if (input.content !== undefined)         payload.content = input.content
    if (input.severity !== undefined)        payload.severity = input.severity
    if (input.triggerContexts !== undefined) payload.trigger_contexts = input.triggerContexts
    if (input.isActive !== undefined)        payload.is_active = input.isActive
    if (input.priority !== undefined)        payload.priority = input.priority

    const { data, error } = await supabase
      .from('ai_policies')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) return { error: error.message }
    revalidatePath('/ia/politicas')
    return { data: mapPolicy(data as AIPolicyRow) }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al actualizar política' }
  }
}

export async function deletePolicy(id: string): Promise<ActionResult<{ success: boolean }>> {
  await requirePermission('ia.configure')
  const supabase = await createClient()
  try {
    const { error } = await supabase.from('ai_policies').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/ia/politicas')
    return { data: { success: true } }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al eliminar política' }
  }
}

export async function togglePolicyActive(id: string, isActive: boolean): Promise<ActionResult<{ success: boolean }>> {
  await requirePermission('ia.configure')
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('ai_policies')
      .update({ is_active: isActive, updated_by: user?.id })
      .eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/ia/politicas')
    return { data: { success: true } }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al cambiar estado' }
  }
}

/**
 * Carga las políticas activas aplicables a un mensaje.
 * - severity='critical': SIEMPRE se incluyen (sin importar el mensaje)
 * - severity='high'|'medium': solo si algún trigger_context coincide en el mensaje
 * Uso INTERNO desde sendChatMessage. Falla silenciosamente.
 */
export async function loadActivePolicies(
  userMessage: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<AIPolicy[]> {
  try {
    const { data } = await supabase
      .from('ai_policies')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })

    if (!data || data.length === 0) return []

    const msgNorm = userMessage.toLowerCase()
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')

    const policies = (data as AIPolicyRow[]).map(mapPolicy)
    const criticals = policies.filter(p => p.severity === 'critical')
    const nonCriticals = policies
      .filter(p => p.severity !== 'critical')
      .filter(p => {
        if (!p.triggerContexts || p.triggerContexts.length === 0) return false
        return p.triggerContexts.some(ctx => {
          const ctxNorm = ctx.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
          return msgNorm.includes(ctxNorm)
        })
      })

    return [...criticals, ...nonCriticals.slice(0, 5)]
  } catch {
    return []
  }
}
