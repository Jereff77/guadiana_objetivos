import { requirePermission } from '@/lib/permissions'
import { getIncentiveSchemas, deleteIncentiveSchema } from '../incentive-actions'
import { IncentiveSchemaForm } from '@/components/incentivos/incentive-schema-form'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { IncentiveSchemasList } from '@/components/incentivos/incentive-schemas-list'

export const metadata = { title: 'Configurar Esquemas de Incentivos — Guadiana' }

export default async function IncentivosConfigurarPage() {
  await requirePermission('incentivos.manage')

  const supabase = await createClient()

  const [schemasResult, { data: departments }, { data: roles }] = await Promise.all([
    getIncentiveSchemas(),
    supabase.from('departments').select('id, name').eq('is_active', true).order('name'),
    supabase.from('roles').select('id, name, is_root').eq('is_active', true).order('name'),
  ])

  const schemas = schemasResult.success ? (schemasResult.data ?? []) : []
  const deptList = departments ?? []
  const roleList = roles ?? []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurar esquemas de incentivos</h1>
          <p className="text-muted-foreground text-sm">
            Define los montos base y niveles de bonificación por departamento/rol.
          </p>
        </div>
        <Link
          href="/incentivos"
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted transition-colors"
        >
          Volver
        </Link>
      </div>

      {/* Formulario de nuevo esquema */}
      <section className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Nuevo esquema</h2>
        <IncentiveSchemaForm
          departments={deptList}
          roles={roleList}
        />
      </section>

      {/* Lista de esquemas existentes */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Esquemas configurados
          {schemas.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({schemas.length})</span>
          )}
        </h2>

        {schemas.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">No hay esquemas configurados aún.</p>
          </div>
        ) : (
          <IncentiveSchemasList schemas={schemas} departments={deptList} roles={roleList} />
        )}
      </section>
    </div>
  )
}
