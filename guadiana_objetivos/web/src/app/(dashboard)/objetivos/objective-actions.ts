'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAssignableUsersForDept } from './dept-actions'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface ObjectiveData {
  title: string
  description?: string
  month: number
  year: number
  weight: number
  target_value?: number | null
  evidence_type: 'document' | 'photo' | 'text' | 'checklist'
  checklist_id?: string | null
  assignee_id?: string | null
}

export interface Objective {
  id: string
  org_department_id: string
  title: string
  description: string | null
  month: number
  year: number
  weight: number
  target_value: number | null
  evidence_type: string
  checklist_id: string | null
  status: string
  created_by: string | null
  created_at: string
  completion_pct?: number
  assignee_id: string | null
  assignee_name?: string | null
}

export interface ObjectiveDeliverable {
  id: string
  objective_id: string
  title: string
  description: string | null
  due_date: string | null
  assignee_id: string | null
  assignee_name: string | null
  status: string
  created_at: string
  submitted_at: string | null
  late_approved_by: string | null
  late_approved_at: string | null
}

export interface UserWithObjectives {
  userId: string
  userName: string | null
  avatarUrl: string | null
  positionName: string | null
  source: string
  area_id: string | null
  area_name: string | null
  objectives: (Objective & { deliverables_count: number; approved_count: number; deliverables: ObjectiveDeliverable[] })[]
  completionPct: number
  incentiveRecord: {
    id: string
    schema_id: string | null
    calculated_amount: number
    status: string
  } | null
}

// ─── Lectura ──────────────────────────────────────────────────────────────────

export async function getObjectivesByDept(
  orgDeptId: string,
  month?: number,
  year?: number
): Promise<Objective[]> {
  const supabase = await createClient()

  let query = supabase
    .from('objectives')
    .select('*')
    .eq('org_department_id', orgDeptId)
    .order('weight', { ascending: false })

  if (month) query = query.eq('month', month)
  if (year) query = query.eq('year', year)

  const { data } = await query
  return data ?? []
}

export async function getObjective(id: string): Promise<Objective | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('objectives')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

// ─── Escritura ────────────────────────────────────────────────────────────────

export async function createObjective(
  orgDeptId: string,
  data: ObjectiveData
): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: obj, error } = await supabase
    .from('objectives')
    .insert({
      org_department_id: orgDeptId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      month: data.month,
      year: data.year,
      weight: data.weight,
      target_value: data.target_value ?? null,
      evidence_type: data.evidence_type,
      checklist_id: data.checklist_id || null,
      created_by: user.id,
      assignee_id: data.assignee_id ?? null,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un objetivo con ese título en este período' }
    if (error.code === '42501') return { error: 'No tienes permiso para crear objetivos en este departamento' }
    return { error: error.message }
  }

  revalidatePath('/objetivos')
  revalidatePath(`/objetivos/${orgDeptId}`)
  return { id: obj.id }
}

