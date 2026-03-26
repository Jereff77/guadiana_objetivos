'use client'

import { useState, useTransition, useRef, useEffect } from 'react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function LmsChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isPending) return

    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/capacitacion/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            history: messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        })

        if (!res.ok) {
          const errData = (await res.json()) as { error?: string }
          setError(errData.error ?? 'Error al contactar el servicio de IA.')
          return
        }

        const data = (await res.json()) as { response?: string; message?: string }
        const assistantContent = data.response ?? data.message ?? 'Sin respuesta.'

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: assistantContent },
        ])
      } catch {
        setError('Error de red. Intenta de nuevo.')
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[600px] rounded-lg border bg-card overflow-hidden">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Haz preguntas sobre los contenidos de capacitación. El asistente te ayudará a
              comprender los temas y aclarar tus dudas.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted text-foreground rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isPending && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5">
              <span className="flex gap-1 items-center text-muted-foreground text-sm">
                <span className="animate-bounce delay-0">.</span>
                <span className="animate-bounce delay-150">.</span>
                <span className="animate-bounce delay-300">.</span>
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 bg-background flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu pregunta… (Enter para enviar)"
          rows={2}
          disabled={isPending}
          className="flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isPending || !input.trim()}
          className="shrink-0 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
