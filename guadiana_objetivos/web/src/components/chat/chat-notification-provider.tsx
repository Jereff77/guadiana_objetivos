'use client'

import {
  createContext, useContext, useState, useEffect, useRef, useCallback,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getUnreadCounts, markRoomAsRead } from '@/app/(dashboard)/chat/chat-actions'
import { MessageSquare, X } from 'lucide-react'

// ── Contexto ──────────────────────────────────────────────────────────────────

interface ChatNotificationsCtx {
  totalUnread: number
  unreadByRoom: Record<string, number>
  markRead: (roomId: string) => void
}

const Ctx = createContext<ChatNotificationsCtx>({
  totalUnread: 0,
  unreadByRoom: {},
  markRead: () => {},
})

export function useChatNotifications() {
  return useContext(Ctx)
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface ToastNotification {
  id: string
  senderName: string
  preview: string
  roomId: string
  roomName: string
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ChatNotificationProvider({
  children,
  currentUserId,
}: {
  children: ReactNode
  currentUserId: string
}) {
  const [unreadByRoom, setUnreadByRoom] = useState<Record<string, number>>({})
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // Cache de nombres de sala (para el toast)
  const roomNamesRef = useRef<Record<string, string>>({})

  const totalUnread = Object.values(unreadByRoom).reduce((a, b) => a + b, 0)
  const isOnChatPage = pathname.startsWith('/chat')

  // Cargar no leídos iniciales
  useEffect(() => {
    getUnreadCounts().then(counts => setUnreadByRoom(counts))
  }, [])

  // Suscripción Realtime global a mensajes nuevos
  useEffect(() => {
    const channel = supabase
      .channel('chat-global-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload) => {
          const msg = payload.new as {
            id: string
            room_id: string
            sender_id: string
            content: string | null
            created_at: string
          }

          // Ignorar mensajes propios
          if (msg.sender_id === currentUserId) return

          // Incrementar contador
          setUnreadByRoom(prev => ({
            ...prev,
            [msg.room_id]: (prev[msg.room_id] ?? 0) + 1,
          }))

          // Mostrar toast si no está en la página de chat
          if (!isOnChatPage) {
            // Fetch nombre del sender y de la sala en paralelo
            const [{ data: senderProfile }, { data: room }] = await Promise.all([
              supabase
                .from('profiles')
                .select('full_name')
                .eq('id', msg.sender_id)
                .single(),
              supabase
                .from('chat_rooms')
                .select('type, name')
                .eq('id', msg.room_id)
                .single(),
            ])

            const senderName = senderProfile?.full_name ?? 'Alguien'
            let roomName = roomNamesRef.current[msg.room_id]
            if (!roomName) {
              roomName = room?.type === 'group'
                ? (room.name ?? 'Grupo')
                : senderName
              roomNamesRef.current[msg.room_id] = roomName
            }

            const toast: ToastNotification = {
              id: crypto.randomUUID(),
              senderName,
              roomName,
              preview: msg.content
                ? msg.content.length > 60 ? msg.content.slice(0, 60) + '…' : msg.content
                : '📎 Archivo adjunto',
              roomId: msg.room_id,
            }

            setToasts(prev => [...prev.slice(-2), toast]) // máx 3 toasts a la vez
            setTimeout(() => dismissToast(toast.id), 6000)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUserId, isOnChatPage])

  const markRead = useCallback((roomId: string) => {
    setUnreadByRoom(prev => {
      const next = { ...prev }
      delete next[roomId]
      return next
    })
    markRoomAsRead(roomId)
  }, [])

  function dismissToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  function handleToastClick(toast: ToastNotification) {
    dismissToast(toast.id)
    router.push('/chat')
  }

  return (
    <Ctx.Provider value={{ totalUnread, unreadByRoom, markRead }}>
      {children}

      {/* ── Toast notifications ──────────────────────────────── */}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map(t => (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-background shadow-lg px-4 py-3 w-80 cursor-pointer hover:bg-accent/50 transition-colors animate-in slide-in-from-right-8 fade-in duration-300"
              onClick={() => handleToastClick(t)}
            >
              <div
                className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5"
                style={{ backgroundColor: '#004B8D' }}
              >
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{t.roomName}</p>
                {t.roomName !== t.senderName && (
                  <p className="text-xs text-muted-foreground truncate">{t.senderName}</p>
                )}
                <p className="text-xs text-muted-foreground truncate mt-0.5">{t.preview}</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); dismissToast(t.id) }}
                className="shrink-0 h-5 w-5 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Ctx.Provider>
  )
}
