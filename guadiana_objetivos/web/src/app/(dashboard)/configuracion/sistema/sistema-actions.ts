'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { checkIsRoot, checkPermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function assertCanEdit() {
  const [isRoot, canEdit] = await Promise.all([checkIsRoot(), checkPermission('config.edit')])
  if (!isRoot && !canEdit) redirect('/sin-acceso')
}

/**
 * Guarda un mapa clave→valor en system_config.
 */
export async function saveSystemConfig(
  updates: Record<string, string | null>
): Promise<{ error?: string }> {
  await assertCanEdit()
  const admin = createAdminClient()

  for (const [key, value] of Object.entries(updates)) {
    const { error } = await admin
      .from('system_config')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) return { error: error.message }
  }

  revalidatePath('/configuracion/sistema')
  revalidatePath('/')
  revalidatePath('/inicio')
  return {}
}

/**
 * Sube un logo al bucket system-assets y guarda la URL en system_config.
 */
export async function uploadLogo(formData: FormData): Promise<{ url?: string; error?: string }> {
  await assertCanEdit()

  const file = formData.get('file') as File | null
  if (!file) return { error: 'No se proporcionó archivo' }
  if (file.size > 2 * 1024 * 1024) return { error: 'El archivo supera 2 MB' }

  const ext = file.name.split('.').pop()
  const path = `logo/logo-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const admin = createAdminClient()
  const { error: uploadError } = await admin.storage
    .from('system-assets')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data } = admin.storage.from('system-assets').getPublicUrl(path)

  await admin
    .from('system_config')
    .upsert(
      { key: 'branding_logo_url', value: data.publicUrl, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )

  revalidatePath('/configuracion/sistema')
  revalidatePath('/')
  revalidatePath('/inicio')
  return { url: data.publicUrl }
}
