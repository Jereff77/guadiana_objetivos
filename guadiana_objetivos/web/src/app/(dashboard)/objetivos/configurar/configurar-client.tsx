'use client'

import { useState } from 'react'
import { type OrgDeptForObjectives, type AssignableUser } from '../dept-actions'
import {
  createObjective,
  type ObjectiveData,
  type Objective,
} from '../objective-actions'
import { createDeliverable } from '../deliverable-actions'
import { useRouter } from 'next/navigation'

interface Survey { id: string; name: string }

type Tab = 'objectives' | 'deliverables'

interface ConfigurarObjetivosClientProps {
  departments: OrgDeptForObjectives[]
  assignableByDept: Record<string, AssignableUser[]>
  surveys: Survey[]
  recentObjectives: (Objective & { dept_name: string })[]
  objectivesByDept: Record<string, Objective[]>
  currentMonth: number
  currentYear: number
  initialDeptId?: string
  initialObjId?: string
  initialTab: string
}

const MONTHS = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const now = new Date()

export function ConfigurarObjetivosClient({
  departments,
  assignableByDept,
  surveys,
  recentObjectives,
  objectivesByDept,
  currentMonth,
  currentYear,
  initialDeptId,
  initialObjId,
  initialTab,
}: ConfigurarObjetivosClientProps) {
  const router = useRouter()
  const validInitialTab: Tab = (initialTab === 'deliverables') ? 'deliverables' : 'objectives'
  const [tab, setTab] = useState<Tab>(validInitialTab)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // ── Tab Objetivos ──
  const [selectedDept, setSelectedDept] = useState(initialDeptId ?? '')
  const [objTitle, setObjTitle] = useState('')
  const [objDesc, setObjDesc] = useState('')
  const [objMonth, setObjMonth] = useState(now.getMonth() + 1)
  const [objYear, setObjYear] = useState(now.getFullYear())
  const [objWeight, setObjWeight] = useState(25)
  const [objEvidenceType, setObjEvidenceType] = useState<ObjectiveData['evidence_type']>('document')
  const [objChecklistId, setObjChecklistId] = useState('')
  const [objTargetValue, setObjTargetValue] = useState('')

  // ── Tab Entregables ──
  const [delivDept, setDelivDept] = useState(initialDeptId ?? '')
  const [selectedObj, setSelectedObj] = useState(initialObjId ?? '')
  const [delivTitle, setDelivTitle] = useState('')
  const [delivDesc, setDelivDesc] = useState('')
  const [delivDueDate, setDelivDueDate] = useState('')
  const [delivAssignee, setDelivAssignee] = useState('')

  function clearError() { setError(null) }

  // ─── Crear Objetivo ───────────────────────────────────────────────────────
  async function handleCreateObj(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDept) { setError('Selecciona un departamento'); return }
    if (!objTitle.trim()) { setError('El título es obligatorio'); return }
    setSaving(true); clearError()
    const result = await createObjective(selectedDept, {
      title: objTitle,
      description: objDesc,
      month: objMonth,
      year: objYear,
      weight: objWeight,
      target_value: objTargetValue ? parseFloat(objTargetValue) : null,
      evidence_type: objEvidenceType,
      checklist_id: objEvidenceType === 'checklist' ? (objChecklistId || null) : null,
    })
    setSaving(false)
    if (result.error) { setError(result.error); return }
    router.push(`/objetivos/${selectedDept}?month=${objMonth}&year=${objYear}`)
  }

  // ─── Crear Entregable ─────────────────────────────────────────────────────
  async function handleCreateDeliv(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedObj) { setError('Selecciona un objetivo'); return }
    if (!delivTitle.trim()) { setError('El título es obligatorio'); return }
    setSaving(true); clearError()
    const result = await createDeliverable(selectedObj, {
      title: delivTitle,
      description: delivDesc,
      due_date: delivDueDate || null,
      assignee_id: delivAssignee || null,
    })
    setSaving(false)
    if (result.error) { setError(result.error); return }
    setDelivTitle(''); setDelivDesc(''); setDelivDueDate(''); setDelivAssignee('')
    router.refresh()
  }

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      tab === t
        ? 'border-brand-blue text-brand-blue'
        : 'border-transparent text-muted-foreground hover:text-foreground'
    }`

  const currentDelivAssignees: AssignableUser[] = delivDept ? (assignableByDept[delivDept] ?? []) : []

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b">
        <button type="button" onClick={() => { setTab('objectives'); clearError() }} className={tabClass('objectives')}>
          Objetivos
        </button>
        <button type="button" onClick={() => { setTab('deliverables'); clearError() }} className={tabClass('deliverables')}>
          Entregables
        </button>
      </div>

      {/* ── Tab: Objetivos ── */}
      {tab === 'objectives' && (
        <>
          <form onSubmit={handleCreateObj} className="space-y-4 border rounded-lg p-4">
            <h3 className="text-sm font-semibold">Nuevo objetivo</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Departamento *</label>
                <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full rounded border border-input px-3 py-1.5 text-sm">
                  <option value="">— Seleccionar —</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Tipo de evidencia</label>
                <select value={objEvidenceType} onChange={(e) => setObjEvidenceType(e.target.value as ObjectiveData['evidence_type'])}
                  className="w-full rounded border border-input px-3 py-1.5 text-sm">
                  <option value="document">Documento</option>
                  <option value="photo">Fotografía</option>
                  <option value="text">Texto libre</option>
                  <option value="checklist">Checklist</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Título *</label>
              <input value={objTitle} onChange={(e) => setObjTitle(e.target.value)}
                className="w-full rounded border border-input px-3 py-1.5 text-sm" placeholder="Ej: Incrementar ventas 15%" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Descripción</label>
              <textarea value={objDesc} onChange={(e) => setObjDesc(e.target.value)} rows={2}
                className="w-full rounded border border-input px-3 py-1.5 text-sm resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Mes</label>
                <select value={objMonth} onChange={(e) => setObjMonth(parseInt(e.target.value))}
                  className="w-full rounded border border-input px-3 py-1.5 text-sm">
                  {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Año</label>
                <select value={objYear} onChange={(e) => setObjYear(parseInt(e.target.value))}
                  className="w-full rounded border border-input px-3 py-1.5 text-sm">
                  {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Peso (%)</label>
                <input type="number" min={1} max={100} value={objWeight} onChange={(e) => setObjWeight(parseInt(e.target.value))}
                  className="w-full rounded border border-input px-3 py-1.5 text-sm" />
              </div>
            </div>
            {objEvidenceType === 'checklist' && (
              <div>
                <label className="block text-xs font-medium mb-1">Checklist vinculado</label>
                <select value={objChecklistId} onChange={(e) => setObjChecklistId(e.target.value)}
                  className="w-full rounded border border-input px-3 py-1.5 text-sm">
                  <option value="">— Sin vincular —</option>
                  {surveys.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
            <button type="submit" disabled={saving}
              className="rounded bg-brand-blue text-white px-4 py-1.5 text-sm hover:bg-brand-blue/90 disabled:opacity-60">
              {saving ? 'Creando…' : 'Crear objetivo'}
            </button>
          </form>

          {/* Lista de objetivos del mes actual */}
          {recentObjectives.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">
                Objetivos de {MONTHS[currentMonth]} {currentYear}
              </h3>
              <div className="space-y-2">
                {recentObjectives.map((obj) => (
                  <div key={obj.id} className="flex items-center justify-between border rounded-md px-4 py-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{obj.title}</span>
                        <span className="text-xs text-muted-foreground">({obj.dept_name})</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">{obj.weight}%</span>
                      </div>
                      {obj.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{obj.description}</p>
                      )}
                    </div>
                    <a
                      href={`/objetivos/${obj.org_department_id}?month=${obj.month}&year=${obj.year}`}
                      className="text-xs text-brand-blue hover:underline"
                    >
                      Ver
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Tab: Entregables ── */}
      {tab === 'deliverables' && (
        <form onSubmit={handleCreateDeliv} className="space-y-4 border rounded-lg p-4">
          <h3 className="text-sm font-semibold">Nuevo entregable</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Departamento</label>
              <select
                value={delivDept}
                onChange={(e) => { setDelivDept(e.target.value); setSelectedObj(''); setDelivAssignee('') }}
                className="w-full rounded border border-input px-3 py-1.5 text-sm"
              >
                <option value="">— Seleccionar —</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Asignado a</label>
              <select
                value={delivAssignee}
                onChange={(e) => setDelivAssignee(e.target.value)}
                className="w-full rounded border border-input px-3 py-1.5 text-sm"
                disabled={!delivDept}
              >
                <option value="">— Sin asignar —</option>
                {currentDelivAssignees.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name ?? u.id}{u.position_name ? ` — ${u.position_name}` : ''}
                  </option>
                ))}
              </select>
              {delivDept && currentDelivAssignees.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">No hay miembros en el organigrama para este departamento.</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Objetivo *</label>
            <select value={selectedObj} onChange={(e) => setSelectedObj(e.target.value)}
              className="w-full rounded border border-input px-3 py-1.5 text-sm">
              <option value="">— Seleccionar objetivo —</option>
              {delivDept && (objectivesByDept[delivDept] ?? []).map((obj) => (
                <option key={obj.id} value={obj.id}>{obj.title}</option>
              ))}
            </select>
            {!delivDept && (
              <p className="text-xs text-muted-foreground mt-1">
                Selecciona un departamento primero.
              </p>
            )}
            {delivDept && (objectivesByDept[delivDept] ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                No hay objetivos en el período actual para este departamento.
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Título *</label>
            <input value={delivTitle} onChange={(e) => setDelivTitle(e.target.value)}
              className="w-full rounded border border-input px-3 py-1.5 text-sm" placeholder="Ej: Reporte mensual firmado" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Descripción</label>
            <textarea value={delivDesc} onChange={(e) => setDelivDesc(e.target.value)} rows={2}
              className="w-full rounded border border-input px-3 py-1.5 text-sm resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Fecha límite</label>
            <input type="date" value={delivDueDate} onChange={(e) => setDelivDueDate(e.target.value)}
              className="w-full rounded border border-input px-3 py-1.5 text-sm" />
          </div>
          <button type="submit" disabled={saving || !selectedObj}
            className="rounded bg-brand-blue text-white px-4 py-1.5 text-sm hover:bg-brand-blue/90 disabled:opacity-60">
            {saving ? 'Creando…' : 'Crear entregable'}
          </button>
        </form>
      )}
    </div>
  )
}
