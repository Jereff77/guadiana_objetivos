'use client'

import { useState } from 'react'
import { Download, ExternalLink, FileText } from 'lucide-react'
import { reviewDeliverable } from '../../app/(dashboard)/objetivos/deliverable-actions'
import type { Evidence } from '../../app/(dashboard)/objetivos/deliverable-actions'

interface ReviewPanelProps {
  deliverableId: string
  evidences?: Evidence[]
  onSuccess?: () => void
}

export function ReviewPanel({ deliverableId, evidences = [], onSuccess }: ReviewPanelProps) {
  const [verdict, setVerdict] = useState<'approved' | 'rejected' | ''>('')
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!verdict) {
      setError('Selecciona un veredicto')
      return
    }
    if (verdict === 'rejected' && !comment.trim()) {
      setError('El motivo de rechazo es obligatorio')
      return
    }

    setSaving(true)
    setError(null)

    const result = await reviewDeliverable(deliverableId, verdict, comment)
    setSaving(false)

    if (result.error) {
      setError(result.error)
    } else {
      onSuccess?.()
    }
  }

  const hasEvidences = evidences && evidences.length > 0

  return (
    <form onSubmit={handleSubmit} className="border rounded-md p-3 space-y-3 bg-muted/20">
      <h4 className="text-xs font-semibold">Revisar entregable</h4>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
          {error}
        </p>
      )}

      {/* Mostrar evidencias para revisión */}
      {hasEvidences && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">
            Evidencias enviadas ({evidences.length}):
          </p>
          {evidences.map((ev) => (
            <div key={ev.id} className="border rounded-md p-2 bg-background">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  {ev.submitter_name || 'Usuario'}
                </span>
              </div>

              {/* Archivo */}
              {ev.storage_path && (
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs truncate flex-1">{ev.storage_path.split('/').pop()}</span>
                  <a
                    href={`/api/objetivos/evidence?path=${encodeURIComponent(ev.storage_path)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-blue hover:underline flex items-center gap-1 shrink-0"
                  >
                    <Download className="h-3 w-3" />
                    Descargar
                  </a>
                </div>
              )}

              {/* URL */}
              {ev.evidence_url && (
                <a
                  href={ev.evidence_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs text-brand-blue hover:underline truncate flex-1">
                    {ev.evidence_url}
                  </span>
                </a>
              )}

              {/* Texto */}
              {ev.text_content && (
                <div className="p-2 rounded bg-muted/30">
                  <p className="text-xs whitespace-pre-wrap break-words">{ev.text_content}</p>
                </div>
              )}

              {ev.notes && (
                <p className="text-xs text-muted-foreground mt-2 italic">Nota: {ev.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Botones de veredicto */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setVerdict('approved')}
          className={`flex-1 rounded py-1.5 text-xs font-medium border transition-colors ${
            verdict === 'approved'
              ? 'bg-green-600 text-white border-green-600'
              : 'border-green-300 text-green-700 hover:bg-green-50'
          }`}
        >
          ✓ Aprobar
        </button>
        <button
          type="button"
          onClick={() => setVerdict('rejected')}
          className={`flex-1 rounded py-1.5 text-xs font-medium border transition-colors ${
            verdict === 'rejected'
              ? 'bg-red-600 text-white border-red-600'
              : 'border-red-300 text-red-600 hover:bg-red-50'
          }`}
        >
          ✕ Rechazar
        </button>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder={verdict === 'rejected' ? 'Motivo del rechazo (obligatorio)…' : 'Comentario (opcional)…'}
        className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm
          placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30 resize-none"
      />

      <button
        type="submit"
        disabled={saving || !verdict}
        className="inline-flex items-center rounded bg-brand-blue text-white px-3 py-1.5
          text-xs font-medium hover:bg-brand-blue/90 disabled:opacity-60 transition-colors"
      >
        {saving ? 'Guardando…' : 'Confirmar revisión'}
      </button>
    </form>
  )
}
