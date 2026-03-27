'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkIsRoot, checkPermission } from '@/lib/permissions'
import { redirect } from 'next/navigation'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ChatUser {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  chat_hidden: boolean
}

export interface ChatMessageFile {
  id: string
  storage_path: string
  file_name: string
  file_size: number
  mime_type: string
}

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  sender_name: string | null
  sender_avatar: string | null
  content: string | null
  edited_at: string | null
  deleted_at: string | null
  created_at: string
  files: ChatMessageFile[]
}

export interface ChatRoom {
  id: string
  type: 'direct' | 'group'
  name: string | null
  created_by: string | null
  updated_at: string
  other_user_id: string | null        // para type=direct
  other_user_name: string | null      // para type=direct
  other_user_avatar: string | null    // para type=direct
  last_message: string | null
  last_message_at: string | null
  my_role: 'member' | 'admin'
}

// ── Guard ─────────────────────────────────────────────────────────────────────

async function assertChatAccess() {
  const [isRoot, can] = await Promise.all([checkIsRoot(), checkPermission('chat.view')])
  if (!isRoot && !can) redirect('/sin-acceso')
}

async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return user.id
}

// ── Rooms ─────────────────────────────────────────────────────────────────────

export async function getRooms(): Promise<ChatRoom[]> {
  await assertChatAccess()
  const supabase = await createClient()
  const uid = await getCurrentUserId()

  const { data: memberships } = await supabase
    .from('chat_room_members')
    .select('room_id, role')
    .eq('user_id', uid)

  if (!memberships || memberships.length === 0) return []

  const roomIds = memberships.map(m => m.room_id)
  const roleMap: Record<string, 'member' | 'admin'> = {}
  for (const m of memberships) roleMap[m.room_id] = m.role as 'member' | 'admin'

  const { data: rooms } = await supabase
    .from('chat_rooms')
    .select('id, type, name, created_by, updated_at')
    .in('id', roomIds)
    .order('updated_at', { ascending: false })

  if (!rooms) return []

  const result: ChatRoom[] = []

  for (const r of rooms) {
    let otherUserId: string | null = null
    let otherUserName: string | null = null
    let otherUserAvatar: string | null = null

    if (r.type === 'direct') {
      const { data: otherMember } = await supabase
        .from('chat_room_members')
        .select('user_id, profiles(full_name, avatar_url)')
        .eq('room_id', r.id)
        .neq('user_id', uid)
        .single()

      if (otherMember) {
        otherUserId = otherMember.user_id
        const p = otherMember.profiles as { full_name: string | null; avatar_url: string | null } | null
        otherUserName = p?.full_name ?? null
        otherUserAvatar = p?.avatar_url ?? null
      }
    }

    // Último mensaje no eliminado
    const { data: lastMsg } = await supabase
      .from('chat_messages')
      .select('content, created_at, deleted_at')
      .eq('room_id', r.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    result.push({
      id: r.id,
      type: r.type as 'direct' | 'group',
      name: r.name,
      created_by: r.created_by,
      updated_at: r.updated_at,
      other_user_id: otherUserId,
      other_user_name: otherUserName,
      other_user_avatar: otherUserAvatar,
      last_message: lastMsg?.deleted_at ? 'Mensaje eliminado' : (lastMsg?.content ?? null),
      last_message_at: lastMsg?.created_at ?? null,
      my_role: roleMap[r.id] ?? 'member',
    })
  }

  return result
}

export async function getMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
  await assertChatAccess()
  const supabase = await createClient()

  const { data: messages } = await supabase
    .from('chat_messages')
    .select(`
      id, room_id, sender_id, content, edited_at, deleted_at, created_at,
      profiles!sender_id(full_name, avatar_url),
      chat_message_files(id, storage_path, file_name, file_size, mime_type)
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (!messages) return []

  return messages.map(m => {
    const p = m.profiles as { full_name: string | null; avatar_url: string | null } | null
    return {
      id: m.id,
      room_id: m.room_id,
      sender_id: m.sender_id,
      sender_name: p?.full_name ?? null,
      sender_avatar: p?.avatar_url ?? null,
      content: m.content,
      edited_at: m.edited_at,
      deleted_at: m.deleted_at,
      created_at: m.created_at,
      files: (m.chat_message_files as ChatMessageFile[]) ?? [],
    }
  })
}

// ── Mensajes ──────────────────────────────────────────────────────────────────

export async function sendMessage(
  roomId: string,
  content: string,
  files: { name: string; type: string; size: number; data: string }[] = []
): Promise<{ error?: string; messageId?: string }> {
  await assertChatAccess()
  const supabase = await createClient()
  const uid = await getCurrentUserId()

  if (!content.trim() && files.length === 0) return { error: 'El mensaje no puede estar vacío' }

  const { data: msg, error: msgErr } = await supabase
    .from('chat_messages')
    .insert({ room_id: roomId, sender_id: uid, content: content.trim() || null })
    .select('id')
    .single()

  if (msgErr || !msg) return { error: msgErr?.message ?? 'Error al enviar mensaje' }

  // Subir archivos
  if (files.length > 0) {
    const admin = createAdminClient()
    for (const file of files) {
      const buffer = Buffer.from(file.data, 'base64')
      const ext = file.name.split('.').pop()
      const path = `${roomId}/${msg.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

      const { error: uploadErr } = await admin.storage
        .from('chat-files')
        .upload(path, buffer, { contentType: file.type, upsert: false })

      if (uploadErr) continue

      await admin.from('chat_message_files').insert({
        message_id: msg.id,
        storage_path: path,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      })
    }
  }

  return { messageId: msg.id }
}

