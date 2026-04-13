'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Loader2, Lightbulb, Tag, X, Sparkles } from 'lucide-react'
import { createSkill, updateSkill, deleteSkill, toggleSkillActive } from './skill-actions'
import { improveContentWithAI } from '@/app/(dashboard)/ia/chat-actions'
import type { AISkill, AISkillInput, AISkillType } from '@/lib/ai/types'

interface SkillsClientProps {
  initialSkills: AISkill[]
}

const SKILL_TYPE_LABELS: Record<AISkillType, string> = {
  knowledge: 'Conocimiento',
  behavior: 'Comportamiento',
  process: 'Proceso',
}

const SKILL_TYPE_COLORS: Record<AISkillType, string> = {
  knowledge: 'bg-blue-100 text-blue-700 border-blue-200',
  behavior: 'bg-purple-100 text-purple-700 border-purple-200',
  process: 'bg-green-100 text-green-700 border-green-200',
}

const EMPTY_FORM: AISkillInput = {
  title: '',
  description: '',
  skillType: 'knowledge',
  content: '',
  triggerKeywords: [],
  isActive: true,
  priority: 50,
}

export function SkillsClient({ initialSkills }: SkillsClientProps) {
  const [skills, setSkills] = useState<AISkill[]>(initialSkills)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AISkillInput>(EMPTY_FORM)
  const [keywordInput, setKeywordInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [improving, setImproving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // ── Formulario ────────────────────────────────────────────────────────────

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setKeywordInput('')
    setError(null)
    setShowForm(true)
  }

  function openEdit(skill: AISkill) {
    setForm({
      title: skill.title,
      description: skill.description || '',
      skillType: skill.skillType,
      content: skill.content,
      triggerKeywords: skill.triggerKeywords,
      isActive: skill.isActive,
      priority: skill.priority,
    })
    setEditingId(skill.id)
    setKeywordInput('')
    setError(null)
    setShowForm(true)
  }

  function addKeyword(raw: string) {
    const kw = raw.trim()
    if (!kw || form.triggerKeywords.includes(kw)) return
    setForm(f => ({ ...f, triggerKeywords: [...f.triggerKeywords, kw] }))
    setKeywordInput('')
  }

  function removeKeyword(kw: string) {
    setForm(f => ({ ...f, triggerKeywords: f.triggerKeywords.filter(k => k !== kw) }))
  }

  function handleKeywordKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addKeyword(keywordInput)
    }
  }

  async function handleImprove() {
    if (!form.content.trim()) { setError('Escribe el contenido antes de mejorar'); return }
    setImproving(true)
    setError(null)
    const result = await improveContentWithAI(form.content, 'skill', form.skillType)
    setImproving(false)
    if (result.error) { setError(result.error); return }
    if (result.data) setForm(f => ({ ...f, content: result.data! }))
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('El título es requerido'); return }
    if (!form.content.trim()) { setError('El contenido es requerido'); return }

    setSaving(true)
    setError(null)

    const result = editingId
      ? await updateSkill(editingId, form)
      : await createSkill(form)

    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.data) {
      if (editingId) {
        setSkills(prev => prev.map(s => s.id === editingId ? result.data! : s))
      } else {
        setSkills(prev => [result.data!, ...prev])
      }
    }
    setShowForm(false)
  }

  // ── Eliminar ──────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta habilidad?')) return
    const result = await deleteSkill(id)
    if (result.error) { alert(result.error); return }
    setSkills(prev => prev.filter(s => s.id !== id))
  }

  // ── Toggle activo ─────────────────────────────────────────────────────────

  async function handleToggle(id: string, isActive: boolean) {
    setTogglingId(id)
    const result = await toggleSkillActive(id, isActive)
    setTogglingId(null)
    if (result.error) { alert(result.error); return }
    setSkills(prev => prev.map(s => s.id === id ? { ...s, isActive } : s))
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const charCount = form.content.length
  const charWarning = charCount > 1200

  return (
    <>
      {/* Cabecera con botón */}
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva habilidad
        </Button>
      </div>

      {/* Lista vacía */}
      {skills.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Sin habilidades creadas</p>
          <p className="text-sm mt-1">Crea la primera habilidad para que GUADIANA la use en el chat</p>
        </Card>
      )}

      {/* Cards de skills */}
      <div className="space-y-3">
        {skills.map(skill => (
          <Card key={skill.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded border ${SKILL_TYPE_COLORS[skill.skillType]}`}>
                    {SKILL_TYPE_LABELS[skill.skillType]}
                  </span>
                  <span className="text-xs text-muted-foreground">Prioridad: {skill.priority}</span>
                </div>
                <p className="font-semibold text-sm">{skill.title}</p>
                {skill.description && (
                  <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                )}
                <div className="flex items-center gap-1 flex-wrap mt-2">
                  {skill.triggerKeywords.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">Siempre activa</span>
                  ) : (
                    skill.triggerKeywords.map(kw => (
                      <span key={kw} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded">
                        <Tag className="h-3 w-3" />{kw}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={skill.isActive}
                  disabled={togglingId === skill.id}
                  onCheckedChange={v => handleToggle(skill.id, v)}
                />
                <Button size="sm" variant="ghost" onClick={() => openEdit(skill)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(skill.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog de creación/edición */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar habilidad' : 'Nueva habilidad'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="skill-title">Título *</Label>
                <Input
                  id="skill-title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ej: Política de Vacaciones"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="skill-type">Tipo *</Label>
                <select
                  id="skill-type"
                  value={form.skillType}
                  onChange={e => setForm(f => ({ ...f, skillType: e.target.value as AISkillType }))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="knowledge">Conocimiento — información que el agente debe saber</option>
                  <option value="behavior">Comportamiento — cómo debe actuar en ciertos casos</option>
                  <option value="process">Proceso — pasos a seguir en un flujo específico</option>
                </select>
              </div>

              <div>
                <Label htmlFor="skill-priority">Prioridad (1–100)</Label>
                <Input
                  id="skill-priority"
                  type="number"
                  min={1}
                  max={100}
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 50 }))}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Mayor número = mayor prioridad si hay más de 5 skills</p>
              </div>

              <div className="col-span-2">
                <Label htmlFor="skill-description">Descripción interna (opcional)</Label>
                <Input
                  id="skill-description"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Nota para administradores, no la ve el agente"
                  className="mt-1"
                />
              </div>

              <div className="col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="skill-content">Contenido * (lo que aprende el agente)</Label>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${charWarning ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      {charCount}/1200 chars{charWarning ? ' — demasiado largo' : ''}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 gap-1 text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
                      onClick={handleImprove}
                      disabled={improving || !form.content.trim()}
                      title="Mejorar y estructurar el contenido con IA"
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
                  id="skill-content"
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Escribe aquí la información, política, proceso o instrucción de comportamiento..."
                  rows={8}
                  className="mt-0 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Puedes escribir en borrador y usar &quot;Mejorar con IA&quot; para darle estructura y formato automáticamente.
                </p>
                {charWarning && (
                  <p className="text-xs text-destructive mt-1">
                    Contenido muy largo puede consumir muchos tokens. Se recomiendan máx. 1200 caracteres (≈300 tokens).
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <Label>Keywords de activación</Label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                  Sin keywords = siempre activa. Con keywords = solo si aparecen en el mensaje del usuario.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.triggerKeywords.map(kw => (
                    <span key={kw} className="inline-flex items-center gap-1 text-sm bg-muted px-2 py-1 rounded">
                      {kw}
                      <button onClick={() => removeKeyword(kw)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  value={keywordInput}
                  onChange={e => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  onBlur={() => keywordInput.trim() && addKeyword(keywordInput)}
                  placeholder="Escribe una keyword y presiona Enter o coma..."
                  className="text-sm"
                />
              </div>

              <div className="col-span-2 flex items-center gap-3">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
                />
                <Label>Habilidad activa</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear habilidad'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
