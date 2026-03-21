'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createAssignment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const surveyId = formData.get('survey_id') as string
  const assigneeType = formData.get('assignee_type') as string
  const assigneeRole = assigneeType === 'role' ? (formData.get('assignee_role') as string) : null
  const assigneeUserId = assigneeType === 'user' ? (formData.get('assignee_user_id') as string) : null
  const frequency = (formData.get('required_frequency') as string) || null
  const startDate = (formData.get('start_date') as string) || null
  const endDate = (formData.get('end_date') as string) || null

  if (!surveyId) return { error: 'Selecciona un formulario' }
  if (assigneeType === 'role' && !assigneeRole) return { error: 'Selecciona un rol' }
  if (assigneeType === 'user' && !assigneeUserId) return { error: 'Selecciona un usuario' }

  const { error } = await supabase.from('form_assignments').insert({
    survey_id: surveyId,
    assignee_role: assigneeRole,
    assignee_user_id: assigneeUserId,
    required_frequency: frequency,
    start_date: startDate,
    end_date: endDate,
    is_active: true,
    created_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/asignaciones')
  return { success: true }
}

export async function toggleAssignment(id: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('form_assignments')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/asignaciones')
  return { success: true }
}

export async function deleteAssignment(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('form_assignments').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/asignaciones')
  return { success: true }
}