export async function updateObjective(
  id: string,
  data: Partial<ObjectiveData>
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('objectives')
    .update({
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
      ...(data.month !== undefined ? { month: data.month } : {}),
      ...(data.year !== undefined ? { year: data.year } : {}),
      ...(data.weight !== undefined ? { weight: data.weight } : {}),
      ...(data.target_value !== undefined ? { target_value: data.target_value } : {}),
      ...(data.evidence_type !== undefined ? { evidence_type: data.evidence_type } : {}),
      ...(data.checklist_id !== undefined ? { checklist_id: data.checklist_id || null } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    if (error.code === '42501') return { error: 'No tienes permiso para editar este objetivo' }
    return { error: error.message }
  }

  const { data: obj } = await supabase.from('objectives').select('org_department_id').eq('id', id).single()
  revalidatePath('/objetivos')
  if (obj) revalidatePath(`/objetivos/${obj.org_department_id}`)
  return {}
}

export async function deleteObjective(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: obj } = await supabase
    .from('objectives')
    .select('org_department_id, status')
    .eq('id', id)
    .single()

  if (obj?.status === 'closed') {
    return { error: 'No se puede eliminar un objetivo cerrado' }
  }

  const { error } = await supabase.from('objectives').delete().eq('id', id)
  if (error) {
    if (error.code === '42501') return { error: 'No tienes permiso para eliminar este objetivo' }
    return { error: error.message }
  }

  revalidatePath('/objetivos')
  if (obj) revalidatePath(`/objetivos/${obj.org_department_id}`)
  return {}
}

export async function cloneObjectives(
  orgDeptId: string,
  fromMonth: number,
  fromYear: number,
  toMonth: number,
  toYear: number
): Promise<{ error?: string; count?: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: source } = await supabase
    .from('objectives')
    .select('title, description, weight, target_value, evidence_type, checklist_id')
    .eq('org_department_id', orgDeptId)
    .eq('month', fromMonth)
    .eq('year', fromYear)

  if (!source || source.length === 0) {
    return { error: 'No hay objetivos en el período origen' }
  }

  const clones = source.map((o) => ({
    org_department_id: orgDeptId,
    title: o.title,
    description: o.description,
    month: toMonth,
    year: toYear,
    weight: o.weight,
    target_value: o.target_value,
    evidence_type: o.evidence_type,
    checklist_id: o.checklist_id,
    created_by: user.id,
  }))

  const { error } = await supabase.from('objectives').insert(clones)
  if (error) {
    if (error.code === '42501') return { error: 'No tienes permiso para crear objetivos en este departamento' }
    return { error: error.message }
  }

  revalidatePath('/objetivos')
  revalidatePath(`/objetivos/${orgDeptId}`)
  return { count: clones.length }
}

export async function closeObjectivesPeriod(
  orgDeptId: string,
  month: number,
  year: number
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('objectives')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('org_department_id', orgDeptId)
    .eq('month', month)
    .eq('year', year)
    .eq('status', 'active')

  if (error) {
    if (error.code === '42501') return { error: 'No tienes permiso para cerrar objetivos en este departamento' }
    return { error: error.message }
  }

  revalidatePath('/objetivos')
  revalidatePath(`/objetivos/${orgDeptId}`)
  return {}
}

export async function calculateObjectiveProgress(objectiveId: string): Promise<number> {
  const supabase = await createClient()

  const { data: obj } = await supabase
    .from('objectives')
    .select('org_department_id, month, year')
    .eq('id', objectiveId)
    .single()

  if (!obj) return 0

  const { data: deliverables } = await supabase
    .from('objective_deliverables')
    .select('status')
    .eq('objective_id', objectiveId)

  if (!deliverables || deliverables.length === 0) return 0

  const approved = deliverables.filter((d) => d.status === 'approved').length
  const pct = Math.round((approved / deliverables.length) * 100)

  await supabase.from('objective_progress').upsert(
    {
      objective_id: objectiveId,
      month: obj.month,
      year: obj.year,
      completion_pct: pct,
      calculated_at: new Date().toISOString(),
    },
    { onConflict: 'objective_id,month,year' }
  )

  return pct
}

