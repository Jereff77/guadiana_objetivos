'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// ─── Survey ─────────────────────────────────────────────────────────────────

export async function updateSurveyMeta(
  surveyId: string,
  data: { name: string; description: string; category: string }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('form_surveys')
    .update({
      name: data.name,
      description: data.description || null,
      category: data.category || null,
      updated_by: user.id,
    })
    .eq('id', surveyId)

  revalidatePath(`/formularios/${surveyId}/editar`)
}

// ─── Sections ────────────────────────────────────────────────────────────────

export async function createSection(surveyId: string, order: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('form_sections')
    .insert({ survey_id: surveyId, title: 'Nueva sección', order })
    .select('id, title, description, order')
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/formularios/${surveyId}/editar`)
  return { section: data }
}

export async function updateSection(
  sectionId: string,
  data: { title: string; description: string }
) {
  const supabase = await createClient()
  await supabase
    .from('form_sections')
    .update({ title: data.title, description: data.description || null })
    .eq('id', sectionId)
}

export async function deleteSection(sectionId: string) {
  const supabase = await createClient()
  await supabase.from('form_sections').delete().eq('id', sectionId)
}

export async function reorderSections(
  surveyId: string,
  orderedIds: string[]
) {
  const supabase = await createClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('form_sections').update({ order: index }).eq('id', id)
    )
  )
  revalidatePath(`/formularios/${surveyId}/editar`)
}

// ─── Questions ───────────────────────────────────────────────────────────────

export async function createQuestion(sectionId: string, type: string, order: number) {
  const supabase = await createClient()

  const defaultLabel: Record<string, string> = {
    boolean: '¿Se cumple este punto?',
    single_choice: 'Selecciona una opción',
    multiple_choice: 'Selecciona las opciones aplicables',
    text_short: 'Escribe tu respuesta',
    text_long: 'Describe con detalle',
    number: 'Ingresa un valor numérico',
    date: 'Selecciona la fecha',
  }

  const { data, error } = await supabase
    .from('form_questions')
    .insert({
      section_id: sectionId,
      label: defaultLabel[type] ?? 'Nueva pregunta',
      type,
      required: false,
      order,
    })
    .select('id, section_id, label, description, type, required, order, placeholder, help_text, metadata')
    .single()

  if (error) return { error: error.message }

  // Para preguntas booleanas: crear opciones Sí/No con puntajes por defecto
  if (type === 'boolean') {
    await supabase.from('form_question_options').insert([
      { question_id: data.id, label: 'Sí', value: 'yes', score: 1, order: 0, is_default: false },
      { question_id: data.id, label: 'No', value: 'no', score: 0, order: 1, is_default: false },
    ])
  }

  return { question: data }
}

export async function updateQuestion(
  questionId: string,
  data: { label: string; help_text: string; required: boolean }
) {
  const supabase = await createClient()
  await supabase
    .from('form_questions')
    .update({
      label: data.label,
      help_text: data.help_text || null,
      required: data.required,
    })
    .eq('id', questionId)
}

export async function deleteQuestion(questionId: string) {
  const supabase = await createClient()
  await supabase.from('form_questions').delete().eq('id', questionId)
}

export async function reorderQuestions(
  sectionId: string,
  orderedIds: string[]
) {
  const supabase = await createClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('form_questions').update({ order: index }).eq('id', id)
    )
  )
}

// ─── Options ─────────────────────────────────────────────────────────────────

export async function createOption(questionId: string, label: string, order: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_question_options')
    .insert({ question_id: questionId, label, order })
    .select('id, question_id, label, value, score, order, is_default')
    .single()

  if (error) return { error: error.message }
  return { option: data }
}

export async function updateOption(
  optionId: string,
  data: { label: string; score: number | null }
) {
  const supabase = await createClient()
  await supabase
    .from('form_question_options')
    .update({ label: data.label, score: data.score })
    .eq('id', optionId)
}

export async function deleteOption(optionId: string) {
  const supabase = await createClient()
  await supabase.from('form_question_options').delete().eq('id', optionId)
}
