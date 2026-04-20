'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface OrgPosition {
  id: string
  name: string
  sort_order: number
}

export interface OrgMember {
  id: string
  user_id: string
  position_id: string | null
  position_name: string | null
  full_name: string | null
  avatar_url: string | null
}

export type OrgDepartmentMember = OrgMember

export interface OrgArea {
  id: string
  department_id: string
  name: string
  position_x: number
  position_y: number
  responsible_id: string | null
  responsible_name: string | null
  responsible_avatar: string | null
  responsible_position_id: string | null
  responsible_position_name: string | null
  members: OrgMember[]
}

export interface OrgDepartment {
  id: string
  name: string
  color: string
  position_x: number
  position_y: number
  responsible_id: string | null
  responsible_name: string | null
  responsible_avatar: string | null
  responsible_position_id: string | null
  responsible_position_name: string | null
  members: OrgDepartmentMember[]
  areas: OrgArea[]
}

export interface PlatformUser {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export interface OrgDirectionArea {
  id: string
  direction_id: string
  name: string
  color: string
  position_x: number
  position_y: number
  responsible_id: string | null
  responsible_name: string | null
  responsible_avatar: string | null
  responsible_position_id: string | null
  responsible_position_name: string | null
  members: OrgMember[]
}

export interface OrgDirection {
  id: string
  name: string
  color: string
  position_x: number
  position_y: number
  responsible_id: string | null
  responsible_name: string | null
  responsible_avatar: string | null
  responsible_position_id: string | null
  responsible_position_name: string | null
  members: OrgMember[]
  areas: OrgDirectionArea[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function checkView(): Promise<void> {
  const supabase = await createClient()
  const { data: root } = await supabase.rpc('is_root')
  if (root) return
  const { data: ok } = await supabase.rpc('has_permission', { permission_key: 'organigrama.view' })
  if (!ok) redirect('/sin-acceso')
}

async function checkManage(): Promise<boolean> {
  const supabase = await createClient()
  const { data: root } = await supabase.rpc('is_root')
  if (root) return true
  const { data: ok } = await supabase.rpc('has_permission', { permission_key: 'organigrama.manage' })
  return ok === true
}

// ─── Puestos ──────────────────────────────────────────────────────────────────

export async function getPositions(): Promise<OrgPosition[]> {
  await checkView()
  const supabase = await createClient()
  const { data } = await supabase
    .from('org_positions')
    .select('id, name, sort_order')
    .order('sort_order')
    .order('name')
  return (data ?? []) as OrgPosition[]
}

export async function createPosition(name: string): Promise<{ error?: string; id?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  if (!name.trim()) return { error: 'El nombre es requerido' }
  const supabase = await createClient()
  const { data: max } = await supabase.from('org_positions').select('sort_order').order('sort_order', { ascending: false }).limit(1).single()
  const { data, error } = await supabase
    .from('org_positions')
    .insert({ name: name.trim(), sort_order: (max?.sort_order ?? 0) + 1 })
    .select('id')
    .single()
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return { id: data.id }
}

export async function updatePosition(id: string, name: string): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  if (!name.trim()) return { error: 'El nombre es requerido' }
  const supabase = await createClient()
  const { error } = await supabase.from('org_positions').update({ name: name.trim() }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}

export async function deletePosition(id: string): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  // Verificar que no esté en uso
  const { count } = await supabase.from('org_members').select('id', { count: 'exact', head: true }).eq('position_id', id)
  if ((count ?? 0) > 0) return { error: 'Este puesto está asignado a uno o más miembros. Reasígnalos antes de eliminarlo.' }
  const { error } = await supabase.from('org_positions').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}

// ─── Lectura ──────────────────────────────────────────────────────────────────

export async function getOrganigrama(): Promise<OrgDepartment[]> {
  await checkView()
  const supabase = await createClient()

  const { data: departments } = await supabase
    .from('org_departments')
    .select('id, name, color, position_x, position_y, responsible_id, responsible_position_id, profiles(full_name, avatar_url), org_positions(name)')
    .order('created_at')

  if (!departments || departments.length === 0) return []

  const { data: areas } = await supabase
    .from('org_areas')
    .select('id, department_id, name, position_x, position_y, responsible_id, responsible_position_id, profiles(full_name, avatar_url), org_positions(name)')
    .in('department_id', departments.map(d => d.id))
    .order('created_at')

  const areaIds = (areas ?? []).map(a => a.id)

  const { data: members } = areaIds.length > 0
    ? await supabase
        .from('org_members')
        .select('id, area_id, user_id, position_id, profiles(full_name, avatar_url), org_positions(name)')
        .in('area_id', areaIds)
        .order('created_at')
    : { data: [] }

  const deptIds = departments.map(d => d.id)
  const { data: deptMembers } = await supabase
    .from('org_department_members')
    .select('id, department_id, user_id, position_id, profiles(full_name, avatar_url), org_positions(name)')
    .in('department_id', deptIds)
    .order('created_at')

  function mapMember(m: unknown): OrgMember {
    const rm = m as {
      id: string; user_id: string; position_id: string | null;
      profiles: { full_name: string | null; avatar_url: string | null } | null;
      org_positions: { name: string } | null
    }
    return {
      id: rm.id,
      user_id: rm.user_id,
      position_id: rm.position_id,
      position_name: rm.org_positions?.name ?? null,
      full_name: rm.profiles?.full_name ?? null,
      avatar_url: rm.profiles?.avatar_url ?? null,
    }
  }

  return departments.map(dept => {
    const raw = dept as unknown as {
      id: string; name: string; color: string; position_x: number; position_y: number;
      responsible_id: string | null; responsible_position_id: string | null;
      profiles: { full_name: string | null; avatar_url: string | null } | null;
      org_positions: { name: string } | null
    }
    return {
      id: raw.id,
      name: raw.name,
      color: raw.color,
      position_x: raw.position_x,
      position_y: raw.position_y,
      responsible_id: raw.responsible_id,
      responsible_name: raw.profiles?.full_name ?? null,
      responsible_avatar: raw.profiles?.avatar_url ?? null,
      responsible_position_id: raw.responsible_position_id,
      responsible_position_name: raw.org_positions?.name ?? null,
      members: (deptMembers ?? [])
        .filter(m => (m as { department_id: string }).department_id === dept.id)
        .map(mapMember),
      areas: (areas ?? [])
        .filter(a => a.department_id === dept.id)
        .map(area => {
          const ra = area as unknown as {
            id: string; department_id: string; name: string; position_x: number; position_y: number;
            responsible_id: string | null; responsible_position_id: string | null;
            profiles: { full_name: string | null; avatar_url: string | null } | null;
            org_positions: { name: string } | null
          }
          return {
            id: ra.id,
            department_id: ra.department_id,
            name: ra.name,
            position_x: ra.position_x,
            position_y: ra.position_y,
            responsible_id: ra.responsible_id,
            responsible_name: ra.profiles?.full_name ?? null,
            responsible_avatar: ra.profiles?.avatar_url ?? null,
            responsible_position_id: ra.responsible_position_id,
            responsible_position_name: ra.org_positions?.name ?? null,
            members: (members ?? [])
              .filter(m => (m as { area_id: string }).area_id === area.id)
              .map(mapMember),
          }
        }),
    }
  })
}

export async function getPlatformUsers(): Promise<PlatformUser[]> {
  await checkView()
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('is_active', true)
    .order('full_name')
  return (data ?? []) as PlatformUser[]
}

// ─── Departamentos ────────────────────────────────────────────────────────────

export async function createDepartment(
  name: string,
  color: string,
  responsibleId?: string
): Promise<{ error?: string; id?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso para gestionar el organigrama' }
  if (!name.trim()) return { error: 'El nombre es requerido' }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('org_departments')
    .insert({ name: name.trim(), color, responsible_id: responsibleId ?? null })
    .select('id')
    .single()
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return { id: data.id }
}

export async function updateDepartment(
  id: string,
  updates: { name?: string; color?: string; responsible_id?: string | null; responsible_position_id?: string | null }
): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso para gestionar el organigrama' }
  const supabase = await createClient()
  const payload: Record<string, unknown> = {}
  if (updates.name !== undefined) payload.name = updates.name.trim()
  if (updates.color !== undefined) payload.color = updates.color
  if ('responsible_id' in updates) payload.responsible_id = updates.responsible_id
  if ('responsible_position_id' in updates) payload.responsible_position_id = updates.responsible_position_id
  const { error } = await supabase.from('org_departments').update(payload).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}

export async function updateDepartmentPosition(id: string, x: number, y: number): Promise<{ error?: string }> {
  if (!(await checkManage())) return {}
  const supabase = await createClient()
  await supabase.from('org_departments').update({ position_x: x, position_y: y }).eq('id', id)
  return {}
}

export async function deleteDepartment(id: string): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso para gestionar el organigrama' }
  const supabase = await createClient()
  const { error } = await supabase.from('org_departments').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}

