'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, checkPermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import type { TallerFormData, TallerRecord, TallerUser } from './taller-types'

// ─── Server Actions ───────────────────────────────────────────────────────────

export async function getTallerData(userId: string): Promise<{
  data?: TallerRecord | null
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  if (userId === user.id) {
    const [canFill, canViewOwn] = await Promise.all([
      checkPermission('taller_fill'),
      checkPermission('taller_view_own'),
    ])
    if (!canFill && !canViewOwn) {
      return { error: 'No tienes permiso para acceder a este formulario' }
    }
  } else {
    await requirePermission('taller_view_all')
  }

  const { data, error } = await supabase
    .from('taller_decisiones')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return { error: error.message }
  return { data: data as TallerRecord | null }
}

export async function saveTallerData(
  userId: string,
  formData: TallerFormData
): Promise<{ data?: TallerRecord | null; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  if (userId !== user.id) return { error: 'Solo puedes guardar tu propio formulario' }

  await requirePermission('taller_fill')

  if (!Array.isArray(formData.decisiones) || formData.decisiones.length !== 10) {
    return { error: 'Deben haber exactamente 10 decisiones' }
  }

  const { data, error } = await supabase
    .from('taller_decisiones')
    .upsert({
      user_id: userId,
      departamento: formData.departamento || null,
      puesto: formData.puesto || null,
      fecha_actualizacion: new Date().toISOString(),
      decisiones: formData.decisiones,
      reflexion_1: formData.reflexion_1 || null,
      reflexion_2: formData.reflexion_2 || null,
      reflexion_3: formData.reflexion_3 || null,
      reflexion_4: formData.reflexion_4 || null,
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/taller/${userId}`)
  return { data: data as TallerRecord }
}

export async function getAllTallerData(): Promise<{
  data?: TallerRecord[]
  error?: string
}> {
  await requirePermission('taller_view_all')

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from('taller_decisiones')
    .select('*')
    .order('fecha_actualizacion', { ascending: false, nullsFirst: false })

  if (error) return { error: error.message }
  return { data: data as TallerRecord[] }
}

export async function getTallerUsers(): Promise<{
  data?: TallerUser[]
  error?: string
}> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_taller_users')
  if (error) return { error: error.message }
  return { data: data as TallerUser[] }
}
