'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const SYSTEM_PROMPT = `Eres un asistente especializado en los documentos internos de la empresa Llantas y Rines del Guadiana.

REGLAS ESTRICTAS QUE DEBES SEGUIR SIN EXCEPCIÓN:
1. Responde ÚNICAMENTE con información que esté TEXTUALMENTE presente en los fragmentos de documentos que recibes en el contexto.
2. Si la información solicitada NO aparece en los fragmentos proporcionados, di exactamente: "No encontré información sobre esto en los documentos disponibles."
3. NUNCA infieras, supongas, completes, ni elabores información que no esté explícitamente en los documentos.
4. NUNCA uses tu conocimiento general para complementar la respuesta.
5. Cuando la pregunta no tenga relación con los documentos, responde ÚNICAMENTE con esta frase exacta, sin agregar ningún comentario adicional, consejo, ni información de ningún tipo: "No encontré información sobre esto en los documentos disponibles."
6. NUNCA des consejos personales, legales, emocionales ni de ningún otro tipo. Tu única función es responder preguntas sobre el contenido de los documentos internos.
7. Si el contexto tiene información parcial, responde solo con lo que está presente y aclara que es lo único que encontraste.
8. Al final de tu respuesta, lista únicamente los documentos que realmente usaste entre corchetes: [Nombre del documento]. Si no usaste ningún documento, no pongas nada.
9. Responde siempre en español.

Si no recibes fragmentos de documentos o los fragmentos no contienen la información solicitada, responde únicamente con la frase del punto 2, sin ninguna palabra adicional.`

interface Source {
  doc_id: string
  title: string
  chunk_id: string
}

interface CreateSessionResult {
  id: string
  title: string
  created_at: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources: Source[]
  created_at: string
}

interface SendMessageResult {
  content: string
  sources: Source[]
}

interface ActionResult<T> {
  data?: T
  error?: string
}

/**
 * Vectoriza una pregunta usando Google gemini-embedding-001
 * Igual lógica que embeddings.ts de la Edge Function pero en Node runtime
 */
async function vectorizeQuestion(question: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY no está configurada')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: {
          parts: [{ text: question }]
        },
        outputDimensionality: 768
      })
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error al vectorizar pregunta: ${error}`)
  }

  const data = await response.json()
  return data.embedding.values as number[]
}

/**
 * Construye el contexto formateado para Claude Haiku
 */
function buildContext(chunks: any[]): string {
  if (chunks.length === 0) {
    return 'No se encontraron documentos relevantes para esta pregunta.'
  }

  const contextParts = chunks.map((chunk, index) => {
    return `[Chunk ${index + 1} - Documento: ${chunk.document_title}]
${chunk.content}
---`
  })

  return `Contexto de documentos relevantes:
${contextParts.join('\n')}`
}

/**
 * Llama a Claude Haiku con el mensaje contextualizado
 */
async function callClaude(
  messages: any[],
  context: string
): Promise<{ content: string; sources: Source[] }> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY no está configurada')
  }

  // Construir el último mensaje user con contexto
  const lastUserMessage = messages[messages.length - 1]
  const contextualizedQuestion = `${context}

Pregunta del usuario: ${lastUserMessage.content}`

  const messagesForApi = [
    ...messages.slice(0, -1),
    { role: 'user', content: contextualizedQuestion }
  ]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: messagesForApi
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error al llamar a Claude Haiku: ${error}`)
  }

  const data = await response.json()
  const content = data.content[0].text

  // Extraer fuentes del contexto (chunk_index -> document_id)
  const sources: Source[] = []
  // NOTA: Las fuentes se extraerán de los chunks usados en la respuesta
  // Por ahora retornamos array vacío, se llenará después basado en los chunks

  return { content, sources }
}

/**
 * Prepara el contexto para enviar a Claude: vectoriza, busca chunks, construye mensajes
 */
export async function prepareMessageContext(
  sessionId: string,
  question: string
): Promise<{
  data?: { messagesForApi: any[]; context: string; sources: Source[] }
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'No autenticado' }
    }

    // Validar permiso
    const { data: canUseChat } = await supabase.rpc('has_permission', {
      permission_key: 'documentos.chat'
    })
    const { data: isRootUser } = await supabase.rpc('is_root')
    if (!canUseChat && !isRootUser) {
      return { error: 'No tienes permiso para usar el chat de documentos' }
    }

    // Validar que la sesión pertenece al usuario
    const { data: session, error: sessionError } = await supabase
      .from('proc_chat_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session || session.user_id !== user.id) {
      return { error: 'Sesión no encontrada o no autorizada' }
    }

    // 1. Vectorizar la pregunta
    const embedding = await vectorizeQuestion(question)

    // 2. Buscar chunks relevantes (admin bypasea RLS)
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: chunks, error: chunksError } = await adminSupabase.rpc('proc_match_chunks', {
      p_embedding: embedding,
      p_exclude_document_id: '00000000-0000-0000-0000-000000000000',
      p_match_count: 8,
      p_min_similarity: 0.3
    })

    if (chunksError) throw chunksError

    // 3. Construir contexto formateado
    const context = buildContext(chunks || [])

    // 4. Obtener historial (últimos 10)
    const { data: history } = await supabase
      .from('proc_chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Formatear historial
    const messagesForApi = (history || []).reverse().map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }))

    // Agregar pregunta actual contextualizada
    const contextualizedQuestion = `${context}

