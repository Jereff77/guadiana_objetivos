'use client'

import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

// ── Tipos ────────────────────────────────────────────────────────────────────

export type ChartType = 'bar' | 'line' | 'pie' | 'donut'

export interface ChartData {
  title?: string
  xKey?: string        // Clave del eje X (default: primera clave del objeto)
  valueKey?: string    // Clave del valor (default: segunda clave)
  // Formato flexible: puede ser array de objetos o labels + values
  data?: Record<string, string | number>[]
  labels?: string[]
  values?: number[]
  // Multi-series (bar/line)
  series?: { label: string; data: number[]; color?: string }[]
}

const COLORS = [
  '#004B8D', '#2563eb', '#16a34a', '#dc2626', '#d97706',
  '#7c3aed', '#0891b2', '#be185d', '#059669', '#ea580c',
]

const CHART_PATTERN = /\[CHART:(bar|line|pie|donut)\]\s*([\s\S]*?)\[\/CHART\]/g

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Normaliza los datos al formato {name, value, ...} que recharts espera */
function normalizeData(
  raw: ChartData
): { normalized: Record<string, string | number>[]; keys: string[] } {
  // Formato con labels + values
  if (raw.labels && raw.values) {
    const normalized = raw.labels.map((label, i) => ({
      name: label,
      value: raw.values![i] ?? 0,
    }))
    return { normalized, keys: ['value'] }
  }

  // Multi-series con labels + series[]
  if (raw.labels && raw.series) {
    const normalized = raw.labels.map((label, i) => {
      const row: Record<string, string | number> = { name: label }
      raw.series!.forEach(s => { row[s.label] = s.data[i] ?? 0 })
      return row
    })
    const keys = raw.series.map(s => s.label)
    return { normalized, keys }
  }

  // Array de objetos directo
  if (raw.data && raw.data.length > 0) {
    const allKeys = Object.keys(raw.data[0])
    const nameKey = raw.xKey || allKeys[0]
    const valueKeys = allKeys.filter(k => k !== nameKey)
    const normalized = raw.data.map(row => ({
      name: row[nameKey],
      ...Object.fromEntries(valueKeys.map(k => [k, row[k]])),
    }))
    return { normalized, keys: valueKeys }
  }

  return { normalized: [], keys: [] }
}

// ── Componente de una sola gráfica ────────────────────────────────────────────

function SingleChart({ type, rawData }: { type: ChartType; rawData: ChartData }) {
  const { normalized, keys } = normalizeData(rawData)
  const title = rawData.title

  if (normalized.length === 0) return null

  const seriesColors = rawData.series?.map((s, i) => s.color || COLORS[i % COLORS.length])
    ?? keys.map((_, i) => COLORS[i % COLORS.length])

  return (
    <div className="my-3 rounded-lg border bg-background p-4 shadow-sm">
      {title && <p className="text-sm font-semibold mb-3 text-foreground">{title}</p>}

      <ResponsiveContainer width="100%" height={240}>
        {type === 'bar' ? (
          <BarChart data={normalized} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            {keys.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
            {keys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={seriesColors[i]} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>

        ) : type === 'line' ? (
          <LineChart data={normalized} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            {keys.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
            {keys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key}
                stroke={seriesColors[i]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>

        ) : (
          // pie / donut
          <PieChart>
            <Pie
              data={normalized}
              dataKey={keys[0] || 'value'}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={type === 'donut' ? 45 : 0}
              label={({ name, percent }) =>
                `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
              }
              labelLine={false}
            >
              {normalized.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

// ── Función de parsing y renderizado ─────────────────────────────────────────

/**
 * Parsea el contenido de un mensaje buscando marcadores [CHART:tipo]{...}[/CHART]
 * y devuelve un array de elementos React (texto/markdown + gráficas).
 */
export function parseCharts(content: string): { text: string; charts: { type: ChartType; data: ChartData; index: number }[] } {
  const charts: { type: ChartType; data: ChartData; index: number }[] = []
  let match
  let cleanText = content

  CHART_PATTERN.lastIndex = 0
  while ((match = CHART_PATTERN.exec(content)) !== null) {
    const type = match[1] as ChartType
    const jsonStr = match[2].trim()
    try {
      const data = JSON.parse(jsonStr) as ChartData
      charts.push({ type, data, index: match.index })
      // Reemplazar el marcador con un placeholder vacío en el texto
      cleanText = cleanText.replace(match[0], '')
    } catch {
      // JSON inválido — dejar el texto tal cual
    }
  }

  return { text: cleanText.trim(), charts }
}

// ── Componente principal ──────────────────────────────────────────────────────

interface ChartRendererProps {
  charts: { type: ChartType; data: ChartData }[]
}

export function ChartRenderer({ charts }: ChartRendererProps) {
  if (charts.length === 0) return null
  return (
    <>
      {charts.map((c, i) => (
        <SingleChart key={i} type={c.type} rawData={c.data} />
      ))}
    </>
  )
}
