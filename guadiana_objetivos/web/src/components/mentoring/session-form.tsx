'use client'

import { useState, useTransition } from 'react'
import {
  createMentoringSession,
  completeMentoringSession,
  submitMenteeFeedback,
  cancelMentoringSession,
  type MentoringSession,
  type CreateSessionData,
} from '@/app/(dashboard)/mentoring/mentoring-actions'

// ── Formulario para crear nueva sesión ──────────────────────────────────────

interface NewSessionFormProps {
  pairId: string
  objectives?: { id: string; title: string }[]
  onCreated?: () => void
}

export function NewSessionForm({ pairId, objectives = [], onCreated }: NewSessionFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [scheduledAt, setScheduledAt] = useState('')
  const [modality, setModality] = useState('presencial')
  const [agenda, setAgenda] = useState('')
  const [objectiveId, setObjectiveId] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!scheduledAt) { setError('La fecha y hora son requeridas.'); return }

    const formData: CreateSessionData = {
      pair_id: pairId,
      scheduled_at: scheduledAt,
      modality,
      agenda: agenda.trim() || null,
      objective_id: objectiveId || null,
    }

    startTransition(async () => {
      const result = await createMentoringSession(formData)
      if (!result.success) {
        setError(result.error ?? 'Error al crear la sesión.')
      } else {
        setScheduledAt('')
        setAgenda('')
        setObjectiveId('')
        onCreated?.()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Fecha y hora <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            required
            className="w-full rounded border bg-background px-2 py-1.5 text-sm"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Modalidad</label>
          <select
            className="w-full rounded border bg-background px-2 py-1.5 text-sm"
            value={modality}
            onChange={(e) => setModality(e.target.value)}
          >
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
            <option value="hibrido">Híbrido</option>
          </select>
        </div>
      </div>

      {objectives.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Objetivo vinculado (opcional)</label>
          <select
            className="w-full rounded border bg-background px-2 py-1.5 text-sm"
            value={objectiveId}
            onChange={(e) => setObjectiveId(e.target.value)}
          >
            <option value="">— Sin objetivo vinculado —</option>
            {objectives.map((o) => (
              <option key={o.id} value={o.id}>{o.title}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Agenda</label>
        <textarea
          rows={2}
          className="w-full rounded border bg-background px-2 py-1.5 text-sm resize-y"
          value={agenda}
          onChange={(e) => setAgenda(e.target.value)}
          placeholder="Temas a tratar en la sesión..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="text-xs px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? 'Programando...' : 'Programar sesión'}
      </button>
    </form>
  )
}

// ── Fila de sesión ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  scheduled:  'bg-blue-100 text-blue-700 border-blue-200',
  completed:  'bg-green-100 text-green-700 border-green-200',
  cancelled:  'bg-gray-100 text-gray-500 border-gray-200',
}
const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada', completed: 'Completada', cancelled: 'Cancelada',
}
const MODALITY_LABELS: Record<string, string> = {
  presencial: 'Presencial', virtual: 'Virtual', hibrido: 'Híbrido',
}

interface SessionRowProps {
  session: MentoringSession
  isMentor: boolean
  isMentee: boolean
}

export function SessionRow({ session, isMentor, isMentee }: SessionRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Complete form state
  const [topics, setTopics] = useState(session.topics_covered?.join('\n') ?? '')
  const [commitments, setCommitments] = useState(session.commitments ?? '')
  const [mentorRating, setMentorRating] = useState<number>(session.mentor_rating ?? 0)
  const [mentorNotes, setMentorNotes] = useState(session.mentor_notes ?? '')
  const [showCompleteForm, setShowCompleteForm] = useState(false)

  // Mentee feedback state
  const [menteeRating, setMenteeRating] = useState<number>(session.mentee_rating ?? 0)
  const [menteeFeedback, setMenteeFeedback] = useState(session.mentee_feedback ?? '')
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  function handleComplete() {
    setError(null)
    startTransition(async () => {
      const result = await completeMentoringSession(session.id, {
        topics_covered: topics.split('\n').map((t) => t.trim()).filter(Boolean),
        commitments: commitments.trim() || null,
        mentor_rating: mentorRating || null,
        mentor_notes: mentorNotes.trim() || null,
      })
      if (!result.success) setError(result.error ?? 'Error.')
      else setShowCompleteForm(false)
    })
  }

  function handleFeedback() {
    setError(null)
    startTransition(async () => {
      const result = await submitMenteeFeedback(session.id, {
        mentee_rating: menteeRating || null,
        mentee_feedback: menteeFeedback.trim() || null,
      })
      if (!result.success) setError(result.error ?? 'Error.')
      else setShowFeedbackForm(false)
    })
  }

  function handleCancel() {
    if (!confirm('¿Cancelar esta sesión?')) return
    setError(null)
    startTransition(async () => {
      const result = await cancelMentoringSession(session.id)
      if (!result.success) setError(result.error ?? 'Error.')
    })
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium">
              {new Date(session.scheduled_at).toLocaleDateString('es-MX', {
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
            <span className="text-xs text-muted-foreground">
              {new Date(session.scheduled_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-xs text-muted-foreground">· {MODALITY_LABELS[session.modality] ?? session.modality}</span>
          </div>
          {session.objective_title && (
            <p className="text-xs text-muted-foreground">Objetivo: {session.objective_title}</p>
          )}
        </div>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[session.status]}`}>
          {STATUS_LABELS[session.status]}
        </span>
      </div>

      {/* Agenda */}
      {session.agenda && (
        <p className="text-xs text-muted-foreground">Agenda: {session.agenda}</p>
      )}

      {/* Detalle expandible */}
      {session.status === 'completed' && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary hover:underline">
          {expanded ? 'Ocultar detalle' : 'Ver detalle'}
        </button>
      )}

      {expanded && session.status === 'completed' && (
        <div className="space-y-2 pt-2 border-t text-xs">
          {(session.topics_covered?.length ?? 0) > 0 && (
            <div>
              <p className="font-medium text-muted-foreground">Temas cubiertos:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {session.topics_covered!.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
          {session.commitments && (
            <div>
              <p className="font-medium text-muted-foreground">Compromisos:</p>
              <p>{session.commitments}</p>
            </div>
          )}
          {session.mentor_rating && (
            <p className="text-muted-foreground">
              Calificación del mentor: {'★'.repeat(session.mentor_rating)}{'☆'.repeat(5 - session.mentor_rating)}
            </p>
          )}
          {session.mentor_notes && <p className="text-muted-foreground italic">Notas: {session.mentor_notes}</p>}
          {session.mentee_rating && (
            <p className="text-muted-foreground">
              Feedback del mentee: {'★'.repeat(session.mentee_rating)}{'☆'.repeat(5 - session.mentee_rating)}
            </p>
          )}
          {session.mentee_feedback && <p className="text-muted-foreground italic">&ldquo;{session.mentee_feedback}&rdquo;</p>}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Acciones para el mentor */}
      {isMentor && session.status === 'scheduled' && (
        <div className="flex gap-2 pt-1 border-t flex-wrap">
          {showCompleteForm ? (
            <div className="w-full space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Temas cubiertos (uno por línea)</label>
                <textarea rows={3} className="w-full rounded border bg-background px-2 py-1 text-xs resize-y mt-1"
                  value={topics} onChange={(e) => setTopics(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Compromisos</label>
                <textarea rows={2} className="w-full rounded border bg-background px-2 py-1 text-xs resize-y mt-1"
                  value={commitments} onChange={(e) => setCommitments(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Calificación:</label>
                {[1,2,3,4,5].map((n) => (
                  <button key={n} type="button" onClick={() => setMentorRating(n)}
                    className={`text-lg ${n <= mentorRating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                ))}
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Notas adicionales</label>
                <textarea rows={2} className="w-full rounded border bg-background px-2 py-1 text-xs resize-y mt-1"
                  value={mentorNotes} onChange={(e) => setMentorNotes(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <button onClick={handleComplete} disabled={isPending}
                  className="text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                  {isPending ? 'Guardando...' : 'Marcar completada'}
                </button>
                <button onClick={() => setShowCompleteForm(false)}
                  className="text-xs px-3 py-1 rounded border hover:bg-muted">Cancelar</button>
              </div>
            </div>
          ) : (
            <>
              <button onClick={() => setShowCompleteForm(true)}
                className="text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">
                Completar
              </button>
              <button onClick={handleCancel} disabled={isPending}
                className="text-xs px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50">
                Cancelar
              </button>
            </>
          )}
        </div>
      )}

      {/* Feedback del mentee */}
      {isMentee && session.status === 'completed' && !session.mentee_rating && (
        <div className="pt-1 border-t">
          {showFeedbackForm ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Tu calificación:</label>
                {[1,2,3,4,5].map((n) => (
                  <button key={n} type="button" onClick={() => setMenteeRating(n)}
                    className={`text-lg ${n <= menteeRating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                ))}
              </div>
              <textarea rows={2} className="w-full rounded border bg-background px-2 py-1 text-xs resize-y"
                value={menteeFeedback} onChange={(e) => setMenteeFeedback(e.target.value)}
                placeholder="Tu feedback sobre la sesión..." />
              <div className="flex gap-2">
                <button onClick={handleFeedback} disabled={isPending}
                  className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {isPending ? 'Enviando...' : 'Enviar feedback'}
                </button>
                <button onClick={() => setShowFeedbackForm(false)}
                  className="text-xs px-3 py-1 rounded border hover:bg-muted">Cancelar</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowFeedbackForm(true)}
              className="text-xs text-primary hover:underline">
              Dar feedback de esta sesión
            </button>
          )}
        </div>
      )}
    </div>
  )
}