export async function getObjectivesGroupedByUser(
  orgDeptId: string,
  month: number,
  year: number
): Promise<UserWithObjectives[]> {
  const supabase = await createClient()

  // 1. Obtener todos los usuarios asignables del depto
  const assignableUsers = await getAssignableUsersForDept(orgDeptId)

  // 2. Obtener todos los objetivos del período con nombre del asignado
  const { data: rawObjectives } = await supabase
    .from('objectives')
    .select('*, profiles!objectives_assignee_id_fkey(full_name)')
    .eq('org_department_id', orgDeptId)
    .eq('month', month)
    .eq('year', year)

  const objectives: (Objective & { deliverables_count: number; approved_count: number; deliverables: ObjectiveDeliverable[] })[] =
    await Promise.all(
      (rawObjectives ?? []).map(async (obj) => {
        const assigneeProfile = (obj as any).profiles as { full_name: string | null } | null
        const { data: delivs } = await supabase
          .from('objective_deliverables')
          .select('id, objective_id, title, description, due_date, assignee_id, status, created_at, submitted_at, late_approved_by, late_approved_at')
          .eq('objective_id', obj.id)

        const deliverablesArr = delivs ?? []
        const approved_count = deliverablesArr.filter((d) => d.status === 'approved').length
        const obj_completion_pct = deliverablesArr.length > 0
          ? Math.round((approved_count / deliverablesArr.length) * 100)
          : 0

        const deliverables: ObjectiveDeliverable[] = deliverablesArr.map((d) => ({
          id: d.id,
          objective_id: d.objective_id,
          title: d.title,
          description: d.description,
          due_date: d.due_date,
          assignee_id: d.assignee_id,
          assignee_name: assigneeProfile?.full_name ?? null,
          status: d.status,
          created_at: d.created_at,
          submitted_at: d.submitted_at,
          late_approved_by: d.late_approved_by,
          late_approved_at: d.late_approved_at,
        }))

        return {
          id: obj.id,
          org_department_id: obj.org_department_id,
          title: obj.title,
          description: obj.description,
          month: obj.month,
          year: obj.year,
          weight: obj.weight,
          target_value: obj.target_value,
          evidence_type: obj.evidence_type,
          checklist_id: obj.checklist_id,
          status: obj.status,
          created_by: obj.created_by,
          created_at: obj.created_at,
          completion_pct: obj_completion_pct,
          assignee_id: obj.assignee_id ?? null,
          assignee_name: assigneeProfile?.full_name ?? null,
          deliverables_count: deliverablesArr.length,
          approved_count,
          deliverables,
        }
      })
    )

  // 3. Obtener incentive_records del período para los usuarios del depto
  const { data: incentiveRows } = await supabase
    .from('incentive_records')
    .select('user_id, id, schema_id, calculated_amount, status')
    .eq('org_dept_id', orgDeptId)
    .eq('month', month)
    .eq('year', year)

  const incentiveByUser = new Map<
    string,
    { id: string; schema_id: string | null; calculated_amount: number; status: string }
  >()
  for (const rec of incentiveRows ?? []) {
    incentiveByUser.set(rec.user_id, {
      id: rec.id,
      schema_id: rec.schema_id,
      calculated_amount: Number(rec.calculated_amount),
      status: rec.status,
    })
  }

  // 4. Agrupar objetivos por assignee_id
  const objectivesByUser = new Map<string, typeof objectives>()
  for (const obj of objectives) {
    if (!obj.assignee_id) continue
    if (!objectivesByUser.has(obj.assignee_id)) {
      objectivesByUser.set(obj.assignee_id, [])
    }
    objectivesByUser.get(obj.assignee_id)!.push(obj)
  }

  // 5. Construir resultado — incluir todos los usuarios del depto aunque no tengan objetivos
  const result: UserWithObjectives[] = assignableUsers.map((u) => {
    const userObjectives = objectivesByUser.get(u.id) ?? []

    // Completitud ponderada: suma(weight * completion_pct) / suma(weight)
    const totalWeight = userObjectives.reduce((s, o) => s + o.weight, 0)
    const completionPct =
      totalWeight > 0
        ? Math.round(
            userObjectives.reduce((s, o) => s + o.weight * (o.completion_pct ?? 0), 0) /
              totalWeight
          )
        : 0

    return {
      userId: u.id,
      userName: u.full_name,
      avatarUrl: u.avatar_url,
      positionName: u.position_name,
      source: u.source,
      area_id: u.area_id,
      area_name: u.area_name,
      objectives: userObjectives,
      completionPct,
      incentiveRecord: incentiveByUser.get(u.id) ?? null,
    }
  })

  return result
}

