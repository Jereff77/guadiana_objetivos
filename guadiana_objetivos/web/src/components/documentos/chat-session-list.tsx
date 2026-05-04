'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, MessageSquare, Trash2 } from 'lucide-react'
import { createChatSession, deleteSession } from '@/app/(dashboard)/documentos/chat/chat-actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface ChatSessionListProps {
  sessions: ChatSession[]
}

export default function ChatSessionList({ sessions }: ChatSessionListProps) {
  const router = useRouter()
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)

  const handleNewSession = async () => {
    setIsLoading(true)
    try {
      const result = await createChatSession()
      if (result.data) {
        setSelectedSessionId(result.data.id)
        router.push(`/documentos/chat?session=${result.data.id}`)
      }
      if (result.error) {
        console.error('Error al crear sesión:', result.error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId)
    router.push(`/documentos/chat?session=${sessionId}`)
  }

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return

    setIsLoading(true)
    try {
      const result = await deleteSession(sessionToDelete)
      if (result.error) {
        console.error('Error al eliminar sesión:', result.error)
      } else {
        if (selectedSessionId === sessionToDelete) {
          setSelectedSessionId(null)
          router.push('/documentos/chat')
        }
      }
    } finally {
      setIsLoading(false)
      setSessionToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins}min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`

    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
  }

  return (
    <>
      <div className="flex flex-col h-full border-r bg-white">
        {/* Header con botón Nueva conversación */}
        <div className="p-4 border-b">
          <button
            onClick={handleNewSession}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#194D95] hover:bg-[#154080] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva conversación</span>
          </button>
        </div>

        {/* Lista de sesiones */}
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4 text-center">
              <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">No tienes conversaciones aún</p>
              <p className="text-xs mt-1">Crea una nueva para empezar</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSessionId === session.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectSession(session.id)}
                >
                  <h3 className="font-medium text-sm text-gray-900 truncate">
                    {session.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(session.updated_at)}
                  </p>

                  {/* Botón eliminar (solo hover) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSessionToDelete(session.id)
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!sessionToDelete} onOpenChange={() => setSessionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los mensajes de esta conversación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSession}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
