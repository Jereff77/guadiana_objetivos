'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeContent } from '../lms-actions'
import { QuizComponent } from '@/components/lms/quiz-component'
import type { LmsContent, LmsQuiz, LmsProgress } from '../lms-actions'

interface ContentViewerProps {
  content: LmsContent & { quiz?: LmsQuiz }
  progress?: LmsProgress
  pdfSignedUrl?: string | null
}

export function ContentViewer({ content, progress, pdfSignedUrl }: ContentViewerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [completed, setCompleted] = useState(Boolean(progress?.completed_at))
  const [finalScore, setFinalScore] = useState<number | null>(progress?.quiz_score ?? null)

  const handleQuizComplete = (score: number) => {
    setFinalScore(score)
    startTransition(async () => {
      await completeContent(content.id, score)
      setCompleted(true)
    })
  }

  const handleMarkComplete = () => {
    startTransition(async () => {
      await completeContent(content.id)
      setCompleted(true)
    })
  }

  return (
    <div className="space-y-6">
      {/* Estado de completado */}
      {completed && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-3">
          <span className="text-green-700 font-medium text-sm">
            Completado
            {finalScore !== null ? ` · Puntaje: ${finalScore.toFixed(0)}/100` : ''}
          </span>
        </div>
      )}

      {/* Renderizado según tipo */}
      {content.content_type === 'text' && content.text_body && (
        <div className="prose prose-sm max-w-none rounded-lg border bg-card p-6">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{content.text_body}</div>
        </div>
      )}

      {content.content_type === 'video' && content.video_url && (
        <div className="rounded-lg border bg-card p-4">
          <div className="aspect-video w-full overflow-hidden rounded-md">
            <iframe
              src={content.video_url}
              className="h-full w-full"
              allowFullScreen
              title={content.title}
            />
          </div>
        </div>
      )}

      {content.content_type === 'pdf' && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          {pdfSignedUrl ? (
            <>
              <iframe
                src={pdfSignedUrl}
                className="w-full h-[600px] rounded-md border"
                title={content.title}
              />
              <a
                href={pdfSignedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Descargar PDF
              </a>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay archivo PDF disponible para este contenido.
            </p>
          )}
        </div>
      )}

      {content.content_type === 'quiz' && content.quiz && !completed && (
        <div className="rounded-lg border bg-card p-6">
          <QuizComponent
            quiz={content.quiz}
            contentId={content.id}
            onComplete={handleQuizComplete}
          />
        </div>
      )}

      {/* Quiz adicional (cuando el tipo no es quiz pero tiene quiz asociado) */}
      {content.content_type !== 'quiz' && content.quiz && (
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-base border-b pb-3">Evaluación del contenido</h3>
          {completed ? (
            <p className="text-sm text-muted-foreground">
              Ya has completado la evaluación
              {finalScore !== null ? ` con ${finalScore.toFixed(0)}/100 puntos.` : '.'}
            </p>
          ) : (
            <QuizComponent
              quiz={content.quiz}
              contentId={content.id}
              onComplete={handleQuizComplete}
            />
          )}
        </div>
      )}

      {/* Marcar como completado (para tipos sin quiz) */}
      {content.content_type !== 'quiz' && !content.quiz && !completed && (
        <div className="flex justify-center">
          <button
            onClick={handleMarkComplete}
            disabled={isPending}
            className="rounded-md bg-green-600 text-white px-6 py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Guardando…' : 'Marcar como completado'}
          </button>
        </div>
      )}

      {/* Botón volver */}
      <div className="pt-4 border-t">
        <button
          onClick={() => router.push('/capacitacion')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Volver al catálogo
        </button>
      </div>
    </div>
  )
}
