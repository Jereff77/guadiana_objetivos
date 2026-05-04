'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { getChatMessages, prepareMessageContext, saveAssistantMessage } from '@/app/(dashboard)/documentos/chat/chat-actions'
import ChatMessage from './chat-message'
import ChatInput from './chat-input'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Sparkles, Loader2 } from 'lucide-react'

interface ChatMessageData {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources: any[]
  created_at: string
}

export default function ChatConversation() {
  const searchParams = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const [streamSources, setStreamSources] = useState<any[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const sessionParam = searchParams.get('session')
    if (!sessionParam) {
      setSessionId(null)
      setMessages([])
      return
    }

    setSessionId(sessionParam)
    setIsLoading(true)

    async function loadMessages() {
      const result = await getChatMessages(sessionParam)
      if (result.data) {
        setMessages(result.data)
      }
      setIsLoading(false)
    }

    loadMessages()
  }, [searchParams])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamContent])

  const handleSendMessage = useCallback(async (question: string) => {
    if (!sessionId || isSending) return

    setIsSending(true)

    const userMessage: ChatMessageData = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      sources: [],
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])

    const tempAssistantId = crypto.randomUUID()

    try {
      const ctx = await prepareMessageContext(sessionId, question)

      if (ctx.error || !ctx.data) {
        console.error('Error preparando contexto:', ctx.error)
        setMessages(prev => [...prev, {
          id: tempAssistantId,
          role: 'assistant',
          content: `Error: ${ctx.error || 'No se pudo preparar el contexto'}`,
          sources: [],
          created_at: new Date().toISOString()
        }])
        return
      }

      const { messagesForApi, sources } = ctx.data

      setStreamContent('')
      setStreamSources(sources)

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      const response = await fetch('/api/documentos/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesForApi }),
        signal: abortController.signal
      })

      if (!response.ok) {
        const errorText = await response.text()
        setMessages(prev => [...prev, {
          id: tempAssistantId,
          role: 'assistant',
          content: `Error del servidor: ${errorText}`,
          sources: [],
          created_at: new Date().toISOString()
        }])
        return
      }

      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                fullContent += parsed.delta.text
                setStreamContent(fullContent)
              }
            } catch {
              // Ignorar líneas parseables
            }
          }
        }
      }

      // Mostrar mensaje completo antes de persistir
      setMessages(prev => [...prev, {
        id: tempAssistantId,
        role: 'assistant',
        content: fullContent,
        sources,
        created_at: new Date().toISOString()
      }])
      setStreamContent('')

      // Persistir en BD (fire and forget)
      saveAssistantMessage(sessionId, question, fullContent, sources)

    } catch (error: any) {
      if (error?.name === 'AbortError') return
      console.error('Error en streaming:', error)
      setMessages(prev => [...prev, {
        id: tempAssistantId,
        role: 'assistant',
        content: `Error: ${error?.message || 'Error al procesar la respuesta'}`,
        sources: [],
        created_at: new Date().toISOString()
      }])
    } finally {
      setIsSending(false)
      abortControllerRef.current = null
    }
  }, [sessionId, isSending])

  const suggestedQuestions = [
    '¿Qué documentos hay sobre políticas de la empresa?',
    '¿Cuál es el proceso de solicitud de vacaciones?',
    '¿Qué se dice sobre el horario laboral?'
  ]

  if (!sessionId) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#194D95] rounded-full mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Chat de Documentos
            </h1>
            <p className="text-gray-600 mb-8">
              Pregunta sobre los documentos del repositorio y obtendrás respuestas basadas únicamente en su contenido.
            </p>

            <div className="space-y-3 text-left">
              <p className="text-sm font-medium text-gray-700 mb-3">Preguntas sugeridas:</p>
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  disabled
                  className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-[#194D95] hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <p className="text-sm text-gray-700">{question}</p>
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Selecciona o crea una conversación para empezar
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-[#194D95] animate-spin" />
          </div>
        ) : messages.length === 0 && !isSending ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Envía tu primera pregunta para empezar la conversación</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                sources={message.sources}
              />
            ))}
            {isSending && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-gray-100 text-gray-900">
                  {streamContent ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamContent}</ReactMarkdown>
                  ) : (
                    <div className="flex gap-1 items-center h-5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSendMessage} disabled={isSending} />
        </div>
      </div>
    </div>
  )
}
