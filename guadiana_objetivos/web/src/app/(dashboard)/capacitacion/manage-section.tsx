'use client'

import { useTransition, useState } from 'react'
import type { LmsPath } from './lms-actions'
import { deleteLmsPath, updateLmsPath } from './lms-actions'

interface ManageSectionProps {
  paths: LmsPath[]
}

export function ManageSection({ paths }: ManageSectionProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const handleTogglePublish = (path: LmsPath) => {
    setMessage(null)
    startTransition(async () => {
      const result = await updateLmsPath(path.id, { is_published: !path.is_published })
      if (!result.success) {
        setMessage({ type: 'error', text: result.error ?? 'Error al actualizar la ruta.' })
      } else {
        setMessage({
          type: 'success',
          text: `Ruta "${path.title}" ${!path.is_published ? 'publicada' : 'movida a borrador'}.`,
        })
      }
    })
  }

  const handleDelete = (path: LmsPath) => {
    if (!confirm(`¿Eliminar la ruta "${path.title}"? Esta acción no se puede deshacer.`)) return
    setMessage(null)
    startTransition(async () => {
      const result = await deleteLmsPath(path.id)
      if (!result.success) {
        setMessage({ type: 'error', text: result.error ?? 'Error al eliminar la ruta.' })
      } else {
        setMessage({ type: 'success', text: `Ruta "${path.title}" eliminada.` })
      }
    })
  }

  if (paths.length === 0) return null

  return (
    <section className="rounded-lg border bg-card p-6 space-y-4">
      <h2 className="text-lg font-semibold">Gestionar rutas de aprendizaje</h2>

      {message && (
        <p
          className={`rounded-md px-3 py-2 text-sm border ${
            message.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="space-y-2">
        {paths.map((path) => (
          <div
            key={path.id}
            className="flex items-center justify-between gap-4 rounded-md border bg-background px-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  path.is_published
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {path.is_published ? 'Publicada' : 'Borrador'}
              </span>
              <span className="text-sm font-medium truncate">{path.title}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {path.content_ids.length} contenidos
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleTogglePublish(path)}
                disabled={isPending}
                className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50 transition-colors"
              >
                {path.is_published ? 'Pasar a borrador' : 'Publicar'}
              </button>
              <button
                onClick={() => handleDelete(path)}
                disabled={isPending}
                className="rounded-md border border-red-200 text-red-600 px-3 py-1.5 text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
