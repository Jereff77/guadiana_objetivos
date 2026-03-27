'use client'

import { useState } from 'react'
import { X, Search, UserPlus } from 'lucide-react'
import { createGroup, type ChatUser } from '@/app/(dashboard)/chat/chat-actions'

interface GroupCreateDialogProps {
  users: ChatUser[]
  onCreated: (roomId: string) => void
  onClose: () => void
}

export function GroupCreateDialog({ users, onCreated, onClose }: GroupCreateDialogProps) {
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return (
      (u.full_name ?? '').toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q)
    )
  })

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleCreate() {
    setError(null)
    if (!name.trim()) { setError('El nombre del grupo es obligatorio'); return }
    if (selected.size === 0) { setError('Agrega al menos un miembro'); return }

    setSaving(true)
    const result = await createGroup(name.trim(), Array.from(selected))
    setSaving(false)

    if (result.error) { setError(result.error); return }
    onCreated(result.roomId!)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-md mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h2 className="font-semibold text-base">Nuevo grupo</h2>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Nombre del grupo *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Equipo Ventas"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          {/* Buscar miembros */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Agregar miembros {selected.size > 0 && <span className="text-brand-blue">({selected.size})</span>}
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar usuario…"
                className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto">
              {filtered.map(u => {
                const isSelected = selected.has(u.id)
                return (
                  <button
                    key={u.id}
                    onClick={() => toggle(u.id)}
                    className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-left ${
                      isSelected ? 'bg-brand-blue/10 text-brand-blue' : 'hover:bg-accent'
                    }`}
                  >
                    <div
                      className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: isSelected ? '#004B8D' : '#94a3b8' }}
                    >
                      {(u.full_name ?? u.email ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium text-xs">{u.full_name ?? 'Sin nombre'}</p>
                      {u.email && <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>}
                    </div>
                    {isSelected && <UserPlus className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Sin resultados</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border shrink-0">
          <button onClick={onClose} className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="rounded-md bg-brand-blue text-white px-4 py-2 text-sm font-medium hover:bg-brand-blue/90 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Creando…' : 'Crear grupo'}
          </button>
        </div>
      </div>
    </div>
  )
}
