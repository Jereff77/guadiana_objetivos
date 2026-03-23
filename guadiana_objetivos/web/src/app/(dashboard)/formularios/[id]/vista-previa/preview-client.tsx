'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Smartphone, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Section { id: string; title: string; description: string | null; order: number }
interface Question {
  id: string; section_id: string; label: string; description: string | null
  type: string; required: boolean; order: number
  placeholder: string | null; help_text: string | null
  metadata: Record<string, unknown> | null
}
interface QuestionOption {
  id: string; question_id: string; label: string; value: string | null
  score: number | null; order: number; is_default: boolean
}
interface Condition {
  id: string
  survey_id: string
  source_question_id: string
  source_option_id: string | null
  condition_value: string
  target_section_id: string | null
  target_question_id: string | null
  action: string
  created_at: string
}

interface PreviewClientProps {
  survey: { id: string; name: string; description: string | null; status: string; version: number }
  sections: Section[]
  questions: Question[]
  options: QuestionOption[]
  conditions: Condition[]
}

// ─── Navigation logic ────────────────────────────────────────────────────────

function useFormNavigation(
  questions: Question[],
  sections: Section[],
  conditions: Condition[],
) {
  // Sorted questions: by section order then question order
  const sorted = useMemo(() => {
    return [...questions].sort((a, b) => {
      const sA = sections.find(s => s.id === a.section_id)?.order ?? 0
      const sB = sections.find(s => s.id === b.section_id)?.order ?? 0
      return sA !== sB ? sA - sB : a.order - b.order
    })
  }, [questions, sections])

  // Retorna el ID de la siguiente pregunta, o null si se llega al final
  function getNextId(currentId: string, answers: Record<string, string | null>): string | null {
    const selectedOptionId = answers[currentId] ?? null

    // 1. Condición específica por opción seleccionada
    if (selectedOptionId) {
      const cond = conditions.find(c =>
        c.source_question_id === currentId &&
        c.source_option_id === selectedOptionId
      )
      if (cond) {
        if (cond.action === 'jump_to_end') return null   // saltar al final
        if (cond.target_question_id) return cond.target_question_id
      }
    }

    // 2. Condición incondicional Q→Q o Q→Fin
    const uncond = conditions.find(c =>
      c.source_question_id === currentId && !c.source_option_id
    )
    if (uncond) {
      if (uncond.action === 'jump_to_end') return null   // saltar al final
      if (uncond.target_question_id) return uncond.target_question_id
    }

    // 3. Siguiente pregunta en orden natural
    const idx = sorted.findIndex(q => q.id === currentId)
    return sorted[idx + 1]?.id ?? null
  }

  return { sorted, getNextId }
}

// ─── Input components (controlled) ───────────────────────────────────────────

