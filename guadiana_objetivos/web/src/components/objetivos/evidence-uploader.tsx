'use client'

import { useState } from 'react'
import { Upload, X, Plus, Send } from 'lucide-react'
import { submitEvidence } from '../../app/(dashboard)/objetivos/deliverable-actions'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface EvidenceUploaderProps {
  deliverableId: string
  onSuccess?: () => void
}

type EvidenceTab = 'file' | 'url' | 'text'

interface PendingEvidence {
  id: string
  type: EvidenceTab
  file?: File
  url?: string
  text?: string
  notes?: string
}

async function uploadFileToBucket(file: File, deliverableId: string): Promise<{ storage_path?: string; error?: string }> {
  const supabase = createClient()
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `evidences/${year}/${month}/${deliverableId}_${timestamp}_${sanitizedName}`

  const { data, error } = await supabase.storage
    .from('objective-evidences')
    .upload(path, file, { upsert: false })

  if (error) return { error: error.message }
  return { storage_path: data.path }
}

export function EvidenceUploader({ deliverableId, onSuccess }: EvidenceUploaderProps) {
  const router = useRouter()
  const [tab, setTab] = useState<EvidenceTab>('file')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingEvidences, setPendingEvidences] = useState<PendingEvidence[]>([])
  const [showAddAnother, setShowAddAnother] = useState(false)

  function currentIsValid() {
    if (tab === 'file') return !!file
    if (tab === 'url') return !!url.trim()
    if (tab === 'text') return !!text.trim()
    return false
  }

  function buildPending(): PendingEvidence {
    return {
      id: Math.random().toString(36).substring(7),
      type: tab,
      file: tab === 'file' ? file || undefined : undefined,
      url: tab === 'url' ? url.trim() : undefined,
      text: tab === 'text' ? text.trim() : undefined,
      notes: notes.trim() || undefined,
    }
  }

  function clearForm() {
    setFile(null)
    setUrl('')
    setText('')
    setNotes('')
    setError(null)
  }

  function handleAddAnother() {
    if (!currentIsValid()) {
      setError('Completa el campo actual antes de agregar otra evidencia.')
      return
    }
    setPendingEvidences((prev) => [...prev, buildPending()])
    clearForm()
    setShowAddAnother(false)
  }

  function removePending(id: string) {
    setPendingEvidences((prev) => prev.filter((e) => e.id !== id))
  }

  async function submitAll(evidences: PendingEvidence[]) {
    setSaving(true)
    setError(null)

    try {
      for (let i = 0; i < evidences.length; i++) {
        const ev = evidences[i]
        setProgress(evidences.length > 1 ? `Enviando ${i + 1} de ${evidences.length}...` : 'Enviando...')

        let storage_path: string | undefined

        if (ev.type === 'file' && ev.file) {
          const uploadResult = await uploadFileToBucket(ev.file, deliverableId)
          if (uploadResult.error) {
            setError(`Error al subir archivo: ${uploadResult.error}`)
            setSaving(false)
            setProgress(null)
            return
          }
          storage_path = uploadResult.storage_path
        }

        const result = await submitEvidence(deliverableId, {
          storage_path,
          evidence_url: ev.url,
          text_content: ev.text,
          notes: ev.notes,
        })

        if (result.error) {
          setError(`Error al guardar evidencia: ${result.error}`)
          setSaving(false)
          setProgress(null)
          return
        }
      }

      setSaving(false)
      setProgress(null)
      setPendingEvidences([])
      clearForm()
      setShowAddAnother(false)
      router.refresh()
      onSuccess?.()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error: ${msg}`)
      setSaving(false)
      setProgress(null)
    }
  }

  async function handleSubmitNow() {
    if (!currentIsValid()) {
      setError('Selecciona un archivo, URL o escribe texto antes de enviar.')
      return
    }
    const all = [...pendingEvidences, buildPending()]
    clearForm()
    await submitAll(all)
  }

  const hasContent = currentIsValid()

  return (
    <div className="border rounded-md p-3 space-y-3 bg-muted/20">
      <h4 className="text-xs font-semibold text-foreground">Subir evidencia</h4>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
          {error}
        </p>
      )}

      {progress && (
        <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-1">
          {progress}
        </p>
      )}

      {/* Evidencias en cola */}
      {pendingEvidences.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            En cola ({pendingEvidences.length}):
          </p>
          {pendingEvidences.map((ev) => (
            <div key={ev.id} className="flex items-center gap-2 p-2 rounded bg-background border text-xs">
              <span className="font-medium text-brand-blue shrink-0">
                {ev.type === 'file' ? 'Archivo' : ev.type === 'url' ? 'URL' : 'Texto'}
              </span>
              <span className="text-muted-foreground truncate flex-1">
                {ev.type === 'file' && ev.file?.name}
                {ev.type === 'url' && ev.url}
                {ev.type === 'text' && ev.text?.substring(0, 40)}
              </span>
              <button type="button" onClick={() => removePending(ev.id)} className="text-red-400 hover:text-red-600 shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulario */}
      <div className="space-y-2">
        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {(['file', 'url', 'text'] as EvidenceTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setError(null) }}
              className={`px-3 py-1 text-xs font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'file' && 'Archivo'}
              {t === 'url' && 'URL / Enlace'}
              {t === 'text' && 'Texto'}
            </button>
          ))}
        </div>

        {/* Archivo */}
        {tab === 'file' && (
          <div>
            <label
              htmlFor={`file-upload-${deliverableId}`}
              className="flex items-center gap-3 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-muted cursor-pointer"
            >
              <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
              {file ? (
                <span className="flex-1 truncate">{file.name}</span>
              ) : (
                <span className="text-muted-foreground">Haz clic para seleccionar un archivo</span>
              )}
            </label>
            <input
              id={`file-upload-${deliverableId}`}
              type="file"
              disabled={saving}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setError(null) } }}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp,.webp"
            />
            {file && (
              <p className="text-xs text-muted-foreground mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
        )}

        {/* URL */}
        {tab === 'url' && (
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null) }}
            placeholder="https://drive.google.com/..."
            className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
        )}

        {/* Texto */}
        {tab === 'text' && (
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setError(null) }}
            rows={3}
            placeholder="Describe la evidencia o pega el contenido relevante..."
            className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 resize-none"
          />
        )}

        {/* Notas */}
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionales (opcional)"
          className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
        />

        {/* Acciones */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSubmitNow}
            disabled={saving || !hasContent}
            className="inline-flex items-center gap-1.5 rounded bg-brand-blue text-white px-4 py-1.5 text-xs font-medium hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
          >
            <Send className="h-3 w-3" />
            {saving ? 'Enviando...' : pendingEvidences.length > 0 ? `Enviar todas (${pendingEvidences.length + 1})` : 'Enviar evidencia'}
          </button>

          {!showAddAnother && hasContent && (
            <button
              type="button"
              onClick={() => setShowAddAnother(true)}
              disabled={saving}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-3 w-3" />
              Agregar otra antes de enviar
            </button>
          )}

          {showAddAnother && (
            <button
              type="button"
              onClick={handleAddAnother}
              disabled={saving || !hasContent}
              className="inline-flex items-center gap-1.5 rounded bg-muted text-foreground px-3 py-1.5 text-xs font-medium hover:bg-muted/80 disabled:opacity-50 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Agregar a cola
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
