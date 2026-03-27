'use client'

import { useState, useRef, useCallback } from 'react'
import { Send, Paperclip, Smile, X, FileText } from 'lucide-react'

// ── Emoji picker data ─────────────────────────────────────────────────────────

const EMOJIS = [
  '😀','😂','😍','🥰','😎','🤔','😢','😡','😅','🤣','😊','🥺',
  '👍','👎','🙏','👏','🤝','✌️','🤞','💪','🖐️','👋','🤙','☝️',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','💕','🔥','✨',
  '🎉','🎊','🎁','🏆','🥇','💯','🚀','⭐','💡','🔔','📌','📎',
  '✅','❌','⚠️','ℹ️','🔒','🔓','🔑','🔗','📧','📞','🕐','📅',
]

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface PendingFile {
  id: string
  name: string
  type: string
  size: number
  data: string   // base64
  previewUrl?: string
}

interface MessageInputProps {
  onSend: (content: string, files: PendingFile[]) => Promise<void>
  disabled?: boolean
}

// ── Componente ────────────────────────────────────────────────────────────────

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<PendingFile[]>([])
  const [showEmoji, setShowEmoji] = useState(false)
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canSend = (text.trim().length > 0 || files.length > 0) && !sending && !disabled

  async function handleSend() {
    if (!canSend) return
    setSending(true)
    await onSend(text.trim(), files)
    setText('')
    setFiles([])
    setSending(false)
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function insertEmoji(emoji: string) {
    const ta = textareaRef.current
    if (!ta) { setText(t => t + emoji); return }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const newText = text.slice(0, start) + emoji + text.slice(end)
    setText(newText)
    setShowEmoji(false)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    e.target.value = ''
    for (const file of selected) {
      if (file.size > 10 * 1024 * 1024) continue // max 10MB
      const data = await fileToBase64(file)
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      setFiles(prev => [...prev, {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        data,
        previewUrl,
      }])
    }
  }

  function removeFile(id: string) {
    setFiles(prev => {
      const f = prev.find(x => x.id === id)
      if (f?.previewUrl) URL.revokeObjectURL(f.previewUrl)
      return prev.filter(x => x.id !== id)
    })
  }

  return (
    <div className="border-t border-border p-3 space-y-2">
      {/* Preview de archivos pendientes */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map(f => (
            <div key={f.id} className="relative group">
              {f.previewUrl ? (
                <img src={f.previewUrl} alt={f.name}
                  className="h-16 w-16 object-cover rounded-md border border-border" />
              ) : (
                <div className="h-16 w-16 flex flex-col items-center justify-center rounded-md border border-border bg-muted gap-1 px-1">
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-[9px] text-muted-foreground truncate w-full text-center leading-none">
                    {f.name}
                  </span>
                </div>
              )}
              <button
                onClick={() => removeFile(f.id)}
                className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div className="rounded-lg border border-border bg-popover p-2 shadow-md">
          <div className="flex flex-wrap gap-0.5 max-w-xs">
            {EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="text-lg p-1 hover:bg-accent rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* Botón emoji */}
        <button
          type="button"
          onClick={() => setShowEmoji(v => !v)}
          disabled={disabled}
          className="shrink-0 h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          title="Emoji"
        >
          <Smile className="h-5 w-5" />
        </button>

        {/* Botón adjuntar */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="shrink-0 h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          title="Adjuntar archivo"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          placeholder="Escribe un mensaje… (Enter para enviar, Shift+Enter para nueva línea)"
          rows={1}
          className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm
            placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30
            disabled:opacity-60 max-h-32 overflow-y-auto"
          style={{ minHeight: '36px' }}
          onInput={e => {
            const ta = e.currentTarget
            ta.style.height = 'auto'
            ta.style.height = Math.min(ta.scrollHeight, 128) + 'px'
          }}
        />

        {/* Botón enviar */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="shrink-0 h-9 w-9 flex items-center justify-center rounded-md text-white transition-colors disabled:opacity-40"
          style={{ backgroundColor: canSend ? '#004B8D' : undefined }}
          title="Enviar"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
