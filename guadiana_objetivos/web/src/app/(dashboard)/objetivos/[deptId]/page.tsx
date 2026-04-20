import { requirePermission } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { getDepartmentsForUser } from '../dept-actions'
import { getObjectivesGroupedByUser } from '../objective-actions'
import { getIncentiveSchemasForDept } from '../../incentivos/incentive-actions'
import { DeptUsersView } from '@/components/objetivos/dept-users-view'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Equipo — Objetivos' }

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

  // Obtener departamentos accesibles para el usuario y encontrar el actual
  const depts = await getDepartmentsForUser()
  const thisDept = depts.find((d) => d.id === deptId)

  if (!thisDept) {
    redirect('/objetivos')
  }

  const canManage = thisDept.userCanManage
  const canReview = canManage || thisDept.userRole === 'area_responsible'

  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const currentUserId = authUser?.id ?? ''

  // Cargar datos en paralelo
  const [usersWithObjectives, incentiveSchemasResult] = await Promise.all([
    getObjectivesGroupedByUser(deptId, month, year),
    getIncentiveSchemasForDept(deptId),
  ])

  const incentiveSchemas = incentiveSchemasResult.data ?? []

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/objetivos" className="hover:text-foreground">
              Objetivos
            </Link>
            <span>/</span>
            <span>{thisDept.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{thisDept.name}</h1>
          {thisDept.responsible_name && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Responsable: {thisDept.responsible_name}
            </p>
          )}
        </div>

        {canManage && (
          <Link
            href={`/objetivos/configurar?dept=${deptId}`}
            className="rounded bg-brand-blue text-white px-3 py-1.5 text-sm hover:bg-brand-blue/90"
          >
            Configurar objetivos
          </Link>
        )}
      </div>

      {/* Vista centrada en usuarios */}
      <DeptUsersView
        users={usersWithObjectives}
        deptId={deptId}
        month={month}
        year={year}
        canManage={canManage}
        canReview={canReview}
        incentiveSchemas={incentiveSchemas}
        currentUserId={currentUserId}
      />
    </div>
  )
}
