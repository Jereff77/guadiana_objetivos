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

export async function getDepartments(): Promise<Department[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('departments')
    .select(`
      id, name, description, manager_id, is_active, created_at,
      profiles(full_name)
    `)
    .order('name')

  if (!data) return []

  return data.map((d) => {
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
