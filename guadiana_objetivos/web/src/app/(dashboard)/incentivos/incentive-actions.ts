'use server'

import { createClient } from '@/lib/supabase/server'
import { checkPermission, checkIsRoot } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface IncentiveTier {
  min_pct: number
  max_pct: number
  bonus_pct: number
}

export interface IncentiveSchema {
  id: string
  /** @deprecated Usar org_dept_id */
  department_id?: string | null
  org_dept_id: string | null
  org_area_id: string | null
  name: string | null
  role_id: string | null
  base_amount: number   // sueldo base (informativo)
  bonus_amount: number  // bono máximo al 100% de cumplimiento
  tiers: IncentiveTier[]
  period_type: 'monthly' | 'annual' | 'custom'
  valid_from: string
  valid_to: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  // joined
  org_dept_name?: string
  role_name?: string
}

export interface IncentiveRecord {
  id: string
  user_id: string
  /** @deprecated Usar org_dept_id */
  department_id?: string | null
  org_dept_id: string | null
  schema_id: string | null
  month: number
  year: number
  completion_pct: number
  base_amount: number
  bonus_pct: number
  calculated_amount: number
  status: 'draft' | 'approved' | 'paid'
  approved_by: string | null
  approved_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // joined
  user_full_name?: string
  user_email?: string
  department_name?: string
  approved_by_name?: string
}

