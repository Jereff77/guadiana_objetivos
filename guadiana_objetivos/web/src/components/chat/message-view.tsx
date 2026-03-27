'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Trash2, Check, X, Download, FileText, FileSpreadsheet, Archive, File } from 'lucide-react'
import {
  getMessages, sendMessage, editMessage, deleteMessage, getFileSignedUrl,
  type ChatMessage, type ChatRoom,
} from '@/app/(dashboard)/chat/chat-actions'
import { MessageInput, type PendingFile } from '@/components/chat/message-input'
import { useChatNotifications } from '@/components/chat/chat-notification-provider'

interface MessageViewProps {
  room: ChatRoom
  currentUserId: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function isWithin20Min(iso: string) {
  return Date.now() - new Date(iso).getTime() < 20 * 60 * 1000
}

function isImage(mime: string) {
  return mime.startsWith('image/')
}

function getFileTypeInfo(mimeType: string, fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (mimeType === 'application/pdf' || ext === 'pdf')
    return { Icon: FileText, color: '#fca5a5', label: 'PDF' }
  if (['doc', 'docx'].includes(ext) || mimeType.includes('word'))
    return { Icon: FileText, color: '#93c5fd', label: 'Word' }
  if (['xls', 'xlsx', 'csv'].includes(ext) || mimeType.includes('sheet') || mimeType.includes('excel'))
    return { Icon: FileSpreadsheet, color: '#86efac', label: 'Excel' }
  if (['ppt', 'pptx'].includes(ext) || mimeType.includes('presentation') || mimeType.includes('powerpoint'))
    return { Icon: FileText, color: '#fdba74', label: 'PPT' }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed'))
    return { Icon: Archive, color: '#c4b5fd', label: 'ZIP' }
  return { Icon: File, color: '#d1d5db', label: ext.toUpperCase() || 'FILE' }
}

// ── Componente de archivo ─────────────────────────────────────────────────────

function FileAttachment({ storagePath, fileName, mimeType, fileSize }: {
  storagePath: string
  fileName: string
  mimeType: string
  fileSize: number
}) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    getFileSignedUrl(storagePath).then(r => { if (r.url) setUrl(r.url) })
  }, [storagePath])

  const sizeLabel = fileSize < 1024 * 1024
    ? `${Math.round(fileSize / 1024)} KB`
    : `${(fileSize / 1024 / 1024).toFixed(1)} MB`

  if (isImage(mimeType)) {
    return url ? (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img src={url} alt={fileName}
          className="max-w-[220px] max-h-[180px] rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity" />
      </a>
    ) : (
      <div className="h-16 w-32 rounded-md bg-black/10 animate-pulse" />
    )
  }

  const { Icon, color, label } = getFileTypeInfo(mimeType, fileName)

  return (
    <a
      href={url ?? '#'}
      download={fileName}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20 transition-colors max-w-[240px]"
    >
      <div className="flex flex-col items-center shrink-0">
        <Icon className="h-5 w-5" style={{ color }} />
        <span className="text-[8px] font-bold mt-0.5" style={{ color }}>{label}</span>
      </div>
      <div className="flex flex-col overflow-hidden flex-1">
        <span className="text-xs font-medium truncate">{fileName}</span>
        <span className="text-[10px] opacity-70">{sizeLabel}</span>
      </div>
      <Download className="h-3.5 w-3.5 shrink-0 opacity-70" />
    </a>
  )
}

