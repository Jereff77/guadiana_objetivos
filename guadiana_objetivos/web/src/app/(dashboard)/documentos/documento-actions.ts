'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { invokeDocumentProcessor } from './process-actions'

// Tipos
export interface Document {
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
  proc_categories?: {
    id: string
    name: string
    color_hex: string
    icon: string | null
  } | null
  profiles?: {
    id: string
    full_name: string | null
  } | null
}

export interface Category {
  id: string
  name: string
  color_hex: string
  icon: string | null
}

export interface UploadDocumentData {
  title: string
  description?: string
  file: File
  category_id?: string
  access_type: 'public' | 'private' | 'roles'
  allowed_roles?: string[]
  tags?: string[]
}

/**
 * Listar documentos (filtra por RLS automáticamente)
 */
export async function getDocuments(): Promise<{ data?: Document[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('proc_documents')
      .select(`
        *,
        proc_categories(id, name, color_hex, icon),
        profiles(id, full_name)
      `)
      .order('created_at', { ascending: false })

    if (error) return { error: error.message }

    return { data: data as Document[] }
  } catch (error: any) {
    return { error: error.message || 'Error al listar documentos' }
  }
}

/**
 * Subir documento a Storage y crear registro en BD
 */
export async function uploadDocument(formData: UploadDocumentData): Promise<{ data?: Document; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'No autenticado' }
    }

    // Validar permisos ANTES de procesar el archivo
    const { data: canUpload } = await supabase.rpc('has_permission', {
      permission_key: 'documentos.upload'
    })
    const { data: isRootUser } = await supabase.rpc('is_root')

    if (!canUpload && !isRootUser) {
      return { error: 'No tienes permiso para subir documentos' }
    }

    // Validar archivo
    const { file, title, description, category_id, access_type, allowed_roles, tags } = formData

    if (!file) {
      return { error: 'No se proporcionó archivo' }
    }

    // Validar tipo de archivo por extensión
    const fileExtension = file.name.toLowerCase()
    if (!fileExtension.endsWith('.txt') && !fileExtension.endsWith('.md')) {
      return { error: 'Solo se permiten archivos .txt y .md' }
    }

    // Validar tamaño (10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return { error: 'El archivo excede los 10MB' }
    }

    // Generar nombre único de archivo (el nombre ya tiene la extensión, no duplicarla)
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${user.id}/${Date.now()}-${sanitizedName}`
    const contentType = sanitizedName.toLowerCase().endsWith('.md') ? 'text/markdown' : 'text/plain'
    const fileTypeForDB = sanitizedName.toLowerCase().endsWith('.md') ? 'md' : 'txt'

    // Subir a Storage con content-type explícito
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('process-documents')
      .upload(fileName, file, {
        contentType: contentType,
        upsert: false
      })

    if (uploadError) {
      return { error: `Error al subir archivo: ${uploadError.message}` }
    }

    // Crear registro en BD usando RPC proc_create_document (SECURITY DEFINER)
    const { data: docData, error: docError } = await supabase.rpc('proc_create_document', {
      p_title: title,
      p_description: description || null,
      p_storage_path: fileName,
      p_file_type: fileTypeForDB,
      p_file_size: file.size,
      p_category_id: category_id || null,
      p_access_type: access_type,
      p_allowed_roles: access_type === 'roles' ? (allowed_roles || []) : [],
      p_tags: tags || []
    })

    if (docError) {
      // Si falla la inserción, eliminar archivo de Storage
      await supabase.storage.from('process-documents').remove(fileName)
      return { error: docError.message }
    }

    revalidatePath('/documentos')

    // Invocar procesador de documentos (fire and forget)
    await invokeDocumentProcessor((docData as any).id)

    return { data: docData as Document }
  } catch (error: any) {
    return { error: error.message || 'Error al subir documento' }
  }
}

/**
 * Eliminar documento (Storage + BD)
 */
export async function deleteDocument(documentId: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()

    // Obtener documento para saber el storage_path
    const { data: doc, error: fetchError } = await supabase
      .from('proc_documents')
      .select('storage_path')
      .eq('id', documentId)
      .single()

    if (fetchError || !doc) {
      return { error: 'Documento no encontrado' }
    }

    // Eliminar de BD
    const { error: deleteError } = await supabase
      .from('proc_documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      return { error: deleteError.message }
    }

    // Eliminar de Storage
    const { error: storageError } = await supabase.storage
      .from('process-documents')
      .remove(doc.storage_path)

    if (storageError) {
      console.error('Error al eliminar archivo de Storage:', storageError)
      // No fallamos el proceso si falla la eliminación del archivo
    }

    revalidatePath('/documentos')

    return {}
  } catch (error: any) {
    return { error: error.message || 'Error al eliminar documento' }
  }
}

/**
 * Actualizar metadata de documento
 */
export async function updateDocument(
  documentId: string,
  data: Partial<Pick<Document, 'title' | 'description' | 'category_id' | 'access_type' | 'allowed_roles' | 'tags'>>
): Promise<{ data?: Document; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: docData, error } = await supabase
      .from('proc_documents')
      .update(data)
      .eq('id', documentId)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/documentos')

    return { data: docData as Document }
  } catch (error: any) {
    return { error: error.message || 'Error al actualizar documento' }
  }
}

/**
 * Listar categorías
 */
export async function getCategories(): Promise<{ data?: Category[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('proc_categories')
      .select('*')
      .order('name')

    if (error) {
      return { error: error.message }
    }

    return { data: data as Category[] }
  } catch (error: any) {
    return { error: error.message || 'Error al listar categorías' }
  }
}

/**
 * Crear categoría
 */
export async function createCategory(
  name: string,
  colorHex: string = '#6366f1',
  icon?: string
): Promise<{ data?: Category; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('proc_categories')
      .insert({
        name,
        color_hex: colorHex,
        icon: icon || null
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/documentos')

    return { data: data as Category }
  } catch (error: any) {
    return { error: error.message || 'Error al crear categoría' }
  }
}

/**
 * Listar roles permitidos para selector
 */
export async function getAllowedRoles(): Promise<{ data?: Array<{ id: string; name: string }>; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('roles')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (error) {
      return { error: error.message }
    }

    return { data: data as Array<{ id: string; name: string }> }
  } catch (error: any) {
    return { error: error.message || 'Error al listar roles' }
  }
}

/**
 * Tipos para relaciones
 */
export interface DocumentRelation {
  id: string
  source_doc_id: string
  target_doc_id: string
  relation_type: 'manual' | 'automatic'
  similarity_score: number | null
  created_at: string
  // Datos del documento relacionado
  related_document?: {
    id: string
    title: string
    file_type: 'txt' | 'md'
  }
}

/**
 * Tipo de respuesta para getDocumentById
 */
export interface DocumentWithContent extends Document {
  content: string // Contenido del archivo descargado server-side
  relations_outgoing: DocumentRelation[] // Relaciones donde este doc es source
  relations_incoming: DocumentRelation[] // Relaciones donde este doc es target
}

/**
 * Obtener documento por ID con contenido y relaciones.
 * Punto C - Validaciones y descarga server-side:
 * - Validar que el documento exista antes de generar signed URL
 * - Si el archivo no existe en Storage, retornar error claro
 * - Descargar contenido server-side con signed URL (válido 1 hora)
 * - NO exponer storage_path al cliente
 */
export async function getDocumentById(documentId: string): Promise<{ data?: DocumentWithContent; error?: string }> {
  try {
    const supabase = await createClient()

    // 1. Obtener documento con categoría y uploader (RLS valida acceso automáticamente)
    const { data: doc, error: docError } = await supabase
      .from('proc_documents')
      .select(`
        *,
        proc_categories(id, name, color_hex, icon),
        profiles(id, full_name)
      `)
      .eq('id', documentId)
      .single()

    if (docError || !doc) {
      return { error: 'Documento no encontrado o sin acceso' }
    }

    // 2. Validar que el documento exista (doble check)
    if (!doc.storage_path) {
      return { error: 'Documento sin storage_path válido' }
    }

    // 3. Generar signed URL válida por 1 hora
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('process-documents')
      .createSignedUrl(doc.storage_path, 3600) // 1 hora

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('Error al generar signed URL:', signedUrlError)
      return { error: 'Error al acceder al archivo del documento' }
    }

    // 4. Descargar contenido server-side
    const response = await fetch(signedUrlData.signedUrl)
    if (!response.ok) {
      console.error('Error al descargar archivo:', response.status, response.statusText)
      return { error: 'Error al descargar el contenido del documento' }
    }

    const content = await response.text()

    // 5. Obtener relaciones donde este documento es source (enlaza a otros)
    const { data: relsOut, error: relsOutError } = await supabase
      .from('proc_document_relations')
      .select(`
        id,
        source_doc_id,
        target_doc_id,
        relation_type,
        similarity_score,
        created_at,
        target_doc:id (
          id,
          title,
          file_type
        )
      `)
      .eq('source_doc_id', documentId)

    if (relsOutError) {
      console.error('Error al obtener relaciones salientes:', relsOutError)
    }

    // 6. Obtener relaciones donde este documento es target (enlazado desde otros)
    const { data: relsIn, error: relsInError } = await supabase
      .from('proc_document_relations')
      .select(`
        id,
        source_doc_id,
        target_doc_id,
        relation_type,
        similarity_score,
        created_at,
        source_doc:id (
          id,
          title,
          file_type
        )
      `)
      .eq('target_doc_id', documentId)

    if (relsInError) {
      console.error('Error al obtener relaciones entrantes:', relsInError)
    }

    // Normalizar relaciones para que tengan estructura consistente
    const relations_outgoing = (relsOut || []).map((rel: any) => ({
      ...rel,
      related_document: rel.target_doc
    }))
    const relations_incoming = (relsIn || []).map((rel: any) => ({
      ...rel,
      related_document: rel.source_doc
    }))

    return {
      data: {
        ...doc as Document,
        content, // Contenido descargado server-side
        relations_outgoing: relations_outgoing as DocumentRelation[],
        relations_incoming: relations_incoming as DocumentRelation[]
      }
    }
  } catch (error: any) {
    console.error('Error en getDocumentById:', error)
    return { error: error.message || 'Error al obtener documento' }
  }
}

/**
 * Reintentar procesamiento de un documento en estado error
 */
export async function retryDocument(documentId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Validar permisos
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'No autenticado' }
    }

    const { data: canUpload } = await supabase.rpc('has_permission', {
      permission_key: 'documentos.upload'
    })
    const { data: canManage } = await supabase.rpc('has_permission', {
      permission_key: 'documentos.manage'
    })
    const { data: isRootUser } = await supabase.rpc('is_root')

    if (!canUpload && !canManage && !isRootUser) {
      return { error: 'No tienes permiso para reintentar el procesamiento' }
    }

    // Verificar que el documento existe y está en estado error
    const { data: doc, error: fetchError } = await supabase
      .from('proc_documents')
      .select('id, processing_status')
      .eq('id', documentId)
      .single()

    if (fetchError || !doc) {
      return { error: 'Documento no encontrado' }
    }

    if (doc.processing_status !== 'error') {
      return { error: 'Documento no está en estado error' }
    }

    const admin = createAdminClient()

    // Limpiar chunks huérfanos
    const { error: chunksError } = await admin
      .from('proc_document_chunks')
      .delete()
      .eq('document_id', documentId)

    if (chunksError) {
      console.error('Error limpiando chunks:', chunksError)
      return { error: 'Error al limpiar chunks del documento' }
    }

    // Limpiar relaciones
    const { error: relsError } = await admin
      .from('proc_document_relations')
      .delete()
      .or(`source_doc_id.eq.${documentId},target_doc_id.eq.${documentId}`)

    if (relsError) {
      console.error('Error limpiando relaciones:', relsError)
      return { error: 'Error al limpiar relaciones del documento' }
    }

    // Resetear estado del documento
    const { error: resetError } = await supabase
      .from('proc_documents')
      .update({
        processing_status: 'pending',
        processing_error: null
      })
      .eq('id', documentId)

    if (resetError) {
      return { error: resetError.message }
    }

    // Invocar Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return { error: 'Configuración de Supabase incompleta' }
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/process-document`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ documentId })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      return {
        error: `Error invocando procesador (${response.status}): ${errorData.error || response.statusText}`
      }
    }

    revalidatePath('/documentos')

    return { success: true }

  } catch (error: any) {
    console.error('Error en retryDocument:', error)
    return { error: error.message || 'Error al reintentar procesamiento' }
  }
}

