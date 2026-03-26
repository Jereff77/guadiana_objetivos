'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { completeTopic } from '../../course-actions'
import { QuizComponent } from '@/components/lms/quiz-component'
import type { LmsContent, LmsQuiz } from '../../lms-actions'

interface TopicContentViewerProps {
  content: LmsContent & { quiz?: LmsQuiz }
  pdfSignedUrl?: string | null
  courseId: string
  topicId: string
  nextTopicId?: string | null
}

export function TopicContentViewer({
  content,
  pdfSignedUrl,
  courseId,
  topicId,
  nextTopicId,
}: TopicContentViewerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [completed, setCompleted] = useState(false)

  const handleComplete = (quizScore?: number) => {
    startTransition(async () => {
      await completeTopic(courseId, topicId, { quizScore })
      setCompleted(true)
      setTimeout(() => {
        if (nextTopicId) {
          router.push(`/capacitacion/${courseId}/${nextTopicId}`)
        } else {
          router.push(`/capacitacion/${courseId}`)
        }
        router.refresh()
      }, 1200)
    })
  }

  if (completed) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-6 py-8 text-center space-y-2">
        <p className="text-green-700 font-semibold text-lg">¡Tema completado!</p>
        <p className="text-sm text-green-600">
          {nextTopicId ? 'Avanzando al siguiente tema…' : 'Regresando al curso…'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Texto */}
      {content.content_type === 'text' && content.text_body && (
        <div className="prose prose-sm max-w-none rounded-lg border bg-card p-6">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{content.text_body}</div>
        </div>
      )}

      {/* Video */}
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

      {/* PDF */}
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

      {/* Quiz puro */}
      {content.content_type === 'quiz' && content.quiz && (
        <div className="rounded-lg border bg-card p-6">
          <QuizComponent
            quiz={content.quiz}
            contentId={content.id}
            onComplete={(score) => handleComplete(score)}
          />
        </div>
      )}

      {/* Quiz adicional (cuando el tipo no es quiz pero tiene evaluación) */}
      {content.content_type !== 'quiz' && content.quiz && (
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-base border-b pb-3">Evaluación del contenido</h3>
          <QuizComponent
            quiz={content.quiz}
            contentId={content.id}
            onComplete={(score) => handleComplete(score)}
          />
        </div>
      )}

      {/* Marcar como completado (para tipos sin quiz) */}
      {content.content_type !== 'quiz' && !content.quiz && (
        <div className="flex items-center gap-4 pt-2 border-t">
          <button
            onClick={() => handleComplete()}
            disabled={isPending}
            className="rounded-md bg-green-600 text-white px-6 py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Guardando…' : 'Marcar como completado'}
          </button>
          <button
            onClick={() => router.push(`/capacitacion/${courseId}`)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al curso
          </button>
        </div>
      )}
    </div>
  )
}
