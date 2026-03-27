import { requirePermission, checkIsRoot } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { getRoleWithPermissions } from '../role-actions'
import { RoleForm } from '@/components/roles/role-form'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Editar rol — Guadiana' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarRolPage({ params }: PageProps) {
  await requirePermission('roles.manage')

  const { id } = await params
  const [role, supabase, isRoot] = await Promise.all([
    getRoleWithPermissions(id),
    createClient(),
    checkIsRoot(),
  ])

  if (!role) notFound()

  // Solo root puede ver/editar el rol root
  if (role.is_root && !isRoot) redirect('/sin-acceso')

  const { data: modules } = await supabase
    .from('platform_modules')
    .select('id, key, label, module, sort_order')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/roles" className="text-sm text-muted-foreground hover:text-foreground">
          ← Roles
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-2xl font-bold tracking-tight">
          {role.is_root ? role.name : `Editar: ${role.name}`}
        </h1>
        {role.is_root && (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
            ROOT
          </span>
        )}
      </div>

      <RoleForm
        mode="edit"
        roleId={role.id}
        initialName={role.name}
        initialDescription={role.description ?? ''}
        initialPermissions={role.permissions}
        isRoot={role.is_root}
        modules={modules ?? []}
      />
    </div>
  )
}
