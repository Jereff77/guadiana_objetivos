import { requirePermission } from '@/lib/permissions'
import { getDepartmentsForUser } from './dept-actions'
import { DepartmentsGrid } from '@/components/objetivos/departments-grid'
import Link from 'next/link'

export const metadata = { title: 'Objetivos — Guadiana' }

export default async function ObjetivosPage() {
  await requirePermission('objetivos.view')

  const departments = await getDepartmentsForUser()
  const canManage = departments.some((d) => d.userCanManage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Objetivos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Seguimiento de objetivos mensuales por departamento.
          </p>
        </div>
        {canManage && (
          <Link
            href="/objetivos/configurar"
            className="inline-flex items-center gap-2 rounded-md bg-brand-blue text-white
              px-4 py-2 text-sm font-medium hover:bg-brand-blue/90 transition-colors"
          >
            + Configurar objetivos
          </Link>
        )}
      </div>

      <DepartmentsGrid departments={departments} />
    </div>
  )
}