/**
 * Actualizar el contenido de un documento (reemplaza archivo en Storage y re-procesa)
 */
export async function updateDocumentContent(documentId: string, content: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Validar permisos
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'No autenticado' }
    }

    const { data: canUpload } = await supabase.rpc('has_permission', {
      permission_key: 'documentos.upload'
    })
    const { data: canManage } = await supabase.rpc('has_permission', {
      permission_key: 'documentos.manage'
    })
    const { data: isRootUser } = await supabase.rpc('is_root')

    if (!canUpload && !canManage && !isRootUser) {
      return { error: 'No tienes permiso para editar documentos' }
    }

    // Obtener documento actual para storage_path y file_type
    const { data: doc, error: fetchError } = await supabase
      .from('proc_documents')
      .select('id, storage_path, file_type')
      .eq('id', documentId)
      .single()

    if (fetchError || !doc) {
      return { error: 'Documento no encontrado' }
    }

    // Convertir contenido a Blob con contentType correcto
    const contentType = doc.file_type === 'md' ? 'text/markdown' : 'text/plain'
    const blob = new Blob([content], { type: contentType })

    // Reemplazar archivo en Storage con upsert: true
    const { error: uploadError } = await supabase.storage
      .from('process-documents')
      .upload(doc.storage_path, blob, {
        contentType,
        upsert: true
      })

    if (uploadError) {
      return { error: `Error al guardar archivo: ${uploadError.message}` }
    }

    const admin = createAdminClient()

    // Limpiar chunks huérfanos
    const { error: chunksError } = await admin
      .from('proc_document_chunks')
      .delete()
      .eq('document_id', documentId)

    if (chunksError) {
      console.error('Error limpiando chunks:', chunksError)
    }

    // Limpiar relaciones
    const { error: relsError } = await admin
      .from('proc_document_relations')
      .delete()
      .or(`source_doc_id.eq.${documentId},target_doc_id.eq.${documentId}`)

    if (relsError) {
      console.error('Error limpiando relaciones:', relsError)
    }

    // Resetear estado del documento
    const { error: resetError } = await supabase
      .from('proc_documents')
      .update({
        processing_status: 'pending',
        processing_error: null
      })
      .eq('id', documentId)

    if (resetError) {
      return { error: resetError.message }
    }

    // Invocar Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return { error: 'Configuración de Supabase incompleta' }
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/process-document`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ documentId })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      return {
        success: true,
        error: `Archivo guardado pero el procesador no se invocó (${response.status}): ${errorData.error || response.statusText}`
      }
    }

    revalidatePath('/documentos')

    return { success: true }

  } catch (error: any) {
    console.error('Error en updateDocumentContent:', error)
    return { error: error.message || 'Error al actualizar contenido del documento' }
  }
}
