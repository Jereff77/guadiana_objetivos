'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, Loader2, Bot, User, ExternalLink, Wrench, ChevronUp, Database } from 'lucide-react'
import type { ChatAuditRow, SessionDetailRow, AIToolInvocation } from './audit-actions'
import { getUserSessions, getSessionDetail, getSessionToolInvocations } from './audit-actions'

interface AuditClientProps {
  rows: ChatAuditRow[]
  initialDays: number
}

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic',
  google:    'Google',
}
const PROVIDER_COLORS: Record<string, string> = {
  anthropic: 'bg-violet-100 text-violet-800',
  google:    'bg-blue-100 text-blue-800',
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

// ── Componente de tool invocation expandible ─────────────────────────────────

function ToolInvocationRow({ inv }: { inv: AIToolInvocation }) {
  const [open, setOpen] = useState(false)
  const isQuery = inv.tool_name === 'execute_query'

  const toolLabels: Record<string, string> = {
    execute_query:        'Consulta SQL',
    schedule_task:        'Programar tarea',
    list_scheduled_tasks: 'Listar tareas',
    cancel_scheduled_task:'Cancelar tarea',
  }

  return (
    <div className="rounded-md border bg-muted/20 text-xs">
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        {isQuery
          ? <Database className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
          : <Wrench className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        }
        <span className="font-medium text-muted-foreground">
          {toolLabels[inv.tool_name] || inv.tool_name}
        </span>
        {isQuery && !!inv.tool_input?.sql && (
          <code className="flex-1 truncate text-indigo-700 font-mono ml-1">
            {String(inv.tool_input.sql).replace(/\s+/g, ' ').slice(0, 80)}
          </code>
        )}
        <span className="text-muted-foreground shrink-0 ml-auto">
          {formatDate(inv.created_at)}
        </span>
        {open ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />}
      </button>

      {open && (
        <div className="border-t px-3 py-2 space-y-2">
          {inv.tool_input && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                {isQuery ? 'SQL ejecutado' : 'Parámetros'}
              </p>
              <pre className={`whitespace-pre-wrap font-mono text-xs rounded p-2 overflow-x-auto max-h-40 ${isQuery ? 'bg-indigo-50 text-indigo-900' : 'bg-muted'}`}>
                {isQuery
                  ? (inv.tool_input.sql as string)
                  : JSON.stringify(inv.tool_input, null, 2)
                }
              </pre>
            </div>
          )}
          {inv.tool_result && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Resultado</p>
              <pre className="whitespace-pre-wrap font-mono text-xs bg-muted rounded p-2 overflow-x-auto max-h-48">
                {JSON.stringify(inv.tool_result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Panel de detalle de una sesión ────────────────────────────────────────────

function SessionPanel({ sessionId, onClose }: { sessionId: string; onClose: () => void }) {
  const [messages,    setMessages]    = useState<SessionDetailRow[] | null>(null)
  const [invocations, setInvocations] = useState<AIToolInvocation[] | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [activeTab,   setActiveTab]   = useState<'messages' | 'tools'>('messages')

  useEffect(() => {
    Promise.all([
      getSessionDetail(sessionId),
      getSessionToolInvocations(sessionId),
    ]).then(([msgRes, toolRes]) => {
      if (msgRes.error) setError(msgRes.error)
      else setMessages(msgRes.data || [])
      setInvocations(toolRes.data || [])
      setLoading(false)
    })
  }, [sessionId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-3xl max-h-[88vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Detalle de sesión</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>Cerrar</Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-4 gap-1 shrink-0">
          <button
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'messages' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('messages')}
          >
            <Bot className="h-3.5 w-3.5 inline mr-1.5" />
            Mensajes
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${activeTab === 'tools' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('tools')}
          >
            <Wrench className="h-3.5 w-3.5" />
            Herramientas
            {invocations && invocations.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-mono">
                {invocations.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Tab: Mensajes */}
          {!loading && activeTab === 'messages' && (
            <div className="space-y-3">
              {messages?.map(m => (
                <div key={m.message_id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-brand-blue" />
                    </div>
                  )}
                  <div className="max-w-[75%] space-y-1">
                    <div className={`rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'bg-brand-blue text-white' : 'bg-muted'}`}>
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 items-center px-1">
                      <span className="text-xs text-muted-foreground">{formatDate(m.message_at)}</span>
                      {m.provider && (
                        <Badge variant="secondary" className={`text-xs px-1.5 py-0 ${PROVIDER_COLORS[m.provider] || ''}`}>
                          {PROVIDER_LABELS[m.provider] || m.provider}
                        </Badge>
                      )}
                      {m.model_used && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0 font-mono">
                          {m.model_used}
                        </Badge>
                      )}
                      {m.role === 'assistant' && (m.input_tokens || m.output_tokens) ? (
                        <span className="text-xs text-muted-foreground">
                          ↑{m.input_tokens ?? 0} ↓{m.output_tokens ?? 0} tokens
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {m.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-brand-blue flex items-center justify-center shrink-0 mt-1">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {messages?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Sin mensajes.</p>
              )}
            </div>
          )}

          {/* Tab: Herramientas */}
          {!loading && activeTab === 'tools' && (
            <div className="space-y-2">
              {invocations && invocations.length > 0 ? (
                invocations.map(inv => (
                  <ToolInvocationRow key={inv.id} inv={inv} />
                ))
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Wrench className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Esta sesión no usó herramientas.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

// ── Fila expandible de usuario ────────────────────────────────────────────────

function UserRow({ row, days }: { row: ChatAuditRow; days: number }) {
  const [expanded, setExpanded]   = useState(false)
  const [sessions, setSessions]   = useState<Array<{ id: string; title: string | null; started_at: string; updated_at: string | null; message_count: number; total_tokens: number }> | null>(null)
  const [loadingSess, setLoading] = useState(false)
  const [activeSession, setActiveSession] = useState<string | null>(null)

  async function handleExpand() {
    if (!expanded && !sessions) {
      setLoading(true)
      const res = await getUserSessions(row.user_id, days)
      setSessions(res.data || [])
      setLoading(false)
    }
    setExpanded(v => !v)
  }

  return (
    <>
      <tr className="border-b hover:bg-muted/30 cursor-pointer" onClick={handleExpand}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            <div>
              <p className="font-medium text-sm">{row.user_name}</p>
              <p className="text-xs text-muted-foreground">{row.department || 'Sin departamento'}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-center">{row.session_count}</td>
        <td className="px-4 py-3 text-sm text-center">{row.message_count}</td>
        <td className="px-4 py-3 text-sm text-center font-mono">{formatTokens(row.total_tokens)}</td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {(row.providers || []).map(p => (
              <Badge key={p} variant="secondary" className={`text-xs ${PROVIDER_COLORS[p] || ''}`}>
                {PROVIDER_LABELS[p] || p}
              </Badge>
            ))}
            {(!row.providers || row.providers.length === 0) && (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="border-b bg-muted/10">
          <td colSpan={5} className="px-8 py-3">
            {loadingSess ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando sesiones...
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    <th className="text-left pb-1 pr-4">Sesión</th>
                    <th className="text-left pb-1 pr-4">Inicio</th>
                    <th className="text-center pb-1 pr-4">Mensajes</th>
                    <th className="text-center pb-1 pr-4">Tokens</th>
                    <th className="pb-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {(sessions || []).map(s => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-1.5 pr-4">
                        <p className="font-medium truncate max-w-xs">{s.title || '(sin título)'}</p>
                        <p className="text-xs text-muted-foreground font-mono">{s.id}</p>
                      </td>
                      <td className="py-1.5 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(s.started_at)}
                      </td>
                      <td className="py-1.5 pr-4 text-center">{s.message_count}</td>
                      <td className="py-1.5 pr-4 text-center font-mono">{formatTokens(s.total_tokens)}</td>
                      <td className="py-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 gap-1 text-xs"
                          onClick={e => { e.stopPropagation(); setActiveSession(s.id) }}
                        >
                          <ExternalLink className="h-3 w-3" /> Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {sessions?.length === 0 && (
                    <tr><td colSpan={5} className="py-2 text-xs text-muted-foreground">Sin sesiones en el período.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </td>
        </tr>
      )}

      {activeSession && (
        <SessionPanel sessionId={activeSession} onClose={() => setActiveSession(null)} />
      )}
    </>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function AuditClient({ rows, initialDays }: AuditClientProps) {
  const router = useRouter()
  const [days,  setDays]  = useState(initialDays)

  function applyDays(d: number) {
    setDays(d)
    router.push(`?dias=${d}`)
  }

  const totalTokens   = rows.reduce((s, r) => s + r.total_tokens, 0)
  const totalSessions = rows.reduce((s, r) => s + r.session_count, 0)
  const totalMessages = rows.reduce((s, r) => s + r.message_count, 0)

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Período:</span>
        {[7, 30, 90].map(d => (
          <Button
            key={d}
            variant={days === d ? 'default' : 'outline'}
            size="sm"
            onClick={() => applyDays(d)}
          >
            {d === 7 ? 'Últimos 7 días' : d === 30 ? 'Últimos 30 días' : 'Últimos 90 días'}
          </Button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Sesiones</p>
          <p className="text-2xl font-bold">{totalSessions}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Mensajes IA</p>
          <p className="text-2xl font-bold">{totalMessages}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Tokens totales</p>
          <p className="text-2xl font-bold font-mono">{formatTokens(totalTokens)}</p>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="text-left px-4 py-3">Usuario / Departamento</th>
                <th className="text-center px-4 py-3">Sesiones</th>
                <th className="text-center px-4 py-3">Mensajes IA</th>
                <th className="text-center px-4 py-3">Tokens</th>
                <th className="text-left px-4 py-3">Proveedores</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <UserRow key={row.user_id} row={row} days={days} />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Sin actividad en el período seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
