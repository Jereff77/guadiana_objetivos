'use client'

import { useState, useTransition, useRef } from 'react'
import { createLmsContent } from '@/app/(dashboard)/capacitacion/lms-actions'
import { createClient } from '@/lib/supabase/client'

type ContentType = 'pdf' | 'video' | 'text' | 'quiz'

interface ContentFormProps {
  onCreated?: () => void
}

const CONTENT_TYPES: { value: ContentType; label: string; desc: string }[] = [
  { value: 'pdf',   label: 'PDF',       desc: 'Sube un archivo PDF' },
  { value: 'video', label: 'Video',     desc: 'URL de YouTube o Vimeo' },
  { value: 'text',  label: 'Texto',     desc: 'Contenido escrito directamente' },
  { value: 'quiz',  label: 'Evaluación',desc: 'Solo evaluación (configura preguntas después)' },
]

export function ContentForm({ onCreated }: ContentFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [contentType, setContentType] = useState<ContentType>('text')
  const [videoUrl, setVideoUrl] = useState('')
  const [textBody, setTextBody] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('')
    setContentType('text')
    setVideoUrl('')
    setTextBody('')
    setIsPublished(false)
    setUploadProgress(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!title.trim()) {
      setError('El título es obligatorio.')
      return
    }
    if (contentType === 'pdf' && !fileInputRef.current?.files?.[0]) {
      setError('Selecciona un archivo PDF.')
      return
    }

    startTransition(async () => {
      let storagePath: string | null = null

      // ── Subir PDF a Supabase Storage ──────────────────────────────────────
      if (contentType === 'pdf') {
        const file = fileInputRef.current!.files![0]
        if (file.size > 50 * 1024 * 1024) {
          setError('El archivo no puede superar los 50 MB.')
          return
        }
        setUploadProgress('Subiendo archivo…')

        const supabase = createClient()
        const ext = file.name.split('.').pop() ?? 'pdf'
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const path = `contenidos/${filename}`

        const { error: uploadError } = await supabase.storage
          .from('lms-content')
          .upload(path, file, { contentType: file.type, upsert: false })

        if (uploadError) {
          setError(`Error al subir el archivo: ${uploadError.message}`)
          setUploadProgress(null)
          return
        }

        storagePath = path
        setUploadProgress('Archivo subido. Guardando contenido…')
      }

      // ── Crear registro en BD ──────────────────────────────────────────────
      const result = await createLmsContent({
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        content_type: contentType,
        storage_path: storagePath,
        video_url: contentType === 'video' ? videoUrl.trim() || null : null,
        text_body: contentType === 'text' ? textBody.trim() || null : null,
        is_published: isPublished,
      })

      setUploadProgress(null)

      if (!result.success) {
        setError(result.error ?? 'Error al crear el contenido.')
        return
      }

      setSuccess(true)
      resetForm()
      onCreated?.()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Título */}
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="lms-title">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="lms-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nombre del contenido"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isPending}
          required
        />
      </div>

      {/* Descripción */}
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="lms-description">
          Descripción
        </label>
        <textarea
          id="lms-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción del contenido (opcional)"
          rows={2}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          disabled={isPending}
        />
      </div>

      {/* Categoría y Tipo en fila */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="lms-category">
            Categoría
          </label>
          <input
            id="lms-category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ej: Seguridad, Ventas…"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="lms-type">
            Tipo de contenido
          </label>
          <select
            id="lms-type"
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isPending}
          >
            {CONTENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            {CONTENT_TYPES.find(t => t.value === contentType)?.desc}
          </p>
        </div>
      </div>

      {/* Upload PDF */}
      {contentType === 'pdf' && (
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="lms-pdf-file">
            Archivo PDF <span className="text-red-500">*</span>
          </label>
          <input
            id="lms-pdf-file"
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-xs file:font-medium file:px-2 file:py-1 file:cursor-pointer cursor-pointer"
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">Máximo 50 MB. Solo archivos PDF.</p>
        </div>
      )}

      {/* URL de video */}
      {contentType === 'video' && (
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="lms-video-url">
            URL del video <span className="text-red-500">*</span>
          </label>
          <input
            id="lms-video-url"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/embed/… o https://player.vimeo.com/…"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isPending}
          />
        </div>
      )}

      {/* Cuerpo de texto */}
      {contentType === 'text' && (
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="lms-text-body">
            Contenido
          </label>
          <textarea
            id="lms-text-body"
            value={textBody}
            onChange={(e) => setTextBody(e.target.value)}
            placeholder="Escribe el contenido aquí…"
            rows={8}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            disabled={isPending}
          />
        </div>
      )}

      {contentType === 'quiz' && (
        <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          Crea el contenido y luego configura las preguntas del quiz desde la página de gestión.
        </div>
      )}

      {/* Publicado */}
      <div className="flex items-center gap-2">
        <input
          id="lms-published"
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-4 w-4 rounded border-input accent-primary"
          disabled={isPending}
        />
        <label className="text-sm" htmlFor="lms-published">
          Publicar inmediatamente
        </label>
      </div>

      {/* Progreso de upload */}
      {uploadProgress && (
        <p className="rounded-md bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 text-sm">
          {uploadProgress}
        </p>
      )}

      {/* Errores */}
      {error && (
        <p className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
          {error}
        </p>
      )}

      {/* Éxito */}
      {success && (
        <p className="rounded-md bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
          Contenido creado correctamente.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? (uploadProgress ?? 'Procesando…') : 'Crear contenido'}
      </button>
    </form>
  )
}
