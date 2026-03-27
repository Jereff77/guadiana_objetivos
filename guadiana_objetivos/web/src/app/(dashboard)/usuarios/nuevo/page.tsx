import { requirePermission, checkIsRoot } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { CreateUserForm } from '@/components/usuarios/create-user-form'
import Link from 'next/link'

export const metadata = { title: 'Nuevo usuario — Guadiana' }

export default async function NuevoUsuarioPage() {
  const isRoot = await checkIsRoot()
  if (!isRoot) await requirePermission('users.edit')

  const supabase = await createClient()
  const { data: roles } = await supabase
    .from('roles')
    .select('id, name, is_root, is_active')
    .eq('is_active', true)
    .order('is_root', { ascending: false })
    .order('name')

  // Filtrar rol root si el viewer no es root
  const availableRoles = (roles ?? []).filter((r) => isRoot || !r.is_root)

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href="/usuarios" className="text-sm text-muted-foreground hover:text-foreground">
          ← Usuarios
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo usuario</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Crea la cuenta del usuario. Podrá iniciar sesión de inmediato con las credenciales que asignes.
      </p>

      <CreateUserForm roles={availableRoles} />
    </div>
  )
}
