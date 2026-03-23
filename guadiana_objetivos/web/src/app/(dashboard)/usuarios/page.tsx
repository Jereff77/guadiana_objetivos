import { requirePermission, checkPermission, checkIsRoot } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { UsersTable } from '@/components/usuarios/users-table'

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
      roles(name)
    `)
    .order('full_name')

  const users = (profiles ?? []).map((p) => {
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
