import { requirePermission } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getPolicies } from './policy-actions'
import { PoliciesClient } from './policies-client'

export default async function IAPoliticasPage() {
  await requirePermission('ia.configure')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) redirect('/login')

  const { data: policies } = await getPolicies()

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Políticas y Reglas del Agente</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Define reglas que GUADIANA debe respetar en todas sus respuestas. Las políticas críticas
          se aplican siempre; las demás se activan según el contexto del mensaje.
        </p>
      </div>
      <PoliciesClient initialPolicies={policies ?? []} />
    </div>
  )
}
