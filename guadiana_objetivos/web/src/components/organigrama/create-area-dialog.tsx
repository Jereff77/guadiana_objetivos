'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface CreateAreaDialogProps {
  open: boolean
  departmentName: string
  onClose: () => void
  onCreate: (name: string) => Promise<void>
}

export function CreateAreaDialog({ open, departmentName, onClose, onCreate }: CreateAreaDialogProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onCreate(name)
      setName('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear área')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nueva Área</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">
          En departamento: <span className="font-medium text-foreground">{departmentName}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="area-name">Nombre del área</Label>
            <Input
              id="area-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Reclutamiento"
              required
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
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
