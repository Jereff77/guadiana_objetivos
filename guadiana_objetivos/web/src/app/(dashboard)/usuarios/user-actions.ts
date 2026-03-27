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

// ─── Cambiar contraseña ───────────────────────────────────────────────────────

/**
 * Cambiar la contraseña de un usuario.
 * El propio usuario puede cambiar la suya; admins con users.edit o root pueden cambiar la de cualquiera.
 */
export async function changeUserPassword(
  userId: string,
  newPassword: string
): Promise<{ error?: string }> {
  const currentId = await getCurrentUserId()
  const isSelf = currentId === userId
  const canChange = isSelf || (await hasPermission('users.edit')) || (await isRoot())

  if (!canChange) return { error: 'Sin permiso para cambiar la contraseña' }

  if (!newPassword || newPassword.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres' }
  }

  // Verificar que el objetivo no sea root a menos que el solicitante también sea root
  if (!isSelf) {
    const supabase = await createClient()
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('roles(is_root)')
      .eq('id', userId)
      .single()

    const targetIsRoot = targetProfile?.roles &&
      typeof targetProfile.roles === 'object' &&
      'is_root' in targetProfile.roles &&
      (targetProfile.roles as { is_root: boolean }).is_root

    if (targetIsRoot && !(await isRoot())) {
      return { error: 'No puedes cambiar la contraseña de un usuario root' }
    }
  }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    password: newPassword,
  })

  if (error) return { error: error.message }

  return {}
}

// ─── Crear usuario ────────────────────────────────────────────────────────────

export interface CreateUserData {
  email: string
  password: string
  fullName: string
  roleId?: string
}

/**
 * Crear un nuevo usuario desde el panel de administración.
 * Requiere permiso users.edit o rol root.
 * Usa el cliente admin (service_role) para crear el auth.user.
 */
export async function createUser(
  data: CreateUserData
): Promise<{ error?: string; userId?: string }> {
  const canCreate = (await hasPermission('users.edit')) || (await isRoot())
  if (!canCreate) return { error: 'Sin permiso para crear usuarios' }

  const email = data.email.trim().toLowerCase()
  const fullName = data.fullName.trim()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: 'Correo electrónico inválido' }
  if (!fullName || fullName.length < 2)
    return { error: 'El nombre debe tener al menos 2 caracteres' }
  if (!data.password || data.password.length < 8)
    return { error: 'La contraseña debe tener al menos 8 caracteres' }

  // Validar rol si se especificó
  if (data.roleId) {
    const supabase = await createClient()
    const { data: role } = await supabase
      .from('roles')
      .select('is_root, is_active')
      .eq('id', data.roleId)
      .single()

    if (!role) return { error: 'El rol seleccionado no existe' }
    if (!role.is_active) return { error: 'El rol no está activo' }
    if (role.is_root && !(await isRoot())) return { error: 'Solo root puede asignar el rol root' }
  }

  // Crear auth user con cliente admin (service_role)
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: data.password,
    email_confirm: true,  // el admin ya validó el email, no necesita verificación
  })

  if (authError) {
    if (authError.message.toLowerCase().includes('already'))
      return { error: 'Ya existe un usuario con ese correo electrónico' }
    return { error: authError.message }
  }

  const userId = authData.user.id

  // Actualizar profile con full_name y role_id usando el admin client
  // (el cliente anon puede ser bloqueado por RLS en INSERT)
  const { error: profileError } = await adminClient
    .from('profiles')
    .upsert({
      id: userId,
      full_name: fullName,
      ...(data.roleId ? { role_id: data.roleId } : {}),
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

  if (profileError) {
    console.error('[createUser] profile upsert failed:', profileError.message)
  }

  revalidatePath('/usuarios')
  return { userId }
}