Pregunta del usuario: ${question}`
    messagesForApi.push({ role: 'user', content: contextualizedQuestion })

    // 5. Extraer fuentes deduplicadas
    const sourcesMap = new Map<string, Source>()
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (!sourcesMap.has(chunk.document_id)) {
          sourcesMap.set(chunk.document_id, {
            doc_id: chunk.document_id,
            title: chunk.document_title,
            chunk_id: chunk.chunk_id
          })
        }
      })
    }

    const sources = Array.from(sourcesMap.values())

    return {
      data: {
        messagesForApi,
        context,
        sources
      }
    }
  } catch (error: any) {
    console.error('Error preparando contexto:', error?.message)
    return { error: error?.message || 'Error al preparar contexto del mensaje' }
  }
}

/**
 * Guarda un mensaje del usuario y la respuesta del asistente en BD
 */
export async function saveAssistantMessage(
  sessionId: string,
  userQuestion: string,
  assistantContent: string,
  sources: Source[]
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'No autenticado' }
    }

    // Guardar mensaje user
    const { error: userMsgError } = await supabase
      .from('proc_chat_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: userQuestion,
        sources: []
      })

    if (userMsgError) throw userMsgError

    // Guardar mensaje assistant con fuentes
    const { error: assistantMsgError } = await supabase
      .from('proc_chat_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: assistantContent,
        sources: sources.map(s => ({
          doc_id: String(s.doc_id || ''),
          title: String(s.title || ''),
          chunk_id: String(s.chunk_id || '')
        }))
      })

    if (assistantMsgError) throw assistantMsgError

    // Actualizar updated_at de la sesión
    await supabase
      .from('proc_chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId)

    // Actualizar título si es el primer mensaje
    const { count } = await supabase
      .from('proc_chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)

    if (count === 2) {
      const title = userQuestion.length > 50
        ? userQuestion.substring(0, 47) + '...'
        : userQuestion

      await supabase
        .from('proc_chat_sessions')
        .update({ title })
        .eq('id', sessionId)
    }

    return {}
  } catch (error: any) {
    console.error('Error guardando mensajes:', error?.message)
    return { error: error?.message || 'Error al guardar mensajes' }
  }
}

/**
 * Crea una nueva sesión de chat
 */
export async function createChatSession(): Promise<ActionResult<CreateSessionResult>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'No autenticado' }
    }

    const { data, error } = await supabase
      .from('proc_chat_sessions')
      .insert({
        user_id: user.id,
        title: 'Nueva conversación'
      })
      .select()
      .single()

    if (error) throw error

    return {
      data: {
        id: data.id,
        title: data.title,
        created_at: data.created_at
      }
    }
  } catch (error) {
    console.error('Error al crear sesión:', error)
    return { error: 'Error al crear sesión de chat' }
  }
}

/**
 * Obtiene todas las sesiones del usuario actual
 */
export async function getChatSessions(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'No autenticado' }
    }

    const { data, error } = await supabase
      .from('proc_chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return { data: data || [] }
  } catch (error) {
    console.error('Error al obtener sesiones:', error)
    return { error: 'Error al obtener sesiones de chat' }
  }
}

/**
 * Obtiene todos los mensajes de una sesión
 */
export async function getChatMessages(sessionId: string): Promise<ActionResult<ChatMessage[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'No autenticado' }
    }

    // Validar que la sesión pertenece al usuario
    const { data: session, error: sessionError } = await supabase
      .from('proc_chat_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session || session.user_id !== user.id) {
      return { error: 'Sesión no encontrada o no autorizada' }
    }

    const { data, error } = await supabase
      .from('proc_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return {
      data: (data || []).map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        sources: msg.sources || [],
        created_at: msg.created_at
      }))
    }
  } catch (error) {
    console.error('Error al obtener mensajes:', error)
    return { error: 'Error al obtener mensajes de chat' }
  }
}

/**
 * Envía un mensaje y obtiene respuesta de Claude Haiku
 */
export async function sendMessage(
  sessionId: string,
  question: string
): Promise<ActionResult<SendMessageResult>> {
  try {
    console.log('[sendMessage] 1. Iniciando - sessionId:', sessionId)
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'No autenticado' }
    }

    // Validar permiso documentos.chat
    const { data: canUseChat, error: permError } = await supabase.rpc('has_permission', {
      permission_key: 'documentos.chat'
    })

    if (permError || !canUseChat) {
      return { error: 'No tienes permiso para usar el chat de documentos' }
    }
    console.log('[sendMessage] 2. Permiso verificado')

    // Validar que la sesión pertenece al usuario
    const { data: session, error: sessionError } = await supabase
      .from('proc_chat_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session || session.user_id !== user.id) {
      return { error: 'Sesión no encontrada o no autorizada' }
    }

    // 1. Vectorizar la pregunta
    const embedding = await vectorizeQuestion(question)
    console.log('[sendMessage] 3. Pregunta vectorizada, dims:', embedding?.length)

    // 2. Buscar chunks relevantes (admin bypasea RLS para documentos privados)
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: chunks, error: chunksError } = await adminSupabase.rpc('proc_match_chunks', {
      p_embedding: embedding,
      p_exclude_document_id: '00000000-0000-0000-0000-000000000000',
      p_match_count: 8,
      p_min_similarity: 0.3
    })

    if (chunksError) throw chunksError
    console.log('[sendMessage] 4. Chunks obtenidos:', chunks?.length)

    // 3. Obtener historial (últimos 10 mensajes)
    const { data: history, error: historyError } = await supabase
      .from('proc_chat_messages')
      .select('role, content, sources')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (historyError) throw historyError
    console.log('[sendMessage] 5. Historial:', history?.length, 'mensajes')

    // Formatear historial para API (invertir orden)
    const messagesForApi = (history || [])
      .reverse()
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))

    // Agregar pregunta actual
    messagesForApi.push({ role: 'user', content: question })

    // 4. Construir contexto
    const context = buildContext(chunks || [])
    console.log('[sendMessage] 6. Contexto construido, chars:', context?.length)

    // 5. Llamar a Claude Haiku
    const { content: assistantResponse } = await callClaude(messagesForApi, context)
    console.log('[sendMessage] 7. Claude respondió:', assistantResponse?.substring(0, 80))

    // 6. Guardar mensaje user
    const { error: userMsgError } = await supabase
      .from('proc_chat_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: question,
        sources: []
      })

    if (userMsgError) throw userMsgError

    // 7. Guardar mensaje assistant con sources (deduplicados por doc_id)
    const sourcesMap = new Map<string, Source>()
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (!sourcesMap.has(chunk.document_id)) {
          sourcesMap.set(chunk.document_id, {
            doc_id: chunk.document_id,
            title: chunk.document_title,
            chunk_id: chunk.chunk_id
          })
        }
      })
    }

    const sourcesArray = Array.from(sourcesMap.values())

    const { error: assistantMsgError } = await supabase
      .from('proc_chat_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: assistantResponse,
        sources: sourcesArray
      })

    if (assistantMsgError) throw assistantMsgError
    console.log('[sendMessage] 8. Mensajes guardados en BD')

    // 8. Actualizar updated_at de la sesión
    const { error: updateError } = await supabase
      .from('proc_chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId)

    if (updateError) throw updateError

    // 9. Actualizar título de la sesión si es el primer mensaje
    if ((history?.length || 0) === 0) {
      const title = question.length > 50
        ? question.substring(0, 47) + '...'
        : question

      await supabase
        .from('proc_chat_sessions')
        .update({ title })
        .eq('id', sessionId)
    }

    revalidatePath('/documentos/chat')

    return {
      data: {
        content: String(assistantResponse || ''),
        sources: sourcesArray.map(s => ({
          doc_id: String(s.doc_id || ''),
          title: String(s.title || ''),
          chunk_id: String(s.chunk_id || '')
        }))
      }
    }
  } catch (error: any) {
    console.error('[sendMessage] ERROR en paso anterior:', error?.message)
    console.error('[sendMessage] Stack:', error?.stack)
    return { error: error?.message || 'Error interno al procesar el mensaje' }
  }
}

/**
 * Elimina una sesión de chat (CASCADE elimina mensajes)
 */
export async function deleteSession(sessionId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'No autenticado' }
    }

    // Validar que la sesión pertenece al usuario
    const { data: session, error: sessionError } = await supabase
      .from('proc_chat_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session || session.user_id !== user.id) {
      return { error: 'Sesión no encontrada o no autorizada' }
    }

    const { error } = await supabase
      .from('proc_chat_sessions')
      .delete()
      .eq('id', sessionId)

    if (error) throw error

    revalidatePath('/documentos/chat')

    return {}
  } catch (error) {
    console.error('Error al eliminar sesión:', error)
    return { error: 'Error al eliminar sesión de chat' }
  }
}
