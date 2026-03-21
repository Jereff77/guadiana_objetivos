'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Send, Archive, RotateCcw, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  publishSurvey,
  archiveSurvey,
  restoreSurvey,
  deleteSurvey,
  createNewVersion,
} from '@/app/(dashboard)/formularios/actions'

type SurveyStatus = 'draft' | 'published' | 'archived'

interface SurveyActionsMenuProps {
  id: string
  status: SurveyStatus
}

export function SurveyActionsMenu({ id, status }: SurveyActionsMenuProps) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function handlePublish() {
    setPending(true)
    await publishSurvey(id)
    setPending(false)
  }

  async function handleArchive() {
    setPending(true)
    await archiveSurvey(id)
    setPending(false)
  }

  async function handleRestore() {
    setPending(true)
    await restoreSurvey(id)
    setPending(false)
  }

  async function handleDelete() {
    setPending(true)
    await deleteSurvey(id)
    setPending(false)
    setDeleteOpen(false)
  }

  async function handleCreateNewVersion() {
    setPending(true)
    await createNewVersion(id)
    setPending(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={pending}>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Acciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {status === 'draft' && (
            <DropdownMenuItem onClick={() => router.push(`/formularios/${id}/editar`)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
          )}
          {status === 'draft' && (
            <DropdownMenuItem onClick={handlePublish}>
              <Send className="h-4 w-4 mr-2" />
              Publicar
            </DropdownMenuItem>
          )}
          {status === 'published' && (
            <DropdownMenuItem onClick={handleCreateNewVersion}>
              <Copy className="h-4 w-4 mr-2" />
              Crear nueva versión
            </DropdownMenuItem>
          )}
          {status === 'published' && (
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="h-4 w-4 mr-2" />
              Archivar
            </DropdownMenuItem>
          )}
          {status === 'archived' && (
            <DropdownMenuItem onClick={handleRestore}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar a borrador
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este formulario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán permanentemente el formulario y todas sus secciones y preguntas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {pending ? 'Eliminando…' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
