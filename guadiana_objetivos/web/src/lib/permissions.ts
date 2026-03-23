import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Verifica si el usuario actual tiene un permiso específico.
 * Llama a la función SQL has_permission() que incluye bypass para root.
 */
export async function checkPermission(key: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase.rpc('has_permission', { permission_key: key })
  return data === true
}

/**
 * Verifica si el usuario actual tiene el rol root.
 */
export async function checkIsRoot(): Promise<boolean> {
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
 * Útil para pasar al cliente (para mostrar/ocultar UI).
 */
export async function getUserPermissions(): Promise<string[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Si es root, retornar todos los permisos disponibles
  const isRoot = await checkIsRoot()
  if (isRoot) {
    const { data: modules } = await supabase
      .from('platform_modules')
      .select('key')
      .eq('is_active', true)
    return (modules ?? []).map((m: { key: string }) => m.key)
  }

  // Obtener permisos del rol del usuario
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
