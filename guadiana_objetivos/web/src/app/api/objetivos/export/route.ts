import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function escapeCell(value: string | number | boolean | null | undefined): string {
  const str = value == null ? '' : String(value)
  return `"${str.replace(/"/g, '""')}"`
}

function toRow(cells: (string | number | boolean | null | undefined)[]) {
  return cells.map(escapeCell).join(',')
}

const STATUS_LABELS: Record<string, string> = {
  pending:   'Pendiente',
  submitted: 'Enviado',
  approved:  'Aprobado',
  rejected:  'Rechazado',
}

const MONTHS = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Verificar permiso
  const { data: canExport } = await supabase.rpc('has_permission', { permission_key: 'dashboard.export' })
  if (!canExport) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  const { searchParams } = request.nextUrl
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1
  const year  = searchParams.get('year')  ? parseInt(searchParams.get('year')!)  : new Date().getFullYear()

  // Departamentos activos
  const { data: depts } = await supabase
    .from('departments')
    .select('id, name, description')
    .eq('is_active', true)
    .order('name')

  if (!depts || depts.length === 0) {
    const csv = '\uFEFF' + toRow(['Sin departamentos activos'])
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="objetivos.csv"',
      },
    })
  }

  const deptIds = depts.map((d) => d.id)

  // Objetivos del período
  const { data: objectives } = await supabase
    .from('objectives')
    .select('id, department_id, title, weight, status')
    .in('department_id', deptIds)
    .eq('month', month)
    .eq('year', year)

  const objIds = (objectives ?? []).map((o) => o.id)

  // Entregables
  const { data: deliverables } = objIds.length > 0
    ? await supabase
        .from('objective_deliverables')
        .select('id, objective_id, title, assignee_id, status, due_date')
        .in('objective_id', objIds)
    : { data: [] }

  // Perfiles de asignados
  const assigneeIds = [...new Set((deliverables ?? []).map((d) => d.assignee_id).filter(Boolean))] as string[]
  const { data: profiles } = assigneeIds.length > 0
    ? await supabase.from('profiles').select('id, full_name').in('id', assigneeIds)
    : { data: [] }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? p.id]))
  const deptMap    = new Map(depts.map((d) => [d.id, d.name]))
  const objMap     = new Map((objectives ?? []).map((o) => [o.id, o]))

  // Construir CSV
  const header = toRow([
    'Período', 'Departamento', 'Objetivo', 'Peso (%)',
    'Entregable', 'Asignado a', 'Estado', 'Fecha límite',
  ])

  const rows: string[] = [header]
  const periodo = `${MONTHS[month]} ${year}`

  for (const deliv of deliverables ?? []) {
    const obj = objMap.get(deliv.objective_id)
    const deptName = obj ? (deptMap.get(obj.department_id) ?? '') : ''
    rows.push(toRow([
      periodo,
      deptName,
      obj?.title ?? '',
      obj?.weight ?? '',
      deliv.title,
      deliv.assignee_id ? (profileMap.get(deliv.assignee_id) ?? deliv.assignee_id) : '—',
      STATUS_LABELS[deliv.status] ?? deliv.status,
      deliv.due_date ?? '—',
    ]))
  }

  if (rows.length === 1) {
    rows.push(toRow([periodo, '', 'Sin entregables en este período', '', '', '', '', '']))
  }

  const csv = '\uFEFF' + rows.join('\r\n')
  const dateStr = new Date().toISOString().slice(0, 10)

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="objetivos-${year}-${String(month).padStart(2, '0')}-${dateStr}.csv"`,
    },
  })
}
