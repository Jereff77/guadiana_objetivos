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
  draft:    'Borrador',
  approved: 'Aprobado',
  paid:     'Pagado',
}

const MONTHS = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: canView } = await supabase.rpc('has_permission', { permission_key: 'incentivos.view' })
  const { data: isRoot } = await supabase.rpc('is_root')
  if (!canView && !isRoot) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  const { searchParams } = request.nextUrl
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1
  const year  = searchParams.get('year')  ? parseInt(searchParams.get('year')!)  : new Date().getFullYear()

  const { data: records } = await supabase
    .from('incentive_records')
    .select(`
      *,
      user:profiles!incentive_records_user_id_fkey ( full_name ),
      departments ( name ),
      approver:profiles!incentive_records_approved_by_fkey ( full_name )
    `)
    .eq('month', month)
    .eq('year', year)
    .order('department_id')
    .order('calculated_amount', { ascending: false })

  const header = toRow([
    'Período', 'Departamento', 'Colaborador', 'Cumplimiento (%)',
    'Monto base', 'Bono (%)', 'Total calculado', 'Estado', 'Aprobado por', 'Fecha aprobación', 'Notas',
  ])

  const rows: string[] = [header]
  const periodo = `${MONTHS[month]} ${year}`

  for (const r of records ?? []) {
    rows.push(toRow([
      periodo,
      (r.departments as { name: string } | null)?.name ?? '',
      (r.user as { full_name: string } | null)?.full_name ?? '',
      Number(r.completion_pct).toFixed(2),
      Number(r.base_amount).toFixed(2),
      Number(r.bonus_pct).toFixed(2),
      Number(r.calculated_amount).toFixed(2),
      STATUS_LABELS[r.status] ?? r.status,
      (r.approver as { full_name: string } | null)?.full_name ?? '',
      r.approved_at ? new Date(r.approved_at).toLocaleDateString('es-MX') : '',
      r.notes ?? '',
    ]))
  }

  if (rows.length === 1) {
    rows.push(toRow([periodo, '', 'Sin registros de incentivos', '', '', '', '', '', '', '', '']))
  }

  const csv = '\uFEFF' + rows.join('\r\n')
  const dateStr = new Date().toISOString().slice(0, 10)

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="incentivos-${year}-${String(month).padStart(2, '0')}-${dateStr}.csv"`,
    },
  })
}
