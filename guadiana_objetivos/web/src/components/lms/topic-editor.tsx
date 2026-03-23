'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { ChevronUp, ChevronDown, Plus, X } from 'lucide-react'
import type { LmsCourseTopic } from '@/app/(dashboard)/capacitacion/course-actions'
import type { LmsContent } from '@/app/(dashboard)/capacitacion/lms-actions'
import {
  createCourseTopic,
  updateCourseTopic,
  deleteCourseTopic,
  reorderCourseTopics,
} from '@/app/(dashboard)/capacitacion/course-actions'

interface TopicEditorProps {
  courseId: string
  initialTopics: LmsCourseTopic[]
  allContents: Pick<LmsContent, 'id' | 'title' | 'content_type'>[]
  publishedSurveys: { id: string; name: string }[]
}

const typeLabels: Record<LmsContent['content_type'], string> = {
  pdf: 'PDF',
  video: 'Video',
  text: 'Texto',
  quiz: 'Evaluación rápida',
}

const topicTypeLabel = (t: LmsCourseTopic) => {
  if (t.topic_type === 'survey') return 'Evaluación'
  if (t.lms_content) return typeLabels[t.lms_content.content_type] ?? 'Contenido'
  return 'Contenido'
}

// ── Formulario de tema (crear o editar) ──────────────────────────────────────

interface TopicFormState {
  title: string
  description: string
  topic_type: 'content' | 'survey'
  content_type: LmsContent['content_type'] | ''
  content_id: string
  survey_id: string
  is_required: boolean
}

const emptyForm = (): TopicFormState => ({
  title: '',
  description: '',
  topic_type: 'content',
  content_type: '',
  content_id: '',
  survey_id: '',
  is_required: true,
})

