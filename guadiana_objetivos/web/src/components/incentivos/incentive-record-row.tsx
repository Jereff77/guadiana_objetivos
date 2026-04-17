'use client'

import { useState, useTransition } from 'react'
import {
  approveIncentiveRecord,
  markIncentiveRecordAsPaid,
  type IncentiveRecord,
} from '@/app/(dashboard)/incentivos/incentive-actions'

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  approved: 'Aprobado',
  paid: 'Pagado',
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-blue-100 text-blue-700 border-blue-200',
  paid: 'bg-green-100 text-green-700 border-green-200',
}

interface IncentiveRecordRowProps {
  record: IncentiveRecord
  canApprove?: boolean
  showUser?: boolean
}

export function IncentiveRecordRow({ record, canApprove = false, showUser = true }: IncentiveRecordRowProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [showApproveForm, setShowApproveForm] = useState(false)

  function handleApprove() {
    setError(null)
    startTransition(async () => {
      const result = await approveIncentiveRecord(record.id, notes || undefined)
      if (!result.success) {
        setError(result.error ?? 'Error al aprobar.')
      } else {
        setShowApproveForm(false)
      }
    })
  }

  function handleMarkPaid() {
    setError(null)
    startTransition(async () => {
      const result = await markIncentiveRecordAsPaid(record.id)
      if (!result.success) {
        setError(result.error ?? 'Error al marcar como pagado.')
      }
    })
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {showUser && (
            <p className="font-medium text-sm truncate">{record.user_full_name ?? 'Usuario desconocido'}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {MONTH_NAMES[record.month]} {record.year} · {record.department_name}
          </p>
        </div>
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[record.status]}`}
        >
          {STATUS_LABELS[record.status]}
        </span>
      </div>

      {/* Detalle numérico */}
      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Cumplimiento</p>
          <p className="font-semibold">{Number(record.completion_pct).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Bono máximo</p>
          <p className="font-semibold">${Number(record.base_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">% del bono</p>
          <p className="font-semibold">{Number(record.bonus_pct).toFixed(0)}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Bono ganado</p>
          <p className="font-bold text-primary">${Number(record.calculated_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Aprobación */}
      {record.status === 'approved' && record.approved_by_name && (
        <p className="text-xs text-muted-foreground">
          Aprobado por {record.approved_by_name}
          {record.approved_at && ` el ${new Date(record.approved_at).toLocaleDateString('es-MX')}`}
        </p>
      )}
      {record.notes && (
        <p className="text-xs text-muted-foreground italic">Nota: {record.notes}</p>
      )}

      {/* Acciones */}
      {canApprove && (
        <div className="pt-1 border-t space-y-2">
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          {record.status === 'draft' && (
            <>
              {showApproveForm ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nota de aprobación (opcional)"
                    className="w-full rounded border bg-background px-2 py-1 text-xs"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleApprove}
                      disabled={isPending}
                      className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isPending ? 'Aprobando...' : 'Confirmar aprobación'}
                    </button>
                    <button
                      onClick={() => setShowApproveForm(false)}
                      className="text-xs px-3 py-1 rounded border hover:bg-muted"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowApproveForm(true)}
                  className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Aprobar
                </button>
              )}
            </>
          )}

          {record.status === 'approved' && (
            <button
              onClick={handleMarkPaid}
              disabled={isPending}
              className="text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isPending ? 'Procesando...' : 'Marcar como pagado'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
