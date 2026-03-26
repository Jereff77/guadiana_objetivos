'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface RoleFormData {
  name: string
  description?: string
}

export interface RoleWithPermissions {
  id: string
  name: string
  description: string | null
  is_root: boolean
  is_active: boolean
  created_at: string
  permissions: string[]  // array de keys de platform_modules
  user_count: number
}

// ─── Helpers de permiso (server-side) ────────────────────────────────────────

async function assertRolesManage() {
  const supabase = await createClient()
  const { data } = await supabase.rpc('has_permission', { permission_key: 'roles.manage' })
  if (!data) redirect('/sin-acceso')
}

// ─── Acciones ────────────────────────────────────────────────────────────────

/**
 * Crear un nuevo rol. Requiere permiso roles.manage.
 */
export async function createRole(data: RoleFormData): Promise<{ error?: string; id?: string }> {
  await assertRolesManage()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: role, error } = await supabase
    .from('roles')
    .insert({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un rol con ese nombre' }
    return { error: error.message }
  }

  revalidatePath('/roles')
  return { id: role.id }
}

/**
 * Actualizar nombre/descripción de un rol. Requiere roles.manage.
 * No permite modificar el rol root.
 */
export async function updateRole(
  id: string,
  data: Partial<RoleFormData> & { is_active?: boolean }
): Promise<{ error?: string }> {
  await assertRolesManage()
  const supabase = await createClient()

  // Verificar que no sea root
  const { data: role } = await supabase
    .from('roles')
    .select('is_root')
    .eq('id', id)
    .single()

  if (role?.is_root) return { error: 'El rol root no puede modificarse' }

  const { error } = await supabase
    .from('roles')
    .update({
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/roles')
  revalidatePath(`/roles/${id}`)
  return {}
}

/**
 * Eliminar un rol. Solo si no tiene usuarios asignados. Requiere roles.manage.
 */
export async function deleteRole(id: string): Promise<{ error?: string }> {
  await assertRolesManage()
  const supabase = await createClient()

  // Verificar que no sea root
  const { data: role } = await supabase
    .from('roles')
    .select('is_root')
    .eq('id', id)
    .single()

  if (role?.is_root) return { error: 'El rol root no puede eliminarse' }

  // Verificar que no tenga usuarios
  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role_id', id)

  if (count && count > 0) {
    return { error: `No se puede eliminar: ${count} usuario(s) tienen este rol asignado` }
  }

  const { error } = await supabase.from('roles').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/roles')
  return {}
}

/**
 * Reemplazar los permisos de un rol. Requiere roles.manage.
 * Recibe un array de keys de platform_modules.
 */
export async function setRolePermissions(
  roleId: string,
  moduleKeys: string[]
): Promise<{ error?: string }> {
  await assertRolesManage()
  const supabase = await createClient()

  // Verificar que no sea root
  const { data: role } = await supabase
    .from('roles')
    .select('is_root')
    .eq('id', roleId)
    .single()

  if (role?.is_root) return { error: 'El rol root tiene todos los permisos por defecto' }

  // Obtener IDs de los módulos seleccionados
  const { data: modules, error: modErr } = await supabase
    .from('platform_modules')
    .select('id')
    .in('key', moduleKeys)

  if (modErr) return { error: modErr.message }

  // Eliminar permisos actuales y reemplazar
  const { error: delErr } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId)

  if (delErr) return { error: delErr.message }

  if (modules && modules.length > 0) {
    const inserts = modules.map((m: { id: string }) => ({ role_id: roleId, module_id: m.id }))
    const { error: insErr } = await supabase.from('role_permissions').insert(inserts)
    if (insErr) return { error: insErr.message }
  }

  revalidatePath('/roles')
  revalidatePath(`/roles/${roleId}`)
  return {}
}

/**
 * Obtener un rol con sus permisos actuales y conteo de usuarios.
 */
export async function getRoleWithPermissions(id: string): Promise<RoleWithPermissions | null> {
  const supabase = await createClient()

  const { data: role } = await supabase
    .from('roles')
    .select('id, name, description, is_root, is_active, created_at')
    .eq('id', id)
    .single()

  if (!role) return null

  const { data: perms } = await supabase
    .from('role_permissions')
    .select('platform_modules(key)')
    .eq('role_id', id)

  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role_id', id)

  const permissions = (perms ?? [])
    .map((p: { platform_modules: unknown }) => {
      const mod = p.platform_modules
      if (mod && typeof mod === 'object' && 'key' in mod) {
        return (mod as { key: string }).key
      }
      return null
    })
    .filter((k): k is string => k !== null)

  return {
    ...role,
    permissions,
    user_count: count ?? 0,
  }
}

/**
 * Obtener todos los roles con conteo de usuarios.
 */
export async function getAllRoles() {
  const supabase = await createClient()

  const { data: roles } = await supabase
    .from('roles')
    .select('id, name, description, is_root, is_active, created_at')
    .order('is_root', { ascending: false })
    .order('name')

  if (!roles) return []

  // Obtener conteo de usuarios por rol
  const withCounts = await Promise.all(
    roles.map(async (role) => {
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role_id', role.id)
      return { ...role, user_count: count ?? 0 }
    })
  )

  return withCounts
}