export async function editMessage(
  messageId: string,
  content: string
): Promise<{ error?: string }> {
  await assertChatAccess()
  const supabase = await createClient()
  const uid = await getCurrentUserId()

  if (!content.trim()) return { error: 'El contenido no puede estar vacío' }

  const { error } = await supabase
    .from('chat_messages')
    .update({ content: content.trim(), edited_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('sender_id', uid)
    .gt('created_at', new Date(Date.now() - 20 * 60 * 1000).toISOString())
    .is('deleted_at', null)

  if (error) return { error: error.message }
  return {}
}

export async function deleteMessage(messageId: string): Promise<{ error?: string }> {
  await assertChatAccess()
  const supabase = await createClient()
  const uid = await getCurrentUserId()

  const { error } = await supabase
    .from('chat_messages')
    .update({ deleted_at: new Date().toISOString(), content: null })
    .eq('id', messageId)
    .eq('sender_id', uid)
    .gt('created_at', new Date(Date.now() - 20 * 60 * 1000).toISOString())

  if (error) return { error: error.message }
  return {}
}

// ── Rooms directos ────────────────────────────────────────────────────────────

export async function getOrCreateDirectRoom(
  otherUserId: string
): Promise<{ error?: string; roomId?: string }> {
  await assertChatAccess()
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_or_create_direct_room', {
    other_user_id: otherUserId,
  })

  if (error) return { error: error.message }
  return { roomId: data as string }
}

// ── Grupos ────────────────────────────────────────────────────────────────────

export async function createGroup(
  name: string,
  memberIds: string[]
): Promise<{ error?: string; roomId?: string }> {
  await assertChatAccess()
  const supabase = await createClient()
  const uid = await getCurrentUserId()

  if (!name.trim()) return { error: 'El nombre del grupo es obligatorio' }

  const { data: room, error: roomErr } = await supabase
    .from('chat_rooms')
    .insert({ type: 'group', name: name.trim(), created_by: uid })
    .select('id')
    .single()

  if (roomErr || !room) return { error: roomErr?.message ?? 'Error al crear grupo' }

  // Creator como admin
  const membersToInsert = [
    { room_id: room.id, user_id: uid, role: 'admin' },
    ...memberIds
      .filter(id => id !== uid)
      .map(id => ({ room_id: room.id, user_id: id, role: 'member' })),
  ]

  const { error: membersErr } = await supabase
    .from('chat_room_members')
    .insert(membersToInsert)

  if (membersErr) return { error: membersErr.message }
  return { roomId: room.id }
}

export async function addGroupMember(
  roomId: string,
  userId: string
): Promise<{ error?: string }> {
  await assertChatAccess()
  const supabase = await createClient()

  const { error } = await supabase
    .from('chat_room_members')
    .insert({ room_id: roomId, user_id: userId, role: 'member' })

  if (error) return { error: error.message }
  return {}
}

export async function removeGroupMember(
  roomId: string,
  userId: string
): Promise<{ error?: string }> {
  await assertChatAccess()
  const supabase = await createClient()

  const { error } = await supabase
    .from('chat_room_members')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', userId)

  if (error) return { error: error.message }
  return {}
}

