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
import { Loader2, Plus, Pencil, Trash2, Play, Terminal, Sparkles } from 'lucide-react'
import type { AITool, AIToolInput } from '@/lib/ai/types'
import { createTool, updateTool, deleteTool, toggleToolActive, testTool, generateToolCode } from './tool-actions'

const PYTHON_TOOL_TEMPLATE = `#!/usr/bin/env python3
"""
Herramienta GUADIANA
Descripción: (describe qué hace este tool)
"""
import sys
import json
import os

# Instala con: pip install supabase
from supabase import create_client

# ── Contexto inyectado automáticamente ───────────────────────────────────────
INPUT    = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
USER_ID  = os.environ['GUADIANA_USER_ID']     # ← SIEMPRE filtrar por USER_ID
SUPA_URL = os.environ['SUPABASE_URL']
SUPA_KEY = os.environ['SUPABASE_SERVICE_ROLE_KEY']

supabase = create_client(SUPA_URL, SUPA_KEY)

# ── Lógica del tool ───────────────────────────────────────────────────────────
# Escribe tu consulta aquí.
# IMPORTANTE: siempre filtra por USER_ID para respetar la seguridad de datos.

# Ejemplo:
# result = (supabase.table('objective_deliverables')
#     .select('id, title, status, due_date')
#     .eq('assignee_id', USER_ID)   # ← filtro obligatorio
#     .order('due_date')
#     .limit(15)
#     .execute())
# data = result.data

data = []  # reemplaza con tu consulta

# ── Retornar resultado como JSON por stdout ───────────────────────────────────
print(json.dumps(data, default=str))
`

const MODEL_OPTIONS = [
  { value: '',                                   label: 'Global (usa el configurado en Configurar IA)' },
  { value: 'anthropic/claude-3-haiku-20240307',  label: 'Claude Haiku — rápido y económico' },
  { value: 'anthropic/claude-sonnet-4-5',        label: 'Claude Sonnet — más preciso' },
  { value: 'google/gemini-2.0-flash',        label: 'Gemini 2.0 Flash — rápido' },
  { value: 'google/gemini-1.5-pro',              label: 'Gemini 1.5 Pro — más potente' },
]

const EMPTY_FORM: AIToolInput = {
  name: '',
  title: '',
  description: '',
  parametersSchema: {},
  pythonCode: PYTHON_TOOL_TEMPLATE,
  isActive: true,
  priority: 50,
  preferredModel: null,
}

interface ToolsClientProps {
  initialTools: AITool[]
}

