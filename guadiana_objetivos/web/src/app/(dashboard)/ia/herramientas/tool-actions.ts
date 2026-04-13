'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import type { ActionResult, AITool, AIToolInput } from '@/lib/ai/types'
import { executePythonTool } from '@/lib/ai/python-tool-executor'
import { getConfiguredAIClient } from '@/lib/ai/ai-client'

interface AIToolRow {
  id: string
  name: string
  title: string
  description: string
  parameters_schema: Record<string, unknown>
  python_code: string
  is_active: boolean
  priority: number
  preferred_model: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

function mapTool(row: AIToolRow): AITool {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    description: row.description,
    parametersSchema: row.parameters_schema ?? {},
    pythonCode: row.python_code,
    isActive: row.is_active,
    priority: row.priority,
    preferredModel: row.preferred_model,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getTools(): Promise<ActionResult<AITool[]>> {
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { error: 'Usuario no autenticado' }

    const { data: canConfigure } = await supabase.rpc('has_permission', { permission_key: 'ia.configure' })

    const query = supabase
      .from('ai_tools')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    const { data, error } = await (canConfigure ? query : query.eq('is_active', true))
    if (error) return { error: error.message }
    return { data: (data as AIToolRow[]).map(mapTool) }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al obtener herramientas' }
  }
}

export async function createTool(input: AIToolInput): Promise<ActionResult<AITool>> {
  await requirePermission('ia.configure')
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { error: 'Usuario no autenticado' }

    const { data, error } = await supabase
      .from('ai_tools')
      .insert({
        name: input.name,
        title: input.title,
        description: input.description,
        parameters_schema: input.parametersSchema,
        python_code: input.pythonCode,
        is_active: input.isActive,
        priority: input.priority,
        preferred_model: input.preferredModel || null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) return { error: error.message }
    revalidatePath('/ia/herramientas')
    return { data: mapTool(data as AIToolRow) }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al crear herramienta' }
  }
}

export async function updateTool(id: string, input: Partial<AIToolInput>): Promise<ActionResult<AITool>> {
  await requirePermission('ia.configure')
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { error: 'Usuario no autenticado' }

    const payload: Record<string, unknown> = { updated_by: user.id }
    if (input.name !== undefined)             payload.name = input.name
    if (input.title !== undefined)            payload.title = input.title
    if (input.description !== undefined)      payload.description = input.description
    if (input.parametersSchema !== undefined) payload.parameters_schema = input.parametersSchema
    if (input.pythonCode !== undefined)       payload.python_code = input.pythonCode
    if (input.isActive !== undefined)         payload.is_active = input.isActive
    if (input.priority !== undefined)         payload.priority = input.priority
    if ('preferredModel' in input)            payload.preferred_model = input.preferredModel || null

    const { data, error } = await supabase
      .from('ai_tools')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) return { error: error.message }
    revalidatePath('/ia/herramientas')
    return { data: mapTool(data as AIToolRow) }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al actualizar herramienta' }
  }
}

export async function deleteTool(id: string): Promise<ActionResult<{ success: boolean }>> {
  await requirePermission('ia.configure')
  const supabase = await createClient()
  try {
    const { error } = await supabase.from('ai_tools').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/ia/herramientas')
    return { data: { success: true } }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al eliminar herramienta' }
  }
}

export async function toggleToolActive(id: string, isActive: boolean): Promise<ActionResult<{ success: boolean }>> {
  await requirePermission('ia.configure')
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('ai_tools')
      .update({ is_active: isActive, updated_by: user?.id })
      .eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/ia/herramientas')
    return { data: { success: true } }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al cambiar estado' }
  }
}

/**
 * Genera el código Python de una herramienta a partir de una descripción en lenguaje natural.
 * El administrador revisa y ajusta el código antes de guardarlo.
 */
export async function generateToolCode(
  description: string,
  preferredModel?: string | null
): Promise<ActionResult<string>> {
  await requirePermission('ia.configure')

  try {
    // Usar el modelo preferido de la herramienta si está definido, si no el global
    let ai
    if (preferredModel) {
      const { AIClient } = await import('@/lib/ai/ai-client')
      const slash = preferredModel.indexOf('/')
      ai = slash === -1
        ? new AIClient(preferredModel as 'anthropic' | 'google' | 'auto')
        : new AIClient(preferredModel.slice(0, slash) as 'anthropic' | 'google' | 'auto', preferredModel.slice(slash + 1))
    } else {
      ai = await getConfiguredAIClient()
    }

    const systemPrompt = `Eres un experto en Python y Supabase. Generas scripts Python para herramientas del agente GUADIANA.

## Contexto del sistema
- El script recibe parámetros como JSON en sys.argv[1]
- Debe imprimir el resultado como JSON en stdout
- Las variables de entorno disponibles son:
  - SUPABASE_URL: URL del proyecto Supabase
  - SUPABASE_SERVICE_ROLE_KEY: clave de servicio de Supabase
  - GUADIANA_USER_ID: UUID del usuario que ejecuta la herramienta (para filtros de seguridad)

## Estructura mínima
\`\`\`python
#!/usr/bin/env python3
import sys, json, os
from supabase import create_client

INPUT    = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
SUPA_URL = os.environ['SUPABASE_URL']
SUPA_KEY = os.environ['SUPABASE_SERVICE_ROLE_KEY']
USER_ID  = os.environ.get('GUADIANA_USER_ID', '')

supabase = create_client(SUPA_URL, SUPA_KEY)

# ... lógica aquí ...

print(json.dumps(resultado, default=str))
\`\`\`

## Tablas disponibles
- objective_deliverables (id, title, status, due_date, assignee_id, objective_id)
- objectives (id, title, department_id, month, year, weight, status)
- departments (id, name, manager_id)
- profiles (id, full_name, role, branch_id)
- lms_courses (id, title, category, is_published)
- lms_course_progress (user_id, course_id, topic_id, completed_at, quiz_score)

## Reglas de seguridad
- Solo consultas de lectura (SELECT)
- Siempre filtrar por USER_ID o datos accesibles al usuario
- No retornar datos sensibles de otros usuarios

Responde SOLO con el código Python, sin explicaciones ni bloques de markdown.`

    const response = await ai.chat(
      [{ role: 'user', content: `Genera un script Python para esta herramienta:\n\n${description}` }],
      systemPrompt,
      2000
    )

    // Limpiar posibles bloques de markdown que el AI haya incluido
    let code = response.content.trim()
    if (code.startsWith('```python')) {
      code = code.slice(9)
    } else if (code.startsWith('```')) {
      code = code.slice(3)
    }
    if (code.endsWith('```')) {
      code = code.slice(0, -3)
    }

    return { data: code.trim() }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al generar código' }
  }
}

/**
 * Prueba un tool ejecutándolo con un input de prueba.
 * Retorna stdout, stderr y el resultado parseado.
 */
export async function testTool(
  id: string,
  testInput: Record<string, unknown>
): Promise<ActionResult<{ result: unknown; raw?: string }>> {
  await requirePermission('ia.configure')
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { error: 'Usuario no autenticado' }

    const { data: toolRow, error } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !toolRow) return { error: 'Herramienta no encontrada' }

    const tool = mapTool(toolRow as AIToolRow)
    const result = await executePythonTool(tool, testInput, user.id)

    return { data: { result } }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al probar herramienta' }
  }
}
