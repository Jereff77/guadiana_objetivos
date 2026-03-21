'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createAssignment } from '@/app/(dashboard)/asignaciones/actions'

interface Survey { id: string; name: string; version: number }
interface Profile { id: string; first_name: string | null; last_name: string | null; role: string | null }

interface CreateAssignmentDialogProps {
  surveys: Survey[]
  profiles: Profile[]
}

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'operator', label: 'Operario' },
  { value: 'viewer', label: 'Visualizador' },
]

const FREQUENCIES = [
  { value: 'once', label: 'Una vez' },
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
]

export function CreateAssignmentDialog({ surveys, profiles }: CreateAssignmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [assigneeType, setAssigneeType] = useState<'role' | 'user'>('role')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [surveyId, setSurveyId] = useState('')
  const [assigneeRole, setAssigneeRole] = useState('')
  const [assigneeUserId, setAssigneeUserId] = useState('')
  const [frequency, setFrequency] = useState('')

  function resetForm() {
    setSurveyId('')
    setAssigneeRole('')
    setAssigneeUserId('')
    setFrequency('')
    setAssigneeType('role')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('survey_id', surveyId)
    formData.set('assignee_type', assigneeType)
    if (assigneeType === 'role') formData.set('assignee_role', assigneeRole)
    else formData.set('assignee_user_id', assigneeUserId)
    if (frequency) formData.set('required_frequency', frequency)

    setPending(true)
    const result = await createAssignment(formData)
    setPending(false)

    if (result?.error) {
      setError(result.error)
      return
    }
    setOpen(false)
    resetForm()
  }

  function handleOpenChange(value: boolean) {
    setOpen(value)
    if (!value) resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button style={{ backgroundColor: '#004B8D' }}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva asignación
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva asignación</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Formulario */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="survey_id">Formulario</Label>
            <Select value={surveyId} onValueChange={setSurveyId}>
              <SelectTrigger id="survey_id">
                <SelectValue placeholder="Selecciona un formulario publicado" />
              </SelectTrigger>
              <SelectContent>
                {surveys.length === 0 ? (
                  <SelectItem value="__empty" disabled>Sin formularios publicados</SelectItem>
                ) : (
                  surveys.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                      <span className="ml-1 text-muted-foreground text-xs">v{s.version}</span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de asignación */}
          <div className="flex flex-col gap-1.5">
            <Label>Asignar a</Label>
            <div className="flex rounded-md border overflow-hidden">
              <button
                type="button"
                className={`flex-1 py-1.5 text-sm transition-colors ${
                  assigneeType === 'role'
                    ? 'bg-[#004B8D] text-white'
                    : 'hover:bg-muted text-foreground'
                }`}
                onClick={() => setAssigneeType('role')}
              >
                Por rol
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-sm transition-colors border-l ${
                  assigneeType === 'user'
                    ? 'bg-[#004B8D] text-white'
                    : 'hover:bg-muted text-foreground'
                }`}
                onClick={() => setAssigneeType('user')}
              >
                Usuario específico
              </button>
            </div>
          </div>

          {/* Rol o usuario */}
          {assigneeType === 'role' ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role_select">Rol</Label>
              <Select value={assigneeRole} onValueChange={setAssigneeRole}>
                <SelectTrigger id="role_select">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user_select">Usuario</Label>
              <Select value={assigneeUserId} onValueChange={setAssigneeUserId}>
                <SelectTrigger id="user_select">
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.length === 0 ? (
                    <SelectItem value="__empty" disabled>Sin usuarios registrados</SelectItem>
                  ) : (
                    profiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {[p.first_name, p.last_name].filter(Boolean).join(' ') || 'Sin nombre'}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Frecuencia – T-303 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="frequency_select">Frecuencia</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency_select">
                <SelectValue placeholder="Sin frecuencia definida" />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vigencia – T-303 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="start_date">Fecha inicio</Label>
              <Input type="date" id="start_date" name="start_date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="end_date">Fecha fin</Label>
              <Input type="date" id="end_date" name="end_date" />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending || !surveyId} style={{ backgroundColor: '#004B8D' }}>
              {pending ? 'Guardando…' : 'Crear asignación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