export function ToolsClient({ initialTools }: ToolsClientProps) {
  const [tools, setTools] = useState<AITool[]>(initialTools)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AIToolInput>(EMPTY_FORM)
  const [schemaText, setSchemaText] = useState('{}')
  const [schemaError, setSchemaError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Panel de prueba
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testInput, setTestInput] = useState('{}')
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testRunning, setTestRunning] = useState(false)

  // Generación con IA
  const [aiDescription, setAiDescription] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const lineCount = form.pythonCode.split('\n').length

  function validateSlug(value: string) {
    return /^[a-z][a-z0-9_]*$/.test(value)
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setSchemaText('{}')
    setSchemaError(null)
    setEditingId(null)
    setError(null)
    setShowForm(true)
  }

  function openEdit(tool: AITool) {
    setForm({
      name: tool.name,
      title: tool.title,
      description: tool.description,
      parametersSchema: tool.parametersSchema,
      pythonCode: tool.pythonCode,
      isActive: tool.isActive,
      priority: tool.priority,
      preferredModel: tool.preferredModel ?? null,
    })
    setSchemaText(JSON.stringify(tool.parametersSchema, null, 2))
    setSchemaError(null)
    setEditingId(tool.id)
    setError(null)
    setShowForm(true)
  }

  function handleSchemaChange(value: string) {
    setSchemaText(value)
    try {
      const parsed = JSON.parse(value)
      setForm(f => ({ ...f, parametersSchema: parsed }))
      setSchemaError(null)
    } catch {
      setSchemaError('JSON inválido')
    }
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('El nombre (slug) es requerido'); return }
    if (!validateSlug(form.name)) { setError('El nombre solo puede contener letras minúsculas, números y guiones bajos'); return }
    if (!form.title.trim()) { setError('El título es requerido'); return }
    if (!form.description.trim()) { setError('La descripción es requerida (Claude la usa para invocar el tool)'); return }
    if (!form.pythonCode.trim()) { setError('El código Python es requerido'); return }
    if (schemaError) { setError('Corrige el JSON del schema antes de guardar'); return }

    setSaving(true)
    setError(null)

    const result = editingId
      ? await updateTool(editingId, form)
      : await createTool(form)

    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.data) {
      if (editingId) {
        setTools(prev => prev.map(t => t.id === editingId ? result.data! : t))
      } else {
        setTools(prev => [result.data!, ...prev])
      }
    }
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta herramienta?')) return
    const result = await deleteTool(id)
    if (result.error) { alert(result.error); return }
    setTools(prev => prev.filter(t => t.id !== id))
  }

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id)
    await toggleToolActive(id, !current)
    setTools(prev => prev.map(t => t.id === id ? { ...t, isActive: !current } : t))
    setTogglingId(null)
  }

  async function handleGenerateCode() {
    if (!aiDescription.trim()) return
    setAiGenerating(true)
    setAiError(null)
    const result = await generateToolCode(aiDescription, form.preferredModel)
    setAiGenerating(false)
    if (result.error) {
      setAiError(result.error)
      return
    }
    if (result.data) {
      setForm(f => ({ ...f, pythonCode: result.data! }))
    }
  }

  async function handleTest(id: string) {
    setTestResult(null)
    setTestRunning(true)
    try {
      const parsed = JSON.parse(testInput)
      const result = await testTool(id, parsed)
      if (result.error) {
        setTestResult(`❌ Error:\n${result.error}`)
      } else {
        setTestResult(JSON.stringify(result.data?.result, null, 2))
      }
    } catch {
      setTestResult('❌ JSON de prueba inválido')
    }
    setTestRunning(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva herramienta
        </Button>
      </div>

      {/* Info panel */}
      <div className="rounded-md bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
        <p className="font-medium mb-1">¿Cómo funcionan las herramientas?</p>
        <ul className="space-y-0.5 text-xs">
          <li>• El asistente detecta cuándo necesita datos y llama a la herramienta adecuada según su descripción</li>
          <li>• Compatible con todos los proveedores de IA (Claude, Gemini, etc.)</li>
          <li>• Al invocarla, el servidor ejecuta el script Python con el contexto del usuario</li>
          <li>• Los scripts deben filtrar siempre por <code className="bg-blue-100 px-1 rounded">USER_ID</code> (disponible en <code className="bg-blue-100 px-1 rounded">os.environ[&apos;GUADIANA_USER_ID&apos;]</code>)</li>
          <li>• Retornar JSON por stdout • Timeout: 10s • Máx 50KB</li>
        </ul>
      </div>

      {tools.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No hay herramientas configuradas. Crea la primera para empezar.
        </p>
      )}

      {/* Lista de tools */}
      <div className="space-y-3">
        {tools.map(tool => (
          <Card key={tool.id} className={`p-4 transition-opacity ${!tool.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{tool.name}</code>
                  <span className="text-xs text-muted-foreground">P{tool.priority}</span>
                </div>
                <p className="font-medium text-sm">{tool.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tool.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {tool.pythonCode.split('\n').length} líneas de Python
                  {tool.preferredModel && (
                    <span className="ml-2 inline-flex items-center gap-1 bg-muted rounded px-1.5 py-0.5 text-[10px] font-mono">
                      {MODEL_OPTIONS.find(m => m.value === tool.preferredModel)?.label.split(' — ')[0] ?? tool.preferredModel}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={tool.isActive}
                  onCheckedChange={() => handleToggle(tool.id, tool.isActive)}
                  disabled={togglingId === tool.id}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => { setTestingId(tool.id); setTestResult(null); setTestInput('{}') }}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Probar
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(tool)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(tool.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog: Crear / Editar */}
      <Dialog open={showForm} onOpenChange={open => { if (!open) setShowForm(false) }}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar herramienta' : 'Nueva herramienta'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                ❌ {error}
              </div>
            )}

            {/* Nombre + Título */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tool-name">Nombre (slug) *</Label>
                <Input
                  id="tool-name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') }))}
                  placeholder="get_my_deliverables"
                  className="mt-1 font-mono"
                  disabled={!!editingId}
                />
                <p className="text-xs text-muted-foreground mt-1">Solo letras minúsculas, números y _</p>
              </div>
              <div>
                <Label htmlFor="tool-title">Título *</Label>
                <Input
                  id="tool-title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Obtener mis entregables"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="tool-desc">Descripción para Claude *</Label>
              <Textarea
                id="tool-desc"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Obtiene los entregables asignados al usuario actual. Usa esto cuando el usuario pregunte por sus tareas, pendientes u objetivos asignados..."
                rows={3}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Claude usa esto para decidir cuándo invocar la herramienta. Sé explícito sobre cuándo usarla.
              </p>
            </div>

            {/* Schema de parámetros */}
            <div>
              <Label htmlFor="tool-schema">Schema de parámetros (JSON Schema)</Label>
              <Textarea
                id="tool-schema"
                value={schemaText}
                onChange={e => handleSchemaChange(e.target.value)}
                rows={5}
                className={`mt-1 font-mono text-xs ${schemaError ? 'border-destructive' : ''}`}
                placeholder='{"type":"object","properties":{"status":{"type":"string","enum":["pending","all"]}}}'
              />
              {schemaError && <p className="text-xs text-destructive mt-1">⚠️ {schemaError}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Define los parámetros que Claude puede pasar a este tool. Usar <code>{'{}'}</code> si no hay parámetros.
              </p>
            </div>

            {/* Generación con IA */}
            <div className="rounded-md border border-dashed border-purple-300 bg-purple-50/50 p-4 space-y-3">
              <p className="text-sm font-medium text-purple-900 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                Generar código con IA
              </p>
              <div>
                <Label htmlFor="ai-desc" className="text-xs text-purple-800">
                  Describe qué debe hacer esta herramienta
                </Label>
                <Textarea
                  id="ai-desc"
                  value={aiDescription}
                  onChange={e => setAiDescription(e.target.value)}
                  placeholder="Ej: Obtiene todos los entregables del usuario actual ordenados por fecha de vencimiento, mostrando título, estado y objetivo al que pertenecen."
                  rows={3}
                  className="mt-1 text-sm"
                />
              </div>
              {aiError && (
                <p className="text-xs text-destructive">❌ {aiError}</p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateCode}
                disabled={aiGenerating || !aiDescription.trim()}
                className="border-purple-300 text-purple-800 hover:bg-purple-100"
              >
                {aiGenerating
                  ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Generando...</>
                  : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />Generar código</>
                }
              </Button>
              <p className="text-xs text-muted-foreground">
                La IA genera un script Python de partida. Revísalo y ajústalo antes de guardar.
              </p>
            </div>

            {/* Código Python */}
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="tool-code">Código Python *</Label>
                <Badge variant="secondary" className="text-xs font-mono">{lineCount} líneas</Badge>
              </div>
              <Textarea
                id="tool-code"
                value={form.pythonCode}
                onChange={e => setForm(f => ({ ...f, pythonCode: e.target.value }))}
                rows={18}
                className="mt-1 font-mono text-xs"
                spellCheck={false}
              />
              <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <p>• Input: <code>sys.argv[1]</code> (JSON string) • Output: <code>stdout</code> (JSON)</p>
                <p>• Env vars disponibles: <code>GUADIANA_USER_ID</code>, <code>SUPABASE_URL</code>, <code>SUPABASE_SERVICE_ROLE_KEY</code></p>
                <p>• Timeout: 10 segundos • Output máximo: 50KB</p>
              </div>
            </div>

            {/* Modelo de IA preferido */}
            <div>
              <Label htmlFor="tool-model">Modelo de IA para esta herramienta</Label>
              <select
                id="tool-model"
                value={form.preferredModel || ''}
                onChange={e => setForm(f => ({ ...f, preferredModel: e.target.value || null }))}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {MODEL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Usa un modelo económico para consultas simples y uno potente para análisis complejos.
                También determina qué IA genera el código cuando usas "Generar con IA".
              </p>
            </div>

            {/* Prioridad + Activa */}
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="tool-priority">Prioridad (1–100)</Label>
                <Input
                  id="tool-priority"
                  type="number"
                  min={1}
                  max={100}
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2 pb-1">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
                />
                <Label>{form.isActive ? 'Activa' : 'Inactiva'}</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? 'Guardar cambios' : 'Crear herramienta'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Probar tool */}
      <Dialog open={!!testingId} onOpenChange={open => { if (!open) setTestingId(null) }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Probar herramienta
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <Label>Input de prueba (JSON)</Label>
              <Textarea
                value={testInput}
                onChange={e => setTestInput(e.target.value)}
                rows={4}
                className="mt-1 font-mono text-sm"
                placeholder='{"status": "pending"}'
              />
            </div>

            <Button
              onClick={() => testingId && handleTest(testingId)}
              disabled={testRunning}
              className="w-full"
            >
              {testRunning
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Ejecutando Python...</>
                : <><Play className="h-4 w-4 mr-2" />Ejecutar</>
              }
            </Button>

            {testResult !== null && (
              <div>
                <Label>Resultado</Label>
                <pre className="mt-1 p-3 bg-muted rounded-md text-xs font-mono overflow-auto max-h-72 whitespace-pre-wrap">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
