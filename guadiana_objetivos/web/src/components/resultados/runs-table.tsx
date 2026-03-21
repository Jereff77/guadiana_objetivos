import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

type Run = {
  id: string
  survey_id: string
  respondent_id: string
  branch_id: string | null
  started_at: string
  completed_at: string | null
  status: string
  form_surveys: { name: string }[] | { name: string } | null
}

type Profile = { id: string; first_name: string | null; last_name: string | null }

interface RunsTableProps {
  runs: Run[]
  profileMap: Map<string, Profile>
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  completed:   { label: 'Completado',   variant: 'default' },
  in_progress: { label: 'En progreso',  variant: 'secondary' },
}

function formatDateTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function profileName(profile: Profile | undefined, fallbackId: string) {
  if (!profile) return fallbackId.slice(0, 8) + '…'
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
  return name || fallbackId.slice(0, 8) + '…'
}

export function RunsTable({ runs, profileMap }: RunsTableProps) {
  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-muted-foreground text-sm">
          No se encontraron ejecuciones con los filtros aplicados.
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
            <TableHead>Respondente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Inicio</TableHead>
            <TableHead>Completado</TableHead>
            <TableHead className="text-right">Detalle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => {
            const statusInfo = STATUS_LABELS[run.status] ?? { label: run.status, variant: 'outline' as const }
            return (
              <TableRow key={run.id}>
                <TableCell className="font-medium">
                  {Array.isArray(run.form_surveys)
                    ? (run.form_surveys[0]?.name ?? '—')
                    : (run.form_surveys?.name ?? '—')}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {profileName(profileMap.get(run.respondent_id), run.respondent_id)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDateTime(run.started_at)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDateTime(run.completed_at)}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/resultados/${run.id}`}>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
