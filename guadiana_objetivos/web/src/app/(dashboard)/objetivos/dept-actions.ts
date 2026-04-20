'use server'

import { createClient } from '@/lib/supabase/server'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface OrgDeptForObjectives {
  id: string
  name: string
  color: string
  responsible_id: string | null
  responsible_name: string | null
  responsible_position_name: string | null
  userCanManage: boolean        // puede crear/editar objetivos
  userCanCreateDeliverables: boolean  // puede crear entregables
  userRole: 'direction' | 'dept_responsible' | 'area_responsible' | 'member' | 'none'
}

export interface AssignableUser {
  id: string
  full_name: string | null
  avatar_url: string | null
  position_name: string | null
  source: 'dept_responsible' | 'dept_member' | 'area_responsible' | 'area_member'
  area_id: string | null
  area_name: string | null
}

export interface OrgContext {
  userId: string
  isRoot: boolean
  isDirectionResponsible: boolean
  responsibleDeptIds: string[]
  responsibleAreaIds: string[]
  responsibleAreaDeptIds: string[]
  memberDeptIds: string[]
  memberAreaDeptIds: string[]
}

// ─── OrgContext ───────────────────────────────────────────────────────────────

export async function getOrgContext(): Promise<OrgContext | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [
    { data: root },
    { data: direction },
    { data: responsibleDepts },
    { data: responsibleAreas },
    { data: deptMemberships },
    { data: areaMemberships },
  ] = await Promise.all([
    supabase.rpc('is_root'),
    supabase.from('org_direction').select('responsible_id').limit(1).maybeSingle(),
    supabase.from('org_departments').select('id').eq('responsible_id', user.id),
    supabase.from('org_areas').select('id, department_id').eq('responsible_id', user.id),
    supabase.from('org_department_members').select('department_id').eq('user_id', user.id),
    supabase.from('org_members').select('area_id, org_areas(department_id)').eq('user_id', user.id),
  ])

  return {
    userId: user.id,
    isRoot: root === true,
    isDirectionResponsible: direction?.responsible_id === user.id,
    responsibleDeptIds: (responsibleDepts ?? []).map((d) => d.id),
    responsibleAreaIds: (responsibleAreas ?? []).map((a) => a.id),
    responsibleAreaDeptIds: [
      ...new Set((responsibleAreas ?? []).map((a) => a.department_id).filter(Boolean)),
    ] as string[],
    memberDeptIds: (deptMemberships ?? []).map((m) => m.department_id),
    memberAreaDeptIds: [
      ...new Set(
        (areaMemberships ?? [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((m) => ((m as any).org_areas as { department_id: string } | null)?.department_id)
          .filter(Boolean)
      ),
    ] as string[],
  }
}

// ─── Departamentos accesibles por el usuario ──────────────────────────────────

export async function getDepartmentsForUser(): Promise<OrgDeptForObjectives[]> {
  const supabase = await createClient()
  const ctx = await getOrgContext()
  if (!ctx) return []

  // Obtener todos los departamentos accesibles (RLS filtra automáticamente via obj_select)
  const { data: depts } = await supabase
    .from('org_departments')
    .select(`
      id, name, color, responsible_id,
      profiles!org_departments_responsible_id_fkey(full_name, avatar_url),
      org_positions!org_departments_responsible_position_id_fkey(name)
    `)
    .order('name')

  if (!depts) return []

  const canManageAll = ctx.isRoot || ctx.isDirectionResponsible

  return depts.map((d: any) => {
    const resp = d.profiles as { full_name: string | null; avatar_url: string | null } | null
    const pos = d.org_positions as { name: string } | null

    const isDeptResponsible = ctx.responsibleDeptIds.includes(d.id)
    const isAreaResponsibleHere = ctx.responsibleAreaDeptIds.includes(d.id)
    const isMemberHere = ctx.memberDeptIds.includes(d.id) || ctx.memberAreaDeptIds.includes(d.id)

    let userRole: OrgDeptForObjectives['userRole'] = 'none'
    if (canManageAll) userRole = 'direction'
    else if (isDeptResponsible) userRole = 'dept_responsible'
    else if (isAreaResponsibleHere) userRole = 'area_responsible'
    else if (isMemberHere) userRole = 'member'

    const userCanManage = canManageAll || isDeptResponsible
    const userCanCreateDeliverables = userCanManage || isAreaResponsibleHere

    return {
      id: d.id,
      name: d.name,
      color: d.color ?? '#6366f1',
      responsible_id: d.responsible_id,
      responsible_name: resp?.full_name ?? null,
      responsible_position_name: pos?.name ?? null,
      userCanManage,
      userCanCreateDeliverables,
      userRole,
    }
  })
}

// ─── Usuarios asignables dentro de un org_department ─────────────────────────

export async function getAssignableUsersForDept(orgDeptId: string): Promise<AssignableUser[]> {
  const supabase = await createClient()

  const users: AssignableUser[] = []
  const seen = new Set<string>()

  function addUser(
    id: string,
    full_name: string | null,
    avatar_url: string | null,
    position_name: string | null,
    source: AssignableUser['source'],
    area_id: string | null = null,
    area_name: string | null = null,
  ) {
    if (!seen.has(id)) {
      seen.add(id)
      users.push({ id, full_name, avatar_url, position_name, source, area_id, area_name })
    }
  }

  // 1. Responsable del departamento
  const { data: dept } = await supabase
    .from('org_departments')
    .select(`
      responsible_id,
      profiles!org_departments_responsible_id_fkey(full_name, avatar_url),
      org_positions!org_departments_responsible_position_id_fkey(name)
    `)
    .eq('id', orgDeptId)
    .maybeSingle()

  if (dept?.responsible_id) {
    const p = (dept as any).profiles as { full_name: string | null; avatar_url: string | null } | null
    const pos = (dept as any).org_positions as { name: string } | null
    addUser(dept.responsible_id, p?.full_name ?? null, p?.avatar_url ?? null, pos?.name ?? null, 'dept_responsible')
  }

  // 2. Miembros directos del departamento
  const { data: deptMembers } = await supabase
    .from('org_department_members')
    .select(`
      user_id,
      profiles!org_department_members_user_id_fkey(full_name, avatar_url),
      org_positions!org_department_members_position_id_fkey(name)
    `)
    .eq('department_id', orgDeptId)

  for (const m of deptMembers ?? []) {
    const p = (m as any).profiles as { full_name: string | null; avatar_url: string | null } | null
    const pos = (m as any).org_positions as { name: string } | null
    addUser(m.user_id, p?.full_name ?? null, p?.avatar_url ?? null, pos?.name ?? null, 'dept_member')
  }

  // 3. Responsables y miembros de áreas del departamento
  const { data: areas } = await supabase
    .from('org_areas')
    .select(`
      id, name, responsible_id,
      profiles!org_areas_responsible_id_fkey(full_name, avatar_url),
      org_positions!org_areas_responsible_position_id_fkey(name),
      org_members(
        user_id,
        profiles!org_members_user_id_fkey(full_name, avatar_url),
        org_positions!org_members_position_id_fkey(name)
      )
    `)
    .eq('department_id', orgDeptId)

  for (const area of areas ?? []) {
    const areaId = (area as any).id as string
    const areaName = (area as any).name as string | null
    if (area.responsible_id) {
      const p = (area as any).profiles as { full_name: string | null; avatar_url: string | null } | null
      const pos = (area as any).org_positions as { name: string } | null
      addUser(area.responsible_id, p?.full_name ?? null, p?.avatar_url ?? null, pos?.name ?? null, 'area_responsible', areaId, areaName)
    }
    for (const m of ((area as any).org_members as any[]) ?? []) {
      const p = m.profiles as { full_name: string | null; avatar_url: string | null } | null
      const pos = m.org_positions as { name: string } | null
      addUser(m.user_id, p?.full_name ?? null, p?.avatar_url ?? null, pos?.name ?? null, 'area_member', areaId, areaName)
    }
  }

  return users
}
