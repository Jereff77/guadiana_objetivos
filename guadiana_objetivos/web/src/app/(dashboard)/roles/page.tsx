import { requirePermission, checkPermission, checkIsRoot } from '@/lib/permissions'
import { getAllRoles } from './role-actions'
import { RolesTable } from '@/components/roles/roles-table'
import Link from 'next/link'

export const metadata = { title: 'Roles — Guadiana' }

export default async function RolesPage() {
  await requirePermission('roles.view')

  const [allRoles, canManage, isRoot] = await Promise.all([
    getAllRoles(),
    checkPermission('roles.manage'),
    checkIsRoot(),
  ])

  // Ocultar el rol root si el viewer no es root
  const roles = isRoot ? allRoles : allRoles.filter((r) => !r.is_root)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra los roles y sus permisos de acceso a la plataforma.
          </p>
        </div>
        {canManage && (
          <Link
            href="/roles/nuevo"
            className="inline-flex items-center gap-2 rounded-md bg-brand-blue text-white
              px-4 py-2 text-sm font-medium hover:bg-brand-blue/90 transition-colors"
          >
            + Nuevo rol
          </Link>
        )}
      </div>

      <RolesTable roles={roles} canManage={canManage} />
    </div>
  )
}
