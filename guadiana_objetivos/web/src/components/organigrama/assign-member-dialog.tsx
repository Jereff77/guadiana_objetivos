'use client'

import { useState, useMemo } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type PlatformUser, type OrgPosition } from '@/app/(dashboard)/organigrama/organigrama-actions'

interface AssignMemberDialogProps {
  open: boolean
  areaName: string
  users: PlatformUser[]
  positions: OrgPosition[]
  alreadyAssigned: string[]
  onClose: () => void
  onAssign: (userId: string, positionId: string) => Promise<void>
}

export function AssignMemberDialog({
  open, areaName, users, positions, alreadyAssigned, onClose, onAssign,
}: AssignMemberDialogProps) {
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [positionId, setPositionId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const available = useMemo(() =>
    users.filter(u =>
      !alreadyAssigned.includes(u.id) &&
      (u.full_name ?? '').toLowerCase().includes(search.toLowerCase())
    ),
    [users, alreadyAssigned, search]
  )

  const selectedUserData = users.find(u => u.id === selectedUser)

  // Seleccionar primer puesto por defecto cuando se abre
  const defaultPosition = positions[0]?.id ?? ''

  function handleClose() {
    setSearch('')
    setSelectedUser('')
    setPositionId('')
    setError(null)
    setLoading(false)
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser) return
    const pid = positionId || defaultPosition
    if (!pid) return
    setError(null)
    setLoading(true)
    try {
      await onAssign(selectedUser, pid)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar miembro')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Asignar Miembro</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">
          Área: <span className="font-medium text-foreground">{areaName}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Usuario</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => { setSearch(e.target.value); setSelectedUser('') }}
                placeholder="Filtrar por nombre..."
                className="pl-8"
                autoFocus
              />
            </div>
            <div className="max-h-44 overflow-y-auto rounded-md border divide-y bg-white">
              {available.length === 0 ? (
                <p className="text-sm text-muted-foreground px-3 py-3 text-center">
                  {users.length === alreadyAssigned.length ? 'Todos los usuarios ya están asignados' : 'Sin resultados'}
                </p>
              ) : (
                available.map(u => {
                  const isSelected = selectedUser === u.id
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUser(u.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors',
                        isSelected ? 'bg-[#004B8D]/10' : 'hover:bg-accent'
                      )}
                    >
                      <div className={cn(
                        'h-7 w-7 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0',
                        isSelected ? 'bg-[#004B8D]' : 'bg-slate-400'
                      )}>
                        {(u.full_name ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 font-medium text-gray-800">{u.full_name ?? 'Sin nombre'}</span>
                      {isSelected && <Check className="h-4 w-4 text-[#004B8D] shrink-0" />}
                    </button>
                  )
                })
              )}
            </div>
            {selectedUserData && (
              <p className="text-xs text-[#004B8D] font-medium px-1">Seleccionado: {selectedUserData.full_name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Puesto</Label>
            <Select value={positionId || defaultPosition} onValueChange={setPositionId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar puesto..." />
              </SelectTrigger>
              <SelectContent>
                {positions.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading || !selectedUser || positions.length === 0}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Asignar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