export async function setGroupAdmin(
  roomId: string,
  userId: string,
  isAdmin: boolean
): Promise<{ error?: string }> {
  await assertChatAccess()
  const supabase = await createClient()

  const { error } = await supabase
    .from('chat_room_members')
    .update({ role: isAdmin ? 'admin' : 'member' })
    .eq('room_id', roomId)
    .eq('user_id', userId)

  if (error) return { error: error.message }
  return {}
}

export async function updateGroupName(
  roomId: string,
  name: string
): Promise<{ error?: string }> {
  await assertChatAccess()
  const supabase = await createClient()

  if (!name.trim()) return { error: 'El nombre no puede estar vacío' }

  const { error } = await supabase
    .from('chat_rooms')
    .update({ name: name.trim() })
    .eq('id', roomId)

  if (error) return { error: error.message }
  return {}
}

export async function getGroupMembers(
  roomId: string
): Promise<{ id: string; full_name: string | null; avatar_url: string | null; role: string }[]> {
  await assertChatAccess()
  const supabase = await createClient()

  const { data } = await supabase
    .from('chat_room_members')
    .select('user_id, role, profiles(full_name, avatar_url)')
    .eq('room_id', roomId)

  if (!data) return []

  return data.map(m => {
    const p = m.profiles as { full_name: string | null; avatar_url: string | null } | null
    return {
      id: m.user_id,
      full_name: p?.full_name ?? null,
      avatar_url: p?.avatar_url ?? null,
      role: m.role,
    }
  })
}

// ── Archivos ──────────────────────────────────────────────────────────────────

export async function getFileSignedUrl(
  storagePath: string
): Promise<{ url?: string; error?: string }> {
  await assertChatAccess()
  const admin = createAdminClient()

  const { data, error } = await admin.storage
    .from('chat-files')
    .createSignedUrl(storagePath, 3600)

  if (error) return { error: error.message }
  return { url: data.signedUrl }
}

// ── Usuarios ──────────────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<ChatUser[]> {
  await assertChatAccess()
  const supabase = await createClient()
  const uid = await getCurrentUserId()

  // IDs de usuarios con quienes ya existe un room directo (incluir aunque estén ocultos)
  const { data: directRooms } = await supabase
    .from('chat_rooms')
    .select('id')
    .eq('type', 'direct')
    .in('id',
      (await supabase
        .from('chat_room_members')
        .select('room_id')
        .eq('user_id', uid)
      ).data?.map(m => m.room_id) ?? []
    )

  const directRoomIds = directRooms?.map(r => r.id) ?? []

  let existingContactIds: string[] = []
  if (directRoomIds.length > 0) {
    const { data: otherMembers } = await supabase
      .from('chat_room_members')
      .select('user_id')
      .in('room_id', directRoomIds)
      .neq('user_id', uid)
    existingContactIds = otherMembers?.map(m => m.user_id) ?? []
  }

  // Traer todos los usuarios activos excepto el actual
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, chat_hidden')
    .neq('id', uid)
    .eq('is_active', true)
    .order('full_name')

  if (!data) return []

  // Filtrar: excluir ocultos SALVO que ya exista conversación directa con ellos
  const filtered = data.filter(p =>
    !p.chat_hidden || existingContactIds.includes(p.id)
  )

  // Obtener emails via admin
  const admin = createAdminClient()
  const { data: authUsers } = await admin.auth.admin.listUsers()
  const emailMap: Record<string, string> = {}
  for (const u of authUsers?.users ?? []) emailMap[u.id] = u.email ?? ''

  return filtered.map(p => ({
    id: p.id,
    full_name: p.full_name,
    email: emailMap[p.id] ?? null,
    avatar_url: p.avatar_url,
    chat_hidden: p.chat_hidden,
  }))
}

export async function toggleChatHidden(): Promise<{ error?: string; hidden?: boolean }> {
  await assertChatAccess()
  const supabase = await createClient()
  const uid = await getCurrentUserId()

  const { data: profile } = await supabase
    .from('profiles')
    .select('chat_hidden')
    .eq('id', uid)
    .single()

  if (!profile) return { error: 'Perfil no encontrado' }

  const newValue = !profile.chat_hidden

  const { error } = await supabase
    .from('profiles')
    .update({ chat_hidden: newValue })
    .eq('id', uid)

  if (error) return { error: error.message }
  return { hidden: newValue }
}

export async function getCurrentUserChatHidden(): Promise<boolean> {
  const supabase = await createClient()
  const uid = await getCurrentUserId()

  const { data } = await supabase
    .from('profiles')
    .select('chat_hidden')
    .eq('id', uid)
    .single()

  return data?.chat_hidden ?? false
}
