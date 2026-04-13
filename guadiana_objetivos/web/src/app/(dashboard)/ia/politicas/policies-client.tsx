'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Plus, Pencil, Trash2, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react'
import type { AIPolicy, AIPolicyInput, AIPolicyType, AIPolicySeverity } from '@/lib/ai/types'
import {
  createPolicy,
  updatePolicy,
  deletePolicy,
  togglePolicyActive,
} from './policy-actions'
import { improveContentWithAI } from '@/app/(dashboard)/ia/chat-actions'

const EMPTY_FORM: AIPolicyInput = {
  title: '',
  description: '',
  policyType: 'privacy',
  content: '',
  severity: 'high',
  triggerContexts: [],
  isActive: true,
  priority: 50,
}

const TYPE_LABELS: Record<AIPolicyType, string> = {
  privacy: 'Privacidad',
  access_control: 'Control de Acceso',
  behavior: 'Comportamiento',
  compliance: 'Cumplimiento',
}

const TYPE_COLORS: Record<AIPolicyType, string> = {
  privacy: 'bg-blue-100 text-blue-800 border-blue-200',
  access_control: 'bg-red-100 text-red-800 border-red-200',
  behavior: 'bg-purple-100 text-purple-800 border-purple-200',
  compliance: 'bg-green-100 text-green-800 border-green-200',
}

const TYPE_DESCRIPTIONS: Record<AIPolicyType, string> = {
  privacy: 'Define qué información confidencial no debe revelar la IA (datos personales, salarios, contraseñas, etc.).',
  access_control: 'Restringe qué puede hacer o consultar la IA según el rol del usuario (ej. solo admins pueden ver reportes globales).',
  behavior: 'Establece cómo debe comportarse la IA: tono, idioma, limitaciones de tema o estilo de respuesta.',
  compliance: 'Impone reglas regulatorias o de negocio que la IA debe respetar siempre (ej. GDPR, políticas internas).',
}

const SEVERITY_LABELS: Record<AIPolicySeverity, string> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Media',
}

