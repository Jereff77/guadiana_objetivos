import { checkIsRoot, checkPermission } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { SistemaTabs } from '@/components/configuracion/sistema-tabs'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Sistema — Guadiana' }

export default async function SistemaPage() {
  const [isRoot, canEdit] = await Promise.all([
    checkIsRoot(),
    checkPermission('config.edit'),
  ])

  if (!isRoot && !canEdit) redirect('/sin-acceso')

  const supabase = await createClient()
  const { data: rows } = await supabase.from('system_config').select('key, value')

  const config: Record<string, string | null> = {}
  for (const row of rows ?? []) config[row.key] = row.value

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Configuración del Sistema</h1>
      <SistemaTabs config={config} />
    </div>
  )
}
