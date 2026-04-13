// ============================================================================
// Gemini Client - Cliente base de Google AI
// Referencia: .specs/asistente-ia/design.md Sección 3.2
// ============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ClaudeMessage, ClaudeResponse } from './types'

export class GeminiClient {
  private client: GoogleGenerativeAI
  private model: string

  constructor(apiKey: string, model?: string) {
    if (!apiKey) {
      throw new Error('Google API key is required')
    }
    this.client = new GoogleGenerativeAI(apiKey)
    this.model = model || 'gemini-2.0-flash'
  }

  /**
   * Envía un mensaje a Gemini y retorna la respuesta
   * Compatible con la interfaz de ClaudeClient
   */
  async chat(
    messages: ClaudeMessage[],
    systemPrompt?: string,
    maxTokens: number = 2000
  ): Promise<ClaudeResponse> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
      })

      // Construir el contenido para Gemini
      const contents = this.buildGeminiContents(messages, systemPrompt)

      const result = await model.generateContent({
        contents,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
        },
      })

      console.log('[Gemini Client] Raw result:', result)
      const text = result.response.text()
      console.log('[Gemini Client] Extracted text:', text)
      const usage = result.response.usageMetadata
      console.log('[Gemini Client] Usage:', usage)

      const response = {
        content: text || '',
        usage: {
          input_tokens: usage?.promptTokenCount || 0,
          output_tokens: usage?.candidatesTokenCount || 0,
        },
        model: this.model,
      }
      console.log('[Gemini Client] Returning response:', response)
      return response
    } catch (error) {
      console.error('[Gemini Client] Error:', error)
      throw error
    }
  }

  /**
   * Analiza una imagen usando capacidades de visión de Gemini
   */
  async analyzeImage(
    base64Image: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<ClaudeResponse> {
    try {
      const model = this.client.getGenerativeModel({
        model: 'gemini-2.0-flash',
      })

      // Construir contenido con imagen
      type ContentPart = { text: string } | { inlineData: { data: string; mimeType: string } }
      type Content = { role: string; parts: ContentPart[] }

      const contents: Content[] = []

      if (systemPrompt) {
        contents.push({
          role: 'user',
          parts: [{ text: systemPrompt }]
        })
      }

      contents.push({
        role: 'user',
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg',
            },
          },
          { text: prompt }
        ]
      })

      const result = await model.generateContent({
        contents,
        generationConfig: {
          maxOutputTokens: 2000,
        },
      })

      const text = result.response.text()
      const usage = result.response.usageMetadata

      return {
        content: text || '',
        usage: {
          input_tokens: usage?.promptTokenCount || 0,
          output_tokens: usage?.candidatesTokenCount || 0,
        },
        model: this.model,
      }
    } catch (error) {
      console.error('[Gemini Client] Image analysis error:', error)
      throw error
    }
  }

  /**
   * Stream de chat para respuestas en tiempo real
   */
  async *chatStream(
    messages: ClaudeMessage[],
    systemPrompt?: string,
    maxTokens: number = 2000
  ): AsyncGenerator<string, void, unknown> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
      })

      const contents = this.buildGeminiContents(messages, systemPrompt)

      const result = await model.generateContentStream({
        contents,
        generationConfig: {
          maxOutputTokens: maxTokens,
        },
      })

      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) {
          yield text
        }
      }
    } catch (error) {
      console.error('[Gemini Client] Stream error:', error)
      throw error
    }
  }

  /**
   * Construye contenidos compatibles con Gemini desde mensajes Claude
   */
  private buildGeminiContents(messages: ClaudeMessage[], systemPrompt?: string): Array<{ role: string; parts: Array<{ text: string }> }> {
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = []

    // Agregar system prompt como primer mensaje si existe
    if (systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      })
    }

    // Agregar cada mensaje
    for (const msg of messages) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })
    }

    return contents
  }
}

// ============================================================================
// Factory function para obtener una instancia del cliente
// ============================================================================

let geminiClientInstance: GeminiClient | null = null

export function getGeminiClient(): GeminiClient {
  if (!geminiClientInstance) {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY environment variable is not set')
    }
    geminiClientInstance = new GeminiClient(apiKey)
  }
  return geminiClientInstance
}
