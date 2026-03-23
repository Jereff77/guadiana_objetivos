'use client'

import { useState } from 'react'
import { markAlertRead } from '@/app/(dashboard)/dashboard/dashboard-actions'
import type { ActiveAlert } from '@/app/(dashboard)/dashboard/dashboard-actions'

interface AlertBadgeProps {
  alerts: ActiveAlert[]
}

const SEVERITY_STYLES: Record<string, { border: string; bg: string; dot: string }> = {
  critical: { border: 'border-red-200',    bg: 'bg-red-50',     dot: 'bg-red-500' },
  warning:  { border: 'border-yellow-200', bg: 'bg-yellow-50',  dot: 'bg-yellow-500' },
  info:     { border: 'border-blue-200',   bg: 'bg-blue-50',    dot: 'bg-blue-400' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function AlertPanel({ alerts: initialAlerts }: AlertBadgeProps) {
  const [alerts, setAlerts] = useState(initialAlerts)

  async function dismiss(id: string) {
    await markAlertRead(id)
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">Sin alertas activas.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const style = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.info
        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 rounded-lg border p-3 ${style.border} ${style.bg}`}
          >
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm">{alert.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(alert.created_at)}</p>
            </div>
            <button
              onClick={() => dismiss(alert.id)}
              className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