export interface CreateIncentiveSchemaData {
  /** @deprecated Usar org_dept_id */
  department_id?: string | null
  org_dept_id?: string | null
  org_area_id?: string | null
  name?: string | null
  role_id: string | null
  period_type?: 'monthly' | 'annual' | 'custom'
  base_amount: number   // sueldo base
  bonus_amount: number  // bono máximo al 100%
  tiers: IncentiveTier[]
  valid_from: string
  valid_to?: string | null
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function applyTier(tiers: IncentiveTier[], completion_pct: number): number {
  const sorted = [...tiers].sort((a, b) => b.min_pct - a.min_pct)
  for (const tier of sorted) {
    if (completion_pct >= tier.min_pct && completion_pct <= tier.max_pct) {
      return tier.bonus_pct
    }
  }
  return 0
}

// ── Actions ────────────────────────────────────────────────────────────────────

export async function getIncentiveSchemas(): Promise<ActionResult<IncentiveSchema[]>> {
  const canView = await checkPermission('incentivos.view')
  const isRoot = await checkIsRoot()
  if (!canView && !isRoot) {
    return { success: false, error: 'Sin permiso para ver esquemas de incentivos.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('incentive_schemas')
    .select(`
      *,
      org_departments ( name ),
      org_areas ( name ),
      roles ( name )
    `)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }

  const schemas: IncentiveSchema[] = (data ?? []).map((row) => ({
    ...row,
    tiers: Array.isArray(row.tiers) ? row.tiers : [],
    org_dept_name: (row.org_departments as { name: string } | null)?.name,
    role_name: (row.roles as { name: string } | null)?.name,
  }))

  return { success: true, data: schemas }
}

export async function createIncentiveSchema(
  formData: CreateIncentiveSchemaData
): Promise<ActionResult<{ id: string }>> {
  const canManage = await checkPermission('incentivos.manage')
  const isRoot = await checkIsRoot()
  if (!canManage && !isRoot) {
    return { success: false, error: 'Sin permiso para crear esquemas de incentivos.' }
  }

  if (!formData.bonus_amount || formData.bonus_amount <= 0) {
    return { success: false, error: 'El monto del bono debe ser mayor a 0.' }
  }
  if (!formData.valid_from) {
    return { success: false, error: 'La fecha de inicio es requerida.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('incentive_schemas')
    .insert({
      org_dept_id: formData.org_dept_id ?? null,
      org_area_id: formData.org_area_id ?? null,
      name: formData.name ?? null,
      role_id: formData.role_id,
      base_amount: formData.base_amount,
      bonus_amount: formData.bonus_amount,
      tiers: formData.tiers,
      valid_from: formData.valid_from,
      valid_to: formData.valid_to ?? null,
      created_by: user?.id ?? null,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/incentivos')
  revalidatePath('/incentivos/configurar')
  return { success: true, data: { id: data.id } }
}

export async function updateIncentiveSchema(
  id: string,
  formData: Partial<CreateIncentiveSchemaData> & { is_active?: boolean }
): Promise<ActionResult> {
  const canManage = await checkPermission('incentivos.manage')
  const isRoot = await checkIsRoot()
  if (!canManage && !isRoot) {
    return { success: false, error: 'Sin permiso para editar esquemas de incentivos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('incentive_schemas')
    .update(formData)
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/incentivos')
  revalidatePath('/incentivos/configurar')
  return { success: true }
}

export async function deleteIncentiveSchema(id: string): Promise<ActionResult> {
  const canManage = await checkPermission('incentivos.manage')
  const isRoot = await checkIsRoot()
  if (!canManage && !isRoot) {
    return { success: false, error: 'Sin permiso para eliminar esquemas de incentivos.' }
  }

  // Verificar que no tenga registros de incentivos asociados en estado approved/paid
  const supabase = await createClient()
  const { count } = await supabase
    .from('incentive_records')
    .select('id', { count: 'exact', head: true })
    .eq('schema_id', id)
    .in('status', ['approved', 'paid'])

  if ((count ?? 0) > 0) {
    return {
      success: false,
      error: 'No se puede eliminar: hay registros aprobados o pagados vinculados a este esquema.',
    }
  }

  const { error } = await supabase
    .from('incentive_schemas')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/incentivos')
  revalidatePath('/incentivos/configurar')
  return { success: true }
}

// ── Cálculo automático de incentivos ──────────────────────────────────────────

export async function calculateIncentivesForPeriod(
  month: number,
  year: number
): Promise<ActionResult<{ created: number; updated: number }>> {
  const canManage = await checkPermission('incentivos.manage')
  const isRoot = await checkIsRoot()
  if (!canManage && !isRoot) {
    return { success: false, error: 'Sin permiso para calcular incentivos.' }
  }

  const supabase = await createClient()

  // Obtener org_dept_ids únicos de los objetivos del período
  const { data: objRows, error: objError } = await supabase
    .from('objectives')
    .select('org_department_id, assignee_id')
    .eq('month', month)
    .eq('year', year)
    .not('assignee_id', 'is', null)

  if (objError) return { success: false, error: objError.message }

  if (!objRows || objRows.length === 0) {
    return { success: true, data: { created: 0, updated: 0 } }
  }

  // Agrupar assignees por org_dept_id
  const deptUserMap = new Map<string, Set<string>>()
  for (const row of objRows) {
    if (!row.org_department_id || !row.assignee_id) continue
    if (!deptUserMap.has(row.org_department_id)) {
      deptUserMap.set(row.org_department_id, new Set())
    }
    deptUserMap.get(row.org_department_id)!.add(row.assignee_id)
  }

  let created = 0
  let updated = 0
  const today = new Date().toISOString().split('T')[0]

  for (const [deptId, userIds] of deptUserMap.entries()) {
    // Calcular completion promedio del dept en el período
    const { data: deptObjectives } = await supabase
      .from('objectives')
      .select('id, weight, completion_pct')
      .eq('org_department_id', deptId)
      .eq('month', month)
      .eq('year', year)

    const totalWeight = (deptObjectives ?? []).reduce((s, o) => s + (o.weight ?? 0), 0)
    const completion =
      totalWeight > 0
        ? Math.round(
            (deptObjectives ?? []).reduce(
              (s, o) => s + (o.weight ?? 0) * (o.completion_pct ?? 0),
              0
            ) / totalWeight
          )
        : 0

    // Buscar esquema activo para este org_dept_id
    const { data: schemas } = await supabase
      .from('incentive_schemas')
      .select('*')
      .eq('org_dept_id', deptId)
      .eq('is_active', true)
      .lte('valid_from', today)
      .or(`valid_to.is.null,valid_to.gte.${today}`)
      .order('valid_from', { ascending: false })
      .limit(1)

    if (!schemas || schemas.length === 0) continue

    const schema = schemas[0]
    const tiers: IncentiveTier[] = Array.isArray(schema.tiers) ? schema.tiers : []
    const bonusPct = applyTier(tiers, completion)
    const calculatedAmount = schema.bonus_amount * (bonusPct / 100)

    for (const userId of userIds) {
      const recordData = {
        user_id: userId,
        org_dept_id: deptId,
        schema_id: schema.id,
        month,
        year,
        completion_pct: completion,
        base_amount: schema.bonus_amount,
        bonus_pct: bonusPct,
        calculated_amount: calculatedAmount,
        status: 'draft' as const,
      }

      const { data: existing } = await supabase
        .from('incentive_records')
        .select('id, status')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle()

      if (existing) {
        if (existing.status === 'draft') {
          await supabase
            .from('incentive_records')
            .update(recordData)
            .eq('id', existing.id)
          updated++
        }
      } else {
        await supabase.from('incentive_records').insert(recordData)
        created++
      }
    }
  }

  return { success: true, data: { created, updated } }
}

// ── Aprobación ─────────────────────────────────────────────────────────────────

export async function approveIncentiveRecord(
  recordId: string,
  notes?: string
): Promise<ActionResult> {
  const canApprove = await checkPermission('incentivos.approve')
  const isRoot = await checkIsRoot()
  if (!canApprove && !isRoot) {
    return { success: false, error: 'Sin permiso para aprobar incentivos.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: record } = await supabase
    .from('incentive_records')
    .select('status')
    .eq('id', recordId)
    .single()

  if (!record) return { success: false, error: 'Registro no encontrado.' }
  if (record.status !== 'draft') {
    return { success: false, error: 'Solo se pueden aprobar registros en estado borrador.' }
  }

  const { error } = await supabase
    .from('incentive_records')
    .update({
      status: 'approved',
      approved_by: user?.id ?? null,
      approved_at: new Date().toISOString(),
      notes: notes ?? null,
    })
    .eq('id', recordId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/incentivos')
  return { success: true }
}

export async function markIncentiveRecordAsPaid(recordId: string): Promise<ActionResult> {
  const canApprove = await checkPermission('incentivos.approve')
  const isRoot = await checkIsRoot()
  if (!canApprove && !isRoot) {
    return { success: false, error: 'Sin permiso para marcar incentivos como pagados.' }
  }

  const supabase = await createClient()

  const { data: record } = await supabase
    .from('incentive_records')
    .select('status')
    .eq('id', recordId)
    .single()

  if (!record) return { success: false, error: 'Registro no encontrado.' }
  if (record.status !== 'approved') {
    return { success: false, error: 'Solo se pueden marcar como pagados los registros aprobados.' }
  }

  const { error } = await supabase
    .from('incentive_records')
    .update({ status: 'paid' })
    .eq('id', recordId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/incentivos')
  return { success: true }
}

// ── Consultas ──────────────────────────────────────────────────────────────────

export async function getMyIncentiveHistory(): Promise<ActionResult<IncentiveRecord[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado.' }

  const { data, error } = await supabase
    .from('incentive_records')
    .select(`
      *,
      org_departments ( name ),
      approver:profiles!incentive_records_approved_by_fkey ( full_name )
    `)
    .eq('user_id', user.id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) return { success: false, error: error.message }

  const records: IncentiveRecord[] = (data ?? []).map((row) => ({
    ...row,
    department_name: (row.org_departments as { name: string } | null)?.name,
    approved_by_name: (row.approver as { full_name: string } | null)?.full_name,
  }))

  return { success: true, data: records }
}

export async function getAllIncentiveRecords(
  month?: number,
  year?: number
): Promise<ActionResult<IncentiveRecord[]>> {
  // Sin guard de permiso: la RLS filtra automáticamente.
  // Admins (incentivos.view) ven todo; responsables de depto ven solo su depto.
  const supabase = await createClient()
  let query = supabase
    .from('incentive_records')
    .select(`
      *,
      user:profiles!incentive_records_user_id_fkey ( full_name ),
      org_departments ( name ),
      approver:profiles!incentive_records_approved_by_fkey ( full_name )
    `)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .order('org_dept_id')

  if (month !== undefined) query = query.eq('month', month)
  if (year !== undefined) query = query.eq('year', year)

  const { data, error } = await query
  if (error) return { success: false, error: error.message }

  const records: IncentiveRecord[] = (data ?? []).map((row) => ({
    ...row,
    user_full_name: (row.user as { full_name: string } | null)?.full_name,
    department_name: (row.org_departments as { name: string } | null)?.name,
    approved_by_name: (row.approver as { full_name: string } | null)?.full_name,
  }))

  return { success: true, data: records }
}

export async function getIncentiveSummary(
  month: number,
  year: number
): Promise<ActionResult<{
  total_records: number
  total_draft: number
  total_approved: number
  total_paid: number
  total_amount_draft: number
  total_amount_approved: number
  total_amount_paid: number
}>> {
  // Sin guard: RLS filtra. El resumen refleja solo los registros visibles al usuario.
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('incentive_records')
    .select('status, calculated_amount')
    .eq('month', month)
    .eq('year', year)

  if (error) return { success: false, error: error.message }

  const rows = data ?? []
  const summary = {
    total_records: rows.length,
    total_draft: rows.filter((r) => r.status === 'draft').length,
    total_approved: rows.filter((r) => r.status === 'approved').length,
    total_paid: rows.filter((r) => r.status === 'paid').length,
    total_amount_draft: rows.filter((r) => r.status === 'draft').reduce((s, r) => s + Number(r.calculated_amount), 0),
    total_amount_approved: rows.filter((r) => r.status === 'approved').reduce((s, r) => s + Number(r.calculated_amount), 0),
    total_amount_paid: rows.filter((r) => r.status === 'paid').reduce((s, r) => s + Number(r.calculated_amount), 0),
  }

  return { success: true, data: summary }
}

// ── Nuevas funciones para vista centrada en usuarios ───────────────────────────

export async function getIncentiveSchemasForDept(
  orgDeptId: string
): Promise<ActionResult<IncentiveSchema[]>> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Obtener planes del dept específico + planes globales (org_dept_id IS NULL)
  const { data, error } = await supabase
    .from('incentive_schemas')
    .select(`
      *,
      org_departments ( name ),
      org_areas ( name ),
      roles ( name )
    `)
    .eq('is_active', true)
    .lte('valid_from', today)
    .or(`valid_to.is.null,valid_to.gte.${today}`)
    .or(`org_dept_id.eq.${orgDeptId},org_dept_id.is.null`)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }

  const schemas: IncentiveSchema[] = (data ?? []).map((row) => ({
    ...row,
    tiers: Array.isArray(row.tiers) ? row.tiers : [],
    org_dept_name: (row.org_departments as { name: string } | null)?.name,
    role_name: (row.roles as { name: string } | null)?.name,
  }))

  return { success: true, data: schemas }
}

export async function assignIncentivePlanToUser(
  userId: string,
  orgDeptId: string,
  schemaId: string,
  month: number,
  year: number
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  // Verificar que el schema exista y sea del dept (o global)
  const { data: schema, error: schemaError } = await supabase
    .from('incentive_schemas')
    .select('id, bonus_amount, org_dept_id')
    .eq('id', schemaId)
    .single()

  if (schemaError || !schema) {
    return { success: false, error: 'El plan de incentivo no existe.' }
  }

  if (schema.org_dept_id !== null && schema.org_dept_id !== orgDeptId) {
    return { success: false, error: 'El plan no pertenece a este departamento.' }
  }

  const { data: upserted, error } = await supabase
    .from('incentive_records')
    .upsert(
      {
        user_id: userId,
        org_dept_id: orgDeptId,
        schema_id: schemaId,
        month,
        year,
        completion_pct: 0,
        base_amount: schema.bonus_amount,
        bonus_pct: 0,
        calculated_amount: 0,
        status: 'draft',
      },
      { onConflict: 'user_id,month,year' }
    )
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/objetivos/${orgDeptId}`)
  return { success: true, data: { id: upserted.id } }
}

export interface LateDeliverable {
  id: string
  title: string
  submitted_at: string
  objective_title: string
  objective_month: number
  objective_year: number
  assignee_name: string | null
  assignee_id: string | null
  period_type: 'monthly' | 'annual' | 'custom'
  schema_valid_to: string | null
}

export async function getLateDeliverables(): Promise<ActionResult<LateDeliverable[]>> {
  const [canApprove, isRoot] = await Promise.all([
    checkPermission('incentivos.approve'),
    checkIsRoot(),
  ])
  if (!canApprove && !isRoot) {
    return { success: false, error: 'Sin permiso.' }
  }

  const supabase = await createClient()

  // Obtener entregables enviados sin aprobación tardía, con datos del objetivo
  const { data, error } = await supabase
    .from('objective_deliverables')
    .select(`
      id, title, submitted_at, assignee_id,
      profiles!objective_deliverables_assignee_id_fkey ( full_name ),
      objectives ( title, month, year, org_department_id )
    `)
    .eq('status', 'submitted')
    .not('submitted_at', 'is', null)
    .is('late_approved_by', null)
    .order('submitted_at', { ascending: false })

  if (error) return { success: false, error: error.message }

  const result: LateDeliverable[] = []

  for (const row of data ?? []) {
    if (!row.submitted_at) continue
    const obj = Array.isArray(row.objectives) ? row.objectives[0] : row.objectives
    if (!obj) continue

    // Por ahora: comparar contra el último día del mes del objetivo (lógica mensual)
    // El period_type real del esquema se resuelve con la migración; aquí usamos monthly como default
    const closeDate = new Date(obj.year, obj.month, 0, 23, 59, 59)

    if (new Date(row.submitted_at) > closeDate) {
      const profile = (row.profiles as unknown) as { full_name: string | null } | null
      result.push({
        id: row.id,
        title: row.title,
        submitted_at: row.submitted_at,
        objective_title: obj.title,
        objective_month: obj.month,
        objective_year: obj.year,
        assignee_id: row.assignee_id,
        assignee_name: profile?.full_name ?? null,
        period_type: 'monthly',
        schema_valid_to: null,
      })
    }
  }

  return { success: true, data: result }
}
