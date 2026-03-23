'use server'

import { createClient } from '@/lib/supabase/server'
import { completeTopic } from '../../course-actions'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SurveyOption {
  id: string
  label: string
  value: string | null
  score: number | null
  order: number
}

export interface SurveyQuestion {
  id: string
  section_id: string
  label: string
  description: string | null
  type: string
  required: boolean
  order: number
  help_text: string | null
  options: SurveyOption[]
}

export interface SurveySection {
  id: string
  title: string
  description: string | null
  order: number
  questions: SurveyQuestion[]
}

export interface SurveyForTopic {
  id: string
  name: string
  description: string | null
  sections: SurveySection[]
}

// ── Cargar survey con secciones, preguntas y opciones ────────────────────────

export async function getSurveyForTopic(
  surveyId: string,
): Promise<{ success: boolean; data?: SurveyForTopic; error?: string }> {
  const supabase = await createClient()

  const { data: survey, error: surveyError } = await supabase
    .from('form_surveys')
    .select('id, name, description')
    .eq('id', surveyId)
    .eq('status', 'published')
    .single()

  if (surveyError || !survey) return { success: false, error: 'Evaluación no encontrada.' }

  const { data: sections, error: sectionsError } = await supabase
    .from('form_sections')
    .select('id, title, description, order')
    .eq('survey_id', surveyId)
    .order('order', { ascending: true })

  if (sectionsError) return { success: false, error: sectionsError.message }

  const sectionIds = (sections ?? []).map(s => s.id)

  const [questionsResult, optionsResult] = await Promise.all([
    sectionIds.length > 0
      ? supabase
          .from('form_questions')
          .select('id, section_id, label, description, type, required, order, help_text')
          .in('section_id', sectionIds)
          .order('order', { ascending: true })
      : { data: [], error: null },
    sectionIds.length > 0
      ? supabase
          .from('form_question_options')
          .select('id, question_id, label, value, score, order')
          .order('order', { ascending: true })
      : { data: [], error: null },
  ])

  if (questionsResult.error) return { success: false, error: questionsResult.error.message }

  const questions = questionsResult.data ?? []
  const options   = optionsResult.data ?? []

  const optionsByQuestion = new Map<string, SurveyOption[]>()
  for (const opt of options) {
    const list = optionsByQuestion.get(opt.question_id) ?? []
    list.push(opt as SurveyOption)
    optionsByQuestion.set(opt.question_id, list)
  }

  const builtSections: SurveySection[] = (sections ?? []).map(sec => ({
    ...sec,
    questions: questions
      .filter(q => q.section_id === sec.id)
      .map(q => ({
        ...q,
        options: optionsByQuestion.get(q.id) ?? [],
      })) as SurveyQuestion[],
  }))

  return {
    success: true,
    data: { ...survey, sections: builtSections },
  }
}

// ── Enviar respuestas y completar el tema ─────────────────────────────────────

type AnswerValue =
  | { type: 'text'; value: string }
  | { type: 'number'; value: number }
  | { type: 'bool'; value: boolean }
  | { type: 'option'; optionId: string }
  | { type: 'options'; optionIds: string[] }

export interface SubmitAnswer {
  questionId: string
  answer: AnswerValue | null
}

export async function submitSurveyTopic(
  surveyId: string,
  courseId: string,
  topicId: string,
  answers: SubmitAnswer[],
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado.' }

  // 1. Crear el survey run
  const { data: run, error: runError } = await supabase
    .from('resp_survey_runs')
    .insert({
      survey_id: surveyId,
      respondent_id: user.id,
      started_at: new Date().toISOString(),
      status: 'in_progress',
    })
    .select('id')
    .single()

  if (runError || !run) return { success: false, error: runError?.message ?? 'Error al iniciar la evaluación.' }

  // 2. Guardar respuestas
  const rows = answers.map(({ questionId, answer }) => {
    const base = { run_id: run.id, question_id: questionId }
    if (!answer) return { ...base, not_applicable: true }

    switch (answer.type) {
      case 'text':    return { ...base, value_text: answer.value }
      case 'number':  return { ...base, value_number: answer.value }
      case 'bool':    return { ...base, value_bool: answer.value }
      case 'option':  return { ...base, option_id: answer.optionId }
      case 'options': return { ...base, value_json: answer.optionIds }
      default:        return base
    }
  })

  if (rows.length > 0) {
    const { error: answersError } = await supabase.from('resp_answers').insert(rows)
    if (answersError) return { success: false, error: answersError.message }
  }

  // 3. Completar el run
  await supabase
    .from('resp_survey_runs')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', run.id)

  // 4. Completar el tema en lms_course_progress
  const result = await completeTopic(courseId, topicId, { surveyRunId: run.id })
  if (!result.success) return { success: false, error: result.error }

  return { success: true }
}
