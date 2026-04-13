'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import type { ActionResult, ChatAuditRow, SessionDetailRow, AIToolInvocation } from '@/lib/ai/types'

export type { ChatAuditRow, SessionDetailRow, AIToolInvocation }

/**
 * Resumen de uso de IA agrupado por usuario para el rango de días indicado.
 * Requiere permiso ia.configure.
 */
export async function getAuditSummary(days: number = 30): Promise<ActionResult<ChatAuditRow[]>> {
  await requirePermission('ia.configure')

  const supabase = await createClient()
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const to   = new Date().toISOString()

  const { data, error } = await supabase.rpc('get_chat_audit_summary', {
    p_from: from,
    p_to:   to,
  })

  if (error) return { error: error.message }

  const rows: ChatAuditRow[] = (data || []).map((r: Record<string, unknown>) => ({
    user_id:       r.user_id as string,
    user_name:     r.user_name as string,
    department:    r.department as string | null,
    session_count: Number(r.session_count),
    message_count: Number(r.message_count),
    total_tokens:  Number(r.total_tokens),
    providers:     r.providers as string[] | null,
  }))

  return { data: rows }
}

/**
 * Detalle de mensajes de una sesión específica.
 * Requiere permiso ia.configure.
 */
export async function getSessionDetail(sessionId: string): Promise<ActionResult<SessionDetailRow[]>> {
  await requirePermission('ia.configure')

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_session_detail', { p_session_id: sessionId })

  if (error) return { error: error.message }

  const rows: SessionDetailRow[] = (data || []).map((r: Record<string, unknown>) => ({
    message_id:    r.message_id as string,
    role:          r.role as string,
    content:       r.content as string,
    provider:      r.provider as string | null,
    model_used:    r.model_used as string | null,
    input_tokens:  r.input_tokens as number | null,
    output_tokens: r.output_tokens as number | null,
    tokens_used:   r.tokens_used as number | null,
    message_at:    r.message_at as string,
  }))

  return { data: rows }
}

/**
 * Lista de sesiones de un usuario específico para el rango de días indicado.
 * Requiere permiso ia.configure.
 */
export async function getUserSessions(
  userId: string,
  days: number = 30
): Promise<ActionResult<Array<{
  id: string
  title: string | null
  started_at: string
  updated_at: string | null
  message_count: number
  total_tokens: number
}>>> {
  await requirePermission('ia.configure')

  const supabase = await createClient()
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .select('id, title, started_at, updated_at, message_count, total_tokens')
    .eq('user_id', userId)
    .gte('started_at', from)
    .order('started_at', { ascending: false })

  if (error) return { error: error.message }
  return { data: data || [] }
}

/**
 * Invocaciones de herramientas de una sesión específica.
 * Requiere permiso ia.configure.
 */
export async function getSessionToolInvocations(
  sessionId: string
): Promise<ActionResult<AIToolInvocation[]>> {
  await requirePermission('ia.configure')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ai_tool_invocations')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) return { error: error.message }

  return {
    data: (data || []).map((r: Record<string, unknown>) => ({
      id:              r.id as string,
      session_id:      r.session_id as string,
      user_message_id: r.user_message_id as string | null,
      tool_name:       r.tool_name as string,
      tool_input:      r.tool_input as Record<string, unknown> | null,
      tool_result:     r.tool_result as Record<string, unknown> | null,
      created_at:      r.created_at as string,
    })),
  }
}
