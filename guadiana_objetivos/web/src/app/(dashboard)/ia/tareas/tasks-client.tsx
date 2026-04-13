'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  CalendarClock,
  Trash2,
  Play,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Zap,
} from 'lucide-react'
import {
  deleteTask,
  toggleTaskActive,
  getTaskExecutions,
  runTaskNow,
} from './task-actions'
import type { AIScheduledTask, AITaskExecution } from '@/lib/ai/types'

interface TasksClientProps {
  initialTasks: AIScheduledTask[]
}

// ── Helpers ────────────────────────────────────────────────────────────────

function cronToHuman(expr: string): string {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return expr
  const [minute, hour, dayOfMonth, , dayOfWeek] = parts

  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const timeStr = (hour !== '*' && minute !== '*')
    ? `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
    : null

  if (dayOfWeek !== '*' && timeStr) {
    const dayName = days[parseInt(dayOfWeek)] ?? `Día ${dayOfWeek}`
    return `${dayName} ${timeStr}`
  }
  if (dayOfMonth !== '*' && timeStr) {
    return `Día ${dayOfMonth} de cada mes ${timeStr}`
  }
  if (hour === '*' && minute !== '*') return `Cada hora al minuto ${minute}`
  if (hour !== '*' && timeStr) return `Diario ${timeStr}`
  return expr
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Componente de historial ────────────────────────────────────────────────

function ExecutionHistory({ taskId }: { taskId: string }) {
  const [executions, setExecutions] = useState<AITaskExecution[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function load() {
    if (executions !== null) return
    setLoading(true)
    const result = await getTaskExecutions(taskId)
    setLoading(false)
    setExecutions(result.data || [])
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando historial...
      </div>
    )
  }

  if (executions === null) {
    return (
      <Button variant="ghost" size="sm" className="text-xs" onClick={load}>
        Ver historial de ejecuciones
      </Button>
    )
  }

  if (executions.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2">Sin ejecuciones aún.</p>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Últimas ejecuciones
      </p>
      {executions.map(ex => (
        <div key={ex.id} className="rounded-md border bg-muted/30 text-sm">
          <div
            className="flex items-center gap-3 px-3 py-2 cursor-pointer"
            onClick={() => setExpanded(expanded === ex.id ? null : ex.id)}
          >
            {ex.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
            {ex.status === 'error'   && <XCircle      className="h-4 w-4 text-destructive shrink-0" />}
            {ex.status === 'running' && <Loader2      className="h-4 w-4 animate-spin shrink-0" />}
            <span className="flex-1 text-xs text-muted-foreground">{formatDate(ex.started_at)}</span>
            {ex.tokens_used && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />{ex.tokens_used}
              </span>
            )}
            {ex.email_sent_to && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />Email
              </span>
            )}
            {expanded === ex.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </div>
          {expanded === ex.id && (
            <div className="border-t px-3 py-2 space-y-1">
              {ex.error_message && (
                <p className="text-xs text-destructive font-mono">{ex.error_message}</p>
              )}
              {ex.result_content && (
                <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground max-h-48 overflow-y-auto">
                  {ex.result_content}
                </pre>
              )}
              {ex.email_sent_to && (
                <p className="text-xs text-muted-foreground">
                  Email enviado a: <span className="font-medium">{ex.email_sent_to}</span>
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────

export function TasksClient({ initialTasks }: TasksClientProps) {
  const [tasks, setTasks] = useState<AIScheduledTask[]>(initialTasks)
  const [togglingId, setTogglingId]   = useState<string | null>(null)
  const [deletingId, setDeletingId]   = useState<string | null>(null)
  const [runningId, setRunningId]     = useState<string | null>(null)
  const [expandedId, setExpandedId]   = useState<string | null>(null)

  async function handleToggle(id: string, isActive: boolean) {
    setTogglingId(id)
    await toggleTaskActive(id, isActive)
    setTogglingId(null)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_active: isActive } : t))
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta tarea? Se perderá el historial de ejecuciones.')) return
    setDeletingId(id)
    await deleteTask(id)
    setDeletingId(null)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  async function handleRunNow(id: string) {
    setRunningId(id)
    const result = await runTaskNow(id)
    setRunningId(null)
    if (result.error) {
      alert(result.error)
      return
    }
    alert('La tarea se ejecutará en el próximo ciclo del scheduler (< 1 minuto).')
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_active: true, next_run_at: new Date().toISOString() } : t))
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        <CalendarClock className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="font-medium">Sin tareas programadas</p>
        <p className="text-sm mt-2">
          Ve al <a href="/ia/chat" className="underline underline-offset-2 hover:text-foreground">chat de IA</a> y dile algo como:<br />
          <em>&ldquo;Envíame un reporte diario a las 7am del cumplimiento de objetivos&rdquo;</em>
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <Card key={task.id} className="p-4">
          <div className="flex items-start gap-4">
            {/* Info principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-semibold text-sm">{task.title}</p>
                {task.last_status === 'success' && (
                  <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                    Último: OK
                  </span>
                )}
                {task.last_status === 'error' && (
                  <span className="text-xs text-destructive bg-destructive/10 border border-destructive/30 px-2 py-0.5 rounded">
                    Último: Error
                  </span>
                )}
                {task.last_status === 'running' && (
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    Ejecutando...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {cronToHuman(task.cron_expression)}
                </span>
                <span>Próxima: {formatDate(task.next_run_at)}</span>
                {task.last_run_at && <span>Última: {formatDate(task.last_run_at)}</span>}
              </div>

              {task.description && (
                <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
              )}
            </div>

            {/* Controles */}
            <div className="flex items-center gap-2 shrink-0">
              <Switch
                checked={task.is_active}
                disabled={togglingId === task.id}
                onCheckedChange={v => handleToggle(task.id, v)}
              />
              <Button
                size="sm"
                variant="ghost"
                title="Ejecutar ahora"
                disabled={runningId === task.id}
                onClick={() => handleRunNow(task.id)}
              >
                {runningId === task.id
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Play className="h-4 w-4" />
                }
              </Button>
              <Button
                size="sm"
                variant="ghost"
                title="Expandir"
                onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
              >
                {expandedId === task.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                title="Eliminar"
                disabled={deletingId === task.id}
                onClick={() => handleDelete(task.id)}
              >
                {deletingId === task.id
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Trash2 className="h-4 w-4 text-destructive" />
                }
              </Button>
            </div>
          </div>

          {/* Sección expandida */}
          {expandedId === task.id && (
            <div className="mt-4 pt-4 border-t space-y-4">
              {/* Prompt */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Instrucción para la IA</p>
                <pre className="text-xs bg-muted/40 rounded-md p-3 whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
                  {task.prompt}
                </pre>
              </div>

              {/* Historial */}
              <ExecutionHistory taskId={task.id} />
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
