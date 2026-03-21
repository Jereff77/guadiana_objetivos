'use client'

import { useEffect, useState, useTransition } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  updateSection,
  deleteSection,
  createQuestion,
} from '@/app/(dashboard)/formularios/[id]/editar/section-actions'
import type { Section, Question } from '@/app/(dashboard)/formularios/[id]/editar/editor-client'

const QUESTION_TYPES = [
  { value: 'boolean', label: 'Sí / No' },
  { value: 'single_choice', label: 'Opción única' },
  { value: 'multiple_choice', label: 'Opción múltiple' },
  { value: 'text_short', label: 'Texto corto' },
  { value: 'text_long', label: 'Texto largo' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Fecha' },
]

interface SectionPropertiesProps {
  section: Section
  sections: Section[]
  questions: Question[]
  onSectionsChange: (sections: Section[]) => void
  onQuestionsChange: (questions: Question[]) => void
  onSaveStart: () => void
  onSaveEnd: (success: boolean) => void
}

export function SectionProperties({
  section,
  sections,
  questions,
  onSectionsChange,
  onQuestionsChange,
  onSaveStart,
  onSaveEnd,
}: SectionPropertiesProps) {
  const [title, setTitle] = useState(section.title)
  const [desc, setDesc] = useState(section.description ?? '')
  const [newQuestionType, setNewQuestionType] = useState('boolean')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const sectionQuestions = questions.filter((q) => q.section_id === section.id)

  // Reset fields when section changes
  useEffect(() => {
    setTitle(section.title)
    setDesc(section.description ?? '')
  }, [section.id, section.title, section.description])

  // Auto-save con debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (title === section.title && desc === (section.description ?? '')) return
      onSaveStart()
      try {
        await updateSection(section.id, { title, description: desc })
        onSectionsChange(
          sections.map((s) =>
            s.id === section.id ? { ...s, title, description: desc } : s
          )
        )
        onSaveEnd(true)
      } catch {
        onSaveEnd(false)
      }
    }, 800)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, desc])

  function handleAddQuestion() {
    startTransition(async () => {
      const result = await createQuestion(section.id, newQuestionType, sectionQuestions.length)
      if (result.question) {
        onQuestionsChange([...questions, result.question])
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteSection(section.id)
      onSectionsChange(sections.filter((s) => s.id !== section.id))
      onQuestionsChange(questions.filter((q) => q.section_id !== section.id))
      setDeleteOpen(false)
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="section-title">Título de la sección</Label>
        <Input
          id="section-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Información general"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="section-desc">Descripción (opcional)</Label>
        <Textarea
          id="section-desc"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Instrucciones adicionales para esta sección"
          rows={2}
        />
      </div>
      <p className="text-xs text-muted-foreground">Los cambios se guardan automáticamente.</p>

      <Separator />

      <div className="space-y-3">
        <p className="text-sm font-medium">Agregar pregunta</p>
        <div className="flex gap-2">
          <Select value={newQuestionType} onValueChange={setNewQuestionType}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleAddQuestion}
            disabled={isPending}
            style={{ backgroundColor: '#FF8F1C' }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive border-destructive/30"
        onClick={() => setDeleteOpen(true)}
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Eliminar sección
      </Button>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta sección?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán la sección y sus {sectionQuestions.length} pregunta(s). Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Eliminando…' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
