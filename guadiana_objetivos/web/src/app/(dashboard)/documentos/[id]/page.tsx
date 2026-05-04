'use client'

import { useEffect, useState, useCallback } from 'react'
import { notFound } from 'next/navigation'
import { getDocumentById, updateDocumentContent } from '../documento-actions'
import type { DocumentWithContent } from '../documento-actions'
import { DocumentContent } from './document-content'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, FileText, Clock, Calendar, Tag, Link2, AlertCircle, Edit3, Save, X } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface PageProps {
  params: {
    id: string
  }
}

export default function DocumentPage({ params }: PageProps) {
  const [document, setDocument] = useState<DocumentWithContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const loadDocument = useCallback(async () => {
    setIsLoading(true)
    const result = await getDocumentById(params.id)
    if (result.error || !result.data) {
      setNotFoundState(true)
    } else {
      setDocument(result.data as DocumentWithContent)
    }
    setIsLoading(false)
  }, [params.id])

  useEffect(() => {
    loadDocument()
  }, [loadDocument])

  useEffect(() => {
    async function checkPermissions() {
      const supabase = createClient()
      const { data: canUpload } = await supabase.rpc('has_permission', {
        permission_key: 'documentos.upload'
      })
      const { data: canManage } = await supabase.rpc('has_permission', {
        permission_key: 'documentos.manage'
      })
      const { data: isRootUser } = await supabase.rpc('is_root')
      setCanEdit(canUpload || canManage || isRootUser)
    }
    checkPermissions()
  }, [])

  const handleEdit = () => {
    if (document) {
      setEditContent(document.content)
      setIsEditing(true)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditContent('')
  }

  const handleSave = async () => {
    if (!document) return
    setIsSaving(true)
    const result = await updateDocumentContent(document.id, editContent)
    setIsSaving(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Contenido guardado. Reprocesando documento...')
    setIsEditing(false)
    setEditContent('')
    loadDocument()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (notFoundState || !document) {
    notFound()
  }

  const doc = document

  if (doc.processing_status === 'pending' || doc.processing_status === 'processing') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/documentos" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Documento en Procesamiento</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
          <h2 className="text-xl font-semibold mb-2">{doc.title}</h2>
          <p className="text-muted-foreground mb-1">
            {doc.processing_status === 'pending'
              ? 'El documento está en cola para ser procesado.'
              : 'El documento se está procesando actualmente.'}
          </p>
          <p className="text-sm text-muted-foreground">
            Vuelve más tarde para ver el contenido completo.
          </p>
          <Link href="/documentos" className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Volver al repositorio
          </Link>
        </div>
      </div>
    )
  }

  if (doc.processing_status === 'error') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/documentos" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Error al Procesar Documento</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mb-6" />
          <h2 className="text-xl font-semibold mb-2">{doc.title}</h2>
          <p className="text-muted-foreground mb-1">
            Ocurrió un error al procesar este documento.
          </p>
          {doc.processing_error && (
            <p className="text-sm text-destructive mt-2 max-w-md">
              Error: {doc.processing_error}
            </p>
          )}
          <Link href="/documentos" className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Volver al repositorio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/documentos" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Documento</h1>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            </>
          ) : (
            doc.processing_status === 'completed' && canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )
          )}
        </div>
      </div>

      {/* Título y metadatos principales */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">{doc.title}</h2>
        {doc.description && (
          <p className="text-lg text-muted-foreground mb-4">{doc.description}</p>
        )}

        {/* Badges de estado */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {doc.file_type === 'md' ? 'Markdown' : 'Texto plano'}
          </Badge>

          <Badge
            variant={doc.access_type === 'public' ? 'default' : 'secondary'}
            className="flex items-center gap-1"
          >
            {doc.access_type === 'public' && '🌖 Público'}
            {doc.access_type === 'private' && '🔒 Privado'}
            {doc.access_type === 'roles' && '👥 Por roles'}
          </Badge>

          {doc.proc_categories && (
            <Badge
              variant="outline"
              style={{
                borderColor: doc.proc_categories.color_hex,
                color: doc.proc_categories.color_hex
              }}
            >
              {doc.proc_categories.icon && <span className="mr-1">{doc.proc_categories.icon}</span>}
              {doc.proc_categories.name}
            </Badge>
          )}

          {doc.word_count && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {doc.word_count.toLocaleString()} palabras
            </Badge>
          )}
        </div>

        {/* Metadatos adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Creado: {new Date(doc.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          {doc.updated_at !== doc.created_at && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Actualizado: {new Date(doc.updated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          )}
          {doc.file_size && (
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Tamaño: {(doc.file_size / 1024).toFixed(1)} KB</span>
            </div>
          )}
          {doc.uploaded_by && doc.profiles && (
            <div className="flex items-center gap-2">
              <span>Subido por: {doc.profiles.full_name || 'Usuario'}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {doc.tags && doc.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {doc.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sección de relaciones */}
      {(doc.relations_outgoing.length > 0 || doc.relations_incoming.length > 0) && (
        <div className="mb-8 p-4 border rounded-lg bg-muted/30">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Relaciones con otros documentos
          </h3>

          {doc.relations_outgoing.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Enlaza a:</p>
              <ul className="space-y-2">
                {doc.relations_outgoing.map((rel) => (
                  <li key={rel.id} className="flex items-center gap-2 text-sm">
                    <Badge variant={rel.relation_type === 'manual' ? 'default' : 'secondary'} className="text-xs">
                      {rel.relation_type === 'manual' ? 'Manual' : 'Automática'}
                    </Badge>
                    {rel.related_document && (
                      <Link
                        href={`/documentos/${rel.related_document.id}`}
                        className="text-primary hover:underline"
                      >
                        {rel.related_document.title}
                      </Link>
                    )}
                    {rel.similarity_score && (
                      <span className="text-muted-foreground text-xs">
                        ({Math.round(rel.similarity_score * 100)}% similitud)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {doc.relations_incoming.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Enlazado desde:</p>
              <ul className="space-y-2">
                {doc.relations_incoming.map((rel) => (
                  <li key={rel.id} className="flex items-center gap-2 text-sm">
                    <Badge variant={rel.relation_type === 'manual' ? 'default' : 'secondary'} className="text-xs">
                      {rel.relation_type === 'manual' ? 'Manual' : 'Automática'}
                    </Badge>
                    {rel.related_document && (
                      <Link
                        href={`/documentos/${rel.related_document.id}`}
                        className="text-primary hover:underline"
                      >
                        {rel.related_document.title}
                      </Link>
                    )}
                    {rel.similarity_score && (
                      <span className="text-muted-foreground text-xs">
                        ({Math.round(rel.similarity_score * 100)}% similitud)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Contenido del documento */}
      <div className="border rounded-lg p-6 bg-background">
        <h3 className="font-semibold mb-4">{isEditing ? 'Editando contenido' : 'Contenido'}</h3>
        <DocumentContent
          content={isEditing ? editContent : doc.content}
          fileType={doc.file_type}
          isEditing={isEditing}
          onContentChange={setEditContent}
        />
      </div>

      {/* Footer */}
      <div className="mt-8 flex gap-4">
        <Link href="/documentos" className="px-4 py-2 border rounded-md hover:bg-muted">
          Volver al repositorio
        </Link>
      </div>
    </div>
  )
}
