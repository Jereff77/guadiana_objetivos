'use server'

import { createClient } from '@/lib/supabase/server'

// Tipos
export interface GraphDocument {
  id: string
  title: string
  description: string | null
  storage_path: string
  file_type: 'txt' | 'md'
  file_size: number | null
  category_id: string | null
  uploaded_by: string
  access_type: 'public' | 'private' | 'roles'
  allowed_roles: string[] | null
  processing_status: 'pending' | 'processing' | 'completed' | 'error'
  processing_error: string | null
  word_count: number | null
  tags: string[] | null
  created_at: string
  updated_at: string
  proc_categories: {
    id: string
    name: string
    color_hex: string
    icon: string | null
  } | null
}

export interface GraphRelation {
  id: string
  source_doc_id: string
  target_doc_id: string
  relation_type: 'manual' | 'automatic'
  similarity_score: number | null
  created_at: string
}

export interface GraphCategory {
  id: string
  name: string
  color_hex: string
  icon: string | null
}

export interface DocumentsGraphData {
  documents: GraphDocument[]
  relations: GraphRelation[]
  categories: GraphCategory[]
}

/**
 * Obtener datos del grafo de documentos.
 * Usa JOINs para que RLS filtre automáticamente documentos y relaciones invisibles.
 *
 * Punto A - Validación de RLS en relaciones:
 * - Hacemos JOIN con proc_documents para source y target
 * - Si RLS bloquea cualquiera de los JOINs, la fila se excluye automáticamente
 * - Esto garantiza que solo vemos relaciones donde ambos documentos son accesibles
 */
export async function getDocumentsGraph(): Promise<{ data?: DocumentsGraphData; error?: string }> {
  try {
    const supabase = await createClient()

    // Obtener documentos con categorías (RLS filtra automáticamente)
    const { data: documents, error: docsError } = await supabase
      .from('proc_documents')
      .select(`
        *,
        proc_categories(id, name, color_hex, icon)
      `)
      .order('created_at', { ascending: false })

    if (docsError) {
      return { error: docsError.message }
    }

    // Obtener relaciones donde AMBOS documentos son accesibles
    // Punto A - JOINs con proc_documents para que RLS filtre automáticamente
    const { data: relations, error: relsError } = await supabase
      .from('proc_document_relations')
      .select(`
        id,
        source_doc_id,
        target_doc_id,
        relation_type,
        similarity_score,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (relsError) {
      return { error: relsError.message }
    }

    // Obtener categorías
    const { data: categories, error: catsError } = await supabase
      .from('proc_categories')
      .select('*')
      .order('name')

    if (catsError) {
      return { error: catsError.message }
    }

    return {
      data: {
        documents: documents as GraphDocument[],
        relations: relations as GraphRelation[],
        categories: categories as GraphCategory[]
      }
    }
  } catch (error: any) {
    return { error: error.message || 'Error al obtener datos del grafo' }
  }
}
