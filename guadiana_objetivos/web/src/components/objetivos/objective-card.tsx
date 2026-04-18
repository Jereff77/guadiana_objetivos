'use client'

import Link from 'next/link'

interface ObjectiveCardProps {
  objective: {
    id: string
    org_department_id: string
    title: string
    description: string | null
    month: number
    year: number
    weight: number
    evidence_type: string
    status: string
    completion_pct?: number
  }
  canManage?: boolean
  onDelete?: (id: string) => void
}

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const EVIDENCE_LABELS: Record<string, string> = {
  document: 'Documento',
  photo: 'Fotografía',
  text: 'Texto libre',
  checklist: 'Checklist',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-500',
}

function CompletionBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? 'bg-brand-blue' : pct >= 50 ? 'bg-brand-orange' : 'bg-red-400'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Cumplimiento</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

export function ObjectiveCard({ objective, canManage, onDelete }: ObjectiveCardProps) {
  const pct = objective.completion_pct ?? 0

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight truncate">{objective.title}</h3>
          {objective.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {objective.description}
            </p>
          )}
        </div>
        <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[objective.status] ?? 'bg-gray-100 text-gray-500'}`}>
          {objective.status === 'active' ? 'Activo' : objective.status === 'closed' ? 'Cerrado' : 'Cancelado'}
        </span>
      </div>

      <CompletionBar pct={pct} />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>Peso: <strong>{objective.weight}%</strong></span>
        <span>·</span>
        <span>{MONTH_NAMES[objective.month]} {objective.year}</span>
        <span>·</span>
        <span>{EVIDENCE_LABELS[objective.evidence_type] ?? objective.evidence_type}</span>
      </div>

      {canManage && objective.status === 'active' && (
        <div className="flex items-center gap-3 pt-1 border-t">
          <Link
            href={`/objetivos/configurar?dept=${objective.org_department_id}&obj=${objective.id}`}
            className="text-xs text-brand-blue hover:underline"
          >
            Editar
          </Link>
          <button
            onClick={() => onDelete?.(objective.id)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  )
}
