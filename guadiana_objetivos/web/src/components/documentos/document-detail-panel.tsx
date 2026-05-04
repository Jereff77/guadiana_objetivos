'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'lucide-react'
import NextLink from 'next/link'
import { cn } from '@/lib/utils'

// Tipos
export interface DocumentRelation {
  id: string
  relation_type: 'manual' | 'automatic'
  similarity_score: number | null
  related_document: {
    id: string
    title: string
    file_type: 'txt' | 'md'
  }
}

export interface DocumentDetail {
  id: string
  title: string
  description: string | null
  file_type: 'txt' | 'md'
  file_size: number | null
  category_id: string | null
  access_type: 'public' | 'private' | 'roles'
  processing_status: 'pending' | 'processing' | 'completed' | 'error'
  word_count: number | null
  tags: string[] | null
  created_at: string
  updated_at: string
  proc_categories: {
    id: string
    name: string
    color_hex: string
    icon: string | null
  } | null
  relations_outgoing: DocumentRelation[]
  relations_incoming: DocumentRelation[]
}

interface DocumentDetailPanelProps {
  document: DocumentDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onNodeClick?: (documentId: string) => void
}

/**
 * Panel lateral (Sheet) con detalles del documento seleccionado.
 * - Muestra metadata completa
 * - Lista de relaciones clickeables
 * - Botón para ver documento completo
 */
export function DocumentDetailPanel({
  document,
  open,
  onOpenChange,
  onNodeClick
}: DocumentDetailPanelProps) {
  if (!document) return null

  const hasRelations =
    document.relations_outgoing.length > 0 || document.relations_incoming.length > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{document.title}</SheetTitle>
          {document.description && (
            <SheetDescription className="text-base">{document.description}</SheetDescription>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Badges principales */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {document.file_type === 'md' ? 'Markdown' : 'Texto plano'}
            </Badge>

            <Badge
              variant={document.access_type === 'public' ? 'default' : 'secondary'}
            >
              {document.access_type === 'public' && '🌖 Público'}
              {document.access_type === 'private' && '🔒 Privado'}
              {document.access_type === 'roles' && '👥 Por roles'}
            </Badge>

            {document.proc_categories && (
              <Badge
                variant="outline"
                style={{
                  borderColor: document.proc_categories.color_hex,
                  color: document.proc_categories.color_hex
                }}
              >
                {document.proc_categories.icon && (
                  <span className="mr-1">{document.proc_categories.icon}</span>
                )}
                {document.proc_categories.name}
              </Badge>
            )}

            {document.processing_status === 'completed' && (
              <Badge variant="default" className="bg-green-600">
                ✓ Procesado
              </Badge>
            )}
          </div>

          {/* Metadatos */}
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold">Información</h4>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div>Estado:</div>
              <div className="text-foreground">
                {document.processing_status === 'completed' && 'Completado'}
                {document.processing_status === 'processing' && 'Procesando...'}
                {document.processing_status === 'pending' && 'Pendiente'}
                {document.processing_status === 'error' && 'Con error'}
              </div>

              {document.word_count && (
                <>
                  <div>Palabras:</div>
                  <div className="text-foreground">{document.word_count.toLocaleString()}</div>
                </>
              )}

              {document.file_size && (
                <>
                  <div>Tamaño:</div>
                  <div className="text-foreground">
                    {(document.file_size / 1024).toFixed(1)} KB
                  </div>
                </>
              )}

              <div>Creado:</div>
              <div className="text-foreground">
                {new Date(document.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>

              {document.updated_at !== document.created_at && (
                <>
                  <div>Actualizado:</div>
                  <div className="text-foreground">
                    {new Date(document.updated_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Etiquetas</h4>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Relaciones */}
          {hasRelations && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Link className="w-4 h-4" />
                Relaciones
              </h4>

              {document.relations_outgoing.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Enlaza a:</p>
                  <ul className="space-y-2">
                    {document.relations_outgoing.map((rel) => (
                      <li
                        key={rel.id}
                        className="text-sm flex items-center gap-2 group cursor-pointer hover:bg-muted p-1 rounded"
                        onClick={() => onNodeClick?.(rel.related_document.id)}
                      >
                        <Badge
                          variant={rel.relation_type === 'manual' ? 'default' : 'secondary'}
                          className="text-xs flex-shrink-0"
                        >
                          {rel.relation_type === 'manual' ? 'Manual' : 'Auto'}
                        </Badge>
                        <span className="truncate flex-1 group-hover:text-primary">
                          {rel.related_document.title}
                        </span>
                        {rel.similarity_score && (
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {Math.round(rel.similarity_score * 100)}%
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {document.relations_incoming.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Enlazado desde:</p>
                  <ul className="space-y-2">
                    {document.relations_incoming.map((rel) => (
                      <li
                        key={rel.id}
                        className="text-sm flex items-center gap-2 group cursor-pointer hover:bg-muted p-1 rounded"
                        onClick={() => onNodeClick?.(rel.related_document.id)}
                      >
                        <Badge
                          variant={rel.relation_type === 'manual' ? 'default' : 'secondary'}
                          className="text-xs flex-shrink-0"
                        >
                          {rel.relation_type === 'manual' ? 'Manual' : 'Auto'}
                        </Badge>
                        <span className="truncate flex-1 group-hover:text-primary">
                          {rel.related_document.title}
                        </span>
                        {rel.similarity_score && (
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {Math.round(rel.similarity_score * 100)}%
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="mt-6">
          <NextLink href={`/documentos/${document.id}`} className="w-full">
            <Button className="w-full">Ver documento completo</Button>
          </NextLink>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
