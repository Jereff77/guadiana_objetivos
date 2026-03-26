import { checkPermission, checkIsRoot } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { UserProfileForm } from '@/components/usuarios/user-profile-form'
import { UserRoleSelector } from '@/components/usuarios/user-role-selector'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Perfil de usuario — Guadiana' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UsuarioPerfilPage({ params }: PageProps) {
  const supabase = await createClient()
  const { id } = await params

  const [
    { data: { user: currentUser } },
    canEdit,
    canChangeRole,
    canActivate,
    isRoot,
  ] = await Promise.all([
    supabase.auth.getUser(),
    checkPermission('users.edit'),
    checkPermission('users.change_role'),
    checkPermission('users.activate'),
    checkIsRoot(),
  ])

  if (!currentUser) redirect('/login')

  const isSelf = currentUser.id === id
  const canView = isSelf || canEdit || isRoot

  if (!canView) redirect('/sin-acceso')

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      id, full_name, role, role_id, is_active,
      phone, whatsapp, avatar_url, last_seen,
      roles(name, is_root)
    `)
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const roleData = profile.roles
  const targetRoleName = roleData && typeof roleData === 'object' && 'name' in roleData
    ? (roleData as { name: string }).name
    : null
  const targetIsRoot = roleData && typeof roleData === 'object' && 'is_root' in roleData
    ? (roleData as { is_root: boolean }).is_root
    : false

  // Solo root puede ver/editar a otro root que no sea él mismo
  if (targetIsRoot && !isSelf && !isRoot) redirect('/sin-acceso')

  // Obtener roles disponibles para el selector
  const { data: roles } = await supabase
    .from('roles')
    .select('id, name, is_root, is_active')
    .order('is_root', { ascending: false })
    .order('name')

  const canEditProfile = isSelf || canEdit || isRoot
  const canChangeThisRole = !targetIsRoot && (canChangeRole || isRoot) && !isSelf

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/usuarios" className="text-sm text-muted-foreground hover:text-foreground">
          ← Usuarios
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-2xl font-bold tracking-tight">
          {isSelf ? 'Mi perfil' : profile.full_name ?? 'Perfil de usuario'}
        </h1>
        {targetRoleName && (
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
            targetIsRoot
              ? 'bg-amber-100 text-amber-800 border-amber-200'
              : 'bg-brand-blue/10 text-brand-blue border-brand-blue/20'
          }`}>
            {targetRoleName}
          </span>
        )}
        {!profile.is_active && (
          <span className="inline-flex items-center rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-xs font-medium text-gray-500">
            Inactivo
          </span>
        )}
      </div>

      {/* Datos del perfil */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold border-b pb-2">Datos del perfil</h2>
        <UserProfileForm
          userId={id}
          initialData={{
            full_name: profile.full_name,
            phone: profile.phone,
            whatsapp: profile.whatsapp,
            avatar_url: profile.avatar_url,
          }}
          readOnly={!canEditProfile}
        />
      </section>

      {/* Cambio de rol */}
      {canChangeThisRole && roles && (
        <section className="space-y-4">
          <h2 className="text-base font-semibold border-b pb-2">Rol asignado</h2>
          <UserRoleSelector
            userId={id}
            currentRoleId={profile.role_id}
            roles={roles}
            viewerIsRoot={isRoot}
          />
        </section>
      )}

      {/* Activar/Desactivar */}
      {(canActivate || isRoot) && !isSelf && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold border-b pb-2">Estado de la cuenta</h2>
          <p className="text-sm text-muted-foreground">
            Estado actual: <strong>{profile.is_active ? 'Activo' : 'Inactivo'}</strong>
          </p>
          <form action={`/api/usuarios/${id}/toggle-active`} method="POST">
            <button
              type="submit"
              className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                profile.is_active
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              }`}
            >
              {profile.is_active ? 'Desactivar cuenta' : 'Activar cuenta'}
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
