import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  completed:   { label: 'Completado',   variant: 'default' },
  in_progress: { label: 'En progreso',  variant: 'secondary' },
}

const TYPE_LABELS: Record<string, string> = {
  boolean:         'Sí / No',
  single_choice:   'Opción única',
  multiple_choice: 'Opción múltiple',
  text_short:      'Texto corto',
  text_long:       'Texto largo',
  number:          'Número',
  date:            'Fecha',
}

function formatDateTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function AnswerValue({
  answer,
  optionLabel,
}: {
  answer: {
    value_text: string | null
    value_number: number | null
    value_bool: boolean | null
    value_date: string | null
    value_json: unknown
    not_applicable: boolean
    option_id: string | null
  }
  optionLabel: string | null
}) {
  if (answer.not_applicable) {
    return <span className="text-muted-foreground italic text-sm">No aplica</span>
  }
  if (answer.option_id && optionLabel) {
    return <span className="text-sm font-medium">{optionLabel}</span>
  }
  if (answer.value_bool !== null) {
    return (
      <Badge variant={answer.value_bool ? 'default' : 'destructive'}>
        {answer.value_bool ? 'Sí' : 'No'}
      </Badge>
    )
  }
  if (answer.value_text) {
    return <span className="text-sm">{answer.value_text}</span>
  }
  if (answer.value_number !== null) {
    return <span className="text-sm font-medium">{answer.value_number}</span>
  }
  if (answer.value_date) {
    return <span className="text-sm">{answer.value_date}</span>
  }
  if (answer.value_json) {
    return <span className="text-sm font-mono text-xs">{JSON.stringify(answer.value_json)}</span>
  }
  return <span className="text-muted-foreground text-sm italic">Sin respuesta</span>
}

export default async function RunDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ── Run ──────────────────────────────────────────────────────────────────────
  const { data: run } = await supabase
    .from('resp_survey_runs')
    .select('*, form_surveys(name, description)')
    .eq('id', id)
    .single()

  if (!run) notFound()

  // ── Answers ──────────────────────────────────────────────────────────────────
  const { data: answers } = await supabase
    .from('resp_answers')
    .select('id, question_id, option_id, value_text, value_number, value_bool, value_date, value_json, not_applicable, comment')
    .eq('run_id', id)

  // ── Questions ────────────────────────────────────────────────────────────────
  const questionIds = (answers ?? []).map((a) => a.question_id)
  const { data: questions } = questionIds.length > 0
    ? await supabase
        .from('form_questions')
        .select('id, label, type, section_id, order, help_text')
        .in('id', questionIds)
    : { data: [] }

  // ── Sections ─────────────────────────────────────────────────────────────────
  const sectionIds = [...new Set((questions ?? []).map((q) => q.section_id))]
  const { data: sections } = sectionIds.length > 0
    ? await supabase.from('form_sections').select('id, title, order').in('id', sectionIds).order('order')
    : { data: [] }

  // ── Options (for option_id display) ─────────────────────────────────────────
  const optionIds = (answers ?? []).map((a) => a.option_id).filter(Boolean) as string[]
  const { data: options } = optionIds.length > 0
    ? await supabase.from('form_question_options').select('id, label').in('id', optionIds)
    : { data: [] }

  // ── Respondent ───────────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('app_profiles')
    .select('first_name, last_name')
    .eq('id', run.respondent_id)
    .single()

  // ── Maps ─────────────────────────────────────────────────────────────────────
  const questionMap = new Map((questions ?? []).map((q) => [q.id, q]))
  const optionMap   = new Map((options ?? []).map((o) => [o.id, o.label]))
  const answerMap   = new Map((answers ?? []).map((a) => [a.question_id, a]))

  const surveyName = Array.isArray(run.form_surveys)
    ? (run.form_surveys[0]?.name ?? 'Formulario')
    : (run.form_surveys?.name ?? 'Formulario')

  const statusInfo = STATUS_LABELS[run.status] ?? { label: run.status, variant: 'outline' as const }
  const respondentName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Sin nombre'
    : run.respondent_id.slice(0, 8) + '…'

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-6 py-4">
        <Link href="/resultados">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex flex-1 items-center gap-3 min-w-0">
          <h1 className="font-semibold text-base truncate">{surveyName}</h1>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-6 max-w-3xl w-full mx-auto">
        {/* Meta */}
        <div className="rounded-lg border bg-card p-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Respondente</p>
            <p className="font-medium">{respondentName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Estado</p>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Inicio</p>
            <p>{formatDateTime(run.started_at)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Completado</p>
            <p>{formatDateTime(run.completed_at)}</p>
          </div>
        </div>

        {/* Answers by section */}
        {(sections ?? []).length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground text-sm">Esta ejecución no tiene respuestas registradas.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {(sections ?? []).map((section) => {
              const sectionQuestions = (questions ?? [])
                .filter((q) => q.section_id === section.id)
                .sort((a, b) => a.order - b.order)

              return (
                <div key={section.id} className="flex flex-col gap-3">
                  <h2 className="font-semibold text-sm" style={{ color: '#004B8D' }}>
                    {section.title}
                  </h2>
                  <div className="rounded-lg border bg-card divide-y">
                    {sectionQuestions.map((question) => {
                      const answer = answerMap.get(question.id)
                      const optionLabel = answer?.option_id ? (optionMap.get(answer.option_id) ?? null) : null

                      return (
                        <div key={question.id} className="flex flex-col gap-2 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-snug flex-1">{question.label}</p>
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                              {TYPE_LABELS[question.type] ?? question.type}
                            </span>
                          </div>

                          {question.help_text && (
                            <p className="text-xs text-muted-foreground">{question.help_text}</p>
                          )}

                          <div className="mt-1">
                            {answer ? (
                              <AnswerValue answer={answer} optionLabel={optionLabel} />
                            ) : (
                              <span className="text-muted-foreground text-sm italic">Sin respuesta</span>
                            )}
                          </div>

                          {answer?.comment && (
                            <>
                              <Separator className="my-1" />
                              <div className="flex flex-col gap-1">
                                <p className="text-xs font-medium text-orange-600">Acción a seguir</p>
                                <p className="text-sm text-gray-700">{answer.comment}</p>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