// ─── Áreas ────────────────────────────────────────────────────────────────────

export async function createArea(departmentId: string, name: string): Promise<{ error?: string; id?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso para gestionar el organigrama' }
  if (!name.trim()) return { error: 'El nombre es requerido' }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('org_areas')
    .insert({ department_id: departmentId, name: name.trim() })
    .select('id')
    .single()
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return { id: data.id }
}

export async function updateArea(id: string, name: string): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { error } = await supabase.from('org_areas').update({ name: name.trim() }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}

export async function updateAreaPosition(id: string, x: number, y: number): Promise<{ error?: string }> {
  if (!(await checkManage())) return {}
  const supabase = await createClient()
  await supabase.from('org_areas').update({ position_x: x, position_y: y }).eq('id', id)
  return {}
}

export async function updateAreaResponsible(
  areaId: string,
  userId: string | null,
  positionId: string | null = null
): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('org_areas')
    .update({ responsible_id: userId, responsible_position_id: userId ? positionId : null })
    .eq('id', areaId)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}

export async function deleteArea(id: string): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { error } = await supabase.from('org_areas').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}

// ─── Miembros ─────────────────────────────────────────────────────────────────

export async function assignMember(
  areaId: string,
  userId: string,
  positionId: string
): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso para gestionar el organigrama' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('org_members')
    .insert({ area_id: areaId, user_id: userId, position_id: positionId })
  if (error) {
    if (error.code === '23505') return { error: 'El usuario ya está asignado a esta área' }
    return { error: error.message }
  }
  revalidatePath('/organigrama')
  return {}
}

