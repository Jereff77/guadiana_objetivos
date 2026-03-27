import { requirePermission, checkPermission, checkIsRoot } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { UsersTable } from '@/components/usuarios/users-table'
import Link from 'next/link'

export const metadata = { title: 'Usuarios — Guadiana' }

export default async function UsuariosPage() {
  await requirePermission('users.view')

  const supabase = await createClient()

  const [
    { data: { user: currentUser } },
    canEdit,
    canActivate,
    canChangeRole,
    isRoot,
  ] = await Promise.all([
    supabase.auth.getUser(),
    checkPermission('users.edit'),
    checkPermission('users.activate'),
    checkPermission('users.change_role'),
    checkIsRoot(),
  ])

  // Obtener perfiles con su rol
  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      role,
      role_id,
      is_active,
      whatsapp,
      last_seen,
      roles(name, is_root)
    `)
    .order('full_name')

  const users = (profiles ?? [])
    .filter((p) => {
      // Ocultar usuarios root si el viewer no es root
      if (!isRoot) {
        const roleData = p.roles
        if (roleData && typeof roleData === 'object' && 'is_root' in roleData) {
          if ((roleData as { is_root: boolean }).is_root) return false
        }
      }
      return true
    })
    .map((p) => {
      const roleData = p.roles
      const roleName = roleData && typeof roleData === 'object' && 'name' in roleData
        ? (roleData as { name: string }).name
        : null

      return {
        id: p.id,
        full_name: p.full_name,
        email: '',  // El email solo está en auth.users (no expuesto en SELECT sin service_role)
        role_name: roleName,
        is_active: p.is_active ?? true,
        whatsapp: p.whatsapp,
        last_seen: p.last_seen,
      }
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los usuarios y sus permisos de acceso.
          </p>
        </div>
        {(canEdit || isRoot) && (
          <Link
            href="/usuarios/nuevo"
            className="inline-flex items-center rounded-md bg-brand-blue text-white
              px-4 py-2 text-sm font-medium hover:bg-brand-blue/90 transition-colors"
          >
            + Nuevo usuario
          </Link>
        )}
      </div>

      <UsersTable
        users={users}
        canEdit={canEdit || isRoot}
        canActivate={canActivate || isRoot}
        canChangeRole={canChangeRole || isRoot}
        currentUserId={currentUser?.id ?? ''}
      />
    </div>
  )
}
