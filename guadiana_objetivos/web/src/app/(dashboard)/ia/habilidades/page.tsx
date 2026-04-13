import { redirect } from 'next/navigation'
import { requirePermission } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { getSkills } from './skill-actions'
import { SkillsClient } from './skills-client'

export const metadata = { title: 'Habilidades IA — Guadiana' }

export default async function IAHabilidadesPage() {
  await requirePermission('ia.configure')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) redirect('/login')

  const { data: skills } = await getSkills()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Habilidades de GUADIANA</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Define conocimientos, procesos y comportamientos que el asistente aplicará en el chat
        </p>
      </div>
      <SkillsClient initialSkills={skills ?? []} />
    </div>
  )
}
