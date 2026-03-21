'use client'

import { useState } from 'react'
import { MoreHorizontal, Power, PowerOff, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toggleAssignment, deleteAssignment } from '@/app/(dashboard)/asignaciones/actions'

type Assignment = {
  id: string
  survey_id: string
  assignee_user_id: string | null
  assignee_role: string | null
  required_frequency: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
  form_surveys: { name: string; status: string } | null
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  operator: 'Operario',
  viewer: 'Visualizador',
}

const FREQUENCY_LABELS: Record<string, string> = {
  once: 'Una vez',
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function AssignmentRow({ assignment }: { assignment: Assignment }) {
  const [pending, setPending] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function handleToggle() {
    setPending(true)
    await toggleAssignment(assignment.id, !assignment.is_active)
    setPending(false)
  }

  async function handleDelete() {
    setPending(true)
    await deleteAssignment(assignment.id)
    setPending(false)
    setDeleteOpen(false)
  }

  const assigneeLabel = assignment.assignee_role
    ? `Rol: ${ROLE_LABELS[assignment.assignee_role] ?? assignment.assignee_role}`
    : assignment.assignee_user_id
      ? `Usuario: ${assignment.assignee_user_id.slice(0, 8)}…`
      : '—'

  const periodLabel = (() => {
    const start = formatDate(assignment.start_date)
    const end = formatDate(assignment.end_date)
    if (start && end) return `${start} — ${end}`
    if (start) return `Desde ${start}`
    if (end) return `Hasta ${end}`
    return '—'
  })()

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          {assignment.form_surveys?.name ?? '—'}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">{assigneeLabel}</TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {assignment.required_frequency
            ? FREQUENCY_LABELS[assignment.required_frequency] ?? assignment.required_frequency
            : '—'}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">{periodLabel}</TableCell>
        <TableCell>
          <Badge variant={assignment.is_active ? 'default' : 'secondary'}>
            {assignment.is_active ? 'Activa' : 'Inactiva'}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={pending}>
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggle}>
                {assignment.is_active ? (
                  <>
                    <PowerOff className="h-4 w-4 mr-2" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4 mr-2" />
                    Activar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta asignación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {pending ? 'Eliminando…' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface AssignmentsTableProps {
  assignments: Assignment[]
}

export function AssignmentsTable({ assignments }: AssignmentsTableProps) {
  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-muted-foreground text-sm">
          No hay asignaciones creadas. Crea una nueva para comenzar.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Formulario</TableHead>
            <TableHead>Asignado a</TableHead>
            <TableHead>Frecuencia</TableHead>
            <TableHead>Vigencia</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((a) => (
            <AssignmentRow key={a.id} assignment={a} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
