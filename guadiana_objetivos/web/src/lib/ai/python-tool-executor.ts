// ============================================================================
// Python Tool Executor — GUADIANA
// Ejecuta scripts Python almacenados en BD como herramientas del agente IA
// SOLO servidor — nunca importar desde componentes cliente
// ============================================================================

import 'server-only'
import { exec } from 'child_process'
import { writeFile, unlink, mkdir } from 'fs/promises'
import path from 'path'
import type { AITool } from './types'
import type { createClient } from '@/lib/supabase/server'

const TOOLS_TMP_DIR = '/tmp/guadiana-tools'
const MAX_OUTPUT_BYTES = 50_000  // 50KB max por respuesta

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

/**
 * Carga todos los tools activos desde la base de datos.
 * Uso interno en sendChatMessage.
 */
export async function loadActiveTools(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<AITool[]> {
  try {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })

    if (error || !data) return []
    return (data as AIToolRow[]).map(mapTool)
  } catch {
    return []
  }
}

/**
 * Convierte los tools al formato que espera la Anthropic Tool Use API.
 */
export function buildAnthropicToolDefs(tools: AITool[]) {
  return tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    input_schema: Object.keys(tool.parametersSchema).length > 0
      ? tool.parametersSchema
      : { type: 'object', properties: {} },
  }))
}

/**
 * Ejecuta un script Python como herramienta del agente.
 *
 * Seguridad:
 * - GUADIANA_USER_ID inyectado como env var — el script debe filtrar por él
 * - Timeout de 10 segundos
 * - Output máximo de 50KB
 * - El archivo temporal se elimina siempre (finally)
 */
export async function executePythonTool(
  tool: AITool,
  input: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  const tmpFile = path.join(TOOLS_TMP_DIR, `${tool.id}-${Date.now()}.py`)

  try {
    await mkdir(TOOLS_TMP_DIR, { recursive: true })
    await writeFile(tmpFile, tool.pythonCode, 'utf-8')

    const result = await new Promise<unknown>((resolve) => {
      // Escapar comillas simples en el JSON para el shell
      const inputJson = JSON.stringify(input).replace(/'/g, "'\\''")

      exec(
        `python3 "${tmpFile}" '${inputJson}'`,
        {
          timeout: 10_000,
          maxBuffer: MAX_OUTPUT_BYTES,
          env: {
            ...process.env,
            GUADIANA_USER_ID: userId,
            // SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY ya están en process.env
          },
        },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`[GUADIANA Tool] Error en '${tool.name}':`, stderr || error.message)
            resolve({ error: stderr.trim() || error.message })
            return
          }

          const out = stdout.trim()
          if (!out) {
            resolve({ result: null })
            return
          }

          try {
            resolve(JSON.parse(out))
          } catch {
            // Si no es JSON válido, retornar como texto
            resolve({ raw: out })
          }
        }
      )
    })

    return result
  } catch (e) {
    console.error(`[GUADIANA Tool] Excepción en '${tool.name}':`, e)
    return { error: e instanceof Error ? e.message : 'Error desconocido al ejecutar herramienta' }
  } finally {
    // Limpiar archivo temporal siempre, incluso si hay error
    unlink(tmpFile).catch(() => {})
  }
}

