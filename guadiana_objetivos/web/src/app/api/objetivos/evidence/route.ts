import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: 'Se requiere el parámetro path' }, { status: 400 })
  }

  const supabase = await createClient()

  // Generar signed URL válida por 1 hora
  const { data, error } = await supabase.storage
    .from('objective-evidences')
    .createSignedUrl(path, 3600)

  if (error || !data) {
    return NextResponse.json({ error: 'Error al generar URL de descarga' }, { status: 500 })
  }

  // Redirigir a la URL firmada
  return NextResponse.redirect(data.signedUrl)
}
