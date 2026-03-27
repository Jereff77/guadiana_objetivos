'use client'

import { useState, useEffect } from 'react'
import { X, Search, Shield, ShieldOff, UserMinus, UserPlus, LogOut } from 'lucide-react'
import {
  getGroupMembers, addGroupMember, removeGroupMember, setGroupAdmin, updateGroupName,
  type ChatUser,
} from '@/app/(dashboard)/chat/chat-actions'

interface Member {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: string
}

interface GroupManageDialogProps {
  roomId: string
  roomName: string | null
  myRole: 'member' | 'admin'
  currentUserId: string
  allUsers: ChatUser[]
  onClose: () => void
  onLeft: () => void
  onNameUpdated: (name: string) => void
}

export function GroupManageDialog({
  roomId,
  roomName,
  myRole,
  currentUserId,
  allUsers,
  onClose,
  onLeft,
  onNameUpdated,
}: GroupManageDialogProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [name, setName] = useState(roomName ?? '')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const isAdmin = myRole === 'admin'

  useEffect(() => {
    getGroupMembers(roomId).then(setMembers)
  }, [roomId])

  const memberIds = new Set(members.map(m => m.id))
  const availableToAdd = allUsers.filter(u =>
    !memberIds.has(u.id) &&
    ((u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? '').toLowerCase().includes(search.toLowerCase()))
  )

  async function handleSaveName() {
    if (!name.trim() || name.trim() === roomName) return
    setSaving(true)
    const r = await updateGroupName(roomId, name.trim())
    setSaving(false)
    if (r.error) { setError(r.error); return }
    onNameUpdated(name.trim())
    flash('Nombre actualizado')
  }

  async function handleAddMember(userId: string) {
    const r = await addGroupMember(roomId, userId)
    if (r.error) { setError(r.error); return }
    const user = allUsers.find(u => u.id === userId)
    if (user) setMembers(prev => [...prev, { id: user.id, full_name: user.full_name, avatar_url: user.avatar_url, role: 'member' }])
    flash('Miembro agregado')
  }

  async function handleRemoveMember(userId: string) {
    const r = await removeGroupMember(roomId, userId)
    if (r.error) { setError(r.error); return }
    setMembers(prev => prev.filter(m => m.id !== userId))
  }

  async function handleToggleAdmin(userId: string, isCurrentlyAdmin: boolean) {
    const r = await setGroupAdmin(roomId, userId, !isCurrentlyAdmin)
    if (r.error) { setError(r.error); return }
    setMembers(prev => prev.map(m => m.id === userId ? { ...m, role: isCurrentlyAdmin ? 'member' : 'admin' } : m))
  }

  async function handleLeave() {
    if (!confirm('¿Seguro que quieres salir del grupo?')) return
    const r = await removeGroupMember(roomId, currentUserId)
    if (r.error) { setError(r.error); return }
    onLeft()
  }

  function flash(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-md mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h2 className="font-semibold text-base">Gestionar grupo</h2>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">{success}</div>
          )}

          {/* Nombre del grupo */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Nombre del grupo</label>
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving || !name.trim() || name.trim() === roomName}
                  className="rounded-md bg-brand-blue text-white px-3 py-2 text-sm hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          {/* Miembros actuales */}
          <div>
            <p className="text-sm font-medium mb-2">Miembros ({members.length})</p>
            <div className="space-y-1">
              {members.map(m => {
                const isMe = m.id === currentUserId
                const isMemberAdmin = m.role === 'admin'
                return (
                  <div key={m.id} className="flex items-center gap-2 rounded-md px-2 py-1.5">
                    <div
                      className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: '#194D95' }}
                    >
                      {(m.full_name ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm truncate">{m.full_name ?? 'Sin nombre'} {isMe && <span className="text-muted-foreground text-xs">(tú)</span>}</p>
                    </div>
                    {isMemberAdmin && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 shrink-0">
                        Admin
                      </span>
                    )}
                    {/* Acciones de admin sobre otros miembros */}
                    {isAdmin && !isMe && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleToggleAdmin(m.id, isMemberAdmin)}
                          className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-brand-blue hover:bg-brand-blue/10 transition-colors"
                          title={isMemberAdmin ? 'Quitar admin' : 'Hacer admin'}
                        >
                          {isMemberAdmin ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Remover del grupo"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Agregar miembro (solo admin) */}
          {isAdmin && (
            <div>
              <p className="text-sm font-medium mb-2">Agregar miembro</p>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar usuario…"
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {availableToAdd.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleAddMember(u.id)}
                    className="w-full flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-accent transition-colors text-left"
                  >
                    <div className="h-6 w-6 shrink-0 rounded-full bg-slate-300 flex items-center justify-center text-white text-xs font-bold">
                      {(u.full_name ?? u.email ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 truncate">{u.full_name ?? u.email}</span>
                    <UserPlus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </button>
                ))}
                {availableToAdd.length === 0 && search && (
                  <p className="text-xs text-muted-foreground text-center py-2">Sin resultados</p>
                )}
                {availableToAdd.length === 0 && !search && (
                  <p className="text-xs text-muted-foreground text-center py-2">Todos los usuarios ya son miembros</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border shrink-0">
          <button
            onClick={handleLeave}
            className="flex items-center gap-1.5 rounded-md border border-destructive/30 text-destructive px-3 py-2 text-sm hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Salir del grupo
          </button>
          <button onClick={onClose} className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
