'use client'

import { useEffect, useState, useTransition } from 'react'
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
  updateOption,
} from '@/app/(dashboard)/formularios/[id]/editar/section-actions'
import type {
  Question,
  QuestionOption,
} from '@/app/(dashboard)/formularios/[id]/editar/editor-client'

// ── OptionRow component ───────────────────────────────────────────────────────

interface OptionRowProps {
  option: QuestionOption
  canDelete: boolean
  disabled: boolean
  onDelete: () => void
  onScoreChange: (score: number | null) => void
}

function OptionRow({ option, canDelete, disabled, onDelete, onScoreChange }: OptionRowProps) {
  const [scoreInput, setScoreInput] = useState(option.score?.toString() ?? '')

  function handleScoreBlur() {
    const parsed = scoreInput === '' ? null : parseFloat(scoreInput)
    if (!isNaN(parsed ?? 0) || parsed === null) {
      onScoreChange(parsed)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex-1 text-sm bg-muted rounded px-2 py-1 truncate">{option.label}</span>
      <input
        type="number"
        value={scoreInput}
        onChange={(e) => setScoreInput(e.target.value)}
        onBlur={handleScoreBlur}
        placeholder="0"
        className="w-14 h-7 text-xs text-right bg-muted rounded px-2 border-0 focus:outline-none focus:ring-1 focus:ring-ring"
        disabled={disabled}
        step="0.5"
      />
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
          onClick={onDelete}
          disabled={disabled}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

const OPTION_TYPES = ['single_choice', 'multiple_choice', 'boolean']
const REQUIRES_OPTIONS = (type: string) => OPTION_TYPES.includes(type)
const CAN_ADD_OPTIONS = (type: string) => ['single_choice', 'multiple_choice'].includes(type)

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
  onSaveStart: () => void
  onSaveEnd: (success: boolean) => void
}

export function QuestionProperties({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  surveyId: _surveyId,
  question,
  options,
  questions,
  onQuestionsChange,
  onOptionsChange,
  onSaveStart,
  onSaveEnd,
}: QuestionPropertiesProps) {
  const [label, setLabel] = useState(question.label)
  const [helpText, setHelpText] = useState(question.help_text ?? '')
  const [required, setRequired] = useState(question.required)
  const [newOptionLabel, setNewOptionLabel] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Reset when question changes
  useEffect(() => {
    setLabel(question.label)
    setHelpText(question.help_text ?? '')
    setRequired(question.required)
  }, [question.id, question.label, question.help_text, question.required])

  // Auto-save con debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (
        label === question.label &&
        helpText === (question.help_text ?? '') &&
        required === question.required
      ) return

      onSaveStart()
      try {
        await updateQuestion(question.id, { label, help_text: helpText, required })
        onQuestionsChange(
          questions.map((q) =>
            q.id === question.id ? { ...q, label, help_text: helpText, required } : q
          )
        )
        onSaveEnd(true)
      } catch {
        onSaveEnd(false)
      }
    }, 800)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label, helpText, required])

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

      <p className="text-xs text-muted-foreground">Los cambios se guardan automáticamente.</p>

      {/* Options for choice/boolean questions */}
      {REQUIRES_OPTIONS(question.type) && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Opciones de respuesta</p>
              <span className="text-xs text-muted-foreground">Puntaje</span>
            </div>
            <div className="space-y-1.5">
              {options.map((opt) => (
                <OptionRow
                  key={opt.id}
                  option={opt}
                  canDelete={CAN_ADD_OPTIONS(question.type)}
                  onDelete={() => handleDeleteOption(opt.id)}
                  onScoreChange={(score) => {
                    startTransition(async () => {
                      await updateOption(opt.id, { label: opt.label, score })
                      onOptionsChange(
                        options.map((o) => o.id === opt.id ? { ...o, score } : o)
                      )
                    })
                  }}
                  disabled={isPending}
                />
              ))}
            </div>
            {CAN_ADD_OPTIONS(question.type) && (
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
            )}
            {options.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Puntaje máximo:{' '}
                <strong>
                  {options.reduce((sum, o) => sum + (o.score ?? 0), 0)} pts
                </strong>
              </p>
            )}
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
