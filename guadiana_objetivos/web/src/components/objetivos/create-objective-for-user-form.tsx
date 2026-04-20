'use client'

import { useState } from 'react'
import { createObjectiveWithDeliverable } from '@/app/(dashboard)/objetivos/objective-actions'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CreateObjectiveForUserFormProps {
  orgDeptId: string
  assigneeId: string
  month: number
  year: number
  onSuccess: () => void
}

export function CreateObjectiveForUserForm({
  orgDeptId,
  assigneeId,
  month,
  year,
  onSuccess,
}: CreateObjectiveForUserFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const title = (form.get('title') as string).trim()
    const description = (form.get('description') as string).trim()
    const weight = parseInt(form.get('weight') as string, 10)
    const evidence_type = form.get('evidence_type') as 'document' | 'photo' | 'text' | 'checklist'
    const due_date = (form.get('due_date') as string) || null

    if (!title) {
      setError('El título es requerido.')
      setLoading(false)
      return
    }
    if (!weight || weight < 1 || weight > 100) {
      setError('El peso debe ser entre 1 y 100.')
      setLoading(false)
      return
    }

    const result = await createObjectiveWithDeliverable(orgDeptId, {
      title,
      description: description || undefined,
      month,
      year,
      weight,
      evidence_type,
      assignee_id: assigneeId,
      due_date,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      toast.success('Objetivo creado correctamente.')
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground mb-1">Nuevo objetivo</p>

      {/* Título */}
      <div className="space-y-1">
        <label htmlFor="obj-title" className="text-xs font-medium">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="obj-title"
          name="title"
          type="text"
          required
          placeholder="Ej: Incrementar ventas en zona norte"
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Descripción */}
      <div className="space-y-1">
        <label htmlFor="obj-description" className="text-xs font-medium">
          Descripción <span className="text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          id="obj-description"
          name="description"
          rows={2}
          placeholder="Detalles adicionales del objetivo..."
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        />
      </div>

      {/* Peso y tipo en fila */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="obj-weight" className="text-xs font-medium">
            Peso %
          </label>
          <input
            id="obj-weight"
            name="weight"
            type="number"
            min={1}
            max={100}
            defaultValue={25}
            required
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="obj-evidence-type" className="text-xs font-medium">
            Tipo de evidencia
          </label>
          <select
            id="obj-evidence-type"
            name="evidence_type"
            defaultValue="document"
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="document">Documento</option>
            <option value="photo">Fotografía</option>
            <option value="text">Texto libre</option>
            <option value="checklist">Checklist</option>
          </select>
        </div>
      </div>

      {/* Fecha límite */}
      <div className="space-y-1">
        <label htmlFor="obj-due-date" className="text-xs font-medium">
          Fecha límite de entrega <span className="text-muted-foreground">(opcional)</span>
        </label>
        <input
          id="obj-due-date"
          name="due_date"
          type="date"
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
          {error}
        </p>
      )}

      {/* Acciones */}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? 'Creando...' : 'Crear objetivo'}
        </Button>
      </div>
    </form>
  )
}