const SEVERITY_COLORS: Record<AIPolicySeverity, string> = {
  critical: 'bg-red-500 text-white border-red-600',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

const SEVERITY_DESCRIPTIONS: Record<AIPolicySeverity, string> = {
  critical: 'Se aplica en TODOS los mensajes sin excepción',
  high: 'Se aplica cuando el contexto del mensaje coincide con los disparadores',
  medium: 'Se aplica cuando el contexto coincide (menor prioridad que Alta)',
}

interface PoliciesClientProps {
  initialPolicies: AIPolicy[]
}

export function PoliciesClient({ initialPolicies }: PoliciesClientProps) {
  const [policies, setPolicies] = useState<AIPolicy[]>(initialPolicies)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AIPolicyInput>(EMPTY_FORM)
  const [contextInput, setContextInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [improving, setImproving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const charCount = form.content.length
  const charWarning = charCount > 1200

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setContextInput('')
    setError(null)
    setShowForm(true)
  }

  function openEdit(policy: AIPolicy) {
    setForm({
      title: policy.title,
      description: policy.description || '',
      policyType: policy.policyType,
      content: policy.content,
      severity: policy.severity,
      triggerContexts: policy.triggerContexts,
      isActive: policy.isActive,
      priority: policy.priority,
    })
    setEditingId(policy.id)
    setContextInput('')
    setError(null)
    setShowForm(true)
  }

  function addContext(raw: string) {
    const ctx = raw.trim().toLowerCase()
    if (!ctx || form.triggerContexts.includes(ctx)) return
    setForm(f => ({ ...f, triggerContexts: [...f.triggerContexts, ctx] }))
    setContextInput('')
  }

  function removeContext(ctx: string) {
    setForm(f => ({ ...f, triggerContexts: f.triggerContexts.filter(c => c !== ctx) }))
  }

  function handleContextKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addContext(contextInput)
    }
  }

  async function handleImprove() {
    if (!form.content.trim()) { setError('Escribe el contenido antes de mejorar'); return }
    setImproving(true)
    setError(null)
    const result = await improveContentWithAI(form.content, 'policy', form.policyType)
    setImproving(false)
    if (result.error) { setError(result.error); return }
    if (result.data) setForm(f => ({ ...f, content: result.data! }))
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('El título es requerido'); return }
    if (!form.content.trim()) { setError('El contenido es requerido'); return }
    if (form.severity !== 'critical' && form.triggerContexts.length === 0) {
      setError('Las políticas no críticas deben tener al menos un contexto disparador')
      return
    }

    setSaving(true)
    setError(null)

    const result = editingId
      ? await updatePolicy(editingId, form)
      : await createPolicy(form)

    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.data) {
      if (editingId) {
        setPolicies(prev => prev.map(p => p.id === editingId ? result.data! : p))
      } else {
        setPolicies(prev => [result.data!, ...prev])
      }
    }
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta política?')) return
    const result = await deletePolicy(id)
    if (result.error) {
      alert(result.error)
      return
    }
    setPolicies(prev => prev.filter(p => p.id !== id))
  }

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id)
    await togglePolicyActive(id, !current)
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, isActive: !current } : p))
    setTogglingId(null)
  }

  const criticalPolicies = policies.filter(p => p.severity === 'critical')
  const otherPolicies = policies.filter(p => p.severity !== 'critical')

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva política
        </Button>
      </div>

      {/* Info panel */}
      <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        <p className="font-medium mb-1">¿Cómo funcionan las políticas?</p>
        <ul className="space-y-0.5 text-xs">
          <li>• <strong>Críticas:</strong> Se inyectan en el system prompt de TODOS los mensajes del chat</li>
          <li>• <strong>Alta / Media:</strong> Solo se inyectan cuando el mensaje contiene alguno de sus contextos disparadores</li>
          <li>• Las políticas se inyectan ANTES que las habilidades para mayor relevancia</li>
        </ul>
      </div>

      {policies.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No hay políticas configuradas. Crea la primera política para comenzar.
        </p>
      )}

      {/* Políticas críticas */}
      {criticalPolicies.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            Críticas — siempre activas
          </h2>
          {criticalPolicies.map(policy => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              toggling={togglingId === policy.id}
              onEdit={() => openEdit(policy)}
              onDelete={() => handleDelete(policy.id)}
              onToggle={() => handleToggle(policy.id, policy.isActive)}
            />
          ))}
        </div>
      )}

      {/* Políticas contextuales */}
      {otherPolicies.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-orange-500" />
            Contextuales — por disparadores
          </h2>
          {otherPolicies.map(policy => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              toggling={togglingId === policy.id}
              onEdit={() => openEdit(policy)}
              onDelete={() => handleDelete(policy.id)}
              onToggle={() => handleToggle(policy.id, policy.isActive)}
            />
          ))}
        </div>
      )}

      {/* Dialog de formulario */}
      <Dialog open={showForm} onOpenChange={open => { if (!open) setShowForm(false) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar política' : 'Nueva política'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                ❌ {error}
              </div>
            )}

            {/* Título */}
            <div>
              <Label htmlFor="policy-title">Título *</Label>
              <Input
                id="policy-title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ej: Privacidad de datos de empleados"
                className="mt-1"
              />
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="policy-desc">Descripción (solo visible para administradores)</Label>
              <Input
                id="policy-desc"
                value={form.description || ''}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descripción interna de esta política"
                className="mt-1"
              />
            </div>

            {/* Tipo + Severidad en fila */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policy-type">Tipo</Label>
                <select
                  id="policy-type"
                  value={form.policyType}
                  onChange={e => setForm(f => ({ ...f, policyType: e.target.value as AIPolicyType }))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="privacy">Privacidad</option>
                  <option value="access_control">Control de Acceso</option>
                  <option value="behavior">Comportamiento</option>
                  <option value="compliance">Cumplimiento</option>
                </select>
                <p className="mt-1.5 text-xs text-muted-foreground leading-snug">
                  {TYPE_DESCRIPTIONS[form.policyType]}
                </p>
              </div>
              <div>
                <Label htmlFor="policy-severity">Severidad</Label>
                <select
                  id="policy-severity"
                  value={form.severity}
                  onChange={e => setForm(f => ({ ...f, severity: e.target.value as AIPolicySeverity }))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="critical">Crítica — siempre activa</option>
                  <option value="high">Alta — por disparadores</option>
                  <option value="medium">Media — por disparadores</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {SEVERITY_DESCRIPTIONS[form.severity]}
                </p>
              </div>
            </div>

            {/* Contextos disparadores */}
            <div>
              <Label>
                Contextos disparadores
                {form.severity === 'critical' && (
                  <span className="text-muted-foreground font-normal ml-1">(no aplica para críticas)</span>
                )}
              </Label>
              <div className="mt-1 flex gap-2">
                <Input
                  value={contextInput}
                  onChange={e => setContextInput(e.target.value)}
                  onKeyDown={handleContextKeyDown}
                  onBlur={() => { if (contextInput.trim()) addContext(contextInput) }}
                  placeholder="Escribe y presiona Enter o coma..."
                  disabled={form.severity === 'critical'}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addContext(contextInput)}
                  disabled={form.severity === 'critical'}
                >
                  Agregar
                </Button>
              </div>
              {form.triggerContexts.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.triggerContexts.map(ctx => (
                    <span
                      key={ctx}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                    >
                      {ctx}
                      <button
                        type="button"
                        onClick={() => removeContext(ctx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {form.severity !== 'critical' && form.triggerContexts.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  Las políticas no críticas necesitan al menos un contexto disparador para activarse.
                </p>
              )}
            </div>

            {/* Contenido */}
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="policy-content">Contenido de la regla *</Label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${charWarning ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                    {charCount}/1200{charWarning && ' ⚠️ puede consumir muchos tokens'}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 gap-1 text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
                    onClick={handleImprove}
                    disabled={improving || !form.content.trim()}
                    title="Mejorar y estructurar la política con IA"
                  >
                    {improving
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Sparkles className="h-3 w-3" />
                    }
                    {improving ? 'Mejorando...' : 'Mejorar con IA'}
                  </Button>
                </div>
              </div>
              <Textarea
                id="policy-content"
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Escribe la regla que el agente debe seguir. Sé específico y claro..."
                rows={8}
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Puedes escribir en borrador y usar &quot;Mejorar con IA&quot; para estructurarlo con instrucciones directas (NUNCA, SIEMPRE, etc.).
              </p>
            </div>

            {/* Prioridad + Activa */}
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="policy-priority">Prioridad (1–100)</Label>
                <Input
                  id="policy-priority"
                  type="number"
                  min={1}
                  max={100}
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
                  className="mt-1"
                />
                <p className="mt-1.5 text-xs text-muted-foreground leading-snug">
                  {form.priority >= 80
                    ? 'Prioridad alta — se posiciona antes que otras políticas en el prompt.'
                    : form.priority >= 40
                    ? 'Prioridad media — orden estándar entre políticas del mismo tipo.'
                    : 'Prioridad baja — se incluye al final, puede ser ignorada si hay conflicto con otras reglas.'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2 pb-1">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
                />
                <Label>{form.isActive ? 'Activa' : 'Inactiva'}</Label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? 'Guardar cambios' : 'Crear política'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Card individual de política ────────────────────────────────────────────────

function PolicyCard({
  policy,
  toggling,
  onEdit,
  onDelete,
  onToggle,
}: {
  policy: AIPolicy
  toggling: boolean
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  return (
    <Card className={`p-4 transition-opacity ${!policy.isActive ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${SEVERITY_COLORS[policy.severity]}`}>
              {policy.severity === 'critical' && '🔴 '}{SEVERITY_LABELS[policy.severity]}
            </span>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${TYPE_COLORS[policy.policyType]}`}>
              {TYPE_LABELS[policy.policyType]}
            </span>
            <span className="text-xs text-muted-foreground">P{policy.priority}</span>
          </div>
          <p className="font-medium text-sm">{policy.title}</p>
          {policy.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{policy.description}</p>
          )}
          <div className="mt-2">
            {policy.severity === 'critical' ? (
              <span className="text-xs text-muted-foreground italic">Siempre activa (crítica)</span>
            ) : policy.triggerContexts.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {policy.triggerContexts.map(ctx => (
                  <Badge key={ctx} variant="secondary" className="text-xs font-normal">
                    {ctx}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-xs text-orange-600">Sin contextos — no se activará</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Switch
            checked={policy.isActive}
            onCheckedChange={onToggle}
            disabled={toggling}
          />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
