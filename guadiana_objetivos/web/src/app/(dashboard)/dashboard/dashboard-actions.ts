'use server'

import { createClient } from '@/lib/supabase/server'
import { checkPermission } from '@/lib/permissions'
import { redirect } from 'next/navigation'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DeptKpi {
  dept_id: string
  dept_name: string
  objectives_count: number
  deliverables_total: number
  deliverables_approved: number
  deliverables_pending: number
  deliverables_submitted: number
  deliverables_rejected: number
  completion_pct: number
}

export interface DeptTrendPoint {
  month: number
  year: number
  label: string
  completion_pct: number
}

export interface DashboardKpis {
  depts: DeptKpi[]
  total_depts: number
  avg_completion: number
  total_approved: number
  total_pending: number
  alerts_count: number
}

export interface ActiveAlert {
  id: string
  type: string
  entity_type: string
  entity_id: string
  message: string
  severity: string
  is_read: boolean
  created_at: string
}

// ── getDashboardKpis ───────────────────────────────────────────────────────────

export async function getDashboardKpis(
  month: number,
  year: number
): Promise<DashboardKpis> {
  const canView = await checkPermission('dashboard.view')
  if (!canView) redirect('/sin-acceso')

  const supabase = await createClient()

  // Obtener todos los departamentos activos
  const { data: depts } = await supabase
    .from('departments')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  if (!depts || depts.length === 0) {
    return { depts: [], total_depts: 0, avg_completion: 0, total_approved: 0, total_pending: 0, alerts_count: 0 }
  }

  // Para cada departamento, obtener objetivos y entregables del período
  const deptKpis: DeptKpi[] = await Promise.all(
    depts.map(async (dept) => {
      const { data: objectives } = await supabase
        .from('objectives')
        .select('id')
        .eq('department_id', dept.id)
        .eq('month', month)
        .eq('year', year)
        .eq('status', 'active')

      const objIds = (objectives ?? []).map((o) => o.id)

      if (objIds.length === 0) {
        return {
          dept_id: dept.id,
          dept_name: dept.name,
          objectives_count: 0,
          deliverables_total: 0,
          deliverables_approved: 0,
          deliverables_pending: 0,
          deliverables_submitted: 0,
          deliverables_rejected: 0,
          completion_pct: 0,
        }
      }

      const { data: deliverables } = await supabase
        .from('objective_deliverables')
        .select('status')
        .in('objective_id', objIds)

      const all = deliverables ?? []
      const approved = all.filter((d) => d.status === 'approved').length
      const pending = all.filter((d) => d.status === 'pending').length
      const submitted = all.filter((d) => d.status === 'submitted').length
      const rejected = all.filter((d) => d.status === 'rejected').length
      const total = all.length
      const pct = total > 0 ? Math.round((approved / total) * 100) : 0

      return {
        dept_id: dept.id,
        dept_name: dept.name,
        objectives_count: objIds.length,
        deliverables_total: total,
        deliverables_approved: approved,
        deliverables_pending: pending,
        deliverables_submitted: submitted,
        deliverables_rejected: rejected,
        completion_pct: pct,
      }
    })
  )

  const withObjectives = deptKpis.filter((d) => d.objectives_count > 0)
  const avgCompletion =
    withObjectives.length > 0
      ? Math.round(withObjectives.reduce((s, d) => s + d.completion_pct, 0) / withObjectives.length)
      : 0

  const totalApproved = deptKpis.reduce((s, d) => s + d.deliverables_approved, 0)
  const totalPending = deptKpis.reduce((s, d) => s + d.deliverables_pending, 0)

  const { count: alertsCount } = await supabase
    .from('system_alerts')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false)

  return {
    depts: deptKpis,
    total_depts: depts.length,
    avg_completion: avgCompletion,
    total_approved: totalApproved,
    total_pending: totalPending,
    alerts_count: alertsCount ?? 0,
  }
}

// ── getDeptTrend ───────────────────────────────────────────────────────────────

export async function getDeptTrend(
  deptId: string,
  months: number = 6
): Promise<DeptTrendPoint[]> {
  const supabase = await createClient()

  const now = new Date()
  const points: DeptTrendPoint[] = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const m = d.getMonth() + 1
    const y = d.getFullYear()

    const MONTHS = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    const { data: objectives } = await supabase
      .from('objectives')
      .select('id')
      .eq('department_id', deptId)
      .eq('month', m)
      .eq('year', y)

    const objIds = (objectives ?? []).map((o) => o.id)

    let pct = 0
    if (objIds.length > 0) {
      const { data: deliverables } = await supabase
        .from('objective_deliverables')
        .select('status')
        .in('objective_id', objIds)

      const all = deliverables ?? []
      const approved = all.filter((d) => d.status === 'approved').length
      pct = all.length > 0 ? Math.round((approved / all.length) * 100) : 0
    }

    points.push({ month: m, year: y, label: `${MONTHS[m]} ${y}`, completion_pct: pct })
  }

  return points
}

// ── getDepartmentRanking ───────────────────────────────────────────────────────

export async function getDepartmentRanking(
  month: number,
  year: number
): Promise<DeptKpi[]> {
  const canView = await checkPermission('dashboard.view')
  if (!canView) redirect('/sin-acceso')

  const { depts } = await getDashboardKpis(month, year)
  return [...depts].sort((a, b) => b.completion_pct - a.completion_pct)
}

// ── getActiveAlerts ────────────────────────────────────────────────────────────

export async function getActiveAlerts(): Promise<ActiveAlert[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('system_alerts')
    .select('id, type, entity_type, entity_id, message, severity, is_read, created_at')
    .or(`target_user.eq.${user.id},target_user.is.null`)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(20)

  return data ?? []
}

// ── markAlertRead ──────────────────────────────────────────────────────────────

export async function markAlertRead(alertId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('system_alerts').update({ is_read: true }).eq('id', alertId)
}
