'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const BLUE   = '#004B8D'
const ORANGE = '#FF8F1C'

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[200px] rounded-lg border border-dashed">
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}

// ── Tendencia de cumplimiento por departamento ──────────────────────────────────

export type TrendPoint = {
  label: string
  completion_pct: number
}

export function ObjectiveTrendChart({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) return <EmptyState message="Sin datos de tendencia." />
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} width={38} />
        <Tooltip formatter={(value) => [`${value}%`, 'Cumplimiento']} />
        <Line type="monotone" dataKey="completion_pct" stroke={BLUE} strokeWidth={2} dot={{ r: 4, fill: BLUE }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Comparativa por departamento ───────────────────────────────────────────────

export type DeptComplianceStat = {
  name: string
  pct: number
}

export function ComplianceBarChart({ data }: { data: DeptComplianceStat[] }) {
  if (data.length === 0) return <EmptyState message="Sin datos de cumplimiento." />
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 48, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value) => [`${value}%`, 'Cumplimiento']} />
        <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.pct >= 80 ? BLUE : entry.pct >= 50 ? ORANGE : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
