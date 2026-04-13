'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import type { ActionResult, AISkill, AISkillInput } from '@/lib/ai/types'

interface AISkillRow {
  id: string
  title: string
  description: string | null
  skill_type: 'knowledge' | 'behavior' | 'process'
  content: string
  trigger_keywords: string[]
  is_active: boolean
  priority: number
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

function mapSkill(row: AISkillRow): AISkill {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    skillType: row.skill_type,
    content: row.content,
    triggerKeywords: row.trigger_keywords ?? [],
    isActive: row.is_active,
    priority: row.priority,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getSkills(): Promise<ActionResult<AISkill[]>> {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { error: 'Usuario no autenticado' }

    const { data: canConfigure } = await supabase.rpc('has_permission', { permission_key: 'ia.configure' })

    const query = supabase
      .from('ai_skills')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    const { data, error } = await (canConfigure ? query : query.eq('is_active', true))
    if (error) return { error: error.message }
    return { data: (data as AISkillRow[]).map(mapSkill) }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al obtener habilidades' }
  }
}

export async function createSkill(input: AISkillInput): Promise<ActionResult<AISkill>> {
  await requirePermission('ia.configure')
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { error: 'Usuario no autenticado' }

    const { data, error } = await supabase
      .from('ai_skills')
      .insert({
        title: input.title,
        description: input.description || null,
        skill_type: input.skillType,
        content: input.content,
        trigger_keywords: input.triggerKeywords,
        is_active: input.isActive,
        priority: input.priority,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) return { error: error.message }
    revalidatePath('/ia/habilidades')
    return { data: mapSkill(data as AISkillRow) }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al crear habilidad' }
  }
}

export async function updateSkill(id: string, input: Partial<AISkillInput>): Promise<ActionResult<AISkill>> {
  await requirePermission('ia.configure')
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { error: 'Usuario no autenticado' }

    const payload: Record<string, unknown> = { updated_by: user.id }
    if (input.title !== undefined)           payload.title = input.title
    if (input.description !== undefined)     payload.description = input.description
    if (input.skillType !== undefined)       payload.skill_type = input.skillType
    if (input.content !== undefined)         payload.content = input.content
    if (input.triggerKeywords !== undefined) payload.trigger_keywords = input.triggerKeywords
    if (input.isActive !== undefined)        payload.is_active = input.isActive
    if (input.priority !== undefined)        payload.priority = input.priority

    const { data, error } = await supabase
      .from('ai_skills')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) return { error: error.message }
    revalidatePath('/ia/habilidades')
    return { data: mapSkill(data as AISkillRow) }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al actualizar habilidad' }
  }
}

export async function deleteSkill(id: string): Promise<ActionResult<{ success: boolean }>> {
  await requirePermission('ia.configure')
  const supabase = await createClient()
  try {
    const { error } = await supabase.from('ai_skills').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/ia/habilidades')
    return { data: { success: true } }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al eliminar habilidad' }
  }
}

export async function toggleSkillActive(id: string, isActive: boolean): Promise<ActionResult<{ success: boolean }>> {
  await requirePermission('ia.configure')
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('ai_skills')
      .update({ is_active: isActive, updated_by: user?.id })
      .eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/ia/habilidades')
    return { data: { success: true } }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al cambiar estado' }
  }
}

/**
 * Carga las skills relevantes para un mensaje dado.
 * Uso INTERNO desde sendChatMessage — recibe supabase ya instanciado.
 * Falla silenciosamente (retorna []) para no romper el chat.
 */
export async function loadRelevantSkills(
  userMessage: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<AISkill[]> {
  try {
    const { data } = await supabase
      .from('ai_skills')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })

    if (!data || data.length === 0) return []

    const msgNorm = userMessage.toLowerCase()
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')

    const candidates = (data as AISkillRow[])
      .map(mapSkill)
      .filter(skill => {
        if (!skill.triggerKeywords || skill.triggerKeywords.length === 0) return true
        return skill.triggerKeywords.some(kw => {
          const kwNorm = kw.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
          return msgNorm.includes(kwNorm)
        })
      })

    return candidates.slice(0, 5)
  } catch {
    return []
  }
}
