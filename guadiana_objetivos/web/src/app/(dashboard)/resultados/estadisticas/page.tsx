import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Estadísticas' }
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import {
  FormCompletionChart,
  WeeklyTrendChart,
  BranchComplianceChart,
  KpiCard,
  type FormStat,
  type WeekStat,
  type BranchStat,
} from '@/components/resultados/kpi-charts'

export default async function EstadisticasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ── Raw runs ───────────────────────────────────────────────────────────────
  const { data: runs } = await supabase
    .from('resp_survey_runs')
    .select('id, survey_id, branch_id, started_at, status, form_surveys(name)')
    .order('started_at', { ascending: true })
    .limit(2000)

  const allRuns = runs ?? []

  // ── KPI totals ─────────────────────────────────────────────────────────────
  const total      = allRuns.length
  const completed  = allRuns.filter((r) => r.status === 'completed').length
  const inProgress = allRuns.filter((r) => r.status === 'in_progress').length
  const pctCompleted = total > 0 ? Math.round((completed / total) * 100) : 0

  // ── Per-form stats ─────────────────────────────────────────────────────────
  const formMap = new Map<string, { name: string; completadas: number; en_progreso: number }>()
  for (const r of allRuns) {
    const fs = r.form_surveys as { name: string }[] | { name: string } | null
    const name = !fs ? r.survey_id
      : Array.isArray(fs) ? (fs[0]?.name ?? r.survey_id)
      : (fs.name ?? r.survey_id)
    if (!formMap.has(r.survey_id)) {
      formMap.set(r.survey_id, { name, completadas: 0, en_progreso: 0 })
    }
    const entry = formMap.get(r.survey_id)!
    if (r.status === 'completed') entry.completadas++
    else entry.en_progreso++
  }

  const formStats: FormStat[] = Array.from(formMap.values()).map((f) => ({
    name: f.name.length > 22 ? f.name.slice(0, 20) + '…' : f.name,
    completadas: f.completadas,
    en_progreso: f.en_progreso,
    total: f.completadas + f.en_progreso,
    pct: f.completadas + f.en_progreso > 0
      ? Math.round((f.completadas / (f.completadas + f.en_progreso)) * 100)
      : 0,
  })).sort((a, b) => b.total - a.total).slice(0, 10)

  // ── Weekly trend ───────────────────────────────────────────────────────────
  const weekMap = new Map<string, { completadas: number; en_progreso: number }>()
  for (const r of allRuns) {
    const d = new Date(r.started_at)
    // ISO week label: YYYY-Www
    const jan4 = new Date(d.getFullYear(), 0, 4)
    const weekNum = Math.ceil(((d.getTime() - jan4.getTime()) / 86400000 + jan4.getDay() + 1) / 7)
    const key = `${d.getFullYear()}-S${String(weekNum).padStart(2, '0')}`
    if (!weekMap.has(key)) weekMap.set(key, { completadas: 0, en_progreso: 0 })
    const entry = weekMap.get(key)!
    if (r.status === 'completed') entry.completadas++
    else entry.en_progreso++
  }

  const weekStats: WeekStat[] = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([semana, v]) => ({ semana, ...v }))

  // ── Branch stats ───────────────────────────────────────────────────────────
  const branchMap = new Map<string, { completadas: number; total: number }>()
  for (const r of allRuns) {
    const key = r.branch_id ?? 'Sin sucursal'
    if (!branchMap.has(key)) branchMap.set(key, { completadas: 0, total: 0 })
    const entry = branchMap.get(key)!
    entry.total++
    if (r.status === 'completed') entry.completadas++
  }

  const branchStats: BranchStat[] = Array.from(branchMap.entries())
    .map(([sucursal, v]) => ({
      sucursal: sucursal.length > 18 ? sucursal.slice(0, 16) + '…' : sucursal,
      completadas: v.completadas,
      total: v.total,
      pct: v.total > 0 ? Math.round((v.completadas / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 10)

  return (
    <>
      <Header
        title="Estadísticas"
        description="Cumplimiento y KPIs de ejecuciones de formularios"
      />
      <div className="flex flex-1 flex-col gap-6 p-6">

        {/* Back link */}
        <div className="flex items-center gap-2">
          <Link href="/resultados">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver a resultados
            </Button>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Total ejecuciones" value={total} />
          <KpiCard
            label="Completadas"
            value={completed}
            sub={`${pctCompleted}% del total`}
            color="#004B8D"
          />
          <KpiCard
            label="En progreso"
            value={inProgress}
            color="#FF8F1C"
          />
          <KpiCard
            label="% Cumplimiento"
            value={`${pctCompleted}%`}
            sub={total === 0 ? 'Sin datos aún' : `${completed} de ${total}`}
            color={pctCompleted >= 80 ? '#16a34a' : pctCompleted >= 50 ? '#FF8F1C' : '#ef4444'}
          />
        </div>

        {/* Form completion */}
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#004B8D' }}>
            Ejecuciones por formulario
          </h2>
          <FormCompletionChart data={formStats} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Weekly trend */}
          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-sm font-semibold mb-4" style={{ color: '#004B8D' }}>
              Tendencia semanal (últimas 12 semanas)
            </h2>
            <WeeklyTrendChart data={weekStats} />
          </div>

          {/* Branch compliance */}
          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-sm font-semibold mb-4" style={{ color: '#004B8D' }}>
              % Cumplimiento por sucursal
            </h2>
            <BranchComplianceChart data={branchStats} />
          </div>
        </div>

      </div>
    </>
  )
}
