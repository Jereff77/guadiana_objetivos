'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import type { ActionResult } from '@/lib/ai/types'

/**
 * Envía un email de prueba al usuario actual usando la configuración de Resend guardada.
 */
export async function sendTestEmail(): Promise<ActionResult<{ message: string }>> {
  await requirePermission('ia.configure')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) return { error: 'Usuario no autenticado' }

  // Obtener email del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const toEmail = user.email
  if (!toEmail) return { error: 'El usuario no tiene email configurado' }

  // Obtener configuración de email
  const { data: settings } = await supabase
    .from('ai_settings')
    .select('setting_key, setting_value')
    .in('setting_key', ['email_resend_api_key', 'email_from_name', 'email_from_address'])
    .is('department_id', null)

  const settingsMap = new Map(settings?.map(s => [s.setting_key, s.setting_value]) || [])
  const apiKey      = settingsMap.get('email_resend_api_key')
  const fromName    = settingsMap.get('email_from_name') || 'Plataforma Guadiana'
  const fromAddress = settingsMap.get('email_from_address')

  if (!apiKey) return { error: 'No hay API Key de Resend configurada. Guarda primero la configuración.' }
  if (!fromAddress) return { error: 'No hay email del remitente configurado.' }

  // Llamar a Resend API
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${fromName} <${fromAddress}>`,
      to: [toEmail],
      subject: 'Prueba de configuración — Plataforma Guadiana',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #004B8D;">Configuración de email correcta ✓</h2>
          <p>Hola ${profile?.full_name || 'Usuario'},</p>
          <p>Este email confirma que la configuración de notificaciones de la plataforma Guadiana está funcionando correctamente.</p>
          <p>Las tareas programadas de IA enviarán sus resultados a esta dirección.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">Plataforma Guadiana — Sistema de Gestión de Objetivos</p>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const msg = (errorData as { message?: string }).message || `Error ${response.status}`
    return { error: `Resend error: ${msg}` }
  }

  return { data: { message: `Email enviado a ${toEmail}` } }
}
