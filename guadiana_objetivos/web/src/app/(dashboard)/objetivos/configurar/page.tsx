import { requirePermission } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { getDepartmentsForUser, getAssignableUsersForDept } from '../dept-actions'
import { getObjectivesByDept } from '../objective-actions'
import { ConfigurarObjetivosClient } from './configurar-client'
import type { Objective } from '../objective-actions'

export const metadata = { title: 'Configurar objetivos — Guadiana' }

interface PageProps {
  searchParams: Promise<{ dept?: string; obj?: string; tab?: string }>
}

export default async function ConfigurarObjetivosPage({ searchParams }: PageProps) {
  await requirePermission('objetivos.view')

  const sp = await searchParams
  const supabase = await createClient()

  const [departments, { data: surveys }] = await Promise.all([
    getDepartmentsForUser(),
    supabase.from('form_surveys').select('id, name').eq('status', 'published').order('name'),
  ])

  // Solo departamentos donde el usuario puede gestionar objetivos
  const managedDepts = departments.filter((d) => d.userCanManage)

  // Cargar objetivos del mes actual por departamento (solo gestionables)
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const objectivesByDept: Record<string, Objective[]> = {}
  for (const dept of managedDepts) {
    objectivesByDept[dept.id] = await getObjectivesByDept(dept.id, currentMonth, currentYear)
  }

  const recentObjectives: (Objective & { dept_name: string })[] = []
  for (const dept of managedDepts) {
    const objs = objectivesByDept[dept.id] ?? []
    objs.forEach((obj) => recentObjectives.push({ ...obj, dept_name: dept.name }))
  }
  recentObjectives.sort((a, b) => {
    if (a.dept_name !== b.dept_name) return a.dept_name.localeCompare(b.dept_name)
    return b.weight - a.weight
  })

  // Usuarios asignables por departamento (para el tab Entregables)
  const assignableByDept: Record<string, Awaited<ReturnType<typeof getAssignableUsersForDept>>> = {}
  for (const dept of managedDepts) {
    assignableByDept[dept.id] = await getAssignableUsersForDept(dept.id)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurar objetivos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define objetivos mensuales y gestiona entregables. Los departamentos se gestionan en el{' '}
          <a href="/organigrama" className="text-brand-blue hover:underline">organigrama</a>.
        </p>
      </div>

      <ConfigurarObjetivosClient
        departments={managedDepts}
        assignableByDept={assignableByDept}
        surveys={surveys ?? []}
        recentObjectives={recentObjectives}
        objectivesByDept={objectivesByDept}
        currentMonth={currentMonth}
        currentYear={currentYear}
        initialDeptId={sp.dept}
        initialObjId={sp.obj}
        initialTab={sp.tab ?? 'objectives'}
      />
    </div>
  )
}
