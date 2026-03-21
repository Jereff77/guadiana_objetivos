'use client'

import { useState, useTransition } from 'react'
import { Trash2, Plus, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
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
  updateQuestion,
  deleteQuestion,
  createOption,
  deleteOption,
} from '@/app/(dashboard)/formularios/[id]/editar/section-actions'
import type {
  Question,
  QuestionOption,
} from '@/app/(dashboard)/formularios/[id]/editar/editor-client'

const OPTION_TYPES = ['single_choice', 'multiple_choice']
const REQUIRES_OPTIONS = (type: string) => OPTION_TYPES.includes(type)

const typeLabels: Record<string, string> = {
  boolean: 'Sí / No',
  single_choice: 'Opción única',
  multiple_choice: 'Opción múltiple',
  text_short: 'Texto corto',
  text_long: 'Texto largo',
  number: 'Número',
  date: 'Fecha',
}

interface QuestionPropertiesProps {
  surveyId: string
  question: Question
  options: QuestionOption[]
  questions: Question[]
  onQuestionsChange: (questions: Question[]) => void
  onOptionsChange: (options: QuestionOption[]) => void
}

export function QuestionProperties({
  question,
  options,
  questions,
  onQuestionsChange,
  onOptionsChange,
}: QuestionPropertiesProps) {
  const [label, setLabel] = useState(question.label)
  const [helpText, setHelpText] = useState(question.help_text ?? '')
  const [required, setRequired] = useState(question.required)
  const [newOptionLabel, setNewOptionLabel] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleSave() {
    startTransition(async () => {
      await updateQuestion(question.id, { label, help_text: helpText, required })
      onQuestionsChange(
        questions.map((q) =>
          q.id === question.id ? { ...q, label, help_text: helpText, required } : q
        )
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  function handleAddOption() {
    if (!newOptionLabel.trim()) return
    startTransition(async () => {
      const result = await createOption(question.id, newOptionLabel.trim(), options.length)
      if (result.option) {
        onOptionsChange([...options, result.option])
        setNewOptionLabel('')
      }
    })
  }

  function handleDeleteOption(optionId: string) {
    startTransition(async () => {
      await deleteOption(optionId)
      onOptionsChange(options.filter((o) => o.id !== optionId))
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteQuestion(question.id)
      onQuestionsChange(questions.filter((q) => q.id !== question.id))
      setDeleteOpen(false)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{typeLabels[question.type] ?? question.type}</Badge>
        {required && (
          <Badge style={{ backgroundColor: '#FF8F1C', color: 'white' }}>Obligatoria</Badge>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="q-label">Texto de la pregunta</Label>
        <Textarea
          id="q-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="¿Cuál es la pregunta?"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="q-help">Texto de ayuda (opcional)</Label>
        <Input
          id="q-help"
          value={helpText}
          onChange={(e) => setHelpText(e.target.value)}
          placeholder="Instrucción adicional para el usuario"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="q-required"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="q-required" className="cursor-pointer">
          Pregunta obligatoria
        </Label>
      </div>

      <Button
        size="sm"
        onClick={handleSave}
        disabled={isPending}
        style={{ backgroundColor: '#004B8D' }}
      >
        {saved ? '¡Guardado!' : isPending ? 'Guardando…' : 'Guardar pregunta'}
      </Button>

      {/* Options for choice questions */}
      {REQUIRES_OPTIONS(question.type) && (
        <>
          <Separator />
          <div className="space-y-3">
            <p className="text-sm font-medium">Opciones de respuesta</p>
            <div className="space-y-1">
              {options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <span className="flex-1 text-sm bg-muted rounded px-2 py-1">{opt.label}</span>
                  {opt.score !== null && (
                    <span className="text-xs text-muted-foreground shrink-0">{opt.score} pts</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleDeleteOption(opt.id)}
                    disabled={isPending}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newOptionLabel}
                onChange={(e) => setNewOptionLabel(e.target.value)}
                placeholder="Nueva opción…"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddOption()
                  }
                }}
              />
              <Button
                size="sm"
                onClick={handleAddOption}
                disabled={isPending || !newOptionLabel.trim()}
                style={{ backgroundColor: '#FF8F1C' }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <Separator />

      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive border-destructive/30"
        onClick={() => setDeleteOpen(true)}
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Eliminar pregunta
      </Button>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta pregunta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
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
