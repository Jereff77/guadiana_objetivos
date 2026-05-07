'use client'

import type { TallerRecord, TallerUser, DecisionEntry } from '@/app/(dashboard)/taller/taller-types'
import { TIPO_OPTIONS } from '@/app/(dashboard)/taller/taller-types'

interface TallerViewProps {
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

const userMap = new Map<string, string>()
// users se reciben pero no se usan en el map porque no hay useEffect

function getUserName(usersList: TallerUser[], id: string): string {
  return usersList.find(u => u.id === id)?.full_name ?? id
}

function formatDate(d: string | null | undefined): string {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('es-MX') } catch { return '—' }
}

export function TallerView({ initialData, ownerName, users }: TallerViewProps) {
  const decisiones: DecisionEntry[] = (initialData?.decisiones && Array.isArray(initialData.decisiones) && initialData.decisiones.length === 10)
    ? initialData.decisiones as DecisionEntry[]
    : []

  const tieneDatos = initialData !== null

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      <h1 className="text-2xl font-bold">Formulario de {ownerName}</h1>

      {!tieneDatos && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">Este usuario aún no ha llenado el formulario del taller.</p>
        </div>
      )}

      {tieneDatos && (
        <>
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
                <p className="text-xs font-medium text-muted-foreground">Nombre</p>
                <p className="text-sm font-medium">{ownerName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Departamento/Área</p>
                <p className="text-sm">{initialData.departamento ?? '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Puesto</p>
                <p className="text-sm">{initialData.puesto ?? '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Fecha</p>
                <p className="text-sm">{formatDate(initialData.fecha_creacion)}</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2 — Catálogo */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Catálogo de Tipos de Decisión</h2>
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

          {/* SECCIÓN 3 — Mapeo */}
          <div>
            <h2 className="text-lg font-semibold mb-1">Parte 2 — Mapeo de Decisiones de tu Departamento</h2>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/80">
                    <th className="text-center px-2 py-2 font-semibold w-10">#</th>
                    <th className="text-left px-3 py-2 font-semibold">Decisión / Situación</th>
                    <th className="text-left px-3 py-2 font-semibold w-40">Tipo</th>
                    <th className="text-left px-3 py-2 font-semibold w-48">¿Quién decide?</th>
                    <th className="text-left px-3 py-2 font-semibold w-48">¿Consulta o informa a quién?</th>
                    <th className="text-left px-3 py-2 font-semibold w-36">Frecuencia</th>
                    <th className="text-left px-3 py-2 font-semibold w-48">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((idx) => {
                    const d = decisiones[idx]
                    const tipoTexto = TIPO_OPTIONS.find(t => t === d?.tipo) ?? d?.tipo ?? ''
                    const quienNombre = d?.quien_decide ? getUserName(users, d.quien_decide) : ''
                    const consultaNombre = d?.consulta_a ? getUserName(users, d.consulta_a) : ''
                    return (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-muted/30' : ''}>
                        <td className="text-center px-2 py-2 text-muted-foreground font-mono text-xs">{idx + 1}</td>
                        <td className="px-3 py-2 text-sm">{d?.decision || '—'}</td>
                        <td className="px-3 py-2 text-xs">{tipoTexto || '—'}</td>
                        <td className="px-3 py-2 text-xs">{quienNombre || '—'}</td>
                        <td className="px-3 py-2 text-xs">{consultaNombre || '—'}</td>
                        <td className="px-3 py-2 text-xs">{d?.frecuencia || '—'}</td>
                        <td className="px-3 py-2 text-xs">{d?.observaciones || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECCIÓN 4 — Reflexiones */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Preguntas de reflexión (para compartir en plenaria)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue text-white text-xs font-bold mr-2">1</span>¿Hay decisiones que hoy tomo solo(a) y que deberían involucrar a otro departamento?</p>
                <p className="text-sm whitespace-pre-wrap">{initialData.reflexion_1 || '—'}</p>
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue text-white text-xs font-bold mr-2">2</span>¿Qué decisión de otro departamento te impacta más y sobre la que debería consultarte?</p>
                <p className="text-sm whitespace-pre-wrap">{initialData.reflexion_2 || '—'}</p>
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue text-white text-xs font-bold mr-2">3</span>¿Hay decisiones que se demoran porque no está claro quién las debe tomar?</p>
                <p className="text-sm whitespace-pre-wrap">{initialData.reflexion_3 || '—'}</p>
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-blue text-white text-xs font-bold mr-2">4</span>¿Qué propuesta harías para mejorar la toma de decisiones en tu área o entre áreas?</p>
                <p className="text-sm whitespace-pre-wrap">{initialData.reflexion_4 || '—'}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