function BooleanInput({
  opts, value, onChange, onAutoAdvance,
}: { opts: QuestionOption[]; value: string | null; onChange: (v: string) => void; onAutoAdvance: (v: string) => void }) {
  const choices = opts.length > 0
    ? opts
    : [{ id: '_yes', label: 'Sí', value: 'yes' }, { id: '_no', label: 'No', value: 'no' }]

  return (
    <div className="flex gap-2">
      {choices.map(opt => {
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => { onChange(opt.id); onAutoAdvance(opt.id) }}
            className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${
              active ? 'bg-[#004B8D] text-white border-[#004B8D]' : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function SingleChoiceInput({
  opts, value, onChange, onAutoAdvance,
}: { opts: QuestionOption[]; value: string | null; onChange: (v: string) => void; onAutoAdvance: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      {opts.map(opt => {
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => { onChange(opt.id); onAutoAdvance(opt.id) }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm text-left transition-colors ${
              active ? 'bg-[#004B8D]/5 border-[#004B8D] text-[#004B8D]' : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
              active ? 'border-[#004B8D]' : 'border-gray-300'
            }`}>
              {active && <span className="h-2 w-2 rounded-full bg-[#004B8D]" />}
            </span>
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function MultipleChoiceInput({
  opts, value, onChange,
}: { opts: QuestionOption[]; value: string | null; onChange: (v: string) => void }) {
  const selected: Set<string> = useMemo(() => {
    if (!value) return new Set()
    try { return new Set(JSON.parse(value) as string[]) } catch { return new Set() }
  }, [value])

  function toggle(id: string) {
    const next = new Set(selected)
    if (next.has(id)) { next.delete(id) } else { next.add(id) }
    onChange(JSON.stringify([...next]))
  }

  return (
    <div className="flex flex-col gap-1.5">
      {opts.map(opt => {
        const active = selected.has(opt.id)
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm text-left transition-colors ${
              active ? 'bg-[#004B8D]/5 border-[#004B8D] text-[#004B8D]' : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            <span className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 ${
              active ? 'border-[#004B8D] bg-[#004B8D]' : 'border-gray-300'
            }`}>
              {active && (
                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Single question view ────────────────────────────────────────────────────

function QuestionView({
  question,
  section,
  options,
  value,
  onChange,
  onAutoAdvance,
}: {
  question: Question
  section: Section | undefined
  options: QuestionOption[]
  value: string | null
  onChange: (v: string) => void
  onAutoAdvance: (v: string) => void
}) {
  const opts = options.filter(o => o.question_id === question.id).sort((a, b) => a.order - b.order)

  return (
    <div className="flex flex-col gap-3">
      {section && (
        <p className="text-[10px] font-bold text-[#004B8D] uppercase tracking-wide">
          {section.title}
        </p>
      )}
      <div className="flex items-start gap-1">
        <span className="text-sm font-semibold text-gray-800 leading-snug flex-1">
          {question.label}
        </span>
        {question.required && <span className="text-xs text-red-500 shrink-0 mt-0.5">*</span>}
      </div>
      {question.help_text && (
        <p className="text-xs text-gray-500">{question.help_text}</p>
      )}

      {question.type === 'boolean' && (
        <BooleanInput opts={opts} value={value} onChange={onChange} onAutoAdvance={onAutoAdvance} />
      )}
      {question.type === 'single_choice' && (
        <SingleChoiceInput opts={opts} value={value} onChange={onChange} onAutoAdvance={onAutoAdvance} />
      )}
      {question.type === 'multiple_choice' && (
        <MultipleChoiceInput opts={opts} value={value} onChange={onChange} />
      )}
      {question.type === 'text_short' && (
        <input
          type="text"
          placeholder={question.placeholder ?? 'Escribe aquí…'}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#004B8D]"
        />
      )}
      {question.type === 'text_long' && (
        <textarea
          placeholder={question.placeholder ?? 'Escribe aquí…'}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm resize-none outline-none focus:border-[#004B8D]"
        />
      )}
      {question.type === 'number' && (
        <input
          type="number"
          placeholder="0"
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#004B8D]"
        />
      )}
      {question.type === 'date' && (
        <input
          type="date"
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#004B8D]"
        />
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PreviewClient({ survey, sections, questions, options, conditions }: PreviewClientProps) {
  const { sorted, getNextId } = useFormNavigation(questions, sections, conditions)
  const firstQuestion = sorted[0]

  const [currentId, setCurrentId] = useState<string | null>(firstQuestion?.id ?? null)
  const [answers, setAnswers] = useState<Record<string, string | null>>({})
  const [done, setDone] = useState(false)

  const currentQuestion = questions.find(q => q.id === currentId) ?? null
  const currentSection  = currentQuestion ? sections.find(s => s.id === currentQuestion.section_id) : undefined
  const currentAnswer   = currentId ? (answers[currentId] ?? null) : null

  const totalQ      = sorted.length
  const answeredCount = Object.keys(answers).length

  // Types that auto-advance on selection
  const isAutoAdvance = currentQuestion?.type === 'boolean' || currentQuestion?.type === 'single_choice'

  // History stack for "Regresar"
  const [history, setHistory] = useState<string[]>([])
  const [showSummary, setShowSummary] = useState(false)

  function handleAnswer(v: string) {
    if (!currentId) return
    setAnswers(prev => ({ ...prev, [currentId]: v }))
  }

  function advance(fromId: string, withAnswers: Record<string, string | null>) {
    const nextId = getNextId(fromId, withAnswers)
    setHistory(prev => [...prev, fromId])
    if (nextId) {
      setCurrentId(nextId)
    } else {
      setDone(true)
    }
  }

  function handleNext() {
    if (!currentId) return
    advance(currentId, answers)
  }

  // Auto-advance: records the answer then navigates after a short delay
  function handleAutoAdvance(v: string) {
    if (!currentId) return
    const newAnswers = { ...answers, [currentId]: v }
    setAnswers(newAnswers)
    setTimeout(() => advance(currentId, newAnswers), 260)
  }

  function handleBack() {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    setCurrentId(prev)
    setDone(false)
  }

  function handleRestart() {
    setCurrentId(firstQuestion?.id ?? null)
    setAnswers({})
    setHistory([])
    setDone(false)
    setShowSummary(false)
  }

  // Empty form
  if (sorted.length === 0) {
    return (
      <div className="flex h-screen flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4 bg-background">
          <Link href={`/formularios/${survey.id}/editar`}>
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <span className="font-semibold text-sm flex-1">Vista previa — {survey.name}</span>
        </header>
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Este formulario no tiene preguntas todavía.
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4 bg-background">
        <Link href={`/formularios/${survey.id}/editar`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <span className="font-semibold text-sm flex-1">Vista previa — {survey.name}</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Smartphone className="h-4 w-4" />
          <span>Simulación App Móvil</span>
        </div>
      </header>

      {/* Preview area */}
      <div className="flex flex-1 items-start justify-center overflow-auto bg-muted/40 p-8">
        {/* Phone frame */}
        <div className="w-[375px] shrink-0">
          <div className="rounded-[44px] border-[8px] border-gray-800 shadow-2xl bg-gray-800 overflow-hidden flex flex-col" style={{ height: 720 }}>
            {/* Status bar */}
            <div className="flex items-center justify-between bg-white px-6 pt-3 pb-1">
              <span className="text-xs font-semibold text-gray-800">9:41</span>
              <div className="flex items-center gap-1">
                <div className="h-2 w-4 rounded-sm bg-gray-800 opacity-80" />
                <div className="h-2 w-2 rounded-full bg-gray-800 opacity-80" />
                <div className="h-2 w-6 rounded-sm border border-gray-800 opacity-80">
                  <div className="h-full w-4/5 rounded-sm bg-gray-800" />
                </div>
              </div>
            </div>

            {/* App header */}
            <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-100">
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: '#004B8D' }}
              >
                G
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{survey.name}</p>
                <p className="text-[10px] text-gray-500">v{survey.version}</p>
              </div>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {answeredCount}/{totalQ}
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-gray-100">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${totalQ > 0 ? (answeredCount / totalQ) * 100 : 0}%`, backgroundColor: '#004B8D' }}
              />
            </div>

            {/* Scrollable content — fixed height, scrolls internally */}
            <div className="bg-gray-50 overflow-y-auto relative" style={{ height: 504 }}>
              {/* Summary overlay */}
              {showSummary && (
                <div className="absolute inset-0 bg-white z-10 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-gray-800">Resumen de respuestas</p>
                    <button type="button" onClick={() => setShowSummary(false)} className="text-xs text-[#004B8D] font-medium">Cerrar</button>
                  </div>
                  {sorted.map(q => {
                    const ans = answers[q.id]
                    if (ans === undefined || ans === null) return null
                    const qOpts = options.filter(o => o.question_id === q.id)
                    let display = ans
                    // For boolean/single_choice, show label not ID
                    const matchOpt = qOpts.find(o => o.id === ans)
                    if (matchOpt) display = matchOpt.label
                    // For multiple_choice
                    if (q.type === 'multiple_choice') {
                      try {
                        const ids: string[] = JSON.parse(ans)
                        display = ids.map(id => qOpts.find(o => o.id === id)?.label ?? id).join(', ')
                      } catch { /* keep as-is */ }
                    }
                    return (
                      <div key={q.id} className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                        <p className="text-[10px] text-gray-400 leading-tight">{q.label}</p>
                        <p className="text-xs font-semibold text-gray-800 mt-0.5">{display}</p>
                      </div>
                    )
                  })}
                  {Object.keys(answers).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-8">Sin respuestas aún.</p>
                  )}
                </div>
              )}

              {done ? (
                /* Done screen */
                <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center h-full">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <div>
                    <p className="text-base font-semibold text-gray-800">¡Checklist completado!</p>
                    <p className="text-xs text-gray-500 mt-1">{answeredCount} respuesta{answeredCount !== 1 ? 's' : ''} registrada{answeredCount !== 1 ? 's' : ''}.</p>
                  </div>
                </div>
              ) : currentQuestion ? (
                /* Current question */
                <div className="px-4 py-5">
                  <QuestionView
                    question={currentQuestion}
                    section={currentSection}
                    options={options}
                    value={currentAnswer}
                    onChange={handleAnswer}
                    onAutoAdvance={handleAutoAdvance}
                  />
                </div>
              ) : null}
            </div>

            {/* ── Bottom action bar — siempre visible ── */}
            <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-2 shrink-0">
              {/* Regresar */}
              <button
                type="button"
                onClick={handleBack}
                disabled={history.length === 0}
                className="flex items-center justify-center h-10 w-10 rounded-xl border border-gray-200 text-gray-500 disabled:opacity-30 transition-opacity shrink-0"
                title="Regresar"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>

              {/* Siguiente / Finalizar */}
              <button
                type="button"
                onClick={done ? handleRestart : handleNext}
                disabled={!done && !!(currentQuestion?.required && !currentAnswer)}
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: '#FF8F1C' }}
              >
                {done ? 'Reiniciar' : (
                  getNextId(currentId ?? '', answers) !== undefined && !done
                    ? <>{isAutoAdvance ? 'Siguiente' : 'Siguiente'} <ChevronRight className="h-4 w-4" /></>
                    : 'Finalizar'
                )}
              </button>

              {/* Resumen */}
              <button
                type="button"
                onClick={() => setShowSummary(s => !s)}
                className="flex items-center justify-center h-10 px-3 rounded-xl border border-gray-200 text-xs text-gray-600 font-medium shrink-0"
                title="Ver resumen"
              >
                {answeredCount > 0 && (
                  <span className="mr-1 text-[#004B8D] font-bold">{answeredCount}</span>
                )}
                Resumen
              </button>
            </div>

            {/* Home indicator */}
            <div className="flex justify-center bg-white py-1.5">
              <div className="h-1 w-24 rounded-full bg-gray-300" />
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Esta es una simulación visual. El comportamiento real puede variar.
          </p>
        </div>
      </div>
    </div>
  )
}
