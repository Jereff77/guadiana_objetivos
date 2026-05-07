'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { TallerRecord, TallerUser, DecisionEntry } from '@/app/(dashboard)/taller/taller-types'
import { EMPTY_DECISION, TIPO_OPTIONS } from '@/app/(dashboard)/taller/taller-types'
import { saveTallerData } from '@/app/(dashboard)/taller/taller-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface TallerFormProps {
  userId: string
  initialData: TallerRecord | null
  ownerName: string
  users: TallerUser[]
}

const CATALOGO = [
  { tipo: '1. OPERATIVAS', descripcion: 'Rutinarias, repetitivas, de bajo riesgo', quien: 'Encargado de área / Gerente de sucursal', ejemplos: 'Facturación de venta, asignación de técnico, cotizaciones, apertura de caja, cambio de aceite', bg: 'bg-blue-900' },
  { tipo: '2. TÁCTICAS', descripcion: 'Requieren análisis; impacto a mediano plazo', quien: 'Gerente / Coordinador con visto bueno de Dirección', ejemplos: 'Descuentos especiales, contratación temporal, cambio de proveedor local, promociones de sucursal', bg: 'bg-green-700' },
  { tipo: '3. ESTRATÉGICAS', descripcion: 'Alta complejidad e impacto a largo plazo en la organización', quien: 'Dirección General (con participación del equipo)', ejemplos: 'Apertura de sucursal, inversión en equipamiento, nuevas líneas de producto, plan de negocios anual', bg: 'bg-amber-800' },
  { tipo: '4. COMPARTIDAS', descripcion: 'Requieren consenso interdepartamental; afectan a más de un área', quien: 'Equipo multidisciplinario + validación Dirección', ejemplos: 'Calendario de vacaciones, políticas de servicio al cliente, cambios en procesos que impactan varias áreas', bg: 'bg-red-800' },
]

const ROWS = Array.from({ length: 10 }, (_, i) => i)

function formatDate(d: string | null | undefined): string {
  if (!d) return new Date().toLocaleDateString('es-MX')
  try { return new Date(d).toLocaleDateString('es-MX') } catch { return new Date().toLocaleDateString('es-MX') }
}

const tipoLabel = (v: string) => v
const tipoValue = (v: string) => v

