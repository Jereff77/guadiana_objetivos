'use client'

import Link from 'next/link'
import type { DeptKpi } from '@/app/(dashboard)/dashboard/dashboard-actions'

interface DeptKpiCardProps {
  kpi: DeptKpi
}

function progressColor(pct: number) {
  if (pct >= 80) return 'bg-green-500'
  if (pct >= 50) return 'bg-brand-orange'
  return 'bg-red-500'
}

function textColor(pct: number) {
  if (pct >= 80) return 'text-green-600'
  if (pct >= 50) return 'text-orange-500'
  return 'text-red-500'
}

export function DeptKpiCard({ kpi }: DeptKpiCardProps) {
  return (
    <Link
      href={`/objetivos/${kpi.dept_id}`}
      className="block rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-sm leading-tight">{kpi.dept_name}</h3>
        <span className={`text-lg font-bold shrink-0 ${textColor(kpi.completion_pct)}`}>
          {kpi.completion_pct}%
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all ${progressColor(kpi.completion_pct)}`}
          style={{ width: `${kpi.completion_pct}%` }}
        />
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-3 gap-1 text-xs text-center">
        <div>
          <p className="font-medium text-green-600">{kpi.deliverables_approved}</p>
          <p className="text-muted-foreground">Aprobados</p>
        </div>
        <div>
          <p className="font-medium text-yellow-600">{kpi.deliverables_submitted + kpi.deliverables_pending}</p>
          <p className="text-muted-foreground">Pendientes</p>
        </div>
        <div>
          <p className="font-medium text-red-500">{kpi.deliverables_rejected}</p>
          <p className="text-muted-foreground">Rechazados</p>
        </div>
      </div>

      {kpi.objectives_count === 0 && (
        <p className="text-xs text-muted-foreground mt-2 text-center">Sin objetivos este período</p>
      )}
    </Link>
  )
}
