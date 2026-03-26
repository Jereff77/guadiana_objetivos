// ============================================================================
// Base Agent - Clase base para todos los agentes de IA
// Referencia: .specs/asistente-ia/design.md Sección 3.3
// ============================================================================

import type { AgentConfig, AgentResult } from '../types'
import { ClaudeClient } from '../claude-client'

export abstract class BaseAgent {
  protected claude: ClaudeClient
  protected systemPrompt: string
  protected maxTokens: number

  constructor(config: AgentConfig) {
    this.claude = config.claudeClient
    this.systemPrompt = config.systemPrompt
    this.maxTokens = config.maxTokens || 2000
  }

  /**
   * Ejecuta un prompt contra Claude y parsea la respuesta
   * @param userPrompt - El prompt del usuario
   * @param formatJSON - Si es true, espera y parsea una respuesta JSON
   */
  protected async executePrompt(
    userPrompt: string,
    formatJSON: boolean = false
  ): Promise<AgentResult> {
    try {
      const prompt = formatJSON
        ? `${userPrompt}\n\nResponde ÚNICAMENTE con un JSON válido.`
        : userPrompt

      const response = await this.claude.chat(
        [{ role: 'user', content: prompt }],
        this.systemPrompt,
        this.maxTokens
      )

      let structuredData: any = undefined
      if (formatJSON) {
        structuredData = this.parseJSONResponse(response.content)
      }

      return {
        success: true,
        content: response.content,
        structuredData,
        usage: response.usage,
      }
    } catch (error) {
      return {
        success: false,
        content: '',
        usage: { input_tokens: 0, output_tokens: 0 },
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Intenta extraer JSON de la respuesta de Claude
   * Maneja JSON con y sin markdown code blocks
   */
  protected parseJSONResponse(content: string): any {
    try {
      // Primero intentar encontrar JSON en bloque de código markdown
      const jsonMatch =
        content.match(/```json\n([\s\S]*?)\n```/) ||
        content.match(/```\n([\s\S]*?)\n```/)

      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1])
      }

      // Si no hay bloque, intentar parsear todo el contenido
      const directMatch = content.match(/\{[\s\S]*\}/)
      if (directMatch) {
        return JSON.parse(directMatch[0])
      }

      console.warn('[Base Agent] No JSON found in response')
      return null
    } catch (e) {
      console.warn('[Base Agent] Failed to parse JSON response:', e)
      return null
    }
  }

  /**
   * Método abstracto que debe ser implementado por cada agente
   */
  abstract execute(input: any): Promise<AgentResult>
}

// ============================================================================
// Utilidades para manejo de errores y reintentos
// ============================================================================

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`[Retry] Attempt ${attempt}/${maxRetries} failed:`, lastError.message)

      if (attempt < maxRetries) {
        // Esperar antes de reintentar con backoff exponencial
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
      }
    }
  }

  throw lastError
}
