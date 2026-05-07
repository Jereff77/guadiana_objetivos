import { createClient } from '@/lib/supabase/server'
import { checkPermission } from '@/lib/permissions'
import { redirect } from 'next/navigation'
import { getTallerData, getTallerUsers } from '../taller-actions'
import { TallerForm } from '@/components/taller/taller-form'
import { TallerView } from '@/components/taller/taller-view'

export const metadata = { title: 'Taller de Decisiones' }

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function TallerPage({ params }: PageProps) {
  const { userId } = await params

  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const currentUserId = authUser.id
  const isOwn = userId === currentUserId

  if (isOwn) {
    const [canFill, canViewOwn] = await Promise.all([
      checkPermission('taller_fill'),
      checkPermission('taller_view_own'),
    ])
    if (!canFill && !canViewOwn) redirect('/objetivos')
  } else {
    const canViewAll = await checkPermission('taller_view_all')
    if (!canViewAll) redirect('/objetivos')
  }

  const [tallerResult, usersResult, profileResult] = await Promise.all([
    getTallerData(userId),
    getTallerUsers(),
    supabase.from('profiles').select('full_name').eq('id', userId).single(),
  ])

  const initialData = tallerResult.data ?? null
  const users = usersResult.data ?? []
  const ownerName = profileResult.data?.full_name ?? 'Usuario'

  const canEdit = isOwn && (await checkPermission('taller_fill'))

  if (canEdit) {
    return (
      <TallerForm
        userId={userId}
        initialData={initialData}
        ownerName={ownerName}
        users={users}
      />
    )
  }

  return (
    <TallerView
      initialData={initialData}
      ownerName={ownerName}
      users={users}
    />
  )
}
