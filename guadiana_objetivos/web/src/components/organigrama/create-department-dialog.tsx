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

const PRESET_COLORS = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#004B8D',
]

interface CreateDepartmentDialogProps {
  open: boolean
  users: PlatformUser[]
  positions: OrgPosition[]
  onClose: () => void
  onCreate: (name: string, color: string, responsibleId?: string, responsiblePositionId?: string) => Promise<void>
}

export function CreateDepartmentDialog({ open, users, positions, onClose, onCreate }: CreateDepartmentDialogProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [search, setSearch] = useState('')
  const [responsibleId, setResponsibleId] = useState<string>('')
  const [responsiblePositionId, setResponsiblePositionId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() =>
    users.filter(u => (u.full_name ?? '').toLowerCase().includes(search.toLowerCase())),
    [users, search]
  )

  const responsibleUser = users.find(u => u.id === responsibleId)

  function handleClose() {
    setName('')
    setColor('#6366f1')
    setSearch('')
    setResponsibleId('')
    setResponsiblePositionId('')
    setError(null)
    setLoading(false)
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onCreate(
        name, color,
        responsibleId || undefined,
        responsibleId && responsiblePositionId ? responsiblePositionId : undefined
      )
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear departamento')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nuevo Departamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dept-name">Nombre</Label>
            <Input
              id="dept-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Recursos Humanos"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>
              Responsable del departamento
              <span className="text-muted-foreground font-normal ml-1">(opcional)</span>
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => { setSearch(e.target.value); setResponsibleId('') }}
                placeholder="Filtrar por nombre..."
                className="pl-8"
              />
            </div>
            <div className="max-h-32 overflow-y-auto rounded-md border divide-y bg-white">
              <button
                type="button"
                onClick={() => { setResponsibleId(''); setResponsiblePositionId(''); setSearch('') }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors',
                  !responsibleId ? 'bg-gray-50' : 'hover:bg-accent'
                )}
              >
                <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-gray-400 text-xs">—</div>
                <span className="flex-1 text-muted-foreground italic">Sin responsable</span>
                {!responsibleId && <Check className="h-4 w-4 text-gray-400 shrink-0" />}
              </button>
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground px-3 py-2 text-center">Sin resultados</p>
              ) : (
                filtered.map(u => {
                  const isSelected = responsibleId === u.id
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => { setResponsibleId(u.id); setSearch('') }}
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
            {responsibleUser && (
              <p className="text-xs text-[#004B8D] font-medium px-1">
                Responsable: {responsibleUser.full_name}
              </p>
            )}
          </div>

          {responsibleId && positions.length > 0 && (
            <div className="space-y-1.5">
              <Label>Puesto del responsable</Label>
              <Select value={responsiblePositionId} onValueChange={setResponsiblePositionId}>
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
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
