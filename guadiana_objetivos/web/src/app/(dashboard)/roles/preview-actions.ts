'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function startRolePreview(roleId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: hasPerm } = await supabase.rpc('has_permission', { permission_key: 'roles.manage' })
  if (!hasPerm) redirect('/sin-acceso')

  const { data: role } = await supabase
    .from('roles')
    .select('id')
    .eq('id', roleId)
    .single()

  if (!role) return { error: 'Rol no encontrado' }

  const cookieStore = await cookies()
  cookieStore.set('guadiana_preview_role', roleId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  redirect('/inicio')
}

export async function stopRolePreview(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('guadiana_preview_role')
  redirect('/roles')
}
