// ============================================================================
// AI Client Unificado - Soporte para Anthropic y Google
// ============================================================================

import { getClaudeClient, ClaudeClient } from './claude-client'
import { getGeminiClient, GeminiClient } from './gemini-client'
import type { AIProvider, AIMessage, AIResponse } from './types'

// Re-exportar tipos para uso externo
export type { AIProvider, AIMessage, AIResponse } from './types'

export class AIClient {
  private provider: AIProvider
  private modelOverride?: string

  constructor(provider: AIProvider = 'auto', model?: string) {
    this.modelOverride = model
    this.provider = provider === 'auto' ? this.getDefaultProvider() : provider
  }

  /**
   * Determina el proveedor por defecto basado en las API keys disponibles
   */
  private getDefaultProvider(): AIProvider {
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
    const hasGoogle = !!process.env.GOOGLE_API_KEY || !!process.env.GEMINI_API_KEY

    if (hasAnthropic && !hasGoogle) return 'anthropic'
    if (!hasAnthropic && hasGoogle) return 'google'
    if (hasAnthropic && hasGoogle) return 'anthropic' // Preferencia por defecto

    throw new Error('No AI provider API key configured')
  }

  /**
   * Envía un mensaje y obtiene respuesta
   */
  async chat(
    messages: AIMessage[],
    systemPrompt?: string,
    maxTokens: number = 2000
  ): Promise<AIResponse> {
    try {
      if (this.provider === 'google') {
        return await this.chatWithGoogle(messages, systemPrompt, maxTokens)
      }
      return await this.chatWithAnthropic(messages, systemPrompt, maxTokens)
    } catch (error) {
      // Si falla el proveedor principal, intentar con el alternativo si está disponible
      console.error(`[AI Client] Error with ${this.provider}:`, error)
      throw error
    }
  }

  /**
   * Usa Anthropic Claude
   */
  private async chatWithAnthropic(
    messages: AIMessage[],
    systemPrompt: string | undefined,
    maxTokens: number
  ): Promise<AIResponse> {
    const claude = this.modelOverride
      ? new ClaudeClient(process.env.ANTHROPIC_API_KEY!, this.modelOverride)
      : getClaudeClient()
    const claudeMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }))
    const result = await claude.chat(claudeMessages, systemPrompt, maxTokens)
    return {
      ...result,
      provider: 'anthropic',
    }
  }

  /**
   * Usa Google Gemini
   */
  private async chatWithGoogle(
    messages: AIMessage[],
    systemPrompt: string | undefined,
    maxTokens: number
  ): Promise<AIResponse> {
    const gemini = this.modelOverride
      ? new GeminiClient(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY!, this.modelOverride)
      : getGeminiClient()
    const geminiMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }))
    const result = await gemini.chat(geminiMessages, systemPrompt, maxTokens)
    return {
      ...result,
      provider: 'google',
    }
  }

  /**
   * Analiza una imagen
   */
  async analyzeImage(
    base64Image: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<AIResponse> {
    if (this.provider === 'google') {
      const gemini = getGeminiClient()
      const result = await gemini.analyzeImage(base64Image, prompt, systemPrompt)
      return { ...result, provider: 'google' }
    }

    const claude = getClaudeClient()
    const result = await claude.analyzeImage(base64Image, prompt, systemPrompt)
    return { ...result, provider: 'anthropic' }
  }

  /**
   * Stream de chat
   */
  async *chatStream(
    messages: AIMessage[],
    systemPrompt?: string,
    maxTokens: number = 2000
  ): AsyncGenerator<string, void, unknown> {
    if (this.provider === 'google') {
      const gemini = getGeminiClient()
      const geminiMessages = messages.map(m => ({
        role: m.role,
        content: m.content,
      }))
      yield* gemini.chatStream(geminiMessages, systemPrompt, maxTokens)
    } else {
      const claude = getClaudeClient()
      const claudeMessages = messages.map(m => ({
        role: m.role,
        content: m.content,
      }))
      yield* claude.chatStream(claudeMessages, systemPrompt, maxTokens)
    }
  }

  /**
   * Obtiene el identificador del modelo activo
   */
  getModel(): string {
    if (this.modelOverride) return this.modelOverride
    return this.provider === 'google' ? 'gemini-2.0-flash' : 'claude-3-haiku-20240307'
  }

  /**
   * Cambia el proveedor
   */
  setProvider(provider: AIProvider): void {
    this.provider = provider === 'auto' ? this.getDefaultProvider() : provider
  }

  /**
   * Obtiene el proveedor actual
   */
  getProvider(): AIProvider {
    return this.provider
  }
}

// ============================================================================
// Factory function para obtener una instancia del cliente
// ============================================================================

let aiClientInstance: AIClient | null = null

export function getAIClient(provider?: AIProvider): AIClient {
  if (!aiClientInstance || provider) {
    aiClientInstance = new AIClient(provider)
  }
  return aiClientInstance
}

/**
 * Parsea el valor del setting de proveedor al formato "provider/model" o "provider".
 * Ejemplos:
 *   "anthropic/claude-sonnet-4-5" → { provider: 'anthropic', model: 'claude-sonnet-4-5' }
 *   "google/gemini-2.0-flash" → { provider: 'google',    model: 'gemini-2.0-flash' }
 *   "anthropic"                    → { provider: 'anthropic', model: undefined }
 *   "auto"                         → { provider: 'auto',      model: undefined }
 */
function parseProviderSetting(value: string): { provider: AIProvider; model?: string } {
  if (!value || value === 'auto') return { provider: 'auto' }
  const slashIdx = value.indexOf('/')
  if (slashIdx === -1) return { provider: value as AIProvider }
  return {
    provider: value.slice(0, slashIdx) as AIProvider,
    model: value.slice(slashIdx + 1),
  }
}

/**
 * Obtiene el proveedor configurado desde la base de datos (sin modelo específico).
 * Para crear un cliente con el modelo correcto, usa getConfiguredAIClient().
 */
export async function getConfiguredProvider(): Promise<AIProvider> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const { data } = await supabase
    .from('ai_settings')
    .select('setting_value')
    .eq('setting_key', 'ai_provider')
    .single()

  const { provider } = parseProviderSetting(data?.setting_value || 'auto')
  return provider
}

/**
 * Crea un AIClient ya configurado con el proveedor y modelo guardados en BD.
 * También lee las API keys almacenadas en BD si no están en variables de entorno.
 */
export async function getConfiguredAIClient(): Promise<AIClient> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('ai_settings')
    .select('setting_key, setting_value')
    .in('setting_key', ['ai_provider', 'anthropic_api_key', 'google_api_key'])
    .is('department_id', null)

  const settingsMap = new Map(settings?.map(s => [s.setting_key, s.setting_value]) || [])

  // Inyectar API keys en process.env si no están configuradas como variables de entorno
  const dbAnthropicKey = settingsMap.get('anthropic_api_key')
  const dbGoogleKey = settingsMap.get('google_api_key')
  if (dbAnthropicKey && !process.env.ANTHROPIC_API_KEY) {
    process.env.ANTHROPIC_API_KEY = dbAnthropicKey
  }
  if (dbGoogleKey && !process.env.GOOGLE_API_KEY) {
    process.env.GOOGLE_API_KEY = dbGoogleKey
  }

  const { provider, model } = parseProviderSetting(settingsMap.get('ai_provider') || 'auto')
  return new AIClient(provider, model)
}
