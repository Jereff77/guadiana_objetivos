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
