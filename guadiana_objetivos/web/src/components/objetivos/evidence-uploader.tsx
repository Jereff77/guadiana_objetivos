'use client'

import { useState } from 'react'
import { submitEvidence } from '@/app/(dashboard)/objetivos/deliverable-actions'

interface EvidenceUploaderProps {
  deliverableId: string
  onSuccess?: () => void
}

type EvidenceTab = 'url' | 'text'

export function EvidenceUploader({ deliverableId, onSuccess }: EvidenceUploaderProps) {
  const [tab, setTab] = useState<EvidenceTab>('url')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (tab === 'url' && !url.trim()) {
      setError('Ingresa una URL válida')
      return
    }
    if (tab === 'text' && !text.trim()) {
      setError('Escribe el contenido de la evidencia')
      return
    }

    setSaving(true)
    setError(null)

    const result = await submitEvidence(deliverableId, {
      evidence_url: tab === 'url' ? url.trim() : undefined,
      text_content: tab === 'text' ? text.trim() : undefined,
      notes: notes.trim() || undefined,
    })

    setSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-md p-3 space-y-3 bg-muted/20">
      <h4 className="text-xs font-semibold text-foreground">Subir evidencia</h4>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
          {error}
        </p>
      )}

      {/* Tabs URL / Texto */}
      <div className="flex gap-1 border-b">
        {(['url', 'text'] as EvidenceTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-1 text-xs font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'url' ? 'URL / Enlace' : 'Texto'}
          </button>
        ))}
      </div>

      {tab === 'url' && (
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://drive.google.com/..."
          className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm
            placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
        />
      )}

      {tab === 'text' && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Describe la evidencia o pega el contenido relevante..."
          className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm
            placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30 resize-none"
        />
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={1}
        placeholder="Notas adicionales (opcional)"
        className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm
          placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30 resize-none"
      />

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded bg-brand-blue text-white px-3 py-1.5
            text-xs font-medium hover:bg-brand-blue/90 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Enviando…' : 'Enviar evidencia'}
        </button>
      </div>
    </form>
  )
}
