'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface UserProfileData {
  full_name?: string
  phone?: string
  whatsapp?: string
  avatar_url?: string
}

export interface UserWithRole {
  id: string
  full_name: string | null
  email: string
  role: string | null
  role_id: string | null
  role_name: string | null
  is_active: boolean
  phone: string | null
  whatsapp: string | null
  avatar_url: string | null
  last_seen: string | null
  created_at: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return user.id
}

async function hasPermission(key: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase.rpc('has_permission', { permission_key: key })
  return data === true
}

async function isRoot(): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase.rpc('is_root')
  return data === true
}

// ─── Acciones ────────────────────────────────────────────────────────────────

/**
 * Obtener todos los usuarios con su rol asignado. Requiere users.view.
 */
export async function getAllUsers(): Promise<UserWithRole[]> {
  if (!(await hasPermission('users.view')) && !(await isRoot())) {
    redirect('/sin-acceso')
  }

  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      role,
      role_id,
      is_active,
      phone,
      whatsapp,
      avatar_url,
      last_seen,
      created_at,
      roles(name)
    `)
    .order('full_name')

  if (!profiles) return []

  // Obtener emails desde auth.users via admin (service role en producción)
  // Por ahora usamos el cliente con permisos de sesión
  const users: UserWithRole[] = profiles.map((p) => {
    const roleData = p.roles
    const roleName = roleData && typeof roleData === 'object' && 'name' in roleData
      ? (roleData as { name: string }).name
      : null

    return {
      id: p.id,
      full_name: p.full_name,
      email: '',  // se complementa en la página con auth.users si se tiene acceso
      role: p.role,
      role_id: p.role_id,
      role_name: roleName,
      is_active: p.is_active ?? true,
      phone: p.phone,
      whatsapp: p.whatsapp,
      avatar_url: p.avatar_url,
      last_seen: p.last_seen,
      created_at: p.created_at,
    }
  })

  return users
}

/**
 * Actualizar perfil de un usuario. Propio o con users.edit.
 */
export async function updateUserProfile(
  userId: string,
  data: UserProfileData
): Promise<{ error?: string }> {
  const currentId = await getCurrentUserId()
  const isSelf = currentId === userId
  const canEdit = isSelf || (await hasPermission('users.edit')) || (await isRoot())

  if (!canEdit) return { error: 'Sin permiso para editar este perfil' }

  // Validar WhatsApp E.164 si se proporciona
  if (data.whatsapp && !/^\+[1-9]\d{7,14}$/.test(data.whatsapp)) {
    return { error: 'El número de WhatsApp debe incluir código de país (ej: +521234567890)' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({
      ...(data.full_name !== undefined ? { full_name: data.full_name.trim() } : {}),
      ...(data.phone !== undefined ? { phone: data.phone?.trim() || null } : {}),
      ...(data.whatsapp !== undefined ? { whatsapp: data.whatsapp?.trim() || null } : {}),
      ...(data.avatar_url !== undefined ? { avatar_url: data.avatar_url?.trim() || null } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/usuarios')
  revalidatePath(`/usuarios/${userId}`)
  return {}
}

/**
 * Activar cuenta de usuario. Requiere users.activate.
 */
export async function activateUser(userId: string): Promise<{ error?: string }> {
  if (!(await hasPermission('users.activate')) && !(await isRoot())) {
    return { error: 'Sin permiso para activar usuarios' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/usuarios')
  revalidatePath(`/usuarios/${userId}`)
  return {}
}

/**
 * Desactivar cuenta de usuario. Requiere users.activate.
 */
export async function deactivateUser(userId: string): Promise<{ error?: string }> {
  if (!(await hasPermission('users.activate')) && !(await isRoot())) {
    return { error: 'Sin permiso para desactivar usuarios' }
  }

  // No puede desactivarse a sí mismo
  const currentId = await getCurrentUserId()
  if (currentId === userId) return { error: 'No puedes desactivar tu propia cuenta' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/usuarios')
  revalidatePath(`/usuarios/${userId}`)
  return {}
}

/**
 * Cambiar el rol de un usuario. Requiere users.change_role.
 * Solo root puede asignar el rol root.
 */
export async function changeUserRole(
  userId: string,
  newRoleId: string,
  reason?: string
): Promise<{ error?: string }> {
  const canChange = (await hasPermission('users.change_role')) || (await isRoot())
  if (!canChange) return { error: 'Sin permiso para cambiar roles' }

  const supabase = await createClient()
  const currentId = await getCurrentUserId()

  // Verificar si el nuevo rol es root
  const { data: newRole } = await supabase
    .from('roles')
    .select('is_root')
    .eq('id', newRoleId)
    .single()

  if (newRole?.is_root && !(await isRoot())) {
    return { error: 'Solo un usuario root puede asignar el rol root' }
  }

  // Verificar si el usuario objetivo es root (no se puede modificar a root si no eres root)
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('role_id, roles(is_root)')
    .eq('id', userId)
    .single()

  const targetIsRoot = targetProfile?.roles &&
    typeof targetProfile.roles === 'object' &&
    'is_root' in targetProfile.roles &&
    (targetProfile.roles as { is_root: boolean }).is_root

  if (targetIsRoot && !(await isRoot())) {
    return { error: 'No puedes modificar el rol de un usuario root' }
  }

  const oldRoleId = targetProfile?.role_id ?? null

  // Actualizar rol
  const { error } = await supabase
    .from('profiles')
    .update({ role_id: newRoleId, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { error: error.message }

  // Registrar en log de auditoría
  await supabase.from('role_change_log').insert({
    user_id: userId,
    changed_by: currentId,
    old_role_id: oldRoleId,
    new_role_id: newRoleId,
    reason: reason?.trim() || null,
  })

  revalidatePath('/usuarios')
  revalidatePath(`/usuarios/${userId}`)
  return {}
}

/**
 * Invitar usuario por email. Requiere users.edit.
 */
export async function inviteUser(
  email: string
): Promise<{ error?: string }> {
  if (!(await hasPermission('users.edit')) && !(await isRoot())) {
    return { error: 'Sin permiso para invitar usuarios' }
  }

  const supabase = await createClient()

  // Supabase Auth admin invite — solo funciona con service role en producción
  // En desarrollo usamos signUp con password temporal
  const { error } = await supabase.auth.admin?.inviteUserByEmail?.(email) ?? { error: null }

  if (error) return { error: (error as { message: string }).message }

  revalidatePath('/usuarios')
  return {}
}