function TopicForm({
  initialValues,
  allContents,
  publishedSurveys,
  isPending,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initialValues: TopicFormState
  allContents: TopicEditorProps['allContents']
  publishedSurveys: TopicEditorProps['publishedSurveys']
  isPending: boolean
  onSubmit: (values: TopicFormState) => void
  onCancel: () => void
  submitLabel: string
}) {
  const [values, setValues] = useState<TopicFormState>(initialValues)
  const [error, setError] = useState<string | null>(null)

  const set = (patch: Partial<TopicFormState>) => setValues(v => ({ ...v, ...patch }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!values.title.trim()) { setError('El título es obligatorio.'); return }
    if (values.topic_type === 'content') {
      if (!values.content_type) { setError('Selecciona el tipo de contenido.'); return }
      if (!values.content_id) { setError('Selecciona un contenido.'); return }
    }
    if (values.topic_type === 'survey' && !values.survey_id) { setError('Selecciona una evaluación.'); return }
    setError(null)
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 rounded-lg border bg-muted/40">
      <input
        type="text"
        value={values.title}
        onChange={e => set({ title: e.target.value })}
        placeholder="Título del tema *"
        disabled={isPending}
        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <input
        type="text"
        value={values.description}
        onChange={e => set({ description: e.target.value })}
        placeholder="Descripción (opcional)"
        disabled={isPending}
        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {/* Tipo */}
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            checked={values.topic_type === 'content'}
            onChange={() => set({ topic_type: 'content', survey_id: '' })}
            disabled={isPending}
            className="accent-primary"
          />
          Contenido
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            checked={values.topic_type === 'survey'}
            onChange={() => set({ topic_type: 'survey', content_id: '' })}
            disabled={isPending}
            className="accent-primary"
          />
          Evaluación
        </label>
      </div>

      {/* Selector de tipo de contenido */}
      {values.topic_type === 'content' && (
        <>
          <select
            value={values.content_type}
            onChange={e => set({ content_type: e.target.value as LmsContent['content_type'] | '', content_id: '' })}
            disabled={isPending}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— Seleccionar tipo de contenido —</option>
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
            <option value="text">Texto</option>
            <option value="quiz">Evaluación rápida</option>
          </select>

          {/* Selector de contenido filtrado por tipo */}
          {values.content_type && (
            <select
              value={values.content_id}
              onChange={e => set({ content_id: e.target.value })}
              disabled={isPending}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— Seleccionar {typeLabels[values.content_type].toLowerCase()} —</option>
              {allContents.filter(c => c.content_type === values.content_type).map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          )}
        </>
      )}

      {/* Selector de evaluación */}
      {values.topic_type === 'survey' && (
        <select
          value={values.survey_id}
          onChange={e => set({ survey_id: e.target.value })}
          disabled={isPending}
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">— Seleccionar evaluación —</option>
          {publishedSurveys.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={values.is_required}
          onChange={e => set({ is_required: e.target.checked })}
          disabled={isPending}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        Obligatorio para completar el curso
      </label>

      {error && (
        <p className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 text-xs">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Guardando…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-md border text-xs font-medium px-3 py-1.5 hover:bg-muted transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

// ── TopicEditor principal ─────────────────────────────────────────────────────

export function TopicEditor({ courseId, initialTopics, allContents, publishedSurveys }: TopicEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [topics, setTopics] = useState<LmsCourseTopic[]>(initialTopics)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)

  // ── Agregar tema ────────────────────────────────────────────────────────
  const handleAdd = (values: TopicFormState) => {
    startTransition(async () => {
      const result = await createCourseTopic({
        course_id: courseId,
        title: values.title.trim(),
        description: values.description.trim() || null,
        sort_order: topics.length,
        topic_type: values.topic_type,
        content_id: values.topic_type === 'content' ? values.content_id : null,
        survey_id: values.topic_type === 'survey' ? values.survey_id : null,
        is_required: values.is_required,
      })
      if (!result.success) { setGlobalError(result.error ?? 'Error al agregar tema.'); return }
      setShowAddForm(false)
      setGlobalError(null)
      router.refresh()
    })
  }

  // ── Editar tema ─────────────────────────────────────────────────────────
  const handleEdit = (topicId: string, values: TopicFormState) => {
    startTransition(async () => {
      const result = await updateCourseTopic(topicId, {
        title: values.title.trim(),
        description: values.description.trim() || null,
        topic_type: values.topic_type,
        content_id: values.topic_type === 'content' ? values.content_id : null,
        survey_id: values.topic_type === 'survey' ? values.survey_id : null,
        is_required: values.is_required,
      })
      if (!result.success) { setGlobalError(result.error ?? 'Error al editar tema.'); return }
      setEditingId(null)
      setGlobalError(null)
      router.refresh()
    })
  }

  // ── Eliminar tema ───────────────────────────────────────────────────────
  const handleDelete = (topicId: string) => {
    startTransition(async () => {
      const result = await deleteCourseTopic(topicId)
      if (!result.success) { setGlobalError(result.error ?? 'Error al eliminar.'); return }
      setConfirmDeleteId(null)
      setTopics(prev => prev.filter(t => t.id !== topicId))
      setGlobalError(null)
      router.refresh()
    })
  }

  // ── Reordenar ───────────────────────────────────────────────────────────
  const moveUp = (index: number) => {
    if (index === 0) return
    const newOrder = [...topics]
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
    setTopics(newOrder)
    startTransition(async () => {
      await reorderCourseTopics(courseId, newOrder.map(t => t.id))
      router.refresh()
    })
  }

  const moveDown = (index: number) => {
    if (index === topics.length - 1) return
    const newOrder = [...topics]
    ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
    setTopics(newOrder)
    startTransition(async () => {
      await reorderCourseTopics(courseId, newOrder.map(t => t.id))
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Gestión del temario</h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            disabled={isPending}
            className="flex items-center gap-1 rounded-md bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar tema
          </button>
        )}
      </div>

      {globalError && (
        <p className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 text-xs">
          {globalError}
        </p>
      )}

      {/* Formulario de nuevo tema */}
      {showAddForm && (
        <TopicForm
          initialValues={emptyForm()}
          allContents={allContents}
          publishedSurveys={publishedSurveys}
          isPending={isPending}
          onSubmit={handleAdd}
          onCancel={() => setShowAddForm(false)}
          submitLabel="Agregar tema"
        />
      )}

      {/* Lista de temas */}
      {topics.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Este curso no tiene temas aún. Agrega el primero.
        </p>
      ) : (
        <ul className="space-y-2">
          {topics.map((topic, index) => (
            <li key={topic.id}>
              {/* Confirmación de borrado */}
              {confirmDeleteId === topic.id ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-red-800 font-medium">¿Eliminar «{topic.title}»?</p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleDelete(topic.id)}
                      disabled={isPending}
                      className="rounded-md bg-red-600 text-white text-xs font-medium px-2.5 py-1 hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {isPending ? '…' : 'Sí'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      disabled={isPending}
                      className="rounded-md border text-xs font-medium px-2.5 py-1 hover:bg-muted transition-colors"
                    >
                      No
                    </button>
                  </div>
                </div>
              ) : editingId === topic.id ? (
                /* Formulario de edición */
                <TopicForm
                  initialValues={{
                    title: topic.title,
                    description: topic.description ?? '',
                    topic_type: topic.topic_type,
                    content_type: topic.lms_content?.content_type ?? '',
                    content_id: topic.content_id ?? '',
                    survey_id: topic.survey_id ?? '',
                    is_required: topic.is_required,
                  }}
                  allContents={allContents}
                  publishedSurveys={publishedSurveys}
                  isPending={isPending}
                  onSubmit={values => handleEdit(topic.id, values)}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Guardar cambios"
                />
              ) : (
                /* Fila normal */
                <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5">
                  {/* Número y botones de orden */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={isPending || index === 0}
                      className="rounded p-0.5 hover:bg-muted disabled:opacity-30 transition-colors"
                      title="Subir"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[10px] font-bold text-muted-foreground w-4 text-center">
                      {index + 1}
                    </span>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={isPending || index === topics.length - 1}
                      className="rounded p-0.5 hover:bg-muted disabled:opacity-30 transition-colors"
                      title="Bajar"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Info del tema */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate">{topic.title}</span>
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {topicTypeLabel(topic)}
                      </span>
                      {!topic.is_required && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-700 px-2 py-0.5 text-[10px] font-medium">
                          Opcional
                        </span>
                      )}
                    </div>
                    {topic.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{topic.description}</p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingId(topic.id)}
                      disabled={isPending}
                      className="rounded-md border text-xs font-medium px-2.5 py-1 hover:bg-muted disabled:opacity-50 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(topic.id)}
                      disabled={isPending}
                      className="rounded-md p-1 text-muted-foreground hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                      title="Eliminar tema"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
