import { SupabaseClient } from 'supabase'
import { Chunk } from './chunker.ts'

export interface SimilarRelation {
  target_doc_id: string
  similarity_score: number
}

/**
 * Detecta relaciones automáticas entre documentos por similitud semántica
 * @param documentId ID del documento nuevo
 * @param chunks Chunks del documento nuevo (con embeddings)
 * @param supabase Cliente Supabase
 * @returns Lista de relaciones detectadas
 */
export async function detectSimilarRelations(
  documentId: string,
  chunks: Chunk[],
  supabase: SupabaseClient
): Promise<SimilarRelation[]> {
  if (chunks.length === 0) return []

  // Obtener embeddings de los chunks
  const chunkEmbeddings = chunks.map(c => c.embedding).filter((e): e is number[] => e !== undefined)

  if (chunkEmbeddings.length === 0) {
    console.log('No hay embeddings para detectar similitudes')
    return []
  }

  // Agrupar similitudes por documento target
  const docSimilarities = new Map<string, number[]>()

  for (const embedding of chunkEmbeddings) {
    // Buscar top 5 chunks más similares de OTROS documentos
    const { data: matches, error } = await supabase.rpc('proc_match_chunks', {
      p_embedding: JSON.stringify(embedding),
      p_exclude_document_id: documentId,
      p_match_count: 5,
      p_min_similarity: 0.5
    })

    if (error) {
      console.error('Error buscando chunks similares:', error)
      continue
    }

    if (!matches || matches.length === 0) continue

    // Agrupar por documento
    for (const match of matches) {
      const docId = match.document_id
      const similarity = match.similarity

      if (!docSimilarities.has(docId)) {
        docSimilarities.set(docId, [])
      }
      docSimilarities.get(docId)!.push(similarity)
    }
  }

  // Calcular promedio de similitud por documento
  const relations: SimilarRelation[] = []

  for (const [docId, similarities] of docSimilarities.entries()) {
    const avgSimilarity = similarities.reduce((sum, s) => sum + s, 0) / similarities.length

    if (avgSimilarity > 0.75) {
      relations.push({
        target_doc_id: docId,
        similarity_score: avgSimilarity
      })
    }
  }

  return relations
}
