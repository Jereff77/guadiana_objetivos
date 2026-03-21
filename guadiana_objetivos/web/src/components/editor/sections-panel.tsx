'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { Section, Question, SelectedElement } from '@/app/(dashboard)/formularios/[id]/editar/editor-client'
import {
  createSection,
  reorderSections,
  reorderQuestions,
} from '@/app/(dashboard)/formularios/[id]/editar/section-actions'

const questionTypeLabels: Record<string, string> = {
  boolean: 'Sí / No',
  single_choice: 'Opción única',
  multiple_choice: 'Opción múltiple',
  text_short: 'Texto corto',
  text_long: 'Texto largo',
  number: 'Número',
  date: 'Fecha',
}

// ── Sortable question row ─────────────────────────────────────────────────────

interface SortableQuestionProps {
  question: Question
  selected: SelectedElement
  onSelect: (el: SelectedElement) => void
}

function SortableQuestion({ question, selected, onSelect }: SortableQuestionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isSelected = selected.kind === 'question' && selected.id === question.id

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-start gap-1 pl-8 pr-2 py-1.5 rounded-md cursor-pointer ml-1',
        isSelected ? 'bg-[#FF8F1C]/10 text-[#FF8F1C]' : 'hover:bg-muted/50'
      )}
      onClick={() => onSelect({ kind: 'question', id: question.id })}
    >
      <span
        {...attributes}
        {...listeners}
        className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3 w-3" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{question.label}</p>
        <p className="text-xs text-muted-foreground truncate">
          {questionTypeLabels[question.type] ?? question.type}
        </p>
      </div>
    </div>
  )
}

// ── Sortable section row ──────────────────────────────────────────────────────

interface SortableSectionProps {
  section: Section
  questions: Question[]
  selected: SelectedElement
  expanded: Set<string>
  onToggle: (id: string) => void
  onSelect: (el: SelectedElement) => void
  onQuestionsReorder: (sectionId: string, newOrder: Question[]) => void
}

function SortableSection({
  section,
  questions,
  selected,
  expanded,
  onToggle,
  onSelect,
  onQuestionsReorder,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const isOpen = expanded.has(section.id)
  const isSectionSelected = selected.kind === 'section' && selected.id === section.id

  function handleQuestionDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = questions.findIndex((q) => q.id === active.id)
    const newIndex = questions.findIndex((q) => q.id === over.id)
    const reordered = arrayMove(questions, oldIndex, newIndex)
    onQuestionsReorder(section.id, reordered)
    reorderQuestions(section.id, reordered.map((q) => q.id))
  }

  return (
    <div ref={setNodeRef} style={style}>
      {/* Section header */}
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer group',
          isSectionSelected ? 'bg-[#004B8D]/10 text-[#004B8D]' : 'hover:bg-muted/50'
        )}
        onClick={() => onSelect({ kind: 'section', id: section.id })}
      >
        <span
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3 w-3" />
        </span>
        <button
          type="button"
          className="shrink-0 text-muted-foreground"
          onClick={(e) => { e.stopPropagation(); onToggle(section.id) }}
        >
          {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
        <span className="text-xs font-medium truncate flex-1">{section.title}</span>
        <span className="text-xs text-muted-foreground shrink-0">{questions.length}</span>
      </div>

      {/* Questions (sortable) */}
      {isOpen && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleQuestionDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((question) => (
              <SortableQuestion
                key={question.id}
                question={question}
                selected={selected}
                onSelect={onSelect}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

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
  onQuestionsChange,
}: SectionsPanelProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(sections.map((s) => s.id)))
  const [adding, setAdding] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

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

  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)
    const reordered = arrayMove(sections, oldIndex, newIndex)
    onSectionsChange(reordered)
    reorderSections(surveyId, reordered.map((s) => s.id))
  }

  function handleQuestionsReorder(sectionId: string, reordered: Question[]) {
    const otherQuestions = questions.filter((q) => q.section_id !== sectionId)
    onQuestionsChange([...otherQuestions, ...reordered])
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

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSectionDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  questions={questions.filter((q) => q.section_id === section.id)}
                  selected={selected}
                  expanded={expanded}
                  onToggle={toggleSection}
                  onSelect={onSelect}
                  onQuestionsReorder={handleQuestionsReorder}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>
    </div>
  )
}
