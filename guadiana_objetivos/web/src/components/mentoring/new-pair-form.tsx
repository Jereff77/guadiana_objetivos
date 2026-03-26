'use client'

import { useState, useTransition } from 'react'
import { createMentoringPair } from '@/app/(dashboard)/mentoring/mentoring-actions'

interface Profile {
  id: string
  full_name: string | null
}

interface NewPairFormProps {
  profiles: Profile[]
}

export function NewPairForm({ profiles }: NewPairFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [mentorId, setMentorId] = useState('')
  const [menteeId, setMenteeId] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState('')
  const [objectives, setObjectives] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!mentorId || !menteeId) { setError('Selecciona mentor y mentee.'); return }
    if (mentorId === menteeId) { setError('El mentor y el mentee no pueden ser la misma persona.'); return }

    startTransition(async () => {
      const result = await createMentoringPair({
        mentor_id: mentorId,
        mentee_id: menteeId,
        start_date: startDate,
        end_date: endDate || null,
        objectives: objectives.trim() || null,
      })

      if (!result.success) {
        setError(result.error ?? 'Error al crear el par.')
      } else {
        setSuccess(true)
        setMentorId('')
        setMenteeId('')
        setEndDate('')
        setObjectives('')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Par creado exitosamente.</p>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Mentor <span className="text-red-500">*</span>
          </label>
          <select
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={mentorId}
            onChange={(e) => setMentorId(e.target.value)}
          >
            <option value="">— Seleccionar —</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name ?? p.id}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Mentee <span className="text-red-500">*</span>
          </label>
          <select
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={menteeId}
            onChange={(e) => setMenteeId(e.target.value)}
          >
            <option value="">— Seleccionar —</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name ?? p.id}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha de inicio <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fecha de fin</label>
          <input
            type="date"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Objetivos del programa</label>
        <textarea
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-y"
          value={objectives}
          onChange={(e) => setObjectives(e.target.value)}
          placeholder="Describe los objetivos que el mentee quiere alcanzar..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? 'Creando...' : 'Crear par de mentoring'}
      </button>
    </form>
  )
}