export async function checkAndCreateAlerts(month: number, year: number): Promise<void> {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('system_alerts')
    .select('type, entity_id')
    .gte('created_at', `${today}T00:00:00`)

  const existingSet = new Set((existing ?? []).map((a) => `${a.type}::${a.entity_id}`))

  const alerts: {
    type: string
    entity_type: string
    entity_id: string
    message: string
    severity: string
    target_role_id: null
    target_user: string | null
  }[] = []

  function maybeAdd(alert: typeof alerts[number]) {
    const key = `${alert.type}::${alert.entity_id}`
    if (!existingSet.has(key)) alerts.push(alert)
  }

  const { data: progress } = await supabase
    .from('objective_progress')
    .select('objective_id, completion_pct')
    .eq('month', month)
    .eq('year', year)

  for (const p of progress ?? []) {
    if (p.completion_pct < 70) {
      maybeAdd({
        type: 'low_completion',
        entity_type: 'objective',
        entity_id: p.objective_id,
        message: `Objetivo con ${p.completion_pct}% de cumplimiento — por debajo del 70%`,
        severity: p.completion_pct < 50 ? 'critical' : 'warning',
        target_role_id: null,
        target_user: null,
      })
    }
  }

  const in2days = new Date()
  in2days.setDate(in2days.getDate() + 2)

  const { data: pending } = await supabase
    .from('objective_deliverables')
    .select('id, title, due_date, assignee_id')
    .eq('status', 'pending')
    .lte('due_date', in2days.toISOString().split('T')[0])
    .gte('due_date', today)

  for (const d of pending ?? []) {
    maybeAdd({
      type: 'deadline_approaching',
      entity_type: 'deliverable',
      entity_id: d.id,
      message: `Entregable "${d.title}" vence el ${d.due_date} y aún no tiene evidencia`,
      severity: 'warning',
      target_role_id: null,
      target_user: d.assignee_id ?? null,
    })
  }

  const { data: closedObjectives } = await supabase
    .from('objectives')
    .select('id, title, org_department_id')
    .eq('month', month)
    .eq('year', year)
    .eq('status', 'closed')

  for (const obj of closedObjectives ?? []) {
    const { data: prog } = await supabase
      .from('objective_progress')
      .select('completion_pct')
      .eq('objective_id', obj.id)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle()

    const pct = prog?.completion_pct ?? 0
    if (pct < 80) {
      maybeAdd({
        type: 'period_closed',
        entity_type: 'objective',
        entity_id: obj.id,
        message: `Período cerrado con ${pct}% de cumplimiento en "${obj.title}"`,
        severity: pct < 50 ? 'critical' : 'warning',
        target_role_id: null,
        target_user: null,
      })
    }
  }

  if (alerts.length > 0) {
    await supabase.from('system_alerts').insert(alerts)
  }
}

export async function createObjectiveWithDeliverable(
  orgDeptId: string,
  data: ObjectiveData & { due_date?: string | null }
): Promise<{ error?: string; objectiveId?: string; deliverableId?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: obj, error: objError } = await supabase
    .from('objectives')
    .insert({
      org_department_id: orgDeptId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      month: data.month,
      year: data.year,
      weight: data.weight,
      target_value: data.target_value ?? null,
      evidence_type: data.evidence_type,
      checklist_id: data.checklist_id || null,
      created_by: user.id,
      assignee_id: data.assignee_id ?? null,
    })
    .select('id')
    .single()

  if (objError) {
    if (objError.code === '23505') return { error: 'Ya existe un objetivo con ese título en este período' }
    if (objError.code === '42501') return { error: 'No tienes permiso para crear objetivos en este departamento' }
    return { error: objError.message }
  }

  const { data: deliv, error: delivError } = await supabase
    .from('objective_deliverables')
    .insert({
      objective_id: obj.id,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      assignee_id: data.assignee_id ?? null,
      due_date: data.due_date || null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (delivError) {
    await supabase.from('objectives').delete().eq('id', obj.id)
    return { error: delivError.message }
  }

  revalidatePath('/objetivos')
  revalidatePath(`/objetivos/${orgDeptId}`)
  return { objectiveId: obj.id, deliverableId: deliv.id }
}
