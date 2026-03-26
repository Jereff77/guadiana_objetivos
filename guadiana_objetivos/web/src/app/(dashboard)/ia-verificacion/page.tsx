import { requirePermission, checkPermission, checkIsRoot } from '@/lib/permissions'
import { getAiAnalysisLog, getAiPrompts } from './ia-actions'
import { AnalysisResultCard } from '@/components/ia/analysis-result-card'
import { PromptEditor } from '@/components/ia/prompt-editor'

export const metadata = { title: 'IA y Verificación — Guadiana' }

const VERDICT_SUMMARY: Record<string, { label: string; color: string }> = {
  approved:     { label: 'Aprobados',          color: 'text-green-600' },
  rejected:     { label: 'Rechazados',         color: 'text-red-500' },
  needs_review: { label: 'Requieren revisión', color: 'text-yellow-600' },
}

export default async function IaVerificacionPage() {
  await requirePermission('ia.view')

  const [canConfigure, canReview, isRoot] = await Promise.all([
    checkPermission('ia.configure'),
    checkPermission('objetivos.review'),
    checkIsRoot(),
  ])

  const [logsResult, promptsResult] = await Promise.all([
    getAiAnalysisLog(100),
    getAiPrompts(),
  ])

  const logs = logsResult.success ? (logsResult.data ?? []) : []
  const prompts = promptsResult.success ? (promptsResult.data ?? []) : []

  // Estadísticas rápidas
  const stats = {
    total: logs.length,
    approved: logs.filter((l) => l.verdict === 'approved').length,
    rejected: logs.filter((l) => l.verdict === 'rejected').length,
    needs_review: logs.filter((l) => l.verdict === 'needs_review').length,
    pending_human: logs.filter((l) => !l.human_verdict).length,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">IA y Verificación</h1>
        <p className="text-muted-foreground text-sm">
          Log de análisis automáticos y configuración de prompts del sistema.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total análisis</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        {(['approved', 'rejected', 'needs_review'] as const).map((v) => (
          <div key={v} className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">{VERDICT_SUMMARY[v].label}</p>
            <p className={`text-2xl font-bold mt-1 ${VERDICT_SUMMARY[v].color}`}>
              {stats[v]}
            </p>
          </div>
        ))}
      </div>

      {stats.pending_human > 0 && (canReview || isRoot) && (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
          <strong>{stats.pending_human}</strong> análisis pendientes de revisión humana.
        </div>
      )}

      {/* Log de análisis */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Log de análisis IA
          {logs.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({logs.length} últimos)
            </span>
          )}
        </h2>

        {logsResult.error && (
          <p className="text-sm text-red-600">{logsResult.error}</p>
        )}

        {logs.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">No hay análisis de IA registrados aún.</p>
            <p className="text-sm text-muted-foreground mt-1">
              El análisis se inicia desde la página de detalle de un entregable.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {logs.map((log) => (
              <AnalysisResultCard
                key={log.id}
                log={log}
                canReview={canReview || isRoot}
              />
            ))}
          </div>
        )}
      </section>

      {/* Configuración de prompts */}
      {(canConfigure || isRoot) && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Prompts del sistema</h2>
          {promptsResult.error ? (
            <p className="text-sm text-red-600">{promptsResult.error}</p>
          ) : (
            <PromptEditor
              prompts={prompts}
              canConfigure={canConfigure || isRoot}
            />
          )}
        </section>
      )}

      {/* Vista de solo lectura de prompts para ia.view */}
      {!canConfigure && !isRoot && prompts.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Prompts configurados</h2>
          <PromptEditor prompts={prompts} canConfigure={false} />
        </section>
      )}
    </div>
  )
}
