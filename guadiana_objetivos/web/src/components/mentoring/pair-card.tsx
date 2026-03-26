'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { updateMentoringPair, deleteMentoringPair, type MentoringPair } from '@/app/(dashboard)/mentoring/mentoring-actions'

interface PairCardProps {
  pair: MentoringPair
  canManage?: boolean
}

export function PairCard({ pair, canManage = false }: PairCardProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleToggleActive() {
    setError(null)
    startTransition(async () => {
      const result = await updateMentoringPair(pair.id, { is_active: !pair.is_active })
      if (!result.success) setError(result.error ?? 'Error al actualizar.')
    })
  }

  function handleDelete() {
    if (!confirm('¿Eliminar este par de mentoring? Se eliminarán también todas sus sesiones.')) return
    setError(null)
    startTransition(async () => {
      const result = await deleteMentoringPair(pair.id)
      if (!result.success) setError(result.error ?? 'Error al eliminar.')
    })
  }

  const completionPct = pair.sessions_count
    ? Math.round(((pair.completed_sessions ?? 0) / pair.sessions_count) * 100)
    : 0

  return (
    <div className={`rounded-lg border bg-card p-4 space-y-3 ${!pair.is_active ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-sm">{pair.mentor_name ?? 'Mentor'}</p>
            <span className="text-xs text-muted-foreground">→</span>
            <p className="font-medium text-sm">{pair.mentee_name ?? 'Mentee'}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Desde {new Date(pair.start_date).toLocaleDateString('es-MX')}
            {pair.end_date && ` · Hasta ${new Date(pair.end_date).toLocaleDateString('es-MX')}`}
          </p>
        </div>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${pair.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500'}`}>
          {pair.is_active ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {/* Progreso de sesiones */}
      {(pair.sessions_count ?? 0) > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{pair.completed_sessions} / {pair.sessions_count} sesiones completadas</span>
            <span>{completionPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Objetivos del par */}
      {pair.objectives && (
        <p className="text-xs text-muted-foreground line-clamp-2">{pair.objectives}</p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Acciones */}
      <div className="flex items-center gap-2 pt-1 border-t flex-wrap">
        <Link
          href={`/mentoring/${pair.id}`}
          className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Ver sesiones
        </Link>
        {canManage && (
          <>
            <button
              onClick={handleToggleActive}
              disabled={isPending}
              className="text-xs px-2 py-1 rounded border hover:bg-muted disabled:opacity-50"
            >
              {pair.is_active ? 'Desactivar' : 'Activar'}
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
