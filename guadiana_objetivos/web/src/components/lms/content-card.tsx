'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import type { LmsContent, LmsProgress } from '@/app/(dashboard)/capacitacion/lms-actions'
import { startContent } from '@/app/(dashboard)/capacitacion/lms-actions'

interface ContentCardProps {
  content: LmsContent
  progress?: LmsProgress
  canManage?: boolean
  onStart: (id: string) => void
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

export function ContentCard({ content, progress, canManage, onStart }: ContentCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleView = () => {
    startTransition(async () => {
      await startContent(content.id)
      onStart(content.id)
      router.push(`/capacitacion/${content.id}`)
    })
  }

  const isCompleted = Boolean(progress?.completed_at)
  const inProgress = progress && !isCompleted

  return (
    <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
      {/* Badges superiores */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[content.content_type]}`}
        >
          {typeLabels[content.content_type]}
        </span>

        {canManage && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              content.is_published
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {content.is_published ? 'Publicado' : 'Borrador'}
          </span>
        )}

        {isCompleted && (
          <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium">
            Completado
            {progress?.quiz_score !== null && progress?.quiz_score !== undefined
              ? ` · ${progress.quiz_score.toFixed(0)}/100`
              : ''}
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
          onClick={handleView}
          disabled={isPending}
          className="flex-1 rounded-md bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Abriendo…' : 'Ver contenido'}
        </button>
      </div>
    </div>
  )
}
