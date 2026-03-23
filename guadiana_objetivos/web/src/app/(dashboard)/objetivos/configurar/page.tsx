import { requirePermission } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { getDepartments } from '../dept-actions'
import { getObjectivesByDept } from '../objective-actions'
import { ConfigurarObjetivosClient } from './configurar-client'
import type { Objective } from '../objective-actions'

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

  // Cargar objetivos recientes (todos los departamentos, mes actual)
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Objetivos del mes actual por departamento
  const objectivesByDept: Record<string, Objective[]> = {}
  for (const dept of departments) {
    objectivesByDept[dept.id] = await getObjectivesByDept(dept.id, currentMonth, currentYear)
  }

  // Objetivos para mostrar en la lista (con nombre de departamento)
  const recentObjectives: (Objective & { dept_name: string })[] = []
  for (const dept of departments) {
    const objs = objectivesByDept[dept.id] ?? []
    objs.forEach(obj => recentObjectives.push({ ...obj, dept_name: dept.name }))
  }

  // Ordenar por departamento y luego por peso
  recentObjectives.sort((a, b) => {
    if (a.dept_name !== b.dept_name) return a.dept_name.localeCompare(b.dept_name)
    return b.weight - a.weight
  })

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
        recentObjectives={recentObjectives}
        objectivesByDept={objectivesByDept}
        currentMonth={currentMonth}
        currentYear={currentYear}
        initialDeptId={sp.dept}
        initialObjId={sp.obj}
        initialTab={sp.tab ?? 'departments'}
      />
    </div>
  )
}
