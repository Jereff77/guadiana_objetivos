'use client'

import { useState } from 'react'
import { Upload, FileText, X, Plus } from 'lucide-react'
import { submitEvidence, uploadEvidenceFile } from '../../app/(dashboard)/objetivos/deliverable-actions'

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

export function EvidenceUploader({ deliverableId, onSuccess }: EvidenceUploaderProps) {
  const [tab, setTab] = useState<EvidenceTab>('file')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingEvidences, setPendingEvidences] = useState<PendingEvidence[]>([])

  function addToPendingList() {
    if (tab === 'file' && !file) {
      setError('Selecciona un archivo para subir')
      return
    }
    if (tab === 'url' && !url.trim()) {
      setError('Ingresa una URL válida')
      return
    }
    if (tab === 'text' && !text.trim()) {
      setError('Escribe el contenido de la evidencia')
      return
    }

    const newEvidence: PendingEvidence = {
      id: Math.random().toString(36).substring(7),
      type: tab,
      file: tab === 'file' ? file || undefined : undefined,
      url: tab === 'url' ? url.trim() : undefined,
      text: tab === 'text' ? text.trim() : undefined,
      notes: notes.trim() || undefined,
    }

    setPendingEvidences([...pendingEvidences, newEvidence])

    // Limpiar formulario
    setFile(null)
    setUrl('')
    setText('')
    setNotes('')
    setError(null)
  }

  function removePending(id: string) {
    setPendingEvidences(pendingEvidences.filter(e => e.id !== id))
  }

  async function handleSubmitAll(e: React.FormEvent) {
    e.preventDefault()

    if (pendingEvidences.length === 0) {
      setError('Agrega al menos una evidencia')
      return
    }

    setSaving(true)
    setError(null)
    setUploadProgress(null)

    try {
      for (let i = 0; i < pendingEvidences.length; i++) {
        const ev = pendingEvidences[i]
        setUploadProgress(`Procesando evidencia ${i + 1} de ${pendingEvidences.length}...`)

        let storage_path: string | undefined

        // Si es archivo, subir primero a Storage
        if (ev.type === 'file' && ev.file) {
          const uploadResult = await uploadEvidenceFile(ev.file, deliverableId)
          if (uploadResult.error) {
            setError(`Error en archivo ${ev.file.name}: ${uploadResult.error}`)
            setSaving(false)
            setUploadProgress(null)
            return
          }
          storage_path = uploadResult.storage_path
        }

        // Guardar evidencia en BD
        const result = await submitEvidence(deliverableId, {
          storage_path,
          evidence_url: ev.url,
          text_content: ev.text,
          notes: ev.notes,
        })

        if (result.error) {
          setError(`Error al guardar evidencia ${i + 1}: ${result.error}`)
          setSaving(false)
          setUploadProgress(null)
          return
        }
      }

      setSaving(false)
      setUploadProgress(null)
      setPendingEvidences([])
      onSuccess?.()
    } catch (err) {
      setError('Error al procesar. Inténtalo de nuevo.')
      setSaving(false)
      setUploadProgress(null)
    }
  }

  return (
    <form onSubmit={handleSubmitAll} className="border rounded-md p-3 space-y-3 bg-muted/20">
      <h4 className="text-xs font-semibold text-foreground">Subir evidencias</h4>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
          {error}
        </p>
      )}

      {uploadProgress && (
        <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-1">
          {uploadProgress}
        </p>
      )}

      {/* Lista de evidencias pendientes */}
      {pendingEvidences.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">
            Evidencias agregadas ({pendingEvidences.length}):
          </p>
          {pendingEvidences.map((ev) => (
            <div key={ev.id} className="flex items-start gap-2 p-2 rounded bg-background border">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-brand-blue">
                    {ev.type === 'file' && 'Archivo'}
                    {ev.type === 'url' && 'URL'}
                    {ev.type === 'text' && 'Texto'}
                  </span>
                  {ev.notes && (
                    <span className="text-xs text-muted-foreground truncate">— {ev.notes}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {ev.type === 'file' && ev.file?.name}
                  {ev.type === 'url' && ev.url}
                  {ev.type === 'text' && ev.text?.substring(0, 50) + (ev.text!.length > 50 ? '...' : '')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removePending(ev.id)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Eliminar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tabs: Archivo, URL, Texto */}
      <div className="flex gap-1 border-b">
        {(['file', 'url', 'text'] as EvidenceTab[]).map((t) => (
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
            <Upload className="h-4 w-4 text-muted-foreground" />
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
            onChange={(e) => {
              const selected = e.target.files?.[0]
              if (selected) setFile(selected)
            }}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp,.webp"
          />
          {file && (
            <p className="text-xs text-muted-foreground mt-1">
              Tamaño: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      )}

      {/* URL */}
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

      {/* Texto */}
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
          type="button"
          onClick={addToPendingList}
          disabled={saving || (tab === 'file' && !file)}
          className="inline-flex items-center gap-1.5 rounded bg-green-600 text-white px-3 py-1.5
            text-xs font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Agregar evidencia
        </button>
        {pendingEvidences.length > 0 && (
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded bg-brand-blue text-white px-3 py-1.5
              text-xs font-medium hover:bg-brand-blue/90 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Enviando…' : `Enviar todas (${pendingEvidences.length})`}
          </button>
        )}
      </div>
    </form>
  )
}
