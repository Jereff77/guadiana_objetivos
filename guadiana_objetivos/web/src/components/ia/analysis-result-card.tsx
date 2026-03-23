'use client'

import { useState, useTransition } from 'react'
import { submitHumanReview, type AiAnalysisLog } from '@/app/(dashboard)/ia-verificacion/ia-actions'

const VERDICT_STYLES: Record<string, { label: string; classes: string }> = {
  approved:     { label: 'Aprobado',          classes: 'bg-green-100 text-green-700 border-green-200' },
  rejected:     { label: 'Rechazado',         classes: 'bg-red-100 text-red-700 border-red-200' },
  needs_review: { label: 'Requiere revisión', classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
}

interface AnalysisResultCardProps {
  log: AiAnalysisLog
  canReview?: boolean
}

export function AnalysisResultCard({ log, canReview = false }: AnalysisResultCardProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const verdict = VERDICT_STYLES[log.verdict] ?? { label: log.verdict, classes: 'bg-gray-100 text-gray-600' }
  const humanVerdict = log.human_verdict
    ? (VERDICT_STYLES[log.human_verdict] ?? { label: log.human_verdict, classes: 'bg-gray-100 text-gray-600' })
    : null

  function handleReview(v: 'approved' | 'rejected') {
    setError(null)
    startTransition(async () => {
      const result = await submitHumanReview(log.id, v)
      if (!result.success) setError(result.error ?? 'Error al guardar revisión.')
    })
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{log.deliverable_title ?? 'Entregable'}</p>
          {log.objective_title && (
            <p className="text-xs text-muted-foreground truncate">{log.objective_title}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${verdict.classes}`}>
            IA: {verdict.label}
          </span>
          {humanVerdict && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${humanVerdict.classes}`}>
              Humano: {humanVerdict.label}
            </span>
          )}
        </div>
      </div>

      {/* Confianza */}
      {log.confidence !== null && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Confianza:</span>
          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-primary"
              style={{ width: `${Math.round((log.confidence ?? 0) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium">{Math.round((log.confidence ?? 0) * 100)}%</span>
        </div>
      )}

      {/* Resumen */}
      {log.summary && (
        <p className="text-sm text-muted-foreground">{log.summary}</p>
      )}

      {/* Hallazgos */}
      {log.findings && (log.findings.positive.length > 0 || log.findings.negative.length > 0) && (
        <div className="space-y-1.5">
          {log.findings.positive.map((f, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs">
              <span className="text-green-600 shrink-0 mt-0.5">✓</span>
              <span>{f}</span>
            </div>
          ))}
          {log.findings.negative.map((f, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs">
              <span className="text-red-500 shrink-0 mt-0.5">✗</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
        <span>
          {log.model_used && `Modelo: ${log.model_used}`}
          {log.prompt_used && ` · Prompt: ${log.prompt_used}`}
        </span>
        <span>{new Date(log.created_at).toLocaleDateString('es-MX')}</span>
      </div>

      {/* Revisión humana */}
      {log.reviewed_by && log.reviewer_name && (
        <p className="text-xs text-muted-foreground">
          Revisado por {log.reviewer_name}
          {log.reviewed_at && ` el ${new Date(log.reviewed_at).toLocaleDateString('es-MX')}`}
        </p>
      )}

      {/* Acciones de revisión */}
      {canReview && !log.human_verdict && (
        <div className="flex gap-2 pt-1">
          {error && <p className="text-xs text-red-600 w-full">{error}</p>}
          <button
            onClick={() => handleReview('approved')}
            disabled={isPending}
            className="text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            Aprobar
          </button>
          <button
            onClick={() => handleReview('rejected')}
            disabled={isPending}
            className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            Rechazar
          </button>
        </div>
      )}
    </div>
  )
}
