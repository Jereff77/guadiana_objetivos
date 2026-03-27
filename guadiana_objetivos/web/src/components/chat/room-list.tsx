'use client'

import { useState, useTransition } from 'react'
import { Users, Search, Settings, Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type ChatRoom, type ChatUser } from '@/app/(dashboard)/chat/chat-actions'
import { GroupCreateDialog } from './group-create-dialog'
import { GroupManageDialog } from './group-manage-dialog'

interface RoomListProps {
  rooms: ChatRoom[]
  users: ChatUser[]
  selectedRoomId: string | null
  currentUserId: string
  canHide: boolean
  isHidden: boolean
  onSelectRoom: (id: string) => void
  onDirectSelect: (userId: string) => Promise<void>
  onGroupCreated: (roomId: string) => void
  onRoomLeft: (roomId: string) => void
  onGroupNameUpdated: (roomId: string, name: string) => void
  onToggleHidden: () => Promise<void>
}

function formatRelativeTime(iso: string | null) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return 'ahora'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })
}

export function RoomList({
  rooms,
  users,
  selectedRoomId,
  currentUserId,
  canHide,
  isHidden,
  onSelectRoom,
  onDirectSelect,
  onGroupCreated,
  onRoomLeft,
  onGroupNameUpdated,
  onToggleHidden,
}: RoomListProps) {
  const [search, setSearch] = useState('')
  const [showGroupCreate, setShowGroupCreate] = useState(false)
  const [managingRoom, setManagingRoom] = useState<ChatRoom | null>(null)
  const [openingUserId, setOpeningUserId] = useState<string | null>(null)
  const [togglingHidden, startHiddenTransition] = useTransition()

  const q = search.toLowerCase()

  // Usuarios que ya tienen room directo con el usuario actual
  const directUserIds = new Set(
    rooms
      .filter(r => r.type === 'direct' && r.other_user_id)
      .map(r => r.other_user_id as string)
  )

  // Filtrar conversaciones (rooms) por búsqueda
  const filteredRooms = rooms.filter(r => {
    const name = r.type === 'direct' ? (r.other_user_name ?? '') : (r.name ?? '')
    return name.toLowerCase().includes(q)
  })

  // Contactos sin conversación activa (ordenados alfabéticamente, ya vienen así del server)
  const filteredContacts = users.filter(u =>
    !directUserIds.has(u.id) &&
    (
      (u.full_name ?? '').toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q)
    )
  )

  async function handleContactClick(userId: string) {
    setOpeningUserId(userId)
    try {
      await onDirectSelect(userId)
    } finally {
      setOpeningUserId(null)
    }
  }

  return (
    <div className="flex flex-col h-full border-r border-border bg-sidebar">
      {/* Header */}
      <div className="px-3 py-3 border-b border-sidebar-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Mensajes</span>
          <div className="flex gap-1">
            {/* Toggle visibilidad (solo si tiene permiso chat.hidden) */}
            {canHide && (
              <button
                onClick={() => startHiddenTransition(async () => { await onToggleHidden() })}
                disabled={togglingHidden}
                className={cn(
                  'h-7 w-7 flex items-center justify-center rounded-md transition-colors',
                  isHidden
                    ? 'text-amber-500 hover:text-amber-600 bg-amber-500/10 hover:bg-amber-500/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60'
                )}
                title={isHidden ? 'Estás oculto — click para hacerte visible' : 'Hacerse invisible'}
              >
                {togglingHidden
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />
                }
              </button>
            )}
            {/* Nuevo grupo */}
            <button
              onClick={() => setShowGroupCreate(true)}
              className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60 transition-colors"
              title="Nuevo grupo"
            >
              <Users className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar…"
            className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue/30"
          />
        </div>
      </div>

      {/* Lista scrolleable */}
      <div className="flex-1 overflow-y-auto py-1">

        {/* ── Conversaciones ─────────────────────────────────── */}
        {filteredRooms.length > 0 && (
          <>
            <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Conversaciones
            </p>
            {filteredRooms.map(room => {
              const name = room.type === 'direct'
                ? (room.other_user_name ?? 'Usuario')
                : (room.name ?? 'Grupo')
              const isActive = selectedRoomId === room.id

              return (
                <div
                  key={room.id}
                  className={cn(
                    'group relative flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors',
                    isActive ? 'text-white' : 'hover:bg-sidebar-accent/50'
                  )}
                  style={isActive ? { backgroundColor: '#194D95' } : undefined}
                  onClick={() => onSelectRoom(room.id)}
                >
                  <div
                    className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#004B8D' }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm font-medium truncate">{name}</p>
                      {room.last_message_at && (
                        <span className={cn('text-[10px] shrink-0', isActive ? 'text-white/70' : 'text-muted-foreground')}>
                          {formatRelativeTime(room.last_message_at)}
                        </span>
                      )}
                    </div>
                    {room.last_message && (
                      <p className={cn('text-xs truncate', isActive ? 'text-white/70' : 'text-muted-foreground')}>
                        {room.last_message}
                      </p>
                    )}
                  </div>
                  {room.type === 'group' && (
                    <button
                      onClick={e => { e.stopPropagation(); setManagingRoom(room) }}
                      className={cn(
                        'shrink-0 h-6 w-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity',
                        isActive ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-muted-foreground hover:bg-accent'
                      )}
                      title="Gestionar grupo"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )
            })}
          </>
        )}

        {/* ── Contactos (sin conversación activa) ────────────── */}
        {filteredContacts.length > 0 && (
          <>
            <p className={cn(
              'px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60',
              filteredRooms.length > 0 ? 'pt-3 border-t border-border mt-1' : 'pt-2'
            )}>
              Contactos
            </p>
            {filteredContacts.map(u => {
              const isOpening = openingUserId === u.id
              return (
                <button
                  key={u.id}
                  disabled={!!openingUserId}
                  onClick={() => handleContactClick(u.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-sidebar-accent/50 transition-colors disabled:opacity-60 text-left"
                >
                  <div
                    className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: '#004B8D' }}
                  >
                    {isOpening
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : (u.full_name ?? u.email ?? '?').charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{u.full_name ?? 'Sin nombre'}</p>
                    {u.email && (
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </>
        )}

        {/* Estado vacío */}
        {filteredRooms.length === 0 && filteredContacts.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-8 px-4">
            {search ? 'Sin resultados' : 'No hay contactos disponibles'}
          </p>
        )}
      </div>

      {/* Crear grupo */}
      {showGroupCreate && (
        <GroupCreateDialog
          users={users}
          onCreated={roomId => { onGroupCreated(roomId); setShowGroupCreate(false) }}
          onClose={() => setShowGroupCreate(false)}
        />
      )}

      {/* Gestionar grupo */}
      {managingRoom && (
        <GroupManageDialog
          roomId={managingRoom.id}
          roomName={managingRoom.name}
          myRole={managingRoom.my_role}
          currentUserId={currentUserId}
          allUsers={users}
          onClose={() => setManagingRoom(null)}
          onLeft={() => { onRoomLeft(managingRoom.id); setManagingRoom(null) }}
          onNameUpdated={name => { onGroupNameUpdated(managingRoom.id, name); setManagingRoom(null) }}
        />
      )}
    </div>
  )
}
