// ============================================================================
// Server Actions - Módulo IA
// Referencia: .specs/asistente-ia/design.md Sección 4
// ============================================================================

'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { getClaudeClient } from '@/lib/ai/claude-client'
import type { ActionResult } from '@/lib/ai/types'

// ============================================================================
// Tipo de retorno estándar para todas las acciones
// ============================================================================

// ============================================================================
// Configuración
// ============================================================================

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

// ============================================================================
// Funciones auxiliares
// ============================================================================

/**
 * Carga el system prompt desde la base de datos o usa el por defecto
 */
async function loadSystemPrompt(context: string = 'verification'): Promise<string> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('ai_prompts')
    .select('system_prompt')
    .eq('context', context)
    .eq('is_active', true)
    .single()

  if (data?.system_prompt) {
    return data.system_prompt
  }

  // System prompt por defecto
  return `Eres GUADIANA, el asistente de inteligencia artificial del Sistema de Gestión de Objetivos de Llantas y Rines del Guadiana. Tu función es analizar evidencias de manera objetiva y constructiva.`
}

/**
 * Registra un análisis en el log de auditoría
 */
async function logAnalysis(
  analysisType: 'evidence' | 'objective' | 'training',
  targetId: string,
  status: 'pending' | 'completed' | 'failed',
  result?: any,
  error?: string
): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  try {
    const { data } = await supabase
      .from('ai_analysis_log')
      .insert({
        user_id: user?.id,
        analysis_type: analysisType,
        target_id: targetId,
        status,
        result_summary: result?.summary || result?.content,
        result_json: result?.structuredData || result,
        error_message: error,
        prompt_tokens: result?.usage?.input_tokens,
        completion_tokens: result?.usage?.output_tokens,
        total_tokens: result?.usage?.input_tokens + result?.usage?.output_tokens,
      })
      .select('id')
      .single()

    return data?.id || null
  } catch (e) {
    console.error('[IA] Error al registrar análisis:', e)
    return null
  }
}

/**
 * Verifica si el módulo de IA está configurado y disponible
 */
export async function isIAAvailable(): Promise<ActionResult<{ available: boolean; reason?: string }>> {
  try {
    if (!ANTHROPIC_API_KEY) {
      return {
        data: { available: false, reason: 'API key de Anthropic no configurada' },
      }
    }

    // Verificar permisos
    const hasPermission = await checkIAPermission()
    if (!hasPermission) {
      return {
        data: { available: false, reason: 'No tienes permisos para usar IA' },
      }
    }

    return { data: { available: true } }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Error al verificar disponibilidad de IA',
    }
  }
}

/**
 * Verifica si el usuario tiene cualquier permiso de IA
 */
async function checkIAPermission(): Promise<boolean> {
  const supabase = await createClient()

  try {
    // Verificar si tiene alguno de los permisos de IA
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return false

    const { data: permissions } = await supabase.rpc('has_permission', {
      permission_key: 'ia.view',
    })

    return permissions || false
  } catch {
    return false
  }
}

// ============================================================================
// Acciones de Configuración
// ============================================================================

/**
 * Obtiene las configuraciones de IA para el departamento del usuario
 */
export async function getIASettings(): Promise<ActionResult<any[] | null>> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      return { error: 'Usuario no autenticado' }
    }

    // Obtener configuraciones globales y del departamento del usuario
    const { data } = await supabase
      .from('profiles')
      .select('branch_id')
      .eq('id', user.id)
      .single()

    const deptId = data?.branch_id

    const { data: settings } = await supabase
      .from('ai_settings')
      .select('*')
      .or(`department_id.is.null,department_id.eq.${deptId}`)

    return { data: settings || [] }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Error al obtener configuraciones',
    }
  }
}

/**
 * Actualiza una configuración de IA (requiere permiso ia.configure)
 */
export async function updateIASetting(
  settingKey: string,
  settingValue: string,
  departmentId?: string | null
): Promise<ActionResult<{ success: boolean }>> {
  await requirePermission('ia.configure')

  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      return { error: 'Usuario no autenticado' }
    }

    const { error } = await supabase
      .from('ai_settings')
      .upsert({
        department_id: departmentId || null,
        setting_key: settingKey,
        setting_value: settingValue,
        updated_by: user.id,
      })

    if (error) {
      return { error: error.message }
    }

    return { data: { success: true } }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Error al actualizar configuración',
    }
  }
}

// ============================================================================
// Acciones de Estadísticas
// ============================================================================

/**
 * Obtiene estadísticas de uso de IA para el usuario actual
 */
export async function getIAStats(): Promise<ActionResult<{
  totalAnalyses: number
  totalTokens: number
  pendingRecommendations: number
}>> {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      return { error: 'Usuario no autenticado' }
    }

    const [analysesResult, recommendationsResult] = await Promise.all([
      supabase
        .from('ai_analysis_log')
        .select('total_tokens')
        .eq('user_id', user.id),
      supabase
        .from('ai_recommendations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending'),
    ])

    const totalTokens =
      analysesResult.data?.reduce((sum, log) => sum + (log.total_tokens || 0), 0) || 0

    return {
      data: {
        totalAnalyses: analysesResult.data?.length || 0,
        totalTokens,
        pendingRecommendations: recommendationsResult.count || 0,
      },
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas',
    }
  }
}
