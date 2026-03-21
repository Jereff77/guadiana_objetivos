'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get('email') as string).trim().toLowerCase()
  if (!email) return { error: 'El correo es requerido' }

  const headersList = await headers()
  const origin = headersList.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  })

  // Siempre retornar éxito para no revelar si el correo existe
  if (error) {
    console.error('[resetPasswordForEmail]', error.message)
  }

  return { success: true }
}
