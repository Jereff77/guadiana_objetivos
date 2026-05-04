import { createClient } from 'supabase'
import { extractText } from './lib/extract-text.ts'
import { detectLinks } from './lib/detect-links.ts'
import { chunkText, Chunk } from './lib/chunker.ts'
import { generateEmbeddingsBatch } from './lib/embeddings.ts'
import { detectSimilarRelations } from './lib/similarity.ts'

interface ProcessRequest {
  documentId: string
}

Deno.serve(async (req) => {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { documentId }: ProcessRequest = await req.json()

    if (!documentId) {
      return new Response(
        JSON.stringify({ error: 'documentId es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validar GOOGLE_API_KEY early
    if (!Deno.env.get('GOOGLE_API_KEY')) {
      throw new Error('GOOGLE_API_KEY no configurada en Edge Function')
    }

    // Encolar el procesamiento en background ANTES de retornar
    EdgeRuntime.waitUntil(processDocument(documentId))

    // Responder inmediatamente con 202 Accepted
    return new Response(
      JSON.stringify({
        message: 'Processing started',
        documentId
      }),
      { status: 202, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error iniciando procesamiento:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Error desconocido'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Pipeline de procesamiento de documentos (9 pasos)
 */
async function processDocument(documentId: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // ============================================================
    // PASO 1: Cambiar processing_status a 'processing'
    // ============================================================
    console.log(`[PASO 1] Iniciando procesamiento del documento ${documentId}`)

    const { error: statusError } = await supabase
      .from('proc_documents')
      .update({ processing_status: 'processing' })
      .eq('id', documentId)

    if (statusError) throw new Error(`Error actualizando status a processing: ${statusError.message}`)

    // ============================================================
    // PASO 2: Descargar archivo desde bucket process-documents
    // ============================================================
    console.log(`[PASO 2] Descargando archivo desde Storage`)

    const { data: doc } = await supabase
      .from('proc_documents')
      .select('storage_path, file_type')
      .eq('id', documentId)
      .single()

    if (!doc) throw new Error('Documento no encontrado')

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('process-documents')
      .download(doc.storage_path)

    if (downloadError) throw new Error(`Error descargando archivo: ${downloadError.message}`)
    if (!fileData) throw new Error('Archivo vacío descargado')

    const buffer = await fileData.arrayBuffer()

    // ============================================================
    // PASO 3: Extraer texto plano y sanitizar
    // ============================================================
    console.log(`[PASO 3] Extrayendo texto (${buffer.length} bytes)`)

    const text = extractText(buffer)
    const wordCount = text.split(/\s+/).length

    console.log(`Texto extraído: ${text.length} caracteres, ~${wordCount} palabras`)

    // ============================================================
    // PASO 4: Detectar enlaces manuales [[...]]
    // ============================================================
    console.log(`[PASO 4] Detectando enlaces manuales`)

    const manualLinkIds = await detectLinks(text, supabase)
    console.log(`Enlaces manuales detectados: ${manualLinkIds.length}`)

    if (manualLinkIds.length > 0) {
      // Crear relaciones manuales
      const relations = manualLinkIds.map(targetId => ({
        source_doc_id: documentId,
        target_doc_id: targetId,
        relation_type: 'manual' as const
      }))

      const { error: relationsError } = await supabase
        .from('proc_document_relations')
        .insert(relations)

      if (relationsError) {
        console.error('Error creando relaciones manuales:', relationsError)
        // No fallamos el proceso si fallan los enlaces
      }
    }

    // ============================================================
    // PASO 5: Fragmentar texto en chunks
    // ============================================================
    console.log(`[PASO 5] Fragmentando en chunks`)

    const chunks = chunkText(text)
    console.log(`Chunks creados: ${chunks.length}`)

    if (chunks.length === 0) {
      throw new Error('No se pudo crear ningún chunk del texto')
    }

    // ============================================================
    // PASO 6: Vectorizar chunks con embeddings
    // ============================================================
    console.log(`[PASO 6] Generando embeddings para ${chunks.length} chunks`)

    const embeddings = await generateEmbeddingsBatch(chunks.map(c => c.content))
    console.log(`Embeddings generados: ${embeddings.length}`)

    if (embeddings.length !== chunks.length) {
      throw new Error(`Error: se generaron ${embeddings.length} embeddings para ${chunks.length} chunks`)
    }

    // Añadir embeddings a los chunks
    const chunksWithEmbeddings: (Chunk & { embedding: number[] })[] = chunks.map((chunk, i) => ({
      ...chunk,
      embedding: embeddings[i]
    }))

    // ============================================================
    // PASO 7: Guardar chunks en BD
    // ============================================================
    console.log(`[PASO 7] Guardando ${chunksWithEmbeddings.length} chunks en BD`)

    const chunksToInsert = chunksWithEmbeddings.map(chunk => ({
      document_id: documentId,
      chunk_index: chunk.chunk_index,
      content: chunk.content,
      embedding: JSON.stringify(chunk.embedding),
      token_count: chunk.token_count
    }))

    const { error: chunksError } = await supabase
      .from('proc_document_chunks')
      .insert(chunksToInsert)

    if (chunksError) {
      // Limpiar chunks parciales si falla la inserción
      await supabase.from('proc_document_chunks').delete().eq('document_id', documentId)
      throw new Error(`Error insertando chunks: ${chunksError.message}`)
    }

    // ============================================================
    // PASO 8: Detectar relaciones automáticas por similitud
    // ============================================================
    console.log(`[PASO 8] Detectando relaciones automáticas`)

    const autoRelations = await detectSimilarRelations(documentId, chunksWithEmbeddings, supabase)
    console.log(`Relaciones automáticas detectadas: ${autoRelations.length}`)

    if (autoRelations.length > 0) {
      // Verificar que no existan relaciones manuales entre los mismos documentos
      const { data: existingRelations } = await supabase
        .from('proc_document_relations')
        .select('target_doc_id')
        .eq('source_doc_id', documentId)
        .in('target_doc_id', autoRelations.map(r => r.target_doc_id))

      const existingTargetIds = new Set(existingRelations?.map(r => r.target_doc_id) || [])

      // Filtrar solo relaciones que no existen
      const newRelations = autoRelations.filter(r => !existingTargetIds.has(r.target_doc_id))

      if (newRelations.length > 0) {
        const relationsToInsert = newRelations.map(r => ({
          source_doc_id: documentId,
          target_doc_id: r.target_doc_id,
          relation_type: 'automatic' as const,
          similarity_score: r.similarity_score
        }))

        const { error: autoRelationsError } = await supabase
          .from('proc_document_relations')
          .insert(relationsToInsert)

        if (autoRelationsError) {
          console.error('Error creando relaciones automáticas:', autoRelationsError)
          // No fallamos el proceso si fallan las relaciones automáticas
        }
      }
    }

    // ============================================================
    // PASO 9: Actualizar word_count y processing_status a 'completed'
    // ============================================================
    console.log(`[PASO 9] Finalizando procesamiento`)

    const { error: finalError } = await supabase
      .from('proc_documents')
      .update({
        word_count: wordCount,
        processing_status: 'completed'
      })
      .eq('id', documentId)

    if (finalError) throw new Error(`Error finalizando documento: ${finalError.message}`)

    console.log(`✅ Documento ${documentId} procesado exitosamente`)

  } catch (error) {
    console.error(`❌ Error procesando documento ${documentId}:`, error)

    // Limpiar chunks parciales
    await supabase.from('proc_document_chunks').delete().eq('document_id', documentId)

    // Guardar error en processing_error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    await supabase
      .from('proc_documents')
      .update({
        processing_status: 'error',
        processing_error: errorMessage
      })
      .eq('id', documentId)

    console.log(`Documento ${documentId} marcado como error: ${errorMessage}`)
  }
}
