'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createSurvey(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'El nombre es requerido' }

  const { data, error } = await supabase
    .from('form_surveys')
    .insert({
      name,
      description: (formData.get('description') as string | null)?.trim() || null,
      status: 'draft',
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/formularios')
  redirect(`/formularios/${data.id}/editar`)
}

export async function publishSurvey(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Validación de integridad: debe tener al menos 1 sección con 1 pregunta
  const { data: sections } = await supabase
    .from('form_sections')
    .select('id')
    .eq('survey_id', id)

  if (!sections || sections.length === 0) {
    return { error: 'El formulario debe tener al menos una sección antes de publicarse.' }
  }

  const { data: questions } = await supabase
    .from('form_questions')
    .select('id')
    .in('section_id', sections.map((s) => s.id))

  if (!questions || questions.length === 0) {
    return { error: 'El formulario debe tener al menos una pregunta antes de publicarse.' }
  }

  const { error } = await supabase
    .from('form_surveys')
    .update({ status: 'published', updated_by: user.id })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/formularios')
  return { success: true }
}

export async function archiveSurvey(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('form_surveys')
    .update({ status: 'archived', updated_by: user.id })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/formularios')
  return { success: true }
}

export async function restoreSurvey(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('form_surveys')
    .update({ status: 'draft', updated_by: user.id })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/formularios')
  return { success: true }
}

export async function deleteSurvey(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('form_surveys')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/formularios')
  return { success: true }
}

export async function createNewVersion(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: survey } = await supabase
    .from('form_surveys')
    .select('name, description, code, category, target_role, ai_context, version, is_template')
    .eq('id', id)
    .single()

  if (!survey) return { error: 'Formulario no encontrado' }

  const { data: newSurvey, error: surveyError } = await supabase
    .from('form_surveys')
    .insert({
      name: survey.name,
      description: survey.description,
      code: survey.code,
      category: survey.category,
      target_role: survey.target_role,
      ai_context: survey.ai_context,
      version: survey.version + 1,
      is_template: survey.is_template,
      status: 'draft',
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id')
    .single()

  if (surveyError || !newSurvey) return { error: surveyError?.message ?? 'Error al crear nueva versión' }

  const { data: sections } = await supabase
    .from('form_sections')
    .select('id, title, description, order')
    .eq('survey_id', id)
    .order('order')

  for (const section of sections ?? []) {
    const { data: newSection } = await supabase
      .from('form_sections')
      .insert({
        survey_id: newSurvey.id,
        title: section.title,
        description: section.description,
        order: section.order,
      })
      .select('id')
      .single()

    if (!newSection) continue

    const { data: questions } = await supabase
      .from('form_questions')
      .select('id, label, description, type, required, order, placeholder, help_text, metadata')
      .eq('section_id', section.id)
      .order('order')

    for (const question of questions ?? []) {
      const { data: newQuestion } = await supabase
        .from('form_questions')
        .insert({
          section_id: newSection.id,
          label: question.label,
          description: question.description,
          type: question.type,
          required: question.required,
          order: question.order,
          placeholder: question.placeholder,
          help_text: question.help_text,
          metadata: question.metadata,
        })
        .select('id')
        .single()

      if (!newQuestion) continue

      const { data: options } = await supabase
        .from('form_question_options')
        .select('label, value, score, order, is_default')
        .eq('question_id', question.id)
        .order('order')

      if (options && options.length > 0) {
        await supabase.from('form_question_options').insert(
          options.map((opt) => ({
            question_id: newQuestion.id,
            label: opt.label,
            value: opt.value,
            score: opt.score,
            order: opt.order,
            is_default: opt.is_default,
          }))
        )
      }
    }
  }

  revalidatePath('/formularios')
  redirect(`/formularios/${newSurvey.id}/editar`)
}
