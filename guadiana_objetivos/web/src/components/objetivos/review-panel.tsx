'use client'

import { useState } from 'react'
import { reviewDeliverable } from '@/app/(dashboard)/objetivos/deliverable-actions'

interface ReviewPanelProps {
  deliverableId: string
  onSuccess?: () => void
}

export function ReviewPanel({ deliverableId, onSuccess }: ReviewPanelProps) {
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

  return (
    <form onSubmit={handleSubmit} className="border rounded-md p-3 space-y-3 bg-muted/20">
      <h4 className="text-xs font-semibold">Revisar entregable</h4>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
          {error}
        </p>
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
