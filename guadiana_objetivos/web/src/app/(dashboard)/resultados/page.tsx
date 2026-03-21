import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Resultados' }
import { Download, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { RunsTable } from '@/components/resultados/runs-table'

interface PageProps {
  searchParams: Promise<{ status?: string; from?: string; to?: string }>
}

const inputClass =
  'h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

export default async function ResultadosPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const status = params.status ?? ''
  const from   = params.from   ?? ''
  const to     = params.to     ?? ''
  const hasFilters = !!(status || from || to)

  // ── Query runs ──────────────────────────────────────────────────────────────
  let query = supabase
    .from('resp_survey_runs')
    .select('id, survey_id, respondent_id, branch_id, started_at, completed_at, status, form_surveys(name)')
    .order('started_at', { ascending: false })
    .limit(200)

  if (status) query = query.eq('status', status)
  if (from)   query = query.gte('started_at', `${from}T00:00:00`)
  if (to)     query = query.lte('started_at', `${to}T23:59:59.999`)

  const { data: runs } = await query

  // ── Respondent profiles ──────────────────────────────────────────────────────
  const respondentIds = [...new Set((runs ?? []).map((r) => r.respondent_id))]
  const { data: profiles } = respondentIds.length > 0
    ? await supabase.from('app_profiles').select('id, first_name, last_name').in('id', respondentIds)
    : { data: [] }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  return (
    <>
      <Header
        title="Resultados"
        description="Ejecuciones de formularios completadas y en progreso"
      />
      <div className="flex flex-1 flex-col gap-4 p-6">
        {/* ── Filters ── */}
        <form method="GET" action="/resultados" className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Estado</label>
            <select name="status" defaultValue={status} className={inputClass}>
              <option value="">Todos los estados</option>
              <option value="completed">Completado</option>
              <option value="in_progress">En progreso</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Desde</label>
            <input type="date" name="from" defaultValue={from} className={inputClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Hasta</label>
            <input type="date" name="to" defaultValue={to} className={inputClass} />
          </div>

          <button
            type="submit"
            className="h-9 rounded-md px-4 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#004B8D' }}
          >
            Filtrar
          </button>

          {hasFilters && (
            <Link
              href="/resultados"
              className="h-9 flex items-center rounded-md border px-4 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Limpiar
            </Link>
          )}

          {/* Estadísticas – T-404 */}
          <Link
            href="/resultados/estadisticas"
            className="h-9 flex items-center gap-2 rounded-md border px-4 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <BarChart2 className="h-4 w-4" />
            Estadísticas
          </Link>

          {/* Exportar CSV – T-403 */}
          <a
            href={`/api/resultados/export${hasFilters ? `?${new URLSearchParams({ ...(status && { status }), ...(from && { from }), ...(to && { to }) })}` : ''}`}
            className="ml-auto h-9 flex items-center gap-2 rounded-md border px-4 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </a>
        </form>

        {/* ── Count ── */}
        {runs && runs.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {runs.length === 200 ? 'Mostrando los últimos 200 resultados' : `${runs.length} ejecución${runs.length !== 1 ? 'es' : ''}`}
          </p>
        )}

        {/* ── Table ── */}
        <RunsTable runs={runs ?? []} profileMap={profileMap} />
      </div>
    </>
  )
}
