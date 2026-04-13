// ============================================================================
// Tool Loop — Provider-Agnostic
// Detecta invocaciones de herramientas en texto plano y ejecuta el loop.
// Compatible con cualquier proveedor de IA (Claude, Gemini, etc.)
// SOLO servidor — nunca importar desde componentes cliente
// ============================================================================

import 'server-only'
import type { AIMessage } from './types'
import type { AIClient } from './ai-client'

const TOOL_PATTERN = /\[TOOL:(\w+)\]\s*([\s\S]*?)\[\/TOOL\]/

export interface ToolLoopResult {
  content: string
  usage: { input_tokens: number; output_tokens: number }
}

/**
 * Detecta si el texto contiene una invocación de herramienta con el patrón:
 * [TOOL:nombre]
 * {"param": "valor"}
 * [/TOOL]
 *
 * Retorna { name, params } si encuentra una, o null si no.
 */
export function detectToolCall(
  text: string
): { name: string; params: Record<string, unknown> } | null {
  const match = TOOL_PATTERN.exec(text)
  if (!match) return null

  const name = match[1]
  const rawParams = match[2].trim()

  try {
    const params = JSON.parse(rawParams)
    return { name, params: typeof params === 'object' && params !== null ? params : {} }
  } catch {
    return { name, params: {} }
  }
}

/**
 * Ejecuta el loop agéntico provider-agnostic.
 *
 * Flujo por ronda:
 *  1. Llama a ai.chat(messages, systemPrompt)
 *  2. Si la respuesta NO contiene [TOOL:...], retorna como respuesta final
 *  3. Si SÍ contiene [TOOL:...], ejecuta la herramienta via toolExecutor
 *  4. Agrega el resultado como mensaje de usuario con [TOOL_RESULT]
 *  5. Repite hasta maxRounds
 *
 * @param initialMessages - Historial de la conversación
 * @param systemPrompt    - System prompt (incluye instrucciones de tools)
 * @param ai              - Cliente de IA (Claude, Gemini, etc.)
 * @param toolExecutor    - Función que ejecuta una herramienta dado su nombre y params
 * @param maxRounds       - Máximo de rondas de tool calling (default 5)
 */
export async function runToolLoop(
  initialMessages: AIMessage[],
  systemPrompt: string,
  ai: AIClient,
  toolExecutor: (name: string, params: Record<string, unknown>) => Promise<unknown>,
  maxRounds = 5
): Promise<ToolLoopResult> {
  const messages: AIMessage[] = [...initialMessages]
  const totalUsage = { input_tokens: 0, output_tokens: 0 }

  for (let round = 0; round < maxRounds; round++) {
    const response = await ai.chat(messages, systemPrompt, 4000)
    totalUsage.input_tokens += response.usage?.input_tokens ?? 0
    totalUsage.output_tokens += response.usage?.output_tokens ?? 0

    const toolCall = detectToolCall(response.content)

    if (!toolCall) {
      // Respuesta final sin invocación de herramienta
      return { content: response.content, usage: totalUsage }
    }

    console.log(`[GUADIANA Tool Loop] Ronda ${round + 1}: herramienta '${toolCall.name}'`, toolCall.params)

    let result: unknown
    try {
      result = await toolExecutor(toolCall.name, toolCall.params)
    } catch (e) {
      result = { error: e instanceof Error ? e.message : 'Error al ejecutar herramienta' }
    }

    // Agregar el turno del asistente y el resultado de la herramienta
    messages.push(
      { role: 'assistant', content: response.content },
      {
        role: 'user',
        content: `[TOOL_RESULT]\n${JSON.stringify(result, null, 2)}\n[/TOOL_RESULT]\n\nCon base en estos datos, responde al usuario. Si son datos tabulares, usa una tabla en formato Markdown.`,
      }
    )
  }

  // Límite alcanzado: pedir respuesta final sin tools
  const finalResponse = await ai.chat(messages, systemPrompt, 4000)
  totalUsage.input_tokens += finalResponse.usage?.input_tokens ?? 0
  totalUsage.output_tokens += finalResponse.usage?.output_tokens ?? 0

  return { content: finalResponse.content, usage: totalUsage }
}
