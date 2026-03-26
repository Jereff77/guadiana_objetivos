'use client'

import type { LmsPath } from '@/app/(dashboard)/capacitacion/lms-actions'

interface PathProgressBarProps {
  path: LmsPath
  total: number
  completed: number
  certified: boolean
}

export function PathProgressBar({ path, total, completed, certified }: PathProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-snug truncate">{path.title}</h3>
          {path.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{path.description}</p>
          )}
        </div>
        {certified && (
          <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium shrink-0">
            Certificado
          </span>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {completed} / {total} contenidos
          </span>
          <span>{percentage}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Certificado título */}
      {certified && path.cert_title && (
        <p className="text-xs text-green-700 font-medium">
          Certificado: {path.cert_title}
        </p>
      )}
    </div>
  )
}
