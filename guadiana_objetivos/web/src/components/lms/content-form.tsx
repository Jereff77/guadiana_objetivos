'use client'

import { useState, useTransition } from 'react'
import { createLmsContent } from '@/app/(dashboard)/capacitacion/lms-actions'

type ContentType = 'pdf' | 'video' | 'text' | 'quiz'

interface ContentFormProps {
  onCreated?: () => void
}

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'video', label: 'Video' },
  { value: 'text', label: 'Texto' },
  { value: 'quiz', label: 'Evaluación' },
]

export function ContentForm({ onCreated }: ContentFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [contentType, setContentType] = useState<ContentType>('text')
  const [videoUrl, setVideoUrl] = useState('')
  const [textBody, setTextBody] = useState('')
  const [isPublished, setIsPublished] = useState(false)

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('')
    setContentType('text')
    setVideoUrl('')
    setTextBody('')
    setIsPublished(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!title.trim()) {
      setError('El título es obligatorio.')
      return
    }

    startTransition(async () => {
      const result = await createLmsContent({
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        content_type: contentType,
        video_url: contentType === 'video' ? videoUrl.trim() || null : null,
        text_body: contentType === 'text' ? textBody.trim() || null : null,
        is_published: isPublished,
      })

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
          rows={3}
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
        </div>
      </div>

      {/* URL de video (solo si tipo = video) */}
      {contentType === 'video' && (
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="lms-video-url">
            URL del video
          </label>
          <input
            id="lms-video-url"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/embed/…"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isPending}
          />
        </div>
      )}

      {/* Cuerpo de texto (solo si tipo = text) */}
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
            rows={6}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            disabled={isPending}
          />
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

      {/* Mensajes */}
      {error && (
        <p className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-md bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
          Contenido creado correctamente.
        </p>
      )}

      {/* Botón */}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Creando…' : 'Crear contenido'}
      </button>
    </form>
  )
}
