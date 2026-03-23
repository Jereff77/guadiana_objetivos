'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  Cell,
} from 'recharts'

// ── Types ─────────────────────────────────────────────────────────────────────

export type FormStat = {
  name: string
  completadas: number
  en_progreso: number
  total: number
  pct: number
}

export type WeekStat = {
  semana: string
  completadas: number
  en_progreso: number
}

export type BranchStat = {
  sucursal: string
  completadas: number
  total: number
  pct: number
}

// ── Palette ───────────────────────────────────────────────────────────────────

const BLUE   = '#004B8D'
const ORANGE = '#FF8F1C'

// ── Completion Bar Chart ───────────────────────────────────────────────────────

export function FormCompletionChart({ data }: { data: FormStat[] }) {
  if (data.length === 0) return <EmptyState message="No hay ejecuciones registradas." />
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          formatter={(value, name) =>
            [value, name === 'completadas' ? 'Completadas' : 'En progreso']
          }
        />
        <Legend
          verticalAlign="top"
          formatter={(value) => (value === 'completadas' ? 'Completadas' : 'En progreso')}
        />
        <Bar dataKey="completadas" fill={BLUE} radius={[4, 4, 0, 0]} />
        <Bar dataKey="en_progreso" fill={ORANGE} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Weekly Trend Line Chart ────────────────────────────────────────────────────

export function WeeklyTrendChart({ data }: { data: WeekStat[] }) {
  if (data.length === 0) return <EmptyState message="Sin datos de tendencia." />
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          formatter={(value, name) =>
            [value, name === 'completadas' ? 'Completadas' : 'En progreso']
          }
        />
        <Legend
          verticalAlign="top"
          formatter={(value) => (value === 'completadas' ? 'Completadas' : 'En progreso')}
        />
        <Line type="monotone" dataKey="completadas" stroke={BLUE} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="en_progreso" stroke={ORANGE} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Branch Compliance Bar Chart ────────────────────────────────────────────────

export function BranchComplianceChart({ data }: { data: BranchStat[] }) {
  if (data.length === 0) return <EmptyState message="Sin datos por sucursal." />
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 48, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="sucursal" width={90} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value) => [`${value}%`, 'Cumplimiento']} />
        <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.pct >= 80 ? BLUE : entry.pct >= 50 ? ORANGE : '#ef4444'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[200px] rounded-lg border border-dashed">
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}

// ── Objective Trend Chart (M2) ─────────────────────────────────────────────────

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

// ── Compliance Bar Chart por departamento (M2) ─────────────────────────────────

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

// ── KPI Card ──────────────────────────────────────────────────────────────────

export function KpiCard({
  label,
  value,
  sub,
  color = BLUE,
}: {
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <div className="rounded-lg border bg-card p-5 flex flex-col gap-1">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}
