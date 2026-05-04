/**
 * Cliente Google Generative AI - Text Embeddings
 * Usa API REST directamente (SIN SDK) para compatibilidad con Deno
 */

interface GoogleEmbeddingResponse {
  embedding: {
    values: number[]
  }
}

interface GoogleErrorResponse {
  error: {
    code: number
    message: string
    status: string
  }
}

/**
 * Genera embedding para un texto usando Google gemini-embedding-001
 * @param text Texto a vectorizar
 * @returns Array de 768 dimensiones
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY')

  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY no configurada en Edge Function')
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`

  const body = {
    model: 'models/gemini-embedding-001',
    content: {
      parts: [{ text }]
    },
    outputDimensionality: 768
  }

  // Retry con backoff exponencial: 1s, 2s, 4s
  const maxRetries = 3
  const delays = [1000, 2000, 4000]

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData: GoogleErrorResponse = await response.json()
        throw new Error(`Google API error ${response.status}: ${errorData.error?.message || response.statusText}`)
      }

      const data: GoogleEmbeddingResponse = await response.json()

      if (!data.embedding?.values) {
        throw new Error('Respuesta inválida de Google API: no se encontró embedding.values')
      }

      const values = data.embedding.values
      if (values.length !== 768) {
        throw new Error(`Embedding inválido: se esperaban 768 dimensiones, se obtuvieron ${values.length}`)
      }

      return values
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout al llamar Google API (30s)')
      }

      if (attempt === maxRetries - 1) {
        throw error // Re-lanzar en el último intento
      }

      console.warn(`Intento ${attempt + 1} falló, reintentando en ${delays[attempt]}ms...`, error)
      await new Promise(resolve => setTimeout(resolve, delays[attempt]))
    }
  }

  throw new Error('No se pudo generar embedding después de 3 intentos')
}

/**
 * Genera embeddings en batch para múltiples textos
 * @param texts Array de textos a vectorizar
 * @returns Matriz de embeddings (textos × 768)
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = []

  for (let i = 0; i < texts.length; i++) {
    console.log(`Generando embedding ${i + 1}/${texts.length}...`)
    const embedding = await generateEmbedding(texts[i])
    embeddings.push(embedding)
  }

  return embeddings
}