export async function updateMemberPosition(memberId: string, positionId: string): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { error } = await supabase.from('org_members').update({ position_id: positionId }).eq('id', memberId)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}

export async function removeMember(memberId: string): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { error } = await supabase.from('org_members').delete().eq('id', memberId)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}

// ─── Equipo directo de departamento ──────────────────────────────────────────

export async function assignDepartmentMember(
  departmentId: string,
  userId: string,
  positionId: string
): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso para gestionar el organigrama' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('org_department_members')
    .insert({ department_id: departmentId, user_id: userId, position_id: positionId })
  if (error) {
    if (error.code === '23505') return { error: 'El usuario ya está asignado a este departamento' }
    return { error: error.message }
  }
  revalidatePath('/organigrama')
  return {}
}

export async function updateDepartmentMemberPosition(memberId: string, positionId: string): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { error } = await supabase.from('org_department_members').update({ position_id: positionId }).eq('id', memberId)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}

export async function removeDepartmentMember(memberId: string): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { error } = await supabase.from('org_department_members').delete().eq('id', memberId)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}

// ─── Dirección ────────────────────────────────────────────────────────────────

export async function getDirection(): Promise<OrgDirection | null> {
  await checkView()
  const supabase = await createClient()

  const { data: dir } = await supabase
    .from('org_direction')
    .select('id, name, color, position_x, position_y, responsible_id, responsible_position_id, profiles(full_name, avatar_url), org_positions(name)')
    .limit(1)
    .maybeSingle()

  if (!dir) return null

  const { data: dirMembers } = await supabase
    .from('org_direction_members')
    .select('id, user_id, position_id, profiles(full_name, avatar_url), org_positions(name)')
    .eq('direction_id', dir.id)
    .order('created_at')

  const { data: areas } = await supabase
    .from('org_direction_areas')
    .select('id, direction_id, name, color, position_x, position_y, responsible_id, responsible_position_id, profiles(full_name, avatar_url), org_positions(name)')
    .eq('direction_id', dir.id)
    .order('created_at')

  const areaIds = (areas ?? []).map(a => a.id)
  const { data: areaMembers } = areaIds.length > 0
    ? await supabase
        .from('org_direction_area_members')
        .select('id, area_id, user_id, position_id, profiles(full_name, avatar_url), org_positions(name)')
        .in('area_id', areaIds)
        .order('created_at')
    : { data: [] }

  function mapMember(m: unknown): OrgMember {
    const rm = m as {
      id: string; user_id: string; position_id: string | null;
      profiles: { full_name: string | null; avatar_url: string | null } | null;
      org_positions: { name: string } | null
    }
    return {
      id: rm.id, user_id: rm.user_id, position_id: rm.position_id,
      position_name: rm.org_positions?.name ?? null,
      full_name: rm.profiles?.full_name ?? null,
      avatar_url: rm.profiles?.avatar_url ?? null,
    }
  }

  const raw = dir as unknown as {
    id: string; name: string; color: string; position_x: number; position_y: number;
    responsible_id: string | null; responsible_position_id: string | null;
    profiles: { full_name: string | null; avatar_url: string | null } | null;
    org_positions: { name: string } | null
  }

  return {
    id: raw.id,
    name: raw.name,
    color: raw.color,
    position_x: raw.position_x,
    position_y: raw.position_y,
    responsible_id: raw.responsible_id,
    responsible_name: raw.profiles?.full_name ?? null,
    responsible_avatar: raw.profiles?.avatar_url ?? null,
    responsible_position_id: raw.responsible_position_id,
    responsible_position_name: raw.org_positions?.name ?? null,
    members: (dirMembers ?? []).map(mapMember),
    areas: (areas ?? []).map(area => {
      const ra = area as unknown as {
        id: string; direction_id: string; name: string; color: string; position_x: number; position_y: number;
        responsible_id: string | null; responsible_position_id: string | null;
        profiles: { full_name: string | null; avatar_url: string | null } | null;
        org_positions: { name: string } | null
      }
      return {
        id: ra.id, direction_id: ra.direction_id,
        name: ra.name, color: ra.color,
        position_x: ra.position_x, position_y: ra.position_y,
        responsible_id: ra.responsible_id,
        responsible_name: ra.profiles?.full_name ?? null,
        responsible_avatar: ra.profiles?.avatar_url ?? null,
        responsible_position_id: ra.responsible_position_id,
        responsible_position_name: ra.org_positions?.name ?? null,
        members: (areaMembers ?? [])
          .filter(m => (m as { area_id: string }).area_id === area.id)
          .map(mapMember),
      }
    }),
  }
}

