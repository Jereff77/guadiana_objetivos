import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

// ── Helper interno: permisos del rol en vista previa ─────────────────────────
// Retorna null si no hay preview activo, o el array de permission keys del rol.

async function getPreviewPermissions(): Promise<string[] | null> {
  const cookieStore = await cookies()
  const previewRoleId = cookieStore.get('guadiana_preview_role')?.value
  if (!previewRoleId) return null

  const supabase = await createClient()

  const { data: role } = await supabase
    .from('roles')
    .select('is_root')
    .eq('id', previewRoleId)
    .single()

  if (role?.is_root) {
    const { data: modules } = await supabase
      .from('platform_modules')
      .select('key')
      .eq('is_active', true)
    return (modules ?? []).map((m: { key: string }) => m.key)
  }

  const { data: perms } = await supabase
    .from('role_permissions')
    .select('platform_modules(key)')
    .eq('role_id', previewRoleId)

  return (perms ?? [])
    .map((p: { platform_modules: unknown }) => {
      const mod = p.platform_modules
      if (mod && typeof mod === 'object' && 'key' in mod) {
        return (mod as { key: string }).key
      }
      return null
    })
    .filter((k): k is string => k !== null)
}

// ── Funciones públicas ────────────────────────────────────────────────────────

/**
 * Verifica si el usuario actual tiene un permiso específico.
 * En modo vista previa, comprueba los permisos del rol de prueba.
 */
export async function checkPermission(key: string): Promise<boolean> {
  const preview = await getPreviewPermissions()
  if (preview !== null) return preview.includes(key)

  const supabase = await createClient()
  const { data } = await supabase.rpc('has_permission', { permission_key: key })
  return data === true
}

/**
 * Verifica si el usuario actual tiene el rol root.
 * En modo vista previa, refleja si el rol de prueba es root.
 */
export async function checkIsRoot(): Promise<boolean> {
  const cookieStore = await cookies()
  const previewRoleId = cookieStore.get('guadiana_preview_role')?.value

  if (previewRoleId) {
    const supabase = await createClient()
    const { data: role } = await supabase
      .from('roles')
      .select('is_root')
      .eq('id', previewRoleId)
      .single()
    return role?.is_root === true
  }

  const supabase = await createClient()
  const { data } = await supabase.rpc('is_root')
  return data === true
}

/**
 * Requiere un permiso específico. Redirige a /sin-acceso si no lo tiene.
 * Usar en Server Components y Server Actions.
 */
export async function requirePermission(key: string): Promise<void> {
  if (!(await checkPermission(key))) {
    redirect('/sin-acceso')
  }
}

/**
 * Requiere rol root. Redirige a /sin-acceso si no es root.
 */
export async function requireRoot(): Promise<void> {
  if (!(await checkIsRoot())) {
    redirect('/sin-acceso')
  }
}

/**
 * Retorna la lista de claves de permisos que tiene el usuario actual.
 * En modo vista previa, retorna los permisos del rol de prueba.
 */
export async function getUserPermissions(): Promise<string[]> {
  const preview = await getPreviewPermissions()
  if (preview !== null) return preview

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const isRoot = await checkIsRoot()
  if (isRoot) {
    const { data: modules } = await supabase
      .from('platform_modules')
      .select('key')
      .eq('is_active', true)
    return (modules ?? []).map((m: { key: string }) => m.key)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role_id')
    .eq('id', user.id)
    .single()

  if (!profile?.role_id) return []

  const { data: perms } = await supabase
    .from('role_permissions')
    .select('platform_modules(key)')
    .eq('role_id', profile.role_id)

  if (!perms) return []

  return perms
    .map((p: { platform_modules: unknown }) => {
      const mod = p.platform_modules
      if (mod && typeof mod === 'object' && 'key' in mod) {
        return (mod as { key: string }).key
      }
      return null
    })
    .filter((k): k is string => k !== null)
}
