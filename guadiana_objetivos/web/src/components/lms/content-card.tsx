'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { LmsContent, LmsProgress } from '@/app/(dashboard)/capacitacion/lms-actions'
import { updateLmsContent, deleteLmsContent } from '@/app/(dashboard)/capacitacion/lms-actions'

interface ContentCardProps {
  content: LmsContent
  progress?: LmsProgress
  canManage?: boolean   // ver borradores + crear contenido
  canEdit?: boolean     // editar contenido
  canDelete?: boolean   // eliminar contenido
}

const typeLabels: Record<LmsContent['content_type'], string> = {
  pdf: 'PDF',
  video: 'Video',
  text: 'Texto',
  quiz: 'Evaluación',
}

const typeColors: Record<LmsContent['content_type'], string> = {
  pdf: 'bg-orange-100 text-orange-700',
  video: 'bg-purple-100 text-purple-700',
  text: 'bg-blue-100 text-blue-700',
  quiz: 'bg-green-100 text-green-700',
}

export function ContentCard({ content, progress, canManage, canEdit, canDelete }: ContentCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Campos del formulario de edición
  const [title, setTitle] = useState(content.title)
  const [description, setDescription] = useState(content.description ?? '')
  const [category, setCategory] = useState(content.category ?? '')
  const [videoUrl, setVideoUrl] = useState(content.video_url ?? '')
  const [textBody, setTextBody] = useState(content.text_body ?? '')
  const [isPublished, setIsPublished] = useState(content.is_published)

  const isCompleted = Boolean(progress?.completed_at)
  const inProgress = progress && !isCompleted

  const handleSave = () => {
    if (!title.trim()) { setEditError('El título es obligatorio.'); return }
    setEditError(null)
    startTransition(async () => {
      const result = await updateLmsContent(content.id, {
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        video_url: content.content_type === 'video' ? videoUrl.trim() || null : content.video_url,
        text_body: content.content_type === 'text' ? textBody.trim() || null : content.text_body,
        is_published: isPublished,
      })
      if (!result.success) { setEditError(result.error ?? 'Error al guardar.'); return }
      setEditing(false)
      router.refresh()
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      await deleteLmsContent(content.id)
      router.refresh()
    })
  }

  // ── Panel de edición ───────────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Editar contenido</span>
          <button
            onClick={() => { setEditing(false); setEditError(null) }}
            className="text-xs text-muted-foreground hover:text-foreground"
            disabled={isPending}
          >
            Cancelar
          </button>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título *"
            disabled={isPending}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            disabled={isPending}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Categoría (opcional)"
            disabled={isPending}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />

          {content.content_type === 'video' && (
            <input
              type="url"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="URL del video"
              disabled={isPending}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}

          {content.content_type === 'text' && (
            <textarea
              value={textBody}
              onChange={e => setTextBody(e.target.value)}
              placeholder="Contenido de texto"
              rows={4}
              disabled={isPending}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            />
          )}

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={e => setIsPublished(e.target.checked)}
              disabled={isPending}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            Publicado
          </label>
        </div>

        {editError && (
          <p className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 text-xs">
            {editError}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-md bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    )
  }

  // ── Confirmación de borrado ────────────────────────────────────────────────
  if (confirmDelete) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex flex-col gap-3">
        <p className="text-sm font-medium text-red-800">
          ¿Eliminar <strong>{content.title}</strong>?
        </p>
        <p className="text-xs text-red-700">Esta acción no se puede deshacer.</p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-md bg-red-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            disabled={isPending}
            className="rounded-md border text-xs font-medium px-3 py-1.5 hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  // ── Vista normal ───────────────────────────────────────────────────────────
  return (
    <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
      {/* Badges superiores */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[content.content_type]}`}>
          {typeLabels[content.content_type]}
        </span>

        {canManage && (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            content.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {content.is_published ? 'Publicado' : 'Borrador'}
          </span>
        )}

        {isCompleted && (
          <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium">
            Completado
            {progress?.quiz_score !== null && progress?.quiz_score !== undefined
              ? ` · ${progress.quiz_score.toFixed(0)}/100` : ''}
          </span>
        )}

        {inProgress && (
          <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-medium">
            En progreso
          </span>
        )}
      </div>

      {/* Título y descripción */}
      <div className="flex-1">
        <h3 className="font-semibold text-sm leading-snug">{content.title}</h3>
        {content.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{content.description}</p>
        )}
        {content.category && (
          <p className="text-xs text-muted-foreground mt-1">
            Categoría: <span className="font-medium">{content.category}</span>
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 mt-auto pt-2 border-t">
        <button
          onClick={() => router.push(`/capacitacion/${content.id}`)}
          className="flex-1 rounded-md bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 hover:bg-primary/90 transition-colors"
        >
          Ver contenido
        </button>

        {canEdit && (
          <button
            onClick={() => setEditing(true)}
            className="rounded-md border text-xs font-medium px-3 py-1.5 hover:bg-muted transition-colors"
            title="Editar contenido"
          >
            Editar
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="rounded-md border border-red-200 text-red-600 text-xs font-medium px-3 py-1.5 hover:bg-red-50 transition-colors"
            title="Eliminar contenido"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  )
}
