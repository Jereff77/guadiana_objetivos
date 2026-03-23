import { requirePermission, checkPermission } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { getObjectivesByDept } from '../objective-actions'
import { getDeliverablesByObjective } from '../deliverable-actions'
import { ObjectiveCard } from '@/components/objetivos/objective-card'
import { DeliverableRow } from '@/components/objetivos/deliverable-row'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Departamento — Objetivos' }

interface PageProps {
  params: Promise<{ deptId: string }>
  searchParams: Promise<{ month?: string; year?: string }>
}

export default async function DeptObjetivosPage({ params, searchParams }: PageProps) {
  await requirePermission('objetivos.view')

  const { deptId } = await params
  const sp = await searchParams

  const now = new Date()
  const month = sp.month ? parseInt(sp.month) : now.getMonth() + 1
  const year = sp.year ? parseInt(sp.year) : now.getFullYear()

  const supabase = await createClient()
  const [
    { data: dept },
    objectives,
    canManage,
    canReview,
    { data: { user } },
  ] = await Promise.all([
    supabase.from('departments').select('id, name, description').eq('id', deptId).single(),
    getObjectivesByDept(deptId, month, year),
    checkPermission('objetivos.manage'),
    checkPermission('objetivos.review'),
    supabase.auth.getUser(),
  ])

  if (!dept) notFound()

  // Para cada objetivo, obtener sus entregables
  const objectivesWithDeliverables = await Promise.all(
    objectives.map(async (obj) => ({
      ...obj,
      deliverables: await getDeliverablesByObjective(obj.id),
    }))
  )

  const MONTHS = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/objetivos" className="hover:text-foreground">← Objetivos</Link>
            <span>/</span>
            <span>{dept.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{dept.name}</h1>
          {dept.description && (
            <p className="text-sm text-muted-foreground mt-1">{dept.description}</p>
          )}
        </div>

        {/* Selector mes/año */}
        <form className="flex items-center gap-2">
          <select
            name="month"
            defaultValue={month}
            className="rounded border border-input bg-background px-2 py-1.5 text-sm"
          >
            {MONTHS.slice(1).map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            name="year"
            defaultValue={year}
            className="rounded border border-input bg-background px-2 py-1.5 text-sm"
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded bg-brand-blue text-white px-3 py-1.5 text-sm hover:bg-brand-blue/90"
          >
            Ver
          </button>
        </form>
      </div>

      {/* Período actual */}
      <p className="text-sm font-medium text-muted-foreground">
        Período: <strong>{MONTHS[month]} {year}</strong> — {objectives.length} objetivo(s)
      </p>

      {/* Sin objetivos */}
      {objectivesWithDeliverables.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">No hay objetivos configurados para este período.</p>
          {canManage && (
            <Link
              href={`/objetivos/configurar?dept=${deptId}`}
              className="mt-3 inline-flex items-center rounded bg-brand-blue text-white px-4 py-2 text-sm hover:bg-brand-blue/90"
            >
              + Configurar objetivos
            </Link>
          )}
        </div>
      )}

      {/* Lista de objetivos con sus entregables */}
      <div className="space-y-6">
        {objectivesWithDeliverables.map((obj) => (
          <div key={obj.id} className="space-y-3">
            <ObjectiveCard
              objective={obj}
              canManage={canManage}
            />

            {obj.deliverables.length > 0 && (
              <div className="ml-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Entregables
                </p>
                {obj.deliverables.map((deliv) => (
                  <DeliverableRow
                    key={deliv.id}
                    deliverable={deliv}
                    canReview={canReview}
                    currentUserIsAssignee={deliv.assignee_id === user?.id}
                  />
                ))}
              </div>
            )}

            {canManage && obj.status === 'active' && (
              <div className="ml-4">
                <Link
                  href={`/objetivos/configurar?dept=${deptId}&obj=${obj.id}&tab=deliverables`}
                  className="text-xs text-brand-blue hover:underline"
                >
                  + Agregar entregable
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
