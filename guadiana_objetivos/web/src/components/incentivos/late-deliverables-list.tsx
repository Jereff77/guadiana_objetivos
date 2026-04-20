'use client'

import { useState, useTransition } from 'react'
import { approveLateSubmission } from '@/app/(dashboard)/objetivos/deliverable-actions'
import type { LateDeliverable } from '@/app/(dashboard)/incentivos/incentive-actions'

const MONTHS = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function daysLate(submittedAt: string, month: number, year: number): number {
  const closeDate = new Date(year, month, 0, 23, 59, 59)
  const submitted = new Date(submittedAt)
  return Math.max(0, Math.ceil((submitted.getTime() - closeDate.getTime()) / 86_400_000))
}

export function LateDeliverablesList({ items }: { items: LateDeliverable[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  function handleApprove(id: string) {
    if (!confirm('¿Aprobar esta entrega tardía excepcionalmente? Contará para el cálculo del bono del usuario.')) return
    startTransition(async () => {
      const result = await approveLateSubmission(id)
      if (result.error) {
        setErrors((prev) => ({ ...prev, [id]: result.error! }))
      } else {
        setDismissed((prev) => new Set([...prev, id]))
      }
    })
  }

  const visible = items.filter((i) => !dismissed.has(i.id))

  if (visible.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <p className="text-muted-foreground text-sm">No hay entregas tardías pendientes.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {visible.map((item) => {
        const days = daysLate(item.submitted_at, item.objective_month, item.objective_year)
        return (
          <div
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-amber-900">{item.title}</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Objetivo: {item.objective_title} · {MONTHS[item.objective_month]} {item.objective_year}
              </p>
              {item.assignee_name && (
                <p className="text-xs text-amber-700">Usuario: {item.assignee_name}</p>
              )}
              <p className="text-xs text-amber-600 mt-1">
                Entregado con {days} {days === 1 ? 'día' : 'días'} de retraso
                {' · '}
                {new Date(item.submitted_at).toLocaleDateString('es-MX', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
              {errors[item.id] && (
                <p className="text-xs text-red-600 mt-1">{errors[item.id]}</p>
              )}
            </div>
            <button
              onClick={() => handleApprove(item.id)}
              disabled={isPending}
              className="shrink-0 rounded bg-amber-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-amber-700 disabled:opacity-60 transition-colors"
            >
              Aprobar tardío
            </button>
          </div>
        )
      })}
    </div>
  )
}
