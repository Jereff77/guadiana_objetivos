'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import type { ActionResult, AIScheduledTask, AITaskExecution } from '@/lib/ai/types'

// ============================================================================
// Helpers
// ============================================================================

/**
 * Calcula el próximo timestamp de ejecución dado una expresión cron y zona horaria.
 * Soporta los casos más comunes: diario, semanal, mensual, cada hora.
 */
export async function calculateNextRunAt(cronExpr: string, timezone: string = 'America/Mexico_City'): Promise<string> {
  const parts = cronExpr.trim().split(/\s+/)
  if (parts.length !== 5) {
    // Fallback: 1 hora desde ahora
    return new Date(Date.now() + 60 * 60 * 1000).toISOString()
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  // Calcular próxima ejecución en UTC usando la zona horaria de destino
  const now = new Date()

  // Obtener hora local en la zona horaria especificada
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
  const parts2 = formatter.formatToParts(now)
  const localYear  = parseInt(parts2.find(p => p.type === 'year')!.value)
  const localMonth = parseInt(parts2.find(p => p.type === 'month')!.value)
  const localDay   = parseInt(parts2.find(p => p.type === 'day')!.value)
  const localHour  = parseInt(parts2.find(p => p.type === 'hour')!.value)
  const localMin   = parseInt(parts2.find(p => p.type === 'minute')!.value)

  const targetHour   = hour   === '*' ? localHour   : parseInt(hour)
  const targetMinute = minute === '*' ? localMin + 1 : parseInt(minute)

  // Construir candidato: hoy a la hora objetivo en la zona horaria local
  const candidate = new Date(`${localYear}-${String(localMonth).padStart(2,'0')}-${String(localDay).padStart(2,'0')}T${String(targetHour).padStart(2,'0')}:${String(targetMinute).padStart(2,'0')}:00`)

  // Convertir a UTC teniendo en cuenta la zona horaria
  const utcOffset = now.getTime() - new Date(now.toLocaleString('en-US', { timeZone: timezone })).getTime()
  let nextRun = new Date(candidate.getTime() + utcOffset)

  // Si ya pasó, avanzar según el patrón
  if (nextRun <= now) {
    if (dayOfWeek !== '*') {
      nextRun = new Date(nextRun.getTime() + 7 * 24 * 60 * 60 * 1000)
    } else if (dayOfMonth !== '*') {
      // Próximo mes
      nextRun = new Date(nextRun.getTime())
      nextRun.setMonth(nextRun.getMonth() + 1)
    } else if (hour === '*') {
      // Cada hora
      nextRun = new Date(nextRun.getTime() + 60 * 60 * 1000)
    } else {
      // Diario: agregar 1 día
      nextRun = new Date(nextRun.getTime() + 24 * 60 * 60 * 1000)
    }
  }

  return nextRun.toISOString()
}

// ============================================================================
// Acciones CRUD
// ============================================================================

/**
 * Obtiene todas las tareas programadas del usuario actual.
 */
export async function getTasks(): Promise<ActionResult<AIScheduledTask[]>> {
  await requirePermission('ia.view')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) return { error: 'Usuario no autenticado' }

  const { data, error } = await supabase
    .from('ai_scheduled_tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { data: data || [] }
}

/**
 * Crea una nueva tarea programada.
 * Solo llamado internamente desde el handler de la tool del chat.
 */
export async function createTask(
  input: { title: string; prompt: string; cron_expression: string; timezone?: string; description?: string },
  userId: string
): Promise<ActionResult<AIScheduledTask>> {
  const supabase = await createClient()

  const timezone = input.timezone || 'America/Mexico_City'
  const nextRunAt = await calculateNextRunAt(input.cron_expression, timezone)

  const { data, error } = await supabase
    .from('ai_scheduled_tasks')
    .insert({
      user_id:         userId,
      title:           input.title,
      description:     input.description || null,
      prompt:          input.prompt,
      cron_expression: input.cron_expression,
      timezone,
      next_run_at:     nextRunAt,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

/**
 * Elimina una tarea programada.
 */
export async function deleteTask(id: string): Promise<ActionResult<{ success: boolean }>> {
  await requirePermission('ia.view')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) return { error: 'Usuario no autenticado' }

  const { error } = await supabase
    .from('ai_scheduled_tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { data: { success: true } }
}

/**
 * Activa o desactiva una tarea.
 */
export async function toggleTaskActive(
  id: string,
  isActive: boolean
): Promise<ActionResult<{ success: boolean }>> {
  await requirePermission('ia.view')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) return { error: 'Usuario no autenticado' }

  const { error } = await supabase
    .from('ai_scheduled_tasks')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { data: { success: true } }
}

/**
 * Obtiene el historial de ejecuciones de una tarea.
 */
export async function getTaskExecutions(
  taskId: string
): Promise<ActionResult<AITaskExecution[]>> {
  await requirePermission('ia.view')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) return { error: 'Usuario no autenticado' }

  // Verificar que la tarea pertenece al usuario
  const { data: task } = await supabase
    .from('ai_scheduled_tasks')
    .select('id')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single()

  if (!task) return { error: 'Tarea no encontrada' }

  const { data, error } = await supabase
    .from('ai_task_executions')
    .select('*')
    .eq('task_id', taskId)
    .order('started_at', { ascending: false })
    .limit(20)

  if (error) return { error: error.message }
  return { data: data || [] }
}

/**
 * Fuerza la ejecución inmediata de una tarea (pone next_run_at = now).
 */
export async function runTaskNow(id: string): Promise<ActionResult<{ success: boolean }>> {
  await requirePermission('ia.view')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) return { error: 'Usuario no autenticado' }

  const { error } = await supabase
    .from('ai_scheduled_tasks')
    .update({ next_run_at: new Date().toISOString(), is_active: true })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { data: { success: true } }
}

/**
 * Lista las tareas activas del usuario (para el tool list_scheduled_tasks del chat).
 */
export async function listTasksForUser(userId: string): Promise<AIScheduledTask[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ai_scheduled_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return data || []
}

/**
 * Cancela (desactiva) una tarea por ID (para el tool cancel_scheduled_task del chat).
 */
export async function cancelTaskForUser(taskId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('ai_scheduled_tasks')
    .update({ is_active: false })
    .eq('id', taskId)
    .eq('user_id', userId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
