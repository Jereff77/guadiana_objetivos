'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { type OrgPosition, createPosition, updatePosition, deletePosition } from '@/app/(dashboard)/organigrama/organigrama-actions'

interface PositionsManagerProps {
  open: boolean
  positions: OrgPosition[]
  onClose: () => void
  onChange: (positions: OrgPosition[]) => void
}

export function PositionsManager({ open, positions, onClose, onChange }: PositionsManagerProps) {
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    if (!newName.trim()) return
    setAdding(true)
    setError(null)
    const res = await createPosition(newName)
    if (res.error) { setError(res.error); setAdding(false); return }
    onChange([...positions, { id: res.id!, name: newName.trim(), sort_order: positions.length + 1 }])
    setNewName('')
    setAdding(false)
  }

  async function handleUpdate(id: string) {
    if (!editingName.trim()) return
    setLoadingId(id)
    setError(null)
    const res = await updatePosition(id, editingName)
    if (res.error) { setError(res.error); setLoadingId(null); return }
    onChange(positions.map(p => p.id === id ? { ...p, name: editingName.trim() } : p))
    setEditingId(null)
    setLoadingId(null)
  }

  async function handleDelete(id: string) {
    setLoadingId(id)
    setError(null)
    const res = await deletePosition(id)
    if (res.error) { setError(res.error); setLoadingId(null); return }
    onChange(positions.filter(p => p.id !== id))
    setLoadingId(null)
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Gestionar Puestos</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">
          Define los puestos disponibles al asignar personal al organigrama.
        </p>

        {/* Lista de puestos */}
        <div className="rounded-md border divide-y max-h-60 overflow-y-auto">
          {positions.length === 0 && (
            <p className="text-sm text-muted-foreground px-3 py-3 text-center">Sin puestos definidos</p>
          )}
          {positions.map(pos => (
            <div key={pos.id} className="flex items-center gap-2 px-3 py-2">
              {editingId === pos.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    className="h-7 text-sm flex-1"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') handleUpdate(pos.id); if (e.key === 'Escape') setEditingId(null) }}
                  />
                  <button
                    onClick={() => handleUpdate(pos.id)}
                    disabled={loadingId === pos.id}
                    className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
                  >
                    {loadingId === pos.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-gray-800">{pos.name}</span>
                  <button
                    onClick={() => { setEditingId(pos.id); setEditingName(pos.name) }}
                    className="p-1 rounded hover:bg-blue-100 text-blue-500 transition-colors opacity-60 hover:opacity-100"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(pos.id)}
                    disabled={loadingId === pos.id}
                    className="p-1 rounded hover:bg-red-100 text-red-500 transition-colors opacity-60 hover:opacity-100"
                  >
                    {loadingId === pos.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Agregar nuevo puesto */}
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Nuevo puesto..."
            className="flex-1"
            onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
          />
          <Button onClick={handleAdd} disabled={adding || !newName.trim()} size="sm" className="gap-1.5">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Agregar
          </Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
