import { requirePermission } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTools } from './tool-actions'
import { ToolsClient } from './tools-client'

export default async function IAHerramientasPage() {
  await requirePermission('ia.configure')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) redirect('/login')

  const { data: tools } = await getTools()

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Herramientas del Agente</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Scripts Python que GUADIANA puede ejecutar para consultar datos en tiempo real.
          Claude decide cuándo usarlos según la descripción de cada herramienta.
        </p>
      </div>
      <ToolsClient initialTools={tools ?? []} />
    </div>
  )
}
