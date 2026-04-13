// ============================================================================
// Server Actions - IA Chat
// Funciones para mejora de contenido con IA
// ============================================================================

'use server'

import { getClaudeClient } from '@/lib/ai/claude-client'
import { requirePermission } from '@/lib/permissions'
import type { ActionResult } from '@/lib/ai/types'

// ============================================================================
// Tipos
// ============================================================================

export interface ImproveContentInput {
  content: string
  context?: 'policy' | 'skill' | 'task'
  additionalContext?: string
}

export interface ImproveContentResult {
  originalContent: string
  improvedContent: string
  suggestions: string[]
  usage?: {
    input_tokens: number
    output_tokens: number
  }
}

// ============================================================================
// Funciones principales
// ============================================================================

/**
 * Mejora el contenido de políticas, habilidades o tareas usando IA
 */
export async function improveContentWithAI(
  input: ImproveContentInput
): Promise<ActionResult<ImproveContentResult>> {
  // Verificar permisos
  const hasPermission = await checkIAPermission()
  if (!hasPermission) {
    return { error: 'No tienes permisos para usar funciones de IA' }
  }

  if (!input.content || input.content.trim().length === 0) {
    return { error: 'El contenido no puede estar vacío' }
  }

  try {
    const claude = getClaudeClient()

    // Construir el prompt según el contexto
    const systemPrompt = buildSystemPrompt(input.context)
    const userPrompt = buildUserPrompt(input)

    const response = await claude.chat(
      [{ role: 'user', content: userPrompt }],
      systemPrompt,
      1500
    )

    // Parsear la respuesta
    const result = parseAIResponse(input.content, response.content)

    return {
      data: {
        ...result,
        usage: response.usage,
      },
    }
  } catch (error) {
    console.error('[IA] Error al mejorar contenido:', error)
    return {
      error: error instanceof Error ? error.message : 'Error al mejorar el contenido con IA',
    }
  }
}

// ============================================================================
// Funciones auxiliares
// ============================================================================

/**
 * Verifica si el usuario tiene permisos de IA
 */
async function checkIAPermission(): Promise<boolean> {
  try {
    // Verificar si tiene alguno de los permisos de IA
    const { checkPermission } = await import('@/lib/permissions')
    return await checkPermission('ia.view')
  } catch {
    return false
  }
}

/**
 * Construye el system prompt según el contexto
 */
function buildSystemPrompt(context?: string): string {
  const basePrompt = `Eres GUADIANA, el asistente de inteligencia artificial del Sistema de Gestión de Objetivos de Llantas y Rines del Guadiana.

Tu función es ayudar a mejorar redacciones profesionales en un contexto corporativo. Debes:
- Mantener un tono profesional y constructivo
- Ser claro y conciso
- Proponer mejoras prácticas sin cambiar el significado original
- Ofrecer sugerencias específicas y accionables`

  const contextPrompts: Record<string, string> = {
    policy: 'Te especializas en mejorar políticas corporativas, asegurando que sean claras, completas y alineadas con mejores prácticas de gestión.',
    skill: 'Te especializas en mejorar descripciones de habilidades y competencias, asegurando que sean específicas, medibles y alcanzables.',
    task: 'Te especializas en mejorar descripciones de tareas, asegurando que sean claras, tengan entregables definidos y sean accionables.',
  }

  return context ? `${basePrompt}\n\n${contextPrompts[context] || ''}` : basePrompt
}

/**
 * Construye el user prompt para la IA
 */
function buildUserPrompt(input: ImproveContentInput): string {
  const contextInfo = input.additionalContext
    ? `\n\nContexto adicional:\n${input.additionalContext}`
    : ''

  const contextLabels: Record<string, string> = {
    policy: 'política',
    skill: 'habilidad',
    task: 'tarea',
  }

  const contextLabel = input.context ? contextLabels[input.context] : 'contenido'

  return `Por favor, mejora la siguiente ${contextLabel}. Responde en este formato exacto:

CONTENIDO_MEJORADO:
[Aquí escribe la versión mejorada del contenido]

SUGERENCIAS:
- [Sugerencia 1]
- [Sugerencia 2]
- [Sugerencia 3]
...

Contenido original:
${input.content}${contextInfo}`
}

/**
 * Parsea la respuesta de la IA
 */
function parseAIResponse(
  originalContent: string,
  aiResponse: string
): Omit<ImproveContentResult, 'usage'> {
  try {
    // Extraer contenido mejorado
    const contenidoMatch = aiResponse.match(/CONTENIDO_MEJORADO:\s*\n([\s\S]*?)(?=\n\nSUGERENCIAS:|$)/i)
    const improvedContent = contenidoMatch
      ? contenidoMatch[1].trim()
      : aiResponse.split('SUGERENCIAS:')[0].trim()

    // Extraer sugerencias
    const sugerenciasMatch = aiResponse.match(/SUGERENCIAS:\s*\n([\s\S]*)/i)
    const suggestions: string[] = []

    if (sugerenciasMatch) {
      const lines = sugerenciasMatch[1].split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('-')) {
          suggestions.push(trimmed.substring(1).trim())
        }
      }
    }

    return {
      originalContent,
      improvedContent,
      suggestions,
    }
  } catch (error) {
    console.error('[IA] Error al parsear respuesta:', error)
    // Fallback: retornar la respuesta completa como contenido mejorado
    return {
      originalContent,
      improvedContent: aiResponse,
      suggestions: [],
    }
  }
}
