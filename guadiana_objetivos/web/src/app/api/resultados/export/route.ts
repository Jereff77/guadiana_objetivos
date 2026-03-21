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
  completed:   'Completado',
  in_progress: 'En progreso',
}

const TYPE_LABELS: Record<string, string> = {
  boolean:         'Sí/No',
  single_choice:   'Opción única',
  multiple_choice: 'Opción múltiple',
  text_short:      'Texto corto',
  text_long:       'Texto largo',
  number:          'Número',
  date:            'Fecha',
}

function formatAnswer(answer: {
  value_text: string | null
  value_number: number | null
  value_bool: boolean | null
  value_date: string | null
  value_json: unknown
  not_applicable: boolean
  option_id: string | null
}, optionLabel: string | null): string {
  if (answer.not_applicable) return 'No aplica'
  if (answer.option_id && optionLabel) return optionLabel
  if (answer.value_bool !== null) return answer.value_bool ? 'Sí' : 'No'
  if (answer.value_text) return answer.value_text
  if (answer.value_number !== null) return String(answer.value_number)
  if (answer.value_date) return answer.value_date
  if (answer.value_json) return JSON.stringify(answer.value_json)
  return ''
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status') ?? ''
  const from   = searchParams.get('from') ?? ''
  const to     = searchParams.get('to') ?? ''

  // ── Runs ──────────────────────────────────────────────────────────────────────
  let runsQuery = supabase
    .from('resp_survey_runs')
    .select('id, respondent_id, started_at, completed_at, status, form_surveys(name)')
    .order('started_at', { ascending: false })
    .limit(1000)

  if (status) runsQuery = runsQuery.eq('status', status)
  if (from)   runsQuery = runsQuery.gte('started_at', `${from}T00:00:00`)
  if (to)     runsQuery = runsQuery.lte('started_at', `${to}T23:59:59.999`)

  const { data: runs } = await runsQuery
  if (!runs || runs.length === 0) {
    const csv = '\uFEFF' + toRow(['Sin resultados con los filtros aplicados'])
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="resultados.csv"',
      },
    })
  }

  const runIds = runs.map((r) => r.id)

  // ── Answers ───────────────────────────────────────────────────────────────────
  const { data: answers } = await supabase
    .from('resp_answers')
    .select('id, run_id, question_id, option_id, value_text, value_number, value_bool, value_date, value_json, not_applicable, comment')
    .in('run_id', runIds)

  // ── Questions ─────────────────────────────────────────────────────────────────
  const questionIds = [...new Set((answers ?? []).map((a) => a.question_id))]
  const { data: questions } = questionIds.length > 0
    ? await supabase.from('form_questions').select('id, label, type, section_id').in('id', questionIds)
    : { data: [] }

  // ── Sections ──────────────────────────────────────────────────────────────────
  const sectionIds = [...new Set((questions ?? []).map((q) => q.section_id))]
  const { data: sections } = sectionIds.length > 0
    ? await supabase.from('form_sections').select('id, title').in('id', sectionIds)
    : { data: [] }

  // ── Options ───────────────────────────────────────────────────────────────────
  const optionIds = (answers ?? []).map((a) => a.option_id).filter(Boolean) as string[]
  const { data: options } = optionIds.length > 0
    ? await supabase.from('form_question_options').select('id, label').in('id', optionIds)
    : { data: [] }

  // ── Profiles ──────────────────────────────────────────────────────────────────
  const respondentIds = [...new Set(runs.map((r) => r.respondent_id))]
  const { data: profiles } = respondentIds.length > 0
    ? await supabase.from('app_profiles').select('id, first_name, last_name').in('id', respondentIds)
    : { data: [] }

  // ── Maps ──────────────────────────────────────────────────────────────────────
  const questionMap = new Map((questions ?? []).map((q) => [q.id, q]))
  const sectionMap  = new Map((sections  ?? []).map((s) => [s.id, s.title]))
  const optionMap   = new Map((options   ?? []).map((o) => [o.id, o.label]))
  const profileMap  = new Map((profiles  ?? []).map((p) => [p.id, p]))

  function runSurveyName(run: { form_surveys: unknown }) {
    const fs = run.form_surveys as { name: string }[] | { name: string } | null
    if (!fs) return ''
    return Array.isArray(fs) ? (fs[0]?.name ?? '') : fs.name
  }

  function profileName(respondentId: string) {
    const p = profileMap.get(respondentId)
    if (!p) return respondentId.slice(0, 8) + '…'
    return [p.first_name, p.last_name].filter(Boolean).join(' ') || respondentId.slice(0, 8) + '…'
  }

  // ── Build CSV ─────────────────────────────────────────────────────────────────
  const header = toRow([
    'ID Ejecución', 'Formulario', 'Respondente', 'Estado', 'Inicio', 'Completado',
    'Sección', 'Pregunta', 'Tipo', 'Respuesta', 'Comentario / Acción a seguir',
  ])

  const answersByRun = new Map<string, typeof answers>()
  for (const a of answers ?? []) {
    if (!answersByRun.has(a.run_id)) answersByRun.set(a.run_id, [])
    answersByRun.get(a.run_id)!.push(a)
  }

  const rows: string[] = [header]

  for (const run of runs) {
    const runAnswers = answersByRun.get(run.id) ?? []
    const surveyName = runSurveyName(run)
    const respondent = profileName(run.respondent_id)
    const statusLabel = STATUS_LABELS[run.status] ?? run.status

    if (runAnswers.length === 0) {
      rows.push(toRow([run.id, surveyName, respondent, statusLabel, run.started_at, run.completed_at ?? '', '', '', '', '', '']))
      continue
    }

    for (const answer of runAnswers) {
      const question   = questionMap.get(answer.question_id)
      const optionLabel = answer.option_id ? (optionMap.get(answer.option_id) ?? null) : null
      rows.push(toRow([
        run.id,
        surveyName,
        respondent,
        statusLabel,
        run.started_at,
        run.completed_at ?? '',
        question ? (sectionMap.get(question.section_id) ?? '') : '',
        question?.label ?? '',
        question ? (TYPE_LABELS[question.type] ?? question.type) : '',
        formatAnswer(answer, optionLabel),
        answer.comment ?? '',
      ]))
    }
  }

  // BOM para que Excel abra UTF-8 correctamente
  const csv = '\uFEFF' + rows.join('\r\n')
  const date = new Date().toISOString().slice(0, 10)

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="resultados-${date}.csv"`,
    },
  })
}
