import { checkPermission, checkIsRoot } from '@/lib/permissions'
import { redirect } from 'next/navigation'
import { getIncentiveSchemas } from '../incentive-actions'
import { IncentiveSchemaForm } from '@/components/incentivos/incentive-schema-form'
import { IncentiveSchemasList } from '@/components/incentivos/incentive-schemas-list'
import { getOrgContext } from '../../objetivos/dept-actions'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Configurar Planes de Incentivos — Guadiana' }

export default async function IncentivosConfigurarPage() {
  const [canManage, isRoot] = await Promise.all([
    checkPermission('incentivos.manage'),
    checkIsRoot(),
  ])

  // Obtener contexto del usuario en el organigrama
  const ctx = await getOrgContext()

  // Accede quien puede gestionar incentivos globalmente O quien es responsable de depto/área
  const isDeptResponsible =
    (ctx?.responsibleDeptIds?.length ?? 0) > 0 ||
    (ctx?.responsibleAreaIds?.length ?? 0) > 0

  if (!canManage && !isRoot && !isDeptResponsible) {
    redirect('/incentivos')
  }

  const supabase = await createClient()

  // Obtener departamentos y áreas propios del usuario (o todos si es admin)
  let orgDepts: { id: string; name: string }[] = []
  let orgAreas: { id: string; name: string; department_id: string }[] = []

  if (canManage || isRoot) {
    // Admin: ve todos
    const [{ data: allDepts }, { data: allAreas }] = await Promise.all([
      supabase.from('org_departments').select('id, name').order('name'),
      supabase.from('org_areas').select('id, name, department_id').order('name'),
    ])
    orgDepts = allDepts ?? []
    orgAreas = allAreas ?? []
  } else {
    // Responsable: solo sus deptos y áreas
    if ((ctx?.responsibleDeptIds?.length ?? 0) > 0) {
      const { data } = await supabase
        .from('org_departments')
        .select('id, name')
        .in('id', ctx!.responsibleDeptIds)
        .order('name')
      orgDepts = data ?? []
    }
    if ((ctx?.responsibleAreaIds?.length ?? 0) > 0) {
      const { data } = await supabase
        .from('org_areas')
        .select('id, name, department_id')
        .in('id', ctx!.responsibleAreaIds)
        .order('name')
      orgAreas = data ?? []
    }
  }

  const schemasResult = await getIncentiveSchemas()
  const schemas = schemasResult.success ? (schemasResult.data ?? []) : []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planes de incentivos</h1>
          <p className="text-muted-foreground text-sm">
            Define montos y tramos de bonificación para tu departamento o área.
          </p>
        </div>
        <Link
          href="/incentivos"
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted transition-colors"
        >
          Volver
        </Link>
      </div>

      <section className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Nuevo plan</h2>
        <IncentiveSchemaForm orgDepts={orgDepts} orgAreas={orgAreas} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Planes configurados
          {schemas.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({schemas.length})</span>
          )}
        </h2>
        {schemas.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">No hay planes configurados aún.</p>
          </div>
        ) : (
          <IncentiveSchemasList schemas={schemas} orgDepts={orgDepts} orgAreas={orgAreas} />
        )}
      </section>
    </div>
  )
}