export async function createOrUpdateDirection(
  name: string, color: string, responsibleId: string | null, responsiblePositionId: string | null
): Promise<{ error?: string; id?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { data: existing } = await supabase.from('org_direction').select('id').limit(1).maybeSingle()
  if (existing) {
    const { error } = await supabase.from('org_direction').update({
      name, color, responsible_id: responsibleId, responsible_position_id: responsiblePositionId,
    }).eq('id', existing.id)
    if (error) return { error: error.message }
    revalidatePath('/organigrama')
    return { id: existing.id }
  }
  const { data, error } = await supabase
    .from('org_direction')
    .insert({ name, color, responsible_id: responsibleId, responsible_position_id: responsiblePositionId })
    .select('id').single()
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return { id: data.id }
}

export async function updateDirectionPosition(id: string, x: number, y: number): Promise<void> {
  if (!(await checkManage())) return
  const supabase = await createClient()
  await supabase.from('org_direction').update({ position_x: x, position_y: y }).eq('id', id)
}

export async function assignDirectionMember(directionId: string, userId: string, positionId: string): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { error } = await supabase.from('org_direction_members').insert({ direction_id: directionId, user_id: userId, position_id: positionId })
  if (error) {
    if (error.code === '23505') return { error: 'El usuario ya está en el equipo de la Dirección' }
    return { error: error.message }
  }
  revalidatePath('/organigrama')
  return {}
}

export async function updateDirectionMemberPosition(memberId: string, positionId: string): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { error } = await supabase.from('org_direction_members').update({ position_id: positionId }).eq('id', memberId)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}

export async function removeDirectionMember(memberId: string): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { error } = await supabase.from('org_direction_members').delete().eq('id', memberId)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}

export async function createDirectionArea(directionId: string, name: string, color: string): Promise<{ error?: string; id?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('org_direction_areas')
    .insert({ direction_id: directionId, name, color })
    .select('id').single()
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return { id: data.id }
}

export async function updateDirectionArea(areaId: string, updates: { name?: string; color?: string; responsible_id?: string | null; responsible_position_id?: string | null }): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { error } = await supabase.from('org_direction_areas').update(updates).eq('id', areaId)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}

export async function updateDirectionAreaPosition(id: string, x: number, y: number): Promise<void> {
  if (!(await checkManage())) return
  const supabase = await createClient()
  await supabase.from('org_direction_areas').update({ position_x: x, position_y: y }).eq('id', id)
}

export async function deleteDirectionArea(id: string): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { error } = await supabase.from('org_direction_areas').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}

export async function assignDirectionAreaMember(areaId: string, userId: string, positionId: string): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { error } = await supabase.from('org_direction_area_members').insert({ area_id: areaId, user_id: userId, position_id: positionId })
  if (error) {
    if (error.code === '23505') return { error: 'El usuario ya está en esta área' }
    return { error: error.message }
  }
  revalidatePath('/organigrama')
  return {}
}

export async function updateDirectionAreaMemberPosition(memberId: string, positionId: string): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { error } = await supabase.from('org_direction_area_members').update({ position_id: positionId }).eq('id', memberId)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}

export async function removeDirectionAreaMember(memberId: string): Promise<{ error?: string }> {
  if (!(await checkManage())) return { error: 'Sin permiso' }
  const supabase = await createClient()
  const { error } = await supabase.from('org_direction_area_members').delete().eq('id', memberId)
  if (error) return { error: error.message }
  revalidatePath('/organigrama')
  return {}
}
