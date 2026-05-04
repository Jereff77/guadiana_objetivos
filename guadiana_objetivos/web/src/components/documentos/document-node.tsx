'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { FileText, File, Lock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Tipos
export interface DocumentNodeData {
  id: string
  title: string
  description: string | null
  file_type: 'txt' | 'md'
  category_color: string | null
  category_name: string | null
  access_type: 'public' | 'private' | 'roles'
  processing_status: 'pending' | 'processing' | 'completed' | 'error'
  word_count: number | null
  isSelected: boolean
  hasSelection: boolean  // NUEVO: indica si hay algún nodo seleccionado en el grafo
}

/**
 * Nodo personalizado para el grafo de documentos.
 * - Color según categoría
 * - Tamaño según word_count
 * - Iconos de acceso y archivo
 * - Bordes punteados para estados error/processing
 */
export function DocumentNode(props: NodeProps) {
  const data = (props.data as unknown) as DocumentNodeData
  const selected = props.selected
  // Determinar tamaño según word_count
  const getSizeClass = () => {
    if (!data.word_count) return 'min-w-[180px] min-h-[90px]' // Default
    if (data.word_count < 500) return 'min-w-[160px] min-h-[80px]' // Pequeño
    if (data.word_count <= 3000) return 'min-w-[180px] min-h-[90px]' // Mediano
    return 'min-w-[200px] min-h-[100px]' // Grande
  }

  // Color de fondo según categoría (o gris si no tiene)
  const bgColor = data.category_color || '#0a3683ff'

  // Icono según file_type
  const FileIcon = data.file_type === 'md' ? FileText : File

  // Icono según access_type
  const AccessIcon = data.access_type === 'private' ? Lock : data.access_type === 'roles' ? Users : null

  // Clases de borde según estado
  const getBorderClass = () => {
    if (data.processing_status === 'error') return 'border-2 border-dashed border-destructive'
    if (data.processing_status === 'processing' || data.processing_status === 'pending') {
      return 'border-2 border-dashed border-primary'
    }
    return 'border-2 border-border'
  }

  // Opacidad según selección - CORREGIDO: Solo atenuar si HAY una selección activa Y este nodo NO es el seleccionado
  const opacityClass = data.hasSelection && !data.isSelected ? 'opacity-30' : 'opacity-100'

  return (
    <div
      className={cn(
        'relative bg-white dark:bg-slate-800 rounded-lg shadow-lg border transition-all duration-200',
        getSizeClass(),
        getBorderClass(),
        selected && 'ring-2 ring-primary ring-offset-2',
        opacityClass
      )}
      style={{
        borderTopColor: bgColor,
        borderTopWidth: 4
      }}
    >
      {/* Handles para conexiones */}
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />

      {/* Contenido del nodo */}
      <div className="p-3 h-full flex flex-col">
        {/* Header con iconos */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <FileIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {AccessIcon && <AccessIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
          </div>

          {/* Badge de tipo de acceso */}
          <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
            {data.access_type === 'public' && '🌖'}
            {data.access_type === 'private' && '🔒'}
            {data.access_type === 'roles' && '👥'}
          </Badge>
        </div>

        {/* Título */}
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground" title={data.title}>
          {data.title}
        </h3>

        {/* Footer con categoría y word count */}
        <div className="mt-auto pt-2 flex items-center justify-between text-xs text-muted-foreground">
          {data.category_name && (
            <span
              className="truncate max-w-[70%]"
              style={{ color: bgColor }}
              title={data.category_name}
            >
              {data.category_name}
            </span>
          )}
          {data.word_count && (
            <span className="flex-shrink-0">{data.word_count} p</span>
          )}
        </div>
      </div>
    </div>
  )
}
