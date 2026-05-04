import { requirePermission } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatSessionList from '@/components/documentos/chat-session-list'
import ChatConversation from '@/components/documentos/chat-conversation'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar permiso documentos.chat
  await requirePermission('documentos.chat')

  // Cargar sesiones del usuario
  const { data: sessions } = await supabase
    .from('proc_chat_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="grid grid-cols-[280px_1fr] h-full">
      <ChatSessionList sessions={sessions || []} />
      <ChatConversation />
    </div>
  )
}
