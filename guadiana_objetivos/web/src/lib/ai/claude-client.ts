// ============================================================================
// Claude Client - Cliente base de Anthropic
// Referencia: .specs/asistente-ia/design.md Sección 3.2
// ============================================================================

import Anthropic from '@anthropic-ai/sdk'
import type { ClaudeMessage, ClaudeResponse } from './types'

export class ClaudeClient {
  private client: Anthropic
  private model: string = 'claude-3-5-sonnet-20241022'

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Anthropic API key is required')
    }
    this.client = new Anthropic({ apiKey })
  }

  /**
   * Envía un mensaje a Claude y retorna la respuesta
   */
  async chat(
    messages: ClaudeMessage[],
    systemPrompt?: string,
    maxTokens: number = 2000
  ): Promise<ClaudeResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      })

      const content = response.content[0]
      return {
        content: content.type === 'text' ? content.text : '',
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
        },
        model: this.model,
      }
    } catch (error) {
      console.error('[Claude Client] Error:', error)
      throw error
    }
  }

  /**
   * Analiza una imagen usando capacidades de visión de Claude
   */
  async analyzeImage(
    base64Image: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<ClaudeResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          },
        ],
      })

      const content = response.content[0]
      return {
        content: content.type === 'text' ? content.text : '',
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
        },
        model: this.model,
      }
    } catch (error) {
      console.error('[Claude Client] Image analysis error:', error)
      throw error
    }
  }

  /**
   * Stream de chat para respuestas en tiempo real (opcional para implementación futura)
   */
  async *chatStream(
    messages: ClaudeMessage[],
    systemPrompt?: string,
    maxTokens: number = 2000
  ): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            yield event.delta.text
          }
        }
      }
    } catch (error) {
      console.error('[Claude Client] Stream error:', error)
      throw error
    }
  }
}

// ============================================================================
// Factory function para obtener una instancia del cliente
// ============================================================================

let claudeClientInstance: ClaudeClient | null = null

export function getClaudeClient(): ClaudeClient {
  if (!claudeClientInstance) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    claudeClientInstance = new ClaudeClient(apiKey)
  }
  return claudeClientInstance
}