// ── Burbuja de mensaje ────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  isOwn,
  isGroup,
  onEdit,
  onDelete,
}: {
  msg: ChatMessage
  isOwn: boolean
  isGroup: boolean
  onEdit: (id: string, content: string) => void
  onDelete: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const canModify = isOwn && isWithin20Min(msg.created_at) && !msg.deleted_at

  if (msg.deleted_at) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
        <span className="text-xs italic text-muted-foreground px-3 py-1.5">
          Mensaje eliminado
        </span>
      </div>
    )
  }

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 group`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`relative max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Nombre del sender en grupos */}
        {!isOwn && isGroup && msg.sender_name && (
          <p className="text-[11px] font-medium text-muted-foreground mb-0.5 px-1">
            {msg.sender_name}
          </p>
        )}

        {/* Burbuja */}
        <div
          className={`rounded-2xl px-3 py-2 text-sm space-y-1.5 ${
            isOwn
              ? 'text-white rounded-br-none'
              : 'bg-muted text-foreground rounded-bl-none'
          }`}
          style={isOwn ? { backgroundColor: '#004B8D' } : undefined}
        >
          {/* Archivos */}
          {msg.files.map(f => (
            <FileAttachment
              key={f.id}
              storagePath={f.storage_path}
              fileName={f.file_name}
              mimeType={f.mime_type}
              fileSize={f.file_size}
            />
          ))}

          {/* Texto */}
          {msg.content && (
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          )}

          {/* Meta */}
          <div className={`flex items-center gap-1 justify-end ${isOwn ? 'text-white/60' : 'text-muted-foreground'}`}>
            {msg.edited_at && <span className="text-[10px]">Editado</span>}
            <span className="text-[10px]">{formatTime(msg.created_at)}</span>
          </div>
        </div>

        {/* Acciones hover */}
        {canModify && hovered && (
          <div
            className={`absolute top-0 ${isOwn ? 'right-full mr-1' : 'left-full ml-1'} flex gap-1`}
          >
            <button
              onClick={() => onEdit(msg.id, msg.content ?? '')}
              className="h-6 w-6 rounded-md bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shadow-sm"
              title="Editar"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={() => onDelete(msg.id)}
              className="h-6 w-6 rounded-md bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shadow-sm"
              title="Eliminar"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function MessageView({ room, currentUserId }: MessageViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const { markRead } = useChatNotifications()

  // Marcar como leído al abrir la sala y al recibir nuevos mensajes
  useEffect(() => {
    markRead(room.id)
  }, [room.id, messages.length])

  // Cargar mensajes iniciales
  useEffect(() => {
    setLoading(true)
    getMessages(room.id).then(msgs => {
      setMessages(msgs)
      setLoading(false)
    })
  }, [room.id])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${room.id}` },
        async () => {
          // Recargar últimos mensajes para obtener sender info + files
          const updated = await getMessages(room.id)
          setMessages(updated)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${room.id}` },
        (payload) => {
          const updated = payload.new as Partial<ChatMessage>
          setMessages(prev =>
            prev.map(m =>
              m.id === updated.id
                ? { ...m, content: updated.content ?? m.content, edited_at: updated.edited_at ?? m.edited_at, deleted_at: updated.deleted_at ?? m.deleted_at }
                : m
            )
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [room.id])

  async function handleSend(content: string, files: PendingFile[]) {
    await sendMessage(room.id, content, files.map(f => ({
      name: f.name, type: f.type, size: f.size, data: f.data
    })))
  }

  async function handleEdit(id: string, current: string) {
    setEditingId(id)
    setEditContent(current)
  }

  async function handleEditSave() {
    if (!editingId) return
    await editMessage(editingId, editContent)
    setEditingId(null)
    setEditContent('')
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este mensaje?')) return
    await deleteMessage(id)
  }

  const roomName = room.type === 'direct'
    ? (room.other_user_name ?? 'Usuario')
    : (room.name ?? 'Grupo')

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 shrink-0">
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: '#194D95' }}
        >
          {roomName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm">{roomName}</p>
          {room.type === 'group' && (
            <p className="text-xs text-muted-foreground">Grupo</p>
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Cargando mensajes…</p>
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Sin mensajes aún. ¡Sé el primero!</p>
          </div>
        )}
        {messages.map(msg =>
          editingId === msg.id ? (
            // Modo edición inline
            <div key={msg.id} className="flex justify-end mb-1">
              <div className="flex items-center gap-2 max-w-[70%] w-full">
                <input
                  autoFocus
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleEditSave()
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
                <button onClick={handleEditSave}
                  className="h-7 w-7 flex items-center justify-center rounded-md bg-green-600 text-white hover:bg-green-700">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setEditingId(null)}
                  className="h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-accent">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isOwn={msg.sender_id === currentUserId}
              isGroup={room.type === 'group'}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} />
    </div>
  )
}
