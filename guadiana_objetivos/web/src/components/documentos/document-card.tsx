'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Document } from '@/app/(dashboard)/documentos/documento-actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FileText,
  MoreVertical,
  Eye,
  Trash2,
  Calendar,
  Tag,
  Lock,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react'
import { deleteDocument, retryDocument } from '@/app/(dashboard)/documentos/documento-actions'
import { toast } from 'sonner'
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
import { createClient } from '@/lib/supabase/client'

interface DocumentCardProps {
  document: Document
  categoryName?: string
  categoryColor?: string
  canManage: boolean
}

export function DocumentCard({ document, categoryName, categoryColor, canManage }: DocumentCardProps) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setCurrentUserId(user.id)
      }

      setLoading(false)
    }

    loadUser()
  }, [])

  const canDelete = canManage || document.uploaded_by === currentUserId

  const handleDelete = async () => {
    setDeleting(true)

    const result = await deleteDocument(document.id)

    setDeleting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Documento eliminado')
    setDeleteOpen(false)
    router.refresh()
  }

  const handleRetry = async () => {
    setRetrying(true)
    const result = await retryDocument(document.id)
    setRetrying(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Reintentando procesamiento...')
    router.refresh()
  }

  const getStatusBadge = () => {
    switch (document.processing_status) {
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            Pendiente
          </Badge>
        )
      case 'processing':
        return (
          <Badge variant="outline" className="gap-1">
            <ExternalLink className="w-3 h-3 animate-spin" />
            Procesando
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="outline" className="gap-1 border-green-500 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Completado
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="outline" className="gap-1 border-red-500 text-red-700">
            <XCircle className="w-3 h-3" />
            Error
          </Badge>
        )
      default:
        return null
    }
  }

  const getAccessBadge = () => {
    switch (document.access_type) {
      case 'public':
        return (
          <Badge variant="outline" className="gap-1">
            <Eye className="w-3 h-3" />
            Público
          </Badge>
        )
      case 'private':
        return (
          <Badge variant="outline" className="gap-1">
            <Lock className="w-3 h-3" />
            Privado
          </Badge>
        )
      case 'roles':
        return (
          <Badge variant="outline" className="gap-1">
            <Users className="w-3 h-3" />
            Por Roles
          </Badge>
        )
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-'
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(2)} KB`
    const mb = kb / 1024
    return `${mb.toFixed(2)} MB`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  return (
    <Card
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => router.push(`/documentos/${document.id}`)}
      >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {document.title}
              </h3>
              {document.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {document.description}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                  <Link href={`/documentos/${document.id}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Link>
                </DropdownMenuItem>

              {!loading && canDelete && (
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {getStatusBadge()}
          {getAccessBadge()}
          {categoryName && (
            <Badge
              variant="outline"
              style={{
                borderColor: categoryColor,
                color: categoryColor
              }}
            >
              {categoryName}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Fecha
            </p>
            <p className="font-medium">{formatDate(document.created_at)}</p>
          </div>

          <div>
            <p className="text-gray-500">Tamaño</p>
            <p className="font-medium">{formatFileSize(document.file_size)}</p>
          </div>
        </div>

        {document.tags && document.tags.length > 0 && (
          <div>
            <p className="text-gray-500 text-sm mb-2 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Etiquetas
            </p>
            <div className="flex flex-wrap gap-1">
              {document.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {document.processing_status === 'error' && document.processing_error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 space-y-2">
            <p className="text-sm text-red-700">{document.processing_error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={retrying}
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              {retrying ? 'Reintentando...' : 'Reintentar'}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Documento</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar "{document.title}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
