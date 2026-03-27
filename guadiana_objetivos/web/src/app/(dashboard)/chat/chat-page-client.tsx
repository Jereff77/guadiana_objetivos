'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare } from 'lucide-react'
import { RoomList } from '@/components/chat/room-list'
import { MessageView } from '@/components/chat/message-view'
import {
  getRooms, getOrCreateDirectRoom, toggleChatHidden,
  type ChatRoom, type ChatUser,
} from '@/app/(dashboard)/chat/chat-actions'

interface ChatPageClientProps {
  initialRooms: ChatRoom[]
  users: ChatUser[]
  currentUserId: string
  canHide: boolean
  initialHidden: boolean
}

export function ChatPageClient({
  initialRooms,
  users,
  currentUserId,
  canHide,
  initialHidden,
}: ChatPageClientProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>(initialRooms)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    initialRooms.length > 0 ? initialRooms[0].id : null
  )
  const [isHidden, setIsHidden] = useState(initialHidden)
  const supabase = createClient()

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) ?? null

  // Realtime: detectar cuando agregan al usuario a un nuevo grupo
  useEffect(() => {
    const channel = supabase
      .channel('my-memberships')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_room_members',
          filter: `user_id=eq.${currentUserId}`,
        },
        async () => {
          const updated = await getRooms()
          setRooms(updated)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUserId])

  async function handleDirectSelect(userId: string): Promise<void> {
    const result = await getOrCreateDirectRoom(userId)
    if (result.error || !result.roomId) throw new Error(result.error ?? 'Error al abrir chat')
    const updated = await getRooms()
    setRooms(updated)
    setSelectedRoomId(result.roomId)
  }

  async function handleGroupCreated(roomId: string) {
    const updated = await getRooms()
    setRooms(updated)
    setSelectedRoomId(roomId)
  }

  function handleRoomLeft(roomId: string) {
    setRooms(prev => prev.filter(r => r.id !== roomId))
    if (selectedRoomId === roomId) setSelectedRoomId(null)
  }

  function handleGroupNameUpdated(roomId: string, name: string) {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, name } : r))
  }

  async function handleToggleHidden(): Promise<void> {
    const result = await toggleChatHidden()
    if (result.error) throw new Error(result.error)
    setIsHidden(result.hidden ?? false)
  }

  return (
    <div className="flex h-full overflow-hidden rounded-lg border border-border bg-background shadow-sm -m-6">
      {/* Panel izquierdo */}
      <div className="w-72 shrink-0 flex flex-col h-full overflow-hidden">
        <RoomList
          rooms={rooms}
          users={users}
          selectedRoomId={selectedRoomId}
          currentUserId={currentUserId}
          canHide={canHide}
          isHidden={isHidden}
          onSelectRoom={setSelectedRoomId}
          onDirectSelect={handleDirectSelect}
          onGroupCreated={handleGroupCreated}
          onRoomLeft={handleRoomLeft}
          onGroupNameUpdated={handleGroupNameUpdated}
          onToggleHidden={handleToggleHidden}
        />
      </div>

      {/* Panel derecho: mensajes */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedRoom ? (
          <MessageView
            room={selectedRoom}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm">Selecciona una conversación</p>
              <p className="text-xs text-muted-foreground mt-1">
                Elige un chat de la lista o escribe a un contacto
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
