'use client'

import { useState } from 'react'
import type { LmsQuiz, QuizQuestion } from '@/app/(dashboard)/capacitacion/lms-actions'

interface QuizComponentProps {
  quiz: LmsQuiz
  contentId: string
  onComplete: (score: number) => void
}

interface AnswerState {
  selected: number | null
}

export function QuizComponent({ quiz, onComplete }: QuizComponentProps) {
  const [answers, setAnswers] = useState<AnswerState[]>(
    quiz.questions.map(() => ({ selected: null })),
  )
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (submitted) return
    setAnswers((prev) =>
      prev.map((a, i) => (i === questionIndex ? { selected: optionIndex } : a)),
    )
  }

  const handleSubmit = () => {
    const correctCount = quiz.questions.reduce((acc, q: QuizQuestion, i) => {
      return acc + (answers[i]?.selected === q.correct ? 1 : 0)
    }, 0)
    const calculatedScore = quiz.questions.length > 0
      ? Math.round((correctCount / quiz.questions.length) * 100)
      : 0

    setScore(calculatedScore)
    setSubmitted(true)
    onComplete(calculatedScore)
  }

  const allAnswered = answers.every((a) => a.selected !== null)
  const passed = score !== null && score >= quiz.min_score

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">Evaluación</h3>
        <span className="text-xs text-muted-foreground">
          Puntaje mínimo: {quiz.min_score}/100
        </span>
      </div>

      {/* Resultado */}
      {submitted && score !== null && (
        <div
          className={`rounded-lg border p-4 text-center ${
            passed
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <p className="font-semibold text-lg">
            {passed ? 'Aprobado' : 'No aprobado'} — {score}/100
          </p>
          <p className="text-sm mt-1">
            {passed
              ? '¡Felicitaciones! Has superado el puntaje mínimo.'
              : `Necesitas al menos ${quiz.min_score} puntos para aprobar.`}
          </p>
        </div>
      )}

      {/* Preguntas */}
      <div className="space-y-6">
        {quiz.questions.map((q: QuizQuestion, qi) => {
          const selectedOption = answers[qi]?.selected ?? null

          return (
            <div key={qi} className="space-y-3">
              <p className="font-medium text-sm">
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((option, oi) => {
                  const isSelected = selectedOption === oi
                  const isCorrect = submitted && oi === q.correct
                  const isWrong = submitted && isSelected && oi !== q.correct

                  let optionClass =
                    'flex items-center gap-3 rounded-md border px-3 py-2.5 cursor-pointer transition-colors text-sm'

                  if (submitted) {
                    if (isCorrect) {
                      optionClass += ' border-green-300 bg-green-50 text-green-800'
                    } else if (isWrong) {
                      optionClass += ' border-red-300 bg-red-50 text-red-800'
                    } else {
                      optionClass += ' border-border bg-background text-muted-foreground cursor-default'
                    }
                  } else if (isSelected) {
                    optionClass += ' border-primary bg-primary/5'
                  } else {
                    optionClass += ' border-border hover:border-primary/50 hover:bg-muted/40'
                  }

                  return (
                    <label key={oi} className={optionClass}>
                      <input
                        type="radio"
                        name={`question-${qi}`}
                        value={oi}
                        checked={isSelected}
                        disabled={submitted}
                        onChange={() => handleSelect(qi, oi)}
                        className="shrink-0 accent-primary"
                      />
                      <span className="flex-1">{option}</span>
                      {submitted && isCorrect && (
                        <span className="text-green-600 font-medium text-xs shrink-0">Correcta</span>
                      )}
                      {submitted && isWrong && (
                        <span className="text-red-600 font-medium text-xs shrink-0">Incorrecta</span>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Botón enviar */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Enviar evaluación
        </button>
      )}

      {!submitted && !allAnswered && (
        <p className="text-xs text-muted-foreground text-center">
          Responde todas las preguntas antes de enviar.
        </p>
      )}
    </div>
  )
}
