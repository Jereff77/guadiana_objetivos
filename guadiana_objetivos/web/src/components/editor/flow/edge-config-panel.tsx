'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Trash2 } from 'lucide-react'
import { createCondition, updateCondition, deleteCondition } from '@/app/(dashboard)/formularios/[id]/editar/section-actions'
import type { Section } from './section-node'
import type { Condition } from './condition-edge'

export interface Question {
  id: string
  section_id: string
  label: string
  description: string | null
  type: string
  required: boolean
  order: number
  placeholder: string | null
  help_text: string | null
  metadata: Record<string, unknown> | null
}

export interface QuestionOption {
  id: string
  question_id: string
  label: string
  value: string | null
  score: number | null
  order: number
  is_default: boolean
}

interface EdgeConfigPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  sourceSection: Section | undefined
  targetSection: Section | undefined
  condition: Condition | null
  questions: Question[]
  options: QuestionOption[]
  surveyId: string
  onSave?: () => void
}

export function EdgeConfigPanel({
  open,
  onOpenChange,
  mode,
  sourceSection,
  targetSection,
  condition,
  questions,
  options,
  surveyId,
  onSave,
}: EdgeConfigPanelProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string>(
    condition?.source_question_id ?? ''
  )
  const [selectedOption, setSelectedOption] = useState<string>(
    condition?.source_option_id ?? ''
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (condition) {
      setSelectedQuestion(condition.source_question_id)
      setSelectedOption(condition.source_option_id ?? '')
    }
  }, [condition])

  // Filtrar preguntas válidas de la sección origen (boolean o single_choice)
  const validQuestions = questions.filter(
    (q) =>
      sourceSection && q.section_id === sourceSection.id && ['boolean', 'single_choice'].includes(q.type)
  )

  // Opciones de la pregunta seleccionada
  const questionOptions = options.filter((o) => o.question_id === selectedQuestion)

  const handleSave = async () => {
    if (!selectedQuestion || !selectedOption || !targetSection) return

    setSaving(true)
    try {
      if (mode === 'create') {
        await createCondition(
          surveyId,
          selectedQuestion,
          selectedOption,
          selectedOption,
          targetSection.id
        )
      } else if (condition) {
        await updateCondition(condition.id, surveyId, {
          sourceQuestionId: selectedQuestion,
          sourceOptionId: selectedOption,
          conditionValue: selectedOption,
          targetSectionId: targetSection.id,
        })
      }
      onOpenChange(false)
      onSave?.()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!condition) return

    setDeleting(true)
    try {
      await deleteCondition(condition.id, surveyId)
      onOpenChange(false)
      onSave?.()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Configurar condición</SheetTitle>
          <SheetDescription>
            Define la pregunta y opción que activa el salto a {targetSection?.title}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {!sourceSection && (
            <div className="flex gap-2 items-start text-sm text-amber-700 bg-amber-50 p-3 rounded">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Sección origen no encontrada. Esta condición es inválida.</span>
            </div>
          )}

          {!targetSection && (
            <div className="flex gap-2 items-start text-sm text-amber-700 bg-amber-50 p-3 rounded">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Sección destino no encontrada. Esta condición es inválida.</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Pregunta disparadora</label>
            <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una pregunta" />
              </SelectTrigger>
              <SelectContent>
                {validQuestions.length > 0 ? (
                  validQuestions.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.label}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No hay preguntas válidas en esta sección
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Respuesta que activa el salto</label>
            <Select value={selectedOption} onValueChange={setSelectedOption}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                {questionOptions.length > 0 ? (
                  questionOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Selecciona una pregunta primero
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sección destino</label>
            <div className="px-3 py-2 bg-muted text-sm rounded-md">
              {targetSection?.title ?? 'No especificada'}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={!selectedQuestion || !selectedOption || saving}
              className="flex-1"
              style={{ backgroundColor: '#004B8D' }}
            >
              {saving ? 'Guardando…' : 'Guardar condición'}
            </Button>
            <SheetClose asChild>
              <Button variant="outline" className="flex-1">
                Cancelar
              </Button>
            </SheetClose>
          </div>

          {mode === 'edit' && condition && (
            <Button
              onClick={handleDelete}
              disabled={deleting}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Eliminando…' : 'Eliminar condición'}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
