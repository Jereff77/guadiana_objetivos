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
  department_id: string | null
  role_id: string | null
  base_amount: number   // sueldo base (informativo)
  bonus_amount: number  // bono máximo al 100% de cumplimiento
  tiers: IncentiveTier[]
  valid_from: string
  valid_to: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  // joined
  department_name?: string
  role_name?: string
}

export interface IncentiveRecord {
  id: string
  user_id: string
  department_id: string
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
  department_id: string | null
  role_id: string | null
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
      departments ( name ),
      roles ( name )
    `)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }

  const schemas: IncentiveSchema[] = (data ?? []).map((row) => ({
    ...row,
    tiers: Array.isArray(row.tiers) ? row.tiers : [],
    department_name: (row.departments as { name: string } | null)?.name,
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

  if (!formData.base_amount || formData.base_amount <= 0) {
    return { success: false, error: 'El sueldo base debe ser mayor a 0.' }
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
      department_id: formData.department_id,
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

  // Obtener todos los departamentos con objetivo_progress del período
  const { data: progresses, error: progressError } = await supabase
    .from('objective_progress')
    .select(`
      department_id,
      completion_pct,
      departments ( id, name )
    `)
    .eq('month', month)
    .eq('year', year)

  if (progressError) return { success: false, error: progressError.message }

  if (!progresses || progresses.length === 0) {
    return { success: true, data: { created: 0, updated: 0 } }
  }

  let created = 0
  let updated = 0
  const today = new Date().toISOString().split('T')[0]

  for (const progress of progresses) {
    const deptId = progress.department_id
    const completion = Number(progress.completion_pct ?? 0)

    // Buscar esquema activo para este departamento
    const { data: schemas } = await supabase
      .from('incentive_schemas')
      .select('*')
      .eq('department_id', deptId)
      .eq('is_active', true)
      .lte('valid_from', today)
      .or(`valid_to.is.null,valid_to.gte.${today}`)
      .order('valid_from', { ascending: false })
      .limit(1)

    if (!schemas || schemas.length === 0) continue

    const schema = schemas[0]
    const tiers: IncentiveTier[] = Array.isArray(schema.tiers) ? schema.tiers : []
    const bonusPct = applyTier(tiers, completion)
    // bonus_amount = bono máximo; tier.bonus_pct = % del bono máximo que se gana
    const calculatedAmount = schema.bonus_amount * (bonusPct / 100)

    // Obtener usuarios del departamento (los que tienen objetivos asignados)
    const { data: assignees } = await supabase
      .from('objective_deliverables')
      .select('assignee_id')
      .in(
        'objective_id',
        (
          await supabase
            .from('objectives')
            .select('id')
            .eq('department_id', deptId)
            .eq('month', month)
            .eq('year', year)
        ).data?.map((o: { id: string }) => o.id) ?? []
      )
      .not('assignee_id', 'is', null)

    const userIds = [...new Set((assignees ?? []).map((a: { assignee_id: string | null }) => a.assignee_id).filter(Boolean))] as string[]

    for (const userId of userIds) {
      const recordData = {
        user_id: userId,
        department_id: deptId,
        schema_id: schema.id,
        month,
        year,
        completion_pct: completion,
        base_amount: schema.bonus_amount, // bono máximo al momento del cálculo
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
        .single()

      if (existing) {
        // Solo actualizar si está en draft
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
      departments ( name ),
      approver:profiles!incentive_records_approved_by_fkey ( full_name )
    `)
    .eq('user_id', user.id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) return { success: false, error: error.message }

  const records: IncentiveRecord[] = (data ?? []).map((row) => ({
    ...row,
    department_name: (row.departments as { name: string } | null)?.name,
    approved_by_name: (row.approver as { full_name: string } | null)?.full_name,
  }))

  return { success: true, data: records }
}

export async function getAllIncentiveRecords(
  month?: number,
  year?: number
): Promise<ActionResult<IncentiveRecord[]>> {
  const canView = await checkPermission('incentivos.view')
  const isRoot = await checkIsRoot()
  if (!canView && !isRoot) {
    return { success: false, error: 'Sin permiso para ver todos los incentivos.' }
  }

  const supabase = await createClient()
  let query = supabase
    .from('incentive_records')
    .select(`
      *,
      user:profiles!incentive_records_user_id_fkey ( full_name ),
      departments ( name ),
      approver:profiles!incentive_records_approved_by_fkey ( full_name )
    `)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .order('department_id')

  if (month !== undefined) query = query.eq('month', month)
  if (year !== undefined) query = query.eq('year', year)

  const { data, error } = await query
  if (error) return { success: false, error: error.message }

  const records: IncentiveRecord[] = (data ?? []).map((row) => ({
    ...row,
    user_full_name: (row.user as { full_name: string } | null)?.full_name,
    department_name: (row.departments as { name: string } | null)?.name,
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
  const canView = await checkPermission('incentivos.view')
  const isRoot = await checkIsRoot()
  if (!canView && !isRoot) {
    return { success: false, error: 'Sin permiso para ver resumen de incentivos.' }
  }

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
