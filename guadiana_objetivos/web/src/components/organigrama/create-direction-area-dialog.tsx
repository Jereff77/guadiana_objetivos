'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

const PRESET_COLORS = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#004B8D',
]

interface CreateDirectionAreaDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (name: string, color: string) => Promise<void>
}

export function CreateDirectionAreaDialog({ open, onClose, onCreate }: CreateDirectionAreaDialogProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    setLoading(false)
    setError(null)
    setName('')
    setColor('#6366f1')
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onCreate(name, color)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear área')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nueva Área de Dirección</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dir-area-name">Nombre del área</Label>
            <Input
              id="dir-area-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Comunicación Corporativa"
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
