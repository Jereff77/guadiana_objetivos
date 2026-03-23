'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { SurveyForTopic, SubmitAnswer } from './survey-topic-actions'
import { submitSurveyTopic } from './survey-topic-actions'

interface SurveyTopicViewerProps {
  survey: SurveyForTopic
  courseId: string
  topicId: string
  nextTopicId?: string | null
  courseTitle: string
}

export function SurveyTopicViewer({
  survey,
  courseId,
  topicId,
  nextTopicId,
  courseTitle,
}: SurveyTopicViewerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [answers, setAnswers] = useState<Record<string, SubmitAnswer['answer']>>({})
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const setAnswer = (questionId: string, answer: SubmitAnswer['answer']) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const allQuestions = survey.sections.flatMap(s => s.questions)
  const requiredIds  = allQuestions.filter(q => q.required).map(q => q.id)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validar requeridos
    const missing = requiredIds.filter(id => {
      const ans = answers[id]
      if (!ans) return true
      if (ans.type === 'text' && !ans.value.trim()) return true
      return false
    })

    if (missing.length > 0) {
      setError(`Completa ${missing.length} pregunta(s) obligatoria(s) antes de enviar.`)
      return
    }

    setError(null)
    startTransition(async () => {
      const submits: SubmitAnswer[] = allQuestions.map(q => ({
        questionId: q.id,
        answer: answers[q.id] ?? null,
      }))

      const result = await submitSurveyTopic(survey.id, courseId, topicId, submits)
      if (!result.success) {
        setError(result.error ?? 'Error al enviar la evaluación.')
        return
      }

      setSubmitted(true)
      // Navegar al siguiente tema o al curso
      setTimeout(() => {
        if (nextTopicId) {
          router.push(`/capacitacion/${courseId}/${nextTopicId}`)
        } else {
          router.push(`/capacitacion/${courseId}`)
        }
        router.refresh()
      }, 1500)
    })
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-6 py-8 text-center space-y-2">
        <p className="text-green-700 font-semibold text-lg">¡Evaluación completada!</p>
        <p className="text-sm text-green-600">
          {nextTopicId ? 'Avanzando al siguiente tema…' : 'Regresando al curso…'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {survey.sections.map(section => (
        <section key={section.id} className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="font-semibold text-base">{section.title}</h3>
            {section.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{section.description}</p>
            )}
          </div>

          <div className="space-y-5">
            {section.questions.map((question, qi) => {
              const ans = answers[question.id]

              return (
                <div key={question.id} className="space-y-2">
                  <label className="block text-sm font-medium">
                    {qi + 1}. {question.label}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {question.help_text && (
                    <p className="text-xs text-muted-foreground">{question.help_text}</p>
                  )}

                  {/* Boolean — Sí / No */}
                  {question.type === 'boolean' && (
                    <div className="flex gap-4">
                      {question.options.map(opt => (
                        <label key={opt.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="radio"
                            name={question.id}
                            checked={ans?.type === 'option' && ans.optionId === opt.id}
                            onChange={() => setAnswer(question.id, { type: 'option', optionId: opt.id })}
                            disabled={isPending}
                            className="accent-primary"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Single choice — Radio */}
                  {question.type === 'single_choice' && (
                    <div className="space-y-1.5">
                      {question.options.map(opt => (
                        <label key={opt.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="radio"
                            name={question.id}
                            checked={ans?.type === 'option' && ans.optionId === opt.id}
                            onChange={() => setAnswer(question.id, { type: 'option', optionId: opt.id })}
                            disabled={isPending}
                            className="accent-primary"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Multiple choice — Checkboxes */}
                  {question.type === 'multiple_choice' && (
                    <div className="space-y-1.5">
                      {question.options.map(opt => {
                        const selected = ans?.type === 'options' ? ans.optionIds : []
                        return (
                          <label key={opt.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selected.includes(opt.id)}
                              onChange={e => {
                                const next = e.target.checked
                                  ? [...selected, opt.id]
                                  : selected.filter(id => id !== opt.id)
                                setAnswer(question.id, { type: 'options', optionIds: next })
                              }}
                              disabled={isPending}
                              className="accent-primary h-4 w-4 rounded"
                            />
                            {opt.label}
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {/* Text short */}
                  {question.type === 'text_short' && (
                    <input
                      type="text"
                      value={ans?.type === 'text' ? ans.value : ''}
                      onChange={e => setAnswer(question.id, { type: 'text', value: e.target.value })}
                      disabled={isPending}
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Tu respuesta…"
                    />
                  )}

                  {/* Text long */}
                  {question.type === 'text_long' && (
                    <textarea
                      value={ans?.type === 'text' ? ans.value : ''}
                      onChange={e => setAnswer(question.id, { type: 'text', value: e.target.value })}
                      disabled={isPending}
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                      placeholder="Tu respuesta detallada…"
                    />
                  )}

                  {/* Number */}
                  {question.type === 'number' && (
                    <input
                      type="number"
                      value={ans?.type === 'number' ? ans.value : ''}
                      onChange={e => setAnswer(question.id, { type: 'number', value: parseFloat(e.target.value) })}
                      disabled={isPending}
                      className="w-40 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}

                  {/* Date */}
                  {question.type === 'date' && (
                    <input
                      type="date"
                      value={ans?.type === 'text' ? ans.value : ''}
                      onChange={e => setAnswer(question.id, { type: 'text', value: e.target.value })}
                      disabled={isPending}
                      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}

      {error && (
        <p className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 text-sm">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2 border-t">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-green-600 text-white px-6 py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Enviando…' : 'Enviar evaluación'}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/capacitacion/${courseId}`)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Volver al curso
        </button>
      </div>
    </form>
  )
}
