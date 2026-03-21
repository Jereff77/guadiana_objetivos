'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { Section, Question, SelectedElement } from '@/app/(dashboard)/formularios/[id]/editar/editor-client'
import { createSection } from '@/app/(dashboard)/formularios/[id]/editar/section-actions'

const questionTypeLabels: Record<string, string> = {
  boolean: 'Sí / No',
  single_choice: 'Opción única',
  multiple_choice: 'Opción múltiple',
  text_short: 'Texto corto',
  text_long: 'Texto largo',
  number: 'Número',
  date: 'Fecha',
}

interface SectionsPanelProps {
  surveyId: string
  sections: Section[]
  questions: Question[]
  selected: SelectedElement
  onSelect: (el: SelectedElement) => void
  onSectionsChange: (sections: Section[]) => void
  onQuestionsChange: (questions: Question[]) => void
}

export function SectionsPanel({
  surveyId,
  sections,
  questions,
  selected,
  onSelect,
  onSectionsChange,
}: SectionsPanelProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(sections.map((s) => s.id)))
  const [adding, setAdding] = useState(false)

  function toggleSection(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleAddSection() {
    setAdding(true)
    const result = await createSection(surveyId, sections.length)
    if (result.section) {
      onSectionsChange([...sections, result.section])
      setExpanded((prev) => new Set([...prev, result.section!.id]))
      onSelect({ kind: 'section', id: result.section.id })
    }
    setAdding(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="text-sm font-medium">Estructura</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={handleAddSection}
          disabled={adding}
        >
          <Plus className="h-3 w-3 mr-1" />
          Sección
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sections.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground px-4">
              Agrega una sección para comenzar a construir tu formulario
            </div>
          )}

          {sections.map((section) => {
            const sectionQuestions = questions.filter((q) => q.section_id === section.id)
            const isOpen = expanded.has(section.id)
            const isSectionSelected = selected.kind === 'section' && selected.id === section.id

            return (
              <div key={section.id}>
                {/* Section row */}
                <div
                  className={cn(
                    'flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer group',
                    isSectionSelected
                      ? 'bg-[#004B8D]/10 text-[#004B8D]'
                      : 'hover:bg-muted/50'
                  )}
                  onClick={() => onSelect({ kind: 'section', id: section.id })}
                >
                  <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                  <button
                    type="button"
                    className="shrink-0 text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSection(section.id)
                    }}
                  >
                    {isOpen
                      ? <ChevronDown className="h-3 w-3" />
                      : <ChevronRight className="h-3 w-3" />
                    }
                  </button>
                  <span className="text-xs font-medium truncate flex-1">{section.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {sectionQuestions.length}
                  </span>
                </div>

                {/* Questions */}
                {isOpen && sectionQuestions.map((question) => {
                  const isQuestionSelected =
                    selected.kind === 'question' && selected.id === question.id
                  return (
                    <div
                      key={question.id}
                      className={cn(
                        'flex items-start gap-1 pl-8 pr-2 py-1.5 rounded-md cursor-pointer ml-1',
                        isQuestionSelected
                          ? 'bg-[#FF8F1C]/10 text-[#FF8F1C]'
                          : 'hover:bg-muted/50'
                      )}
                      onClick={() => onSelect({ kind: 'question', id: question.id })}
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{question.label}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {questionTypeLabels[question.type] ?? question.type}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
