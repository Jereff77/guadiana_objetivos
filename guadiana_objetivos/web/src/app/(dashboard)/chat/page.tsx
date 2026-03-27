import { checkIsRoot, checkPermission } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatPageClient } from './chat-page-client'
import { getRooms, getAllUsers, getCurrentUserChatHidden } from './chat-actions'

export const metadata = { title: 'Chat — Guadiana' }

export default async function ChatPage() {
  const [isRoot, canView, canHide] = await Promise.all([
    checkIsRoot(),
    checkPermission('chat.view'),
    checkPermission('chat.hidden'),
  ])
  if (!isRoot && !canView) redirect('/sin-acceso')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [rooms, users, isHidden] = await Promise.all([
    getRooms(),
    getAllUsers(),
    getCurrentUserChatHidden(),
  ])

  return (
    <ChatPageClient
      initialRooms={rooms}
      users={users}
      currentUserId={user.id}
      canHide={canHide}
      initialHidden={isHidden}
    />
  )
}
