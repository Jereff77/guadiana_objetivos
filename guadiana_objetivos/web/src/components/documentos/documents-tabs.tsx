'use client'

import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { DocumentsGraph } from './documents-graph'
import { DocumentsList } from './documents-list'
import { useSearchParams, useRouter } from 'next/navigation'
import { getDocumentsGraph } from '@/app/(dashboard)/documentos/graph-actions'
import { Document, Category } from '@/app/(dashboard)/documentos/documento-actions'
import { GraphDocument, GraphRelation, GraphCategory } from '@/app/(dashboard)/documentos/graph-actions'

// Tipos
interface FiltersProps {
  search: string
  onSearchChange: (value: string) => void
  category: string | null
  onCategoryChange: (value: string | null) => void
  access_type: string | null
  onAccessTypeChange: (value: string | null) => void
  relationType: 'all' | 'manual' | 'automatic'
  onRelationTypeChange: (value: 'all' | 'manual' | 'automatic') => void
  categories: Category[]
}

/**
 * Componente de filtros compartidos entre vistas.
 * Punto B - Polling intacto: estos filtros son client-side,
 * documents-list sigue teniendo su propio polling con router.refresh()
 */
function Filters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  access_type,
  onAccessTypeChange,
  relationType,
  onRelationTypeChange,
  categories
}: FiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border-b bg-muted/30">
      {/* Buscador */}
      <div className="space-y-2">
        <Label htmlFor="search">Buscar por título</Label>
        <Input
          id="search"
          placeholder="Escribe para buscar..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filtro por categoría */}
      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <Select value={category || 'all'} onValueChange={(v) => onCategoryChange(v === 'all' ? null : v)}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro por tipo de acceso */}
      <div className="space-y-2">
        <Label htmlFor="access_type">Tipo de acceso</Label>
        <Select value={access_type || 'all'} onValueChange={(v) => onAccessTypeChange(v === 'all' ? null : v)}>
          <SelectTrigger id="access_type">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="public">🌖 Público</SelectItem>
            <SelectItem value="private">🔒 Privado</SelectItem>
            <SelectItem value="roles">👥 Por roles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtro por tipo de relación (solo para grafo) */}
      <div className="space-y-2">
        <Label htmlFor="relation_type">Tipo de relación</Label>
        <Select value={relationType} onValueChange={(v: any) => onRelationTypeChange(v)}>
          <SelectTrigger id="relation_type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las relaciones</SelectItem>
            <SelectItem value="manual">Solo manuales</SelectItem>
            <SelectItem value="automatic">Solo automáticas</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// Tipos para props del componente
interface DocumentsTabsProps {
  initialDocuments: Document[]
  initialGraphData: {
    documents: GraphDocument[]
    relations: GraphRelation[]
    categories: GraphCategory[]
  }
  categories: Category[]
}

/**
 * Wrapper con tabs Lista/Grafo.
 * - Estado de tab persistente en URL (?vista=lista|grafo)
 * - Filtros compartidos entre ambas vistas
 * - Polling de procesamiento funciona en ambas vistas (Punto B)
 */
export function DocumentsTabs({
  initialDocuments,
  initialGraphData,
  categories
}: DocumentsTabsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Estado de tab desde URL (default: 'lista')
  const tab = searchParams.get('vista') || 'lista'

  // Estado de filtros
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [access_type, setAccessType] = useState<string | null>(null)
  const [relationType, setRelationType] = useState<'all' | 'manual' | 'automatic'>('all')

  // Actualizar URL cuando cambia el tab
  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'lista') {
        params.delete('vista')
      } else {
        params.set('vista', value)
      }
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [searchParams, router]
  )

  // Actualizar URL cuando cambian los filtros (opcional, para compartir links)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (search) params.set('search', search)
    else params.delete('search')

    if (category) params.set('category', category)
    else params.delete('category')

    if (access_type) params.set('access_type', access_type)
    else params.delete('access_type')

    if (relationType !== 'all') params.set('relationType', relationType)
    else params.delete('relationType')

    const newUrl = `?${params.toString()}`
    if (newUrl !== `?${searchParams.toString()}`) {
      router.push(newUrl, { scroll: false })
    }
  }, [search, category, access_type, relationType, searchParams, router])

  return (
    <div className="h-full flex flex-col">
      {/* Header con título y botón de subida */}
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documentos</h1>
        {/* El botón de subida ya está en page.tsx, no lo duplicamos */}
      </div>

      {/* Tabs de vistas */}
      <Tabs value={tab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b px-4 h-14">
          <TabsTrigger value="lista" className="data-[state=active]:bg-background">
            Lista
          </TabsTrigger>
          <TabsTrigger value="grafo" className="data-[state=active]:bg-background">
            Grafo
          </TabsTrigger>
        </TabsList>

        {/* Filtros compartidos */}
        <Filters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          access_type={access_type}
          onAccessTypeChange={setAccessType}
          relationType={relationType}
          onRelationTypeChange={setRelationType}
          categories={categories}
        />

        {/* Contenido de los tabs */}
        <TabsContent value="lista" className="flex-1 m-0 p-0 overflow-hidden">
          {/* Punto B - documents-list recibe filtros como props */}
          <DocumentsList
            initialDocuments={initialDocuments}
            filters={{
              search,
              category,
              access_type
            }}
          />
        </TabsContent>

        <TabsContent value="grafo" className="flex-1 m-0 p-0 overflow-hidden">
          <div className="w-full h-full">
            <DocumentsGraph
              initialDocuments={initialGraphData.documents}
              initialRelations={initialGraphData.relations}
              categories={initialGraphData.categories}
              filters={{
                search,
                category,
                access_type,
                relationType
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
