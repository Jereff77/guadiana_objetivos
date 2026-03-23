'use client'

import Link from 'next/link'
import type { DeptKpi } from '@/app/(dashboard)/dashboard/dashboard-actions'

interface RankingTableProps {
  ranking: DeptKpi[]
}

function medalIcon(idx: number) {
  if (idx === 0) return '🥇'
  if (idx === 1) return '🥈'
  if (idx === 2) return '🥉'
  return `${idx + 1}.`
}

function barColor(pct: number) {
  if (pct >= 80) return 'bg-green-500'
  if (pct >= 50) return 'bg-brand-orange'
  return 'bg-red-500'
}

export function RankingTable({ ranking }: RankingTableProps) {
  if (ranking.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">No hay departamentos con objetivos en este período.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {ranking.map((dept, idx) => (
        <Link
          key={dept.dept_id}
          href={`/objetivos/${dept.dept_id}`}
          className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 hover:shadow-sm transition-shadow"
        >
          <span className="w-8 text-center text-sm font-bold shrink-0">
            {medalIcon(idx)}
          </span>
          <span className="flex-1 text-sm font-medium truncate">{dept.dept_name}</span>
          <div className="w-32 bg-gray-100 rounded-full h-2 shrink-0">
            <div
              className={`h-2 rounded-full ${barColor(dept.completion_pct)}`}
              style={{ width: `${dept.completion_pct}%` }}
            />
          </div>
          <span className="w-10 text-right text-sm font-semibold shrink-0">
            {dept.completion_pct}%
          </span>
        </Link>
      ))}
    </div>
  )
}
