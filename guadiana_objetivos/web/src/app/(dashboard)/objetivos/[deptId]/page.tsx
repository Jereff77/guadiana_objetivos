import { requirePermission, checkPermission } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { getObjectivesByDept } from '../objective-actions'
import { getDeliverableWithDetail } from '../deliverable-actions'
import { ObjectiveCard } from '@/components/objetivos/objective-card'
import { DeliverableRow } from '@/components/objetivos/deliverable-row'
import type { Deliverable } from '../deliverable-actions'
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

  // Para cada objetivo, obtener sus entregables con evidencias y revisiones
  const objectivesWithDeliverables = await Promise.all(
    objectives.map(async (obj) => {
      // Obtener entregables del objetivo
      const { data: delivs } = await supabase
        .from('objective_deliverables')
        .select(`
          id, objective_id, title, description, due_date, assignee_id, status, created_at,
          profiles(full_name),
          objective_evidences (
            id, deliverable_id, submitted_by, storage_path, evidence_url,
            text_content, submitted_at, notes,
            profiles(full_name)
          ),
          objective_reviews (
            id, deliverable_id, reviewer_id, verdict, comment, reviewed_at,
            profiles(full_name)
          )
        `)
        .eq('objective_id', obj.id)
        .order('created_at')

      const deliverables: Deliverable[] = (delivs ?? []).map((d: any) => {
        const assignee = d.profiles
        const evidences = (d.objective_evidences ?? []).map((e: any) => {
          const sub = e.profiles
          return {
            id: e.id,
            deliverable_id: e.deliverable_id,
            submitted_by: e.submitted_by,
            submitter_name: sub ? (sub.full_name ?? null) : null,
            storage_path: e.storage_path,
            evidence_url: e.evidence_url,
            text_content: e.text_content,
            submitted_at: e.submitted_at,
            notes: e.notes,
          }
        })

        const reviews = (d.objective_reviews ?? []).map((r: any) => {
          const rev = r.profiles
          return {
            id: r.id,
            deliverable_id: r.deliverable_id,
            reviewer_id: r.reviewer_id,
            reviewer_name: rev ? (rev.full_name ?? null) : null,
            verdict: r.verdict,
            comment: r.comment,
            reviewed_at: r.reviewed_at,
          }
        })

        return {
          id: d.id,
          objective_id: d.objective_id,
          title: d.title,
          description: d.description,
          due_date: d.due_date,
          assignee_id: d.assignee_id,
          assignee_name: assignee ? (assignee.full_name ?? null) : null,
          status: d.status,
          created_at: d.created_at,
          evidences,
          latest_review: reviews.length > 0 ? reviews[reviews.length - 1] : null,
        }
      })

      return {
        ...obj,
        deliverables,
      }
    })
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
