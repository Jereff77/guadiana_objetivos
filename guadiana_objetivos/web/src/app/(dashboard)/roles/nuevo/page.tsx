import { requirePermission } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { RoleForm } from '@/components/roles/role-form'
import Link from 'next/link'

export const metadata = { title: 'Nuevo rol — Guadiana' }

export default async function NuevoRolPage() {
  await requirePermission('roles.manage')

  const supabase = await createClient()
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
        <h1 className="text-2xl font-bold tracking-tight">Nuevo rol</h1>
      </div>

      <RoleForm
        mode="create"
        modules={modules ?? []}
      />
    </div>
  )
}
