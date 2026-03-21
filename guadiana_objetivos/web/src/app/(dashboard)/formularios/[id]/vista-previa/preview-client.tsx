'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Smartphone } from 'lucide-react'
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

interface PreviewClientProps {
  survey: { id: string; name: string; description: string | null; status: string; version: number }
  sections: Section[]
  questions: Question[]
  options: QuestionOption[]
}

// ─── Question type components ────────────────────────────────────────────────

function BooleanInput({ opts }: { opts: QuestionOption[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const choices = opts.length > 0
    ? opts
    : [{ id: '_yes', label: 'Sí', value: 'yes' }, { id: '_no', label: 'No', value: 'no' }]

  return (
    <div className="flex gap-2">
      {choices.map((opt) => {
        const val = opt.value ?? opt.label
        const active = selected === val
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelected(val)}
            className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${
              active
                ? 'bg-[#004B8D] text-white border-[#004B8D]'
                : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function SingleChoiceInput({ opts }: { opts: QuestionOption[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-1.5">
      {opts.map((opt) => {
        const val = opt.value ?? opt.label
        const active = selected === val
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelected(val)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm text-left transition-colors ${
              active
                ? 'bg-[#004B8D]/5 border-[#004B8D] text-[#004B8D]'
                : 'bg-white border-gray-200 text-gray-700'
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

function MultipleChoiceInput({ opts }: { opts: QuestionOption[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggle(val: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(val)) next.delete(val)
      else next.add(val)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-1.5">
      {opts.map((opt) => {
        const val = opt.value ?? opt.label
        const active = selected.has(val)
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(val)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm text-left transition-colors ${
              active
                ? 'bg-[#004B8D]/5 border-[#004B8D] text-[#004B8D]'
                : 'bg-white border-gray-200 text-gray-700'
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

function QuestionPreview({ question, options }: { question: Question; options: QuestionOption[] }) {
  const opts = options.filter((o) => o.question_id === question.id)

  return (
    <div className="flex flex-col gap-2 pb-4 mb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-start gap-1">
        <span className="text-sm font-semibold text-gray-800 leading-snug flex-1">
          {question.label}
        </span>
        {question.required && (
          <span className="text-xs text-red-500 shrink-0 mt-0.5">Requerido</span>
        )}
      </div>
      {question.help_text && (
        <p className="text-xs text-gray-500">{question.help_text}</p>
      )}

      {question.type === 'boolean' && <BooleanInput opts={opts} />}
      {question.type === 'single_choice' && <SingleChoiceInput opts={opts} />}
      {question.type === 'multiple_choice' && <MultipleChoiceInput opts={opts} />}
      {question.type === 'text_short' && (
        <input
          type="text"
          placeholder={question.placeholder ?? 'Escribe aquí…'}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#004B8D]"
        />
      )}
      {question.type === 'text_long' && (
        <textarea
          placeholder={question.placeholder ?? 'Escribe aquí…'}
          rows={3}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm resize-none outline-none focus:border-[#004B8D]"
        />
      )}
      {question.type === 'number' && (
        <input
          type="number"
          placeholder="0"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#004B8D]"
        />
      )}
      {question.type === 'date' && (
        <input
          type="date"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#004B8D]"
        />
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PreviewClient({ survey, sections, questions, options }: PreviewClientProps) {
  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4 bg-background">
        <Link href={`/formularios/${survey.id}/editar`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
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
          {/* Bezel */}
          <div className="rounded-[44px] border-[8px] border-gray-800 shadow-2xl bg-gray-800 overflow-hidden">
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
                {sections.length} secc.
              </Badge>
            </div>

            {/* Scrollable form content */}
            <div className="bg-gray-50 overflow-y-auto" style={{ maxHeight: '580px' }}>
              {/* Form description */}
              {survey.description && (
                <div className="px-4 pt-4 pb-2">
                  <p className="text-xs text-gray-500 leading-relaxed">{survey.description}</p>
                </div>
              )}

              {sections.length === 0 ? (
                <div className="flex items-center justify-center py-16 px-4 text-center">
                  <p className="text-sm text-gray-400">Este formulario aún no tiene secciones.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0 pb-6">
                  {sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => {
                      const sectionQuestions = questions
                        .filter((q) => q.section_id === section.id)
                        .sort((a, b) => a.order - b.order)

                      return (
                        <div key={section.id}>
                          {/* Section header */}
                          <div className="px-4 pt-5 pb-2">
                            <h2 className="text-sm font-bold text-[#004B8D]">{section.title}</h2>
                            {section.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                            )}
                          </div>

                          {/* Questions */}
                          {sectionQuestions.length > 0 ? (
                            <div className="mx-3 rounded-2xl bg-white p-4 shadow-sm">
                              {sectionQuestions.map((q) => (
                                <QuestionPreview key={q.id} question={q} options={options} />
                              ))}
                            </div>
                          ) : (
                            <div className="mx-3 rounded-2xl bg-white p-4 shadow-sm">
                              <p className="text-xs text-gray-400 text-center py-2">Sin preguntas</p>
                            </div>
                          )}
                        </div>
                      )
                    })}

                  {/* Submit button */}
                  <div className="px-3 pt-5">
                    <button
                      type="button"
                      className="w-full py-3 rounded-2xl text-white text-sm font-semibold"
                      style={{ backgroundColor: '#FF8F1C' }}
                    >
                      Enviar formulario
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Home indicator */}
            <div className="flex justify-center bg-white py-2">
              <div className="h-1 w-24 rounded-full bg-gray-300" />
            </div>
          </div>

          {/* Label below */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Esta es una simulación visual. El comportamiento real puede variar.
          </p>
        </div>
      </div>
    </div>
  )
}
