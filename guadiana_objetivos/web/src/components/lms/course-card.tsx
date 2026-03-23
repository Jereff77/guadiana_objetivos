'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { BookOpen } from 'lucide-react'
import type { LmsCourse } from '@/app/(dashboard)/capacitacion/course-actions'
import { updateCourse, deleteCourse } from '@/app/(dashboard)/capacitacion/course-actions'

interface CourseCardProps {
  course: LmsCourse
  totalTopics: number
  completedTopics: number
  canManage?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export function CourseCard({
  course,
  totalTopics,
  completedTopics,
  canManage,
  canEdit,
  canDelete,
}: CourseCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Campos de edición
  const [title, setTitle] = useState(course.title)
  const [description, setDescription] = useState(course.description ?? '')
  const [category, setCategory] = useState(course.category ?? '')
  const [coverUrl, setCoverUrl] = useState(course.cover_url ?? '')
  const [isPublished, setIsPublished] = useState(course.is_published)

  const progressPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  const handleSave = () => {
    if (!title.trim()) { setEditError('El título es obligatorio.'); return }
    setEditError(null)
    startTransition(async () => {
      const result = await updateCourse(course.id, {
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        cover_url: coverUrl.trim() || null,
        is_published: isPublished,
      })
      if (!result.success) { setEditError(result.error ?? 'Error al guardar.'); return }
      setEditing(false)
      router.refresh()
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      await deleteCourse(course.id)
      router.refresh()
    })
  }

  // ── Panel de edición ─────────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Editar curso</span>
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
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            rows={2}
            disabled={isPending}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <input
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Categoría (opcional)"
            disabled={isPending}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="url"
            value={coverUrl}
            onChange={e => setCoverUrl(e.target.value)}
            placeholder="URL de portada (opcional)"
            disabled={isPending}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
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

  // ── Confirmación de borrado ──────────────────────────────────────────────
  if (confirmDelete) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex flex-col gap-3">
        <p className="text-sm font-medium text-red-800">
          ¿Eliminar <strong>{course.title}</strong>?
        </p>
        <p className="text-xs text-red-700">Se eliminarán también todos los temas del temario. Esta acción no se puede deshacer.</p>
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

  // ── Vista normal ─────────────────────────────────────────────────────────
  return (
    <div className="rounded-lg border bg-card flex flex-col overflow-hidden">
      {/* Portada */}
      {course.cover_url ? (
        <div className="h-36 w-full overflow-hidden shrink-0">
          <img
            src={course.cover_url}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="h-36 w-full flex items-center justify-center bg-muted shrink-0">
          <BookOpen className="h-10 w-10 text-muted-foreground/40" />
        </div>
      )}

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {course.category && (
            <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-medium">
              {course.category}
            </span>
          )}
          {canManage && (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              course.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {course.is_published ? 'Publicado' : 'Borrador'}
            </span>
          )}
        </div>

        {/* Título y descripción */}
        <div className="flex-1">
          <h3 className="font-semibold text-sm leading-snug">{course.title}</h3>
          {course.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
          )}
        </div>

        {/* Progreso */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progreso</span>
            <span>{completedTopics} / {totalTopics} temas</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <button
            onClick={() => router.push(`/capacitacion/${course.id}`)}
            className="flex-1 rounded-md bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 hover:bg-primary/90 transition-colors"
          >
            Ir al curso
          </button>
          {canEdit && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border text-xs font-medium px-3 py-1.5 hover:bg-muted transition-colors"
              title="Editar curso"
            >
              Editar
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-md border border-red-200 text-red-600 text-xs font-medium px-3 py-1.5 hover:bg-red-50 transition-colors"
              title="Eliminar curso"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
