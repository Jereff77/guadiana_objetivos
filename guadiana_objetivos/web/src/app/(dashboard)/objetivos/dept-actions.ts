'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface DepartmentData {
  name: string
  description?: string
  manager_id?: string | null
}

export interface Department {
  id: string
  name: string
  description: string | null
  manager_id: string | null
  manager_name: string | null
  is_active: boolean
  created_at: string
  objective_count?: number
}

async function assertManage() {
  const supabase = await createClient()
  // Permite acceso con departamentos.manage O con objetivos.manage (retrocompatible)
  const [{ data: deptPerm }, { data: objPerm }] = await Promise.all([
    supabase.rpc('has_permission', { permission_key: 'departamentos.manage' }),
    supabase.rpc('has_permission', { permission_key: 'objetivos.manage' }),
  ])
  if (!deptPerm && !objPerm) redirect('/sin-acceso')
}

/**
 * Obtiene los departamentos según los permisos del usuario:
 * - objetivos.manage o departamentos.manage: todos los departamentos
 * - objetivos.view.assigned: solo departamentos con entregables asignados al usuario
 * - objetivos.view: todos los departamentos (solo lectura)
 */
export async function getDepartments(): Promise<Department[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Verificar permisos en orden de especificidad
  const [
    { data: canManage },
    { data: canViewAssigned },
    { data: canView },
  ] = await Promise.all([
    supabase.rpc('has_permission', { permission_key: 'objetivos.manage' }),
    supabase.rpc('has_permission', { permission_key: 'objetivos.view.assigned' }),
    supabase.rpc('has_permission', { permission_key: 'objetivos.view' }),
  ])

  // Si puede gestionar, retorna todos los departamentos
  if (canManage) {
    return fetchAllDepartments(supabase)
  }

  // Si solo puede ver asignados, filtrar por entregables
  if (canViewAssigned) {
    return getDepartmentsWithAssignments(supabase, user.id)
  }

  // Si puede ver todos (view), retorna todos los departamentos
  if (canView) {
    return fetchAllDepartments(supabase)
  }

  return []
}

/**
 * Obtiene todos los departamentos con información de manager
 */
async function fetchAllDepartments(supabase: any): Promise<Department[]> {
  const { data } = await supabase
    .from('departments')
    .select(`
      id, name, description, manager_id, is_active, created_at,
      profiles(full_name)
    `)
    .eq('is_active', true)
    .order('name')

  if (!data) return []

  return data.map((d: any) => {
    const mgr = d.profiles
    return {
      id: d.id,
      name: d.name,
      description: d.description,
      manager_id: d.manager_id,
      manager_name:
        mgr && typeof mgr === 'object' && 'full_name' in mgr
          ? (mgr as { full_name: string | null }).full_name
          : null,
      is_active: d.is_active,
      created_at: d.created_at,
    }
  })
}

/**
 * Obtiene solo los departamentos donde el usuario tiene entregables asignados
 */
async function getDepartmentsWithAssignments(supabase: any, userId: string): Promise<Department[]> {
  // Obtener departamentos únicos donde el usuario tiene entregables asignados
  const { data: deliverables } = await supabase
    .from('objective_deliverables')
    .select('objective_id!inner')
    .eq('assignee_id', userId)

  if (!deliverables || deliverables.length === 0) return []

  // Obtener los department_id de los objetivos
  const objectiveIds = deliverables.map((d: any) => d.objective_id)
  const { data: objectives } = await supabase
    .from('objectives')
    .select('department_id')
    .in('id', objectiveIds)

  if (!objectives || objectives.length === 0) return []

  const deptIds = [...new Set(objectives.map((o: any) => o.department_id))]

  // Obtener los departamentos
  const { data: departments } = await supabase
    .from('departments')
    .select(`
      id, name, description, manager_id, is_active, created_at,
      profiles(full_name)
    `)
    .in('id', deptIds)
    .eq('is_active', true)
    .order('name')

  if (!departments) return []

  return departments.map((d: any) => {
    const mgr = d.profiles
    return {
      id: d.id,
      name: d.name,
      description: d.description,
      manager_id: d.manager_id,
      manager_name:
        mgr && typeof mgr === 'object' && 'full_name' in mgr
          ? (mgr as { full_name: string | null }).full_name
          : null,
      is_active: d.is_active,
      created_at: d.created_at,
    }
  })
}

export async function createDepartment(data: DepartmentData): Promise<{ error?: string; id?: string }> {
  await assertManage()
  const supabase = await createClient()

  const { data: dept, error } = await supabase
    .from('departments')
    .insert({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      manager_id: data.manager_id || null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/objetivos')
  return { id: dept.id }
}

export async function updateDepartment(id: string, data: Partial<DepartmentData> & { is_active?: boolean }): Promise<{ error?: string }> {
  await assertManage()
  const supabase = await createClient()

  const { error } = await supabase
    .from('departments')
    .update({
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
      ...(data.manager_id !== undefined ? { manager_id: data.manager_id || null } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/objetivos')
  return {}
}

export async function deleteDepartment(id: string): Promise<{ error?: string }> {
  await assertManage()
  const supabase = await createClient()

  // Verificar que no tenga objetivos activos
  const { count } = await supabase
    .from('objectives')
    .select('id', { count: 'exact', head: true })
    .eq('department_id', id)
    .eq('status', 'active')

  if (count && count > 0) {
    return { error: `No se puede eliminar: tiene ${count} objetivo(s) activo(s)` }
  }

  const { error } = await supabase.from('departments').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/objetivos')
  return {}
}
