import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { AssignmentsTable } from '@/components/asignaciones/assignments-table'
import { CreateAssignmentDialog } from '@/components/asignaciones/create-assignment-dialog'

export default async function AsignacionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: assignments }, { data: surveys }, { data: profiles }] = await Promise.all([
    supabase
      .from('form_assignments')
      .select('*, form_surveys(name, status)')
      .order('created_at', { ascending: false }),
    supabase
      .from('form_surveys')
      .select('id, name, version')
      .eq('status', 'published')
      .order('name'),
    supabase
      .from('app_profiles')
      .select('id, first_name, last_name, role')
      .order('first_name'),
  ])

  return (
    <>
      <Header
        title="Asignaciones"
        description="Gestiona la asignación de formularios a roles y usuarios"
        action={
          <CreateAssignmentDialog
            surveys={surveys ?? []}
            profiles={profiles ?? []}
          />
        }
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <AssignmentsTable assignments={assignments ?? []} />
      </div>
    </>
  )
}
