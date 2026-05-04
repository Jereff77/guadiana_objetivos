'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DocumentCard } from './document-card'
import { type Document } from '@/app/(dashboard)/documentos/documento-actions'

// Punto B - Filtros recibidos como props desde el wrapper de tabs
interface FiltersProps {
  search: string
  category: string | null
  access_type: string | null
}

interface DocumentsListProps {
  initialDocuments: Document[]
  filters: FiltersProps
}

/**
 * Lista de documentos con filtros client-side.
 * Punto B - Polling intacto: router.refresh() sigue funcionando
 * Punto B - Filtros NO se aplican en BD, son client-side
 */
export function DocumentsList({ initialDocuments, filters }: DocumentsListProps) {
  const router = useRouter()

  // Polling para documentos en procesamiento (Punto B - intacto)
  useEffect(() => {
    const processingDocs = initialDocuments.filter(
      doc => doc.processing_status === 'pending' || doc.processing_status === 'processing'
    )

    if (processingDocs.length === 0) return

    console.log(`Polling activo: ${processingDocs.length} documentos en procesamiento`)

    const interval = setInterval(() => {
      console.log('Refrescando lista de documentos...')
      router.refresh()
    }, 5000) // 5 segundos

    return () => {
      clearInterval(interval)
      console.log('Polling detenido')
    }
  }, [initialDocuments, router])

  // Filtros client-side (Punto B - NO en BD)
  const filteredDocs = initialDocuments.filter(doc => {
    // Filtro por búsqueda
    const matchesSearch =
      filters.search === '' ||
      doc.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (doc.description?.toLowerCase() || '').includes(filters.search.toLowerCase())

    // Filtro por categoría
    const matchesCategory = !filters.category || doc.category_id === filters.category

    // Filtro por tipo de acceso
    const matchesAccessType = !filters.access_type || doc.access_type === filters.access_type

    return matchesSearch && matchesCategory && matchesAccessType
  })

  return (
    <div className="p-4 space-y-4">
      {/* Contador de resultados */}
      <div className="text-sm text-muted-foreground">
        {filteredDocs.length} {filteredDocs.length === 1 ? 'documento' : 'documentos'}
      </div>

      {/* Grid de documentos */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron documentos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              categoryName={doc.proc_categories?.name}
              categoryColor={doc.proc_categories?.color_hex}
              canManage={false} // Se gestiona desde el panel lateral del grafo
            />
          ))}
        </div>
      )}
    </div>
  )
}
