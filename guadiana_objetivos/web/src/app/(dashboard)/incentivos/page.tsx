import { checkPermission, checkIsRoot } from '@/lib/permissions'
import { redirect } from 'next/navigation'
import { getAllIncentiveRecords, getIncentiveSummary, getMyIncentiveHistory, getLateDeliverables } from './incentive-actions'
import { LateDeliverablesList } from '@/components/incentivos/late-deliverables-list'
import { IncentiveRecordRow } from '@/components/incentivos/incentive-record-row'
import Link from 'next/link'

export const metadata = { title: 'Incentivos — Guadiana' }

const MONTHS = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

interface PageProps {
  searchParams: Promise<{ month?: string; year?: string; calc?: string; msg?: string }>
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

export default async function IncentivosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const now = new Date()
  const month = params.month ? Number(params.month) : now.getMonth() + 1
  const year = params.year ? Number(params.year) : now.getFullYear()
  const calc = params.calc
  const calcMsg = params.msg ? decodeURIComponent(params.msg) : undefined

  const [canViewIncentivos, canViewObjetivos, canManage, canApprove, isRoot] = await Promise.all([
    checkPermission('incentivos.view'),
    checkPermission('objetivos.view'),
    checkPermission('incentivos.manage'),
    checkPermission('incentivos.approve'),
    checkIsRoot(),
  ])

  // Accede quien gestiona incentivos O quien gestiona objetivos (responsables de depto)
  if (!canViewIncentivos && !canViewObjetivos && !isRoot) {
    redirect('/dashboard')
  }

  const [recordsResult, summaryResult, lateResult] = await Promise.all([
    getAllIncentiveRecords(month, year),
    getIncentiveSummary(month, year),
    canApprove || isRoot ? getLateDeliverables() : Promise.resolve({ success: true, data: [] }),
  ])

  const records = recordsResult.success ? (recordsResult.data ?? []) : []
  const summary = summaryResult.success ? summaryResult.data : null
  const canActOnRecords = canApprove || isRoot
  const lateDeliverables = lateResult.success ? (lateResult.data ?? []) : []

  const myHistoryResult = await getMyIncentiveHistory()
  const myRecords = myHistoryResult.success ? (myHistoryResult.data ?? []) : []
  const myCurrentRecord = myRecords.find((r) => r.month === month && r.year === year)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incentivos</h1>
          <p className="text-muted-foreground text-sm">
            {MONTHS[month]} {year} · Bonificaciones por cumplimiento de objetivos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(canManage || isRoot) && (
            <>
              <Link
                href="/incentivos/configurar"
                className="rounded-md border px-4 py-2 text-sm hover:bg-muted transition-colors"
              >
                Configurar esquemas
              </Link>
              <form method="GET" action="/incentivos/calcular" style={{ display: 'inline' }}>
                <input type="hidden" name="month" value={month} />
                <input type="hidden" name="year" value={year} />
                <Link
                  href={`/incentivos/calcular?month=${month}&year=${year}`}
                  className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Calcular incentivos
                </Link>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Banner resultado cálculo */}
      {calc && calcMsg && (
        <div className={`rounded-md border px-4 py-3 text-sm ${
          calc === 'ok'
            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300'
            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300'
        }`}>
          {calc === 'ok' ? '✓ ' : '✗ '}{calcMsg}
        </div>
      )}

      {/* Filtro de período */}
      <form className="flex items-center gap-3 flex-wrap">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Mes</label>
          <select
            name="month"
            defaultValue={month}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            {MONTHS.slice(1).map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Año</label>
          <select
            name="year"
            defaultValue={year}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="pt-5">
          <button
            type="submit"
            className="rounded-md bg-secondary text-secondary-foreground px-4 py-1.5 text-sm hover:bg-secondary/80"
          >
            Filtrar
          </button>
        </div>
      </form>

      {/* Mi incentivo del período */}
      {myCurrentRecord && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Mi incentivo — {MONTHS[month]} {year}</h2>
          <div className="max-w-md">
            <IncentiveRecordRow record={myCurrentRecord} canApprove={false} showUser={false} />
          </div>
        </section>
      )}

      {/* Resumen global (solo con permiso incentivos.view) */}
      {summary && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Resumen del período</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <SummaryCard
              label="Total registros"
              value={String(summary.total_records)}
            />
            <SummaryCard
              label="En borrador"
              value={String(summary.total_draft)}
              sub={`$${summary.total_amount_draft.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`}
            />
            <SummaryCard
              label="Aprobados"
              value={String(summary.total_approved)}
              sub={`$${summary.total_amount_approved.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`}
            />
            <SummaryCard
              label="Pagados"
              value={String(summary.total_paid)}
              sub={`$${summary.total_amount_paid.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`}
            />
            <SummaryCard
              label="Total aprobado"
              value={`$${summary.total_amount_approved.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`}
            />
            <SummaryCard
              label="Total pagado"
              value={`$${summary.total_amount_paid.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`}
            />
          </div>
        </section>
      )}

      {/* Lista de todos los registros */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Registros — {MONTHS[month]} {year}
          {records.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({records.length})</span>
          )}
        </h2>

        {recordsResult.error && (
          <p className="text-sm text-red-600">{recordsResult.error}</p>
        )}

        {records.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              No hay registros de incentivos para {MONTHS[month]} {year}.
            </p>
            {(canManage || isRoot) && (
              <p className="text-sm text-muted-foreground mt-1">
                Usa el botón <strong>Calcular incentivos</strong> para generar los registros del período.
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => (
              <IncentiveRecordRow
                key={record.id}
                record={record}
                canApprove={canActOnRecords}
                showUser={true}
              />
            ))}
          </div>
        )}
      </section>

      {/* Mi historial completo */}
      {myRecords.length > 1 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Mi historial completo</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myRecords.map((record) => (
              <IncentiveRecordRow
                key={record.id}
                record={record}
                canApprove={false}
                showUser={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Entregas tardías pendientes */}
      {(canApprove || isRoot) && (
        <section>
          <h2 className="text-lg font-semibold mb-3">
            Entregas tardías pendientes de autorización
            {lateDeliverables.length > 0 && (
              <span className="ml-2 text-sm font-normal text-amber-600">
                ({lateDeliverables.length})
              </span>
            )}
          </h2>
          {lateDeliverables.length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-center">
              <p className="text-muted-foreground text-sm">No hay entregas tardías pendientes.</p>
            </div>
          ) : (
            <LateDeliverablesList items={lateDeliverables} />
          )}
        </section>
      )}

      {/* Exportar */}
      {(canManage || isRoot || canApprove) && records.length > 0 && (
        <div className="pt-4 border-t">
          <Link
            href={`/api/incentivos/export?month=${month}&year=${year}`}
            className="text-sm text-primary hover:underline"
          >
            Exportar CSV — {MONTHS[month]} {year}
          </Link>
        </div>
      )}
    </div>
  )
}
