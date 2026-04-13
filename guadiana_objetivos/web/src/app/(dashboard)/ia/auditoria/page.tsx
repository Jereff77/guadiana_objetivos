import { requirePermission } from '@/lib/permissions'
import { getAuditSummary } from './audit-actions'
import { AuditClient } from './audit-client'

export const metadata = { title: 'Auditoría de IA — GUADIANA' }

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>
}) {
  await requirePermission('ia.configure')

  const params = await searchParams
  const days = Number(params.dias) || 30
  const { data: rows, error } = await getAuditSummary(days)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Auditoría de IA</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Trazabilidad de conversaciones, modelos y consumo de tokens por usuario.
        </p>
      </div>

      {error ? (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          Error al cargar datos: {error}
        </div>
      ) : (
        <AuditClient rows={rows || []} initialDays={days} />
      )}
    </div>
  )
}
