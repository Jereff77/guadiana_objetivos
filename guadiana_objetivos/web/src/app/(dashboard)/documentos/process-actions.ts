'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Invoca la Edge Function de procesamiento de documentos
 * Esta es una llamada "fire and forget" - no espera a que termine el procesamiento
 */
export async function invokeDocumentProcessor(documentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Validar permisos ANTES de invocar la Edge Function
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: canUpload } = await supabase.rpc('has_permission', {
      permission_key: 'documentos.upload'
    })
    const { data: isRootUser } = await supabase.rpc('is_root')

    if (!canUpload && !isRootUser) {
      return { success: false, error: 'No tienes permiso para procesar documentos' }
    }

    // Obtener credenciales para invocar la Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, error: 'Configuración de Supabase incompleta' }
    }

    // Invocar Edge Function (fire and forget)
    const response = await fetch(`${supabaseUrl}/functions/v1/process-document`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ documentId })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      return {
        success: false,
        error: `Error invocando Edge Function (${response.status}): ${errorData.error || response.statusText}`
      }
    }

    // La Edge Function responde 202 inmediatamente
    return { success: true }

  } catch (error) {
    console.error('Error invocando procesador de documentos:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al invocar procesador de documentos'
    }
  }
}
