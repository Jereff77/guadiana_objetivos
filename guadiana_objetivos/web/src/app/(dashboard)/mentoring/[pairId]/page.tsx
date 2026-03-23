import { requirePermission, checkIsRoot } from '@/lib/permissions'
import {
  getMentoringPair,
  getSessionsByPair,
  getMentoringReport,
} from '../mentoring-actions'
import { NewSessionForm, SessionRow } from '@/components/mentoring/session-form'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Detalle de Par — Mentoring' }

interface PageProps {
  params: Promise<{ pairId: string }>
}

export default async function MentoringPairPage({ params }: PageProps) {
  await requirePermission('mentoring.view')

  const { pairId } = await params
  const isRoot = await checkIsRoot()

  const [pairResult, sessionsResult, reportResult] = await Promise.all([
    getMentoringPair(pairId),
    getSessionsByPair(pairId),
    getMentoringReport(pairId),
  ])

  if (!pairResult.success || !pairResult.data) notFound()

  const pair = pairResult.data
  const sessions = sessionsResult.success ? (sessionsResult.data ?? []) : []
  const report = reportResult.success ? reportResult.data : null

  // Obtener usuario actual para saber si es mentor o mentee
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isMentor = pair.mentor_id === user?.id || isRoot
  const isMentee = pair.mentee_id === user?.id

  // Obtener objetivos activos para vincular a sesiones
  const { data: objectives } = await supabase
    .from('objectives')
    .select('id, title')
    .eq('status', 'active')
    .order('title')

  const scheduledSessions = sessions.filter((s) => s.status === 'scheduled')
  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const cancelledSessions = sessions.filter((s) => s.status === 'cancelled')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/mentoring" className="text-sm text-muted-foreground hover:text-foreground">
              ← Mentoring
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {pair.mentor_name} → {pair.mentee_name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Desde {new Date(pair.start_date).toLocaleDateString('es-MX')}
            {pair.end_date && ` · Hasta ${new Date(pair.end_date).toLocaleDateString('es-MX')}`}
            {' · '}
            <span className={pair.is_active ? 'text-green-600' : 'text-muted-foreground'}>
              {pair.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </p>
        </div>
      </div>

      {/* Objetivos del programa */}
      {pair.objectives && (
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium mb-1">Objetivos del programa</p>
          <p className="text-sm text-muted-foreground">{pair.objectives}</p>
        </div>
      )}

      {/* Reporte */}
      {report && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Resumen</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Total sesiones', value: String(report.total_sessions) },
              { label: 'Completadas', value: String(report.completed), color: 'text-green-600' },
              { label: 'Programadas', value: String(report.scheduled), color: 'text-blue-600' },
              { label: 'Canceladas', value: String(report.cancelled), color: 'text-gray-500' },
              {
                label: 'Rating mentor (promedio)',
                value: report.avg_mentor_rating
                  ? `${report.avg_mentor_rating.toFixed(1)} ★`
                  : '—',
              },
              {
                label: 'Rating mentee (promedio)',
                value: report.avg_mentee_rating
                  ? `${report.avg_mentee_rating.toFixed(1)} ★`
                  : '—',
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-xl font-bold mt-1 ${color ?? ''}`}>{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Programar nueva sesión (solo mentor) */}
      {isMentor && pair.is_active && (
        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Programar sesión</h2>
          <NewSessionForm
            pairId={pairId}
            objectives={objectives ?? []}
          />
        </section>
      )}

      {/* Sesiones programadas */}
      {scheduledSessions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">
            Próximas sesiones ({scheduledSessions.length})
          </h2>
          <div className="space-y-3">
            {scheduledSessions.map((s) => (
              <SessionRow key={s.id} session={s} isMentor={isMentor} isMentee={isMentee} />
            ))}
          </div>
        </section>
      )}

      {/* Sesiones completadas */}
      {completedSessions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">
            Sesiones completadas ({completedSessions.length})
          </h2>
          <div className="space-y-3">
            {completedSessions.map((s) => (
              <SessionRow key={s.id} session={s} isMentor={isMentor} isMentee={isMentee} />
            ))}
          </div>
        </section>
      )}

      {/* Sesiones canceladas */}
      {cancelledSessions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
            Sesiones canceladas ({cancelledSessions.length})
          </h2>
          <div className="space-y-3">
            {cancelledSessions.map((s) => (
              <SessionRow key={s.id} session={s} isMentor={isMentor} isMentee={isMentee} />
            ))}
          </div>
        </section>
      )}

      {sessions.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">No hay sesiones registradas para este par.</p>
          {isMentor && <p className="text-sm text-muted-foreground mt-1">Usa el formulario de arriba para programar la primera sesión.</p>}
        </div>
      )}
    </div>
  )
}
