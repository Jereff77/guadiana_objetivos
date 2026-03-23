'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createCourse } from '@/app/(dashboard)/capacitacion/course-actions'

export function CourseForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('El título es obligatorio.'); return }
    setError(null)

    startTransition(async () => {
      const result = await createCourse({
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        cover_url: coverUrl.trim() || null,
        is_published: isPublished,
      })

      if (!result.success) {
        setError(result.error ?? 'Error al crear el curso.')
        return
      }

      router.push(`/capacitacion/${result.data!.id}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título del curso *"
            disabled={isPending}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="sm:col-span-2">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            rows={2}
            disabled={isPending}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <input
          type="text"
          value={category}
          onChange={e => setCategory(e.target.value)}
          placeholder="Categoría (opcional)"
          disabled={isPending}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <input
          type="url"
          value={coverUrl}
          onChange={e => setCoverUrl(e.target.value)}
          placeholder="URL de portada (opcional)"
          disabled={isPending}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={e => setIsPublished(e.target.checked)}
          disabled={isPending}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        Publicar inmediatamente
      </label>

      {error && (
        <p className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 text-xs">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Creando curso…' : 'Crear curso'}
      </button>
    </form>
  )
}
