'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (question: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [question, setQuestion] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize del textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [question])

  const handleSubmit = () => {
    const trimmed = question.trim()
    if (!trimmed || disabled) return

    onSend(trimmed)
    setQuestion('')

    // Resetear altura
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Escribe tu pregunta sobre los documentos... (Enter para enviar, Shift+Enter para nueva línea)"
        className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#194D95] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        rows={1}
        style={{ minHeight: '44px', maxHeight: '200px' }}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !question.trim()}
        className="px-4 py-3 bg-[#194D95] hover:bg-[#154080] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        style={{ height: '44px' }}
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  )
}