export function TallerForm({ userId, initialData, ownerName, users }: TallerFormProps) {
  const [saving, setSaving] = useState(false)

  const [departamento, setDepartamento] = useState(initialData?.departamento ?? '')
  const [puesto, setPuesto] = useState(initialData?.puesto ?? '')
  const [decisiones, setDecisiones] = useState<DecisionEntry[]>(() => {
    if (initialData?.decisiones && Array.isArray(initialData.decisiones) && initialData.decisiones.length === 10) {
      return initialData.decisiones as DecisionEntry[]
    }
    return Array.from({ length: 10 }, () => ({ ...EMPTY_DECISION }))
  })
  const [reflexion1, setReflexion1] = useState(initialData?.reflexion_1 ?? '')
  const [reflexion2, setReflexion2] = useState(initialData?.reflexion_2 ?? '')
  const [reflexion3, setReflexion3] = useState(initialData?.reflexion_3 ?? '')
  const [reflexion4, setReflexion4] = useState(initialData?.reflexion_4 ?? '')

  function updateDecision(idx: number, field: keyof DecisionEntry, value: string) {
    setDecisiones(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    const result = await saveTallerData(userId, {
      departamento,
      puesto,
      decisiones,
      reflexion_1: reflexion1,
      reflexion_2: reflexion2,
      reflexion_3: reflexion3,
      reflexion_4: reflexion4,
    })
    setSaving(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Datos guardados correctamente')
    }
  }

  const fechaDisplay = formatDate(initialData?.fecha_creacion)

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 pb-24">
      {/* SECCIÓN 1 — Header institucional */}
      <div className="relative">
        <div className="text-right mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-brand-blue text-white font-bold text-2xl">
            G
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center">Taller de Interdependencia en la Toma de Decisiones</h1>
        <p className="text-center text-muted-foreground mt-1">Formato de Clasificación y Mapeo de Decisiones por Departamento</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="space-y-1">
            <Label>Nombre</Label>
            <Input value={ownerName} readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-1">
            <Label>Departamento/Área</Label>
            <Input value={departamento} onChange={e => setDepartamento(e.target.value)} placeholder="Ej: Ventas" />
          </div>
          <div className="space-y-1">
            <Label>Puesto</Label>
            <Input value={puesto} onChange={e => setPuesto(e.target.value)} placeholder="Ej: Gerente" />
          </div>
          <div className="space-y-1">
            <Label>Fecha</Label>
            <Input value={fechaDisplay} readOnly className="bg-muted/50" />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2 — Catálogo de Tipos de Decisión */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Catálogo de Tipos de Decisión</h2>
        <p className="text-sm text-muted-foreground mb-3">Tabla de referencia — solo lectura</p>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/80">
                <th className="text-left px-4 py-2 font-semibold w-48">Tipo de Decisión</th>
                <th className="text-left px-4 py-2 font-semibold">Descripción</th>
                <th className="text-left px-4 py-2 font-semibold w-56">¿Quién decide?</th>
                <th className="text-left px-4 py-2 font-semibold w-64">Ejemplos</th>
              </tr>
            </thead>
            <tbody>
              {CATALOGO.map((cat) => (
                <tr key={cat.tipo} className={`${cat.bg} text-white border-b border-white/20`}>
                  <td className="px-4 py-3 font-bold text-sm">{cat.tipo}</td>
                  <td className="px-4 py-3 text-xs">{cat.descripcion}</td>
                  <td className="px-4 py-3 text-xs">{cat.quien}</td>
                  <td className="px-4 py-3 text-xs">{cat.ejemplos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 3 — Mapeo de Decisiones */}
      <div>
        <h2 className="text-lg font-semibold mb-1">Parte 2 — Mapeo de Decisiones de tu Departamento</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Describe en cada fila una decisión relevante de tu área. Usa el catálogo de tipos de la sección anterior para clasificarla.
        </p>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/80">
                <th className="text-center px-2 py-2 font-semibold w-10">#</th>
                <th className="text-left px-3 py-2 font-semibold min-w-[350px]">Decisión / Situación</th>
                <th className="text-left px-3 py-2 font-semibold w-40">Tipo</th>
                <th className="text-left px-3 py-2 font-semibold w-48">¿Quién decide?</th>
                <th className="text-left px-3 py-2 font-semibold w-48">¿Consulta o informa a quién?</th>
                <th className="text-left px-3 py-2 font-semibold w-36">Frecuencia</th>
                <th className="text-left px-3 py-2 font-semibold w-48">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((idx) => (
                <tr key={idx} className={idx % 2 === 1 ? 'bg-muted/30' : ''}>
                  <td className="text-center px-2 py-1.5 text-muted-foreground font-mono">{idx + 1}</td>
                  <td className="px-3 py-1.5">
                    <Input
                      value={decisiones[idx].decision}
                      onChange={e => updateDecision(idx, 'decision', e.target.value)}
                      placeholder="Describe la decisión..."
                      className="h-8 text-xs"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <select
                      value={decisiones[idx].tipo}
                      onChange={e => updateDecision(idx, 'tipo', e.target.value)}
                      className="w-full rounded border border-input bg-background px-2 py-1 text-xs h-8"
                    >
                      <option value=""></option>
                      {TIPO_OPTIONS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <select
                      value={decisiones[idx].quien_decide}
                      onChange={e => updateDecision(idx, 'quien_decide', e.target.value)}
                      className="w-full rounded border border-input bg-background px-2 py-1 text-xs h-8"
                    >
                      <option value=""></option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.full_name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <select
                      value={decisiones[idx].consulta_a}
                      onChange={e => updateDecision(idx, 'consulta_a', e.target.value)}
                      className="w-full rounded border border-input bg-background px-2 py-1 text-xs h-8"
                    >
                      <option value=""></option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.full_name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      value={decisiones[idx].frecuencia}
                      onChange={e => updateDecision(idx, 'frecuencia', e.target.value)}
                      placeholder="Ej: Diario"
                      className="h-8 text-xs"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      value={decisiones[idx].observaciones}
                      onChange={e => updateDecision(idx, 'observaciones', e.target.value)}
                      placeholder="Notas..."
                      className="h-8 text-xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 4 — Preguntas de reflexión */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Preguntas de reflexión (para compartir en plenaria)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-medium"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue text-white text-xs font-bold mr-2">1</span>¿Hay decisiones que hoy tomo solo(a) y que deberían involucrar a otro departamento?</p>
            <Textarea value={reflexion1} onChange={e => setReflexion1(e.target.value)} placeholder="Escribe tu reflexión..." rows={3} />
          </div>
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-medium"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue text-white text-xs font-bold mr-2">2</span>¿Qué decisión de otro departamento te impacta más y sobre la que debería consultarte?</p>
            <Textarea value={reflexion2} onChange={e => setReflexion2(e.target.value)} placeholder="Escribe tu reflexión..." rows={3} />
          </div>
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-medium"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue text-white text-xs font-bold mr-2">3</span>¿Hay decisiones que se demoran porque no está claro quién las debe tomar?</p>
            <Textarea value={reflexion3} onChange={e => setReflexion3(e.target.value)} placeholder="Escribe tu reflexión..." rows={3} />
          </div>
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-medium"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue text-white text-xs font-bold mr-2">4</span>¿Qué propuesta harías para mejorar la toma de decisiones en tu área o entre áreas?</p>
            <Textarea value={reflexion4} onChange={e => setReflexion4(e.target.value)} placeholder="Escribe tu reflexión..." rows={3} />
          </div>
        </div>
      </div>

      {/* Botón Guardar sticky */}
      <div className="fixed bottom-0 left-56 right-0 bg-background/95 backdrop-blur border-t px-6 py-3 z-10">
        <div className="max-w-5xl mx-auto flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-brand-blue hover:bg-brand-blue/90 text-white min-w-[160px]">
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
