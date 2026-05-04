/**
 * Estima tokens basado en longitud de texto
 * Aproximación: ~4 caracteres = 1 token (válido para español)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export interface Chunk {
  chunk_index: number
  content: string
  token_count: number
}

/**
 * Fragmenta texto en chunks de ~500 tokens con overlap de 50 tokens
 * Split inteligente: párrafos → oraciones → tamaño fijo
 */
export function chunkText(text: string): Chunk[] {
  const TARGET_TOKENS = 500
  const OVERLAP_TOKENS = 50
  const chunks: Chunk[] = []

  // Paso 1: Dividir por párrafos (dobles saltos de línea)
  let paragraphs = text.split(/\n\n+/)

  let currentIndex = 0
  let currentChunk = ''
  let currentTokens = 0

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph)

    // Si el párrafo es muy corto, agregar al chunk actual
    if (paragraphTokens < TARGET_TOKENS / 2 && currentTokens + paragraphTokens < TARGET_TOKENS) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph
      currentTokens += paragraphTokens
      continue
    }

    // Si el párrafo es muy largo, dividir por oraciones
    if (paragraphTokens > TARGET_TOKENS) {
      const sentences = paragraph.split(/(?<=[.!?])\s+/)

      for (const sentence of sentences) {
        const sentenceTokens = estimateTokens(sentence)

        if (currentTokens + sentenceTokens > TARGET_TOKENS && currentChunk) {
          // Guardar chunk actual
          chunks.push({
            chunk_index: currentIndex++,
            content: currentChunk.trim(),
            token_count: currentTokens
          })

          // Overlap: mantener últimos OVERLAP_TOKENS del chunk anterior
          const overlapChars = OVERLAP_TOKENS * 4
          const lastPart = currentChunk.slice(-overlapChars)
          currentChunk = lastPart + '\n\n' + sentence
          currentTokens = estimateTokens(currentChunk)
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence
          currentTokens += sentenceTokens
        }
      }
    } else {
      // Párrafo mediano, guardar chunk actual y empezar nuevo
      if (currentChunk) {
        chunks.push({
          chunk_index: currentIndex++,
          content: currentChunk.trim(),
          token_count: currentTokens
        })
      }
      currentChunk = paragraph
      currentTokens = paragraphTokens
    }
  }

  // Guardar último chunk
  if (currentChunk) {
    chunks.push({
      chunk_index: currentIndex,
      content: currentChunk.trim(),
      token_count: currentTokens
    })
  }

  return chunks
}
