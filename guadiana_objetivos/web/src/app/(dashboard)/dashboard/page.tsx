import { requirePermission, checkPermission } from '@/lib/permissions'
import {
  getDashboardKpis,
  getDepartmentRanking,
  getActiveAlerts,
} from './dashboard-actions'
import { DeptKpiCard } from '@/components/dashboard/dept-kpi-card'
import { RankingTable } from '@/components/dashboard/ranking-table'
import { AlertPanel } from '@/components/dashboard/alert-badge'
import { ComplianceBarChart } from '@/components/dashboard/dashboard-charts'
import Link from 'next/link'

function KpiCard({ label, value, color = '#004B8D' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-lg border bg-card p-5 flex flex-col gap-1">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
    </div>
  )
}

export const metadata = { title: 'Dashboard — Guadiana' }

interface PageProps {
  searchParams: Promise<{ month?: string; year?: string }>
}

const MONTHS = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default async function DashboardPage({ searchParams }: PageProps) {
  await requirePermission('dashboard.view')

  const sp = await searchParams
  const now = new Date()
  const month = sp.month ? parseInt(sp.month) : now.getMonth() + 1
  const year  = sp.year  ? parseInt(sp.year)  : now.getFullYear()

  const [kpis, ranking, alerts, canExport] = await Promise.all([
    getDashboardKpis(month, year),
    getDepartmentRanking(month, year),
    getActiveAlerts(),
    checkPermission('dashboard.export'),
  ])

  const complianceData = kpis.depts
    .filter((d) => d.objectives_count > 0)
    .map((d) => ({ name: d.dept_name, pct: d.completion_pct }))

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Período: <strong>{MONTHS[month]} {year}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Selector mes/año */}
          <form className="flex items-center gap-2">
            <select
              name="month"
              defaultValue={month}
              className="rounded border border-input bg-background px-2 py-1.5 text-sm"
            >
              {MONTHS.slice(1).map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              name="year"
              defaultValue={year}
              className="rounded border border-input bg-background px-2 py-1.5 text-sm"
            >
              {[year - 1, year, year + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded bg-brand-blue text-white px-3 py-1.5 text-sm hover:bg-brand-blue/90"
            >
              Ver
            </button>
          </form>

          {canExport && (
            <a
              href={`/api/objetivos/export?month=${month}&year=${year}`}
              className="rounded border border-input bg-background px-3 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              Exportar CSV
            </a>
          )}
        </div>
      </div>

      {/* KPIs globales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Departamentos" value={kpis.total_depts} />
        <KpiCard
          label="Cumplimiento promedio"
          value={`${kpis.avg_completion}%`}
          color={kpis.avg_completion >= 80 ? '#16a34a' : kpis.avg_completion >= 50 ? '#f97316' : '#ef4444'}
        />
        <KpiCard label="Entregables aprobados" value={kpis.total_approved} color="#16a34a" />
        <KpiCard label="Pendientes de revisión" value={kpis.total_pending} color="#f97316" />
      </div>

      {/* Grid de departamentos */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Cumplimiento por departamento</h2>
          <Link href="/objetivos" className="text-xs text-brand-blue hover:underline">
            Ver todos →
          </Link>
        </div>
        {kpis.depts.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">No hay departamentos con objetivos en este período.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.depts.map((dept) => (
              <DeptKpiCard key={dept.dept_id} kpi={dept} />
            ))}
          </div>
        )}
      </section>

      {/* Gráfica de barras */}
      {complianceData.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3">Comparativa de cumplimiento</h2>
          <div className="rounded-lg border bg-card p-4">
            <ComplianceBarChart data={complianceData} />
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking */}
        <section>
          <h2 className="text-base font-semibold mb-3">Ranking de departamentos</h2>
          <RankingTable ranking={ranking} />
        </section>

        {/* Alertas */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">
              Alertas activas
              {alerts.length > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  {alerts.length}
                </span>
              )}
            </h2>
          </div>
          <AlertPanel alerts={alerts} />
        </section>
      </div>
    </div>
  )
}
