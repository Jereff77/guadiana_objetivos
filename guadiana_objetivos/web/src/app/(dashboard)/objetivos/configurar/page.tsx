import { requirePermission } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { getDepartments } from '../dept-actions'
import { ConfigurarObjetivosClient } from './configurar-client'

export const metadata = { title: 'Configurar objetivos — Guadiana' }

interface PageProps {
  searchParams: Promise<{ dept?: string; obj?: string; tab?: string }>
}

export default async function ConfigurarObjetivosPage({ searchParams }: PageProps) {
  await requirePermission('objetivos.manage')

  const sp = await searchParams
  const supabase = await createClient()

  const [departments, { data: profiles }, { data: surveys }] = await Promise.all([
    getDepartments(),
    supabase.from('profiles').select('id, full_name').eq('is_active', true).order('full_name'),
    supabase.from('form_surveys').select('id, name').eq('status', 'published').order('name'),
  ])

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurar objetivos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administra departamentos, define objetivos mensuales y gestiona entregables.
        </p>
      </div>

      <ConfigurarObjetivosClient
        departments={departments}
        profiles={profiles ?? []}
        surveys={surveys ?? []}
        initialDeptId={sp.dept}
        initialObjId={sp.obj}
        initialTab={sp.tab ?? 'departments'}
      />
    </div>
  )
}
