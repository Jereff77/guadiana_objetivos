'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  EdgeMarker,
  OnNodesChange,
  OnEdgesChange,
  OnConnect
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { DocumentNode, DocumentNodeData } from './document-node'
import { DocumentDetailPanel, DocumentDetail } from './document-detail-panel'
import { useRouter } from 'next/navigation'
import { GraphDocument, GraphRelation, GraphCategory } from '@/app/(dashboard)/documentos/graph-actions'
import { cn } from '@/lib/utils'

// Tipos
interface DocumentsGraphProps {
  initialDocuments: GraphDocument[]
  initialRelations: GraphRelation[]
  categories: GraphCategory[]
  filters: {
    search: string
    category: string | null
    access_type: string | null
    relationType: 'all' | 'manual' | 'automatic'
  }
}

// Extender Node para incluir nuestros datos personalizados
type DocumentNode = Node<DocumentNodeData>

// Extender Edge para incluir nuestros datos personalizados
type DocumentEdge = Edge<{ relation_type: 'manual' | 'automatic'; similarity_score: number | null }>

/**
 * Componente principal del grafo de documentos.
 * - Canvas interactivo con @xyflow/react
 * - Nodos personalizados con colores por categoría
 * - Aristas diferenciadas por tipo (manual/automática)
 * - Layout force-directed automático
 * - Panel lateral con detalles al click
 * - Doble click navega a /documentos/[id]
 * - Filtros client-side
 */
export function DocumentsGraph({
  initialDocuments,
  initialRelations,
  categories,
  filters
}: DocumentsGraphProps) {
  const router = useRouter()
  const [nodes, setNodes, onNodesChange] = useNodesState<DocumentNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<DocumentEdge>([])

  // Estado del panel lateral
  const [selectedDocument, setSelectedDocument] = useState<DocumentDetail | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // Filtrar documentos según filtros
  const filteredDocuments = useMemo(() => {
    return initialDocuments.filter((doc) => {
      // Filtro por búsqueda
      if (filters.search && !doc.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Filtro por categoría
      if (filters.category && doc.category_id !== filters.category) {
        return false
      }

      // Filtro por tipo de acceso
      if (filters.access_type && doc.access_type !== filters.access_type) {
        return false
      }

      return true
    })
  }, [initialDocuments, filters])

  // Filtrar relaciones según tipo y documentos visibles
  const filteredRelations = useMemo(() => {
    const visibleDocIds = new Set(filteredDocuments.map((d) => d.id))

    return initialRelations.filter((rel) => {
      // Solo relaciones donde ambos documentos son visibles
      if (!visibleDocIds.has(rel.source_doc_id) || !visibleDocIds.has(rel.target_doc_id)) {
        return false
      }

      // Filtro por tipo de relación
      if (filters.relationType === 'manual' && rel.relation_type !== 'manual') {
        return false
      }
      if (filters.relationType === 'automatic' && rel.relation_type !== 'automatic') {
        return false
      }

      return true
    })
  }, [initialRelations, filteredDocuments, filters.relationType])

  // Convertir documentos a nodos
  const documentNodes: DocumentNode[] = useMemo(() => {
    return filteredDocuments.map((doc, index) => {
      const category = categories.find((c) => c.id === doc.category_id)
      const isSelected = selectedDocument?.id === doc.id

      // Layout force-directed simple: posicionar en círculo
      const angle = (index / filteredDocuments.length) * 2 * Math.PI
      const radius = Math.sqrt(filteredDocuments.length) * 150
      const x = Math.cos(angle) * radius + 400
      const y = Math.sin(angle) * radius + 300

      return {
        id: doc.id,
        type: 'document',
        position: { x, y },
        data: {
          id: doc.id,
          title: doc.title,
          description: doc.description,
          file_type: doc.file_type,
          category_color: category?.color_hex || null,
          category_name: category?.name || null,
          access_type: doc.access_type,
          processing_status: doc.processing_status,
          word_count: doc.word_count,
          isSelected,
          hasSelection: selectedDocument !== null  // NUEVO: indica si hay una selección activa
        },
        style: {
          opacity: selectedDocument !== null && !isSelected ? 0.3 : 1
        }
      }
    })
  }, [filteredDocuments, categories, selectedDocument])

  // Convertir relaciones a aristas
  const documentEdges: DocumentEdge[] = useMemo(() => {
    const filteredDocIds = new Set(filteredDocuments.map((d) => d.id))

    return filteredRelations
      .filter(rel => filteredDocIds.has(rel.source_doc_id) && filteredDocIds.has(rel.target_doc_id))
      .map((rel) => {
        // Estilo según tipo de relación
        const isManual = rel.relation_type === 'manual'
        const strokeColor = isManual ? '#194D95' : '#9ca3af'
        const strokeDasharray = isManual ? undefined : [5, 5]

        // Grosor según similarity_score (solo para automáticas)
        let strokeWidth = 1
        if (!isManual && rel.similarity_score) {
          if (rel.similarity_score < 0.6) strokeWidth = 1
          else if (rel.similarity_score < 0.8) strokeWidth = 2
          else strokeWidth = 3
        }

        return {
          id: rel.id,
          source: rel.source_doc_id,
          target: rel.target_doc_id,
          type: 'smoothstep',
          animated: false,
          style: {
            stroke: strokeColor,
            strokeWidth,
            strokeDasharray
          },
          markerEnd: {
            type: 'arrowclosed',
            color: strokeColor,
            strokeWidth: 1.5
          } as EdgeMarker,
          data: {
            relation_type: rel.relation_type,
            similarity_score: rel.similarity_score
          },
          // Tooltip para aristas automáticas
          label: !isManual && rel.similarity_score
            ? `${Math.round(rel.similarity_score * 100)}%`
            : undefined,
          labelStyle: {
            fontSize: 10,
            fontWeight: 500
          },
          labelShowBg: true,
          labelBgStyle: {
            fill: 'white',
            fillOpacity: 0.8
          }
        }
      })
  }, [filteredRelations, filteredDocuments])

  // Actualizar nodos y aristas cuando cambian
  useEffect(() => {
    setNodes(documentNodes)
  }, [documentNodes, setNodes])

  useEffect(() => {
    setEdges(documentEdges)
  }, [documentEdges, setEdges])

  // Callback: click en nodo
  const onNodeClick = useCallback(
    (_: any, node: DocumentNode) => {
      const doc = initialDocuments.find((d) => d.id === node.id)
      if (!doc) return

      // Marcar nodo como seleccionado
      setSelectedDocument({
        ...doc,
        proc_categories: categories.find((c) => c.id === doc.category_id) || null,
        relations_outgoing: initialRelations
          .filter((r) => r.source_doc_id === doc.id)
          .map((r) => ({
            ...r,
            related_document: initialDocuments.find((d) => d.id === r.target_doc_id)!
          })),
        relations_incoming: initialRelations
          .filter((r) => r.target_doc_id === doc.id)
          .map((r) => ({
            ...r,
            related_document: initialDocuments.find((d) => d.id === r.source_doc_id)!
          }))
      })
      setIsPanelOpen(true)
    },
    [initialDocuments, initialRelations, categories]
  )

  // Callback: doble click en nodo → navegar a /documentos/[id]
  const onNodeDoubleClick = useCallback(
    (_: any, node: DocumentNode) => {
      router.push(`/documentos/${node.id}`)
    },
    [router]
  )

  // Callback: click en fondo → deseleccionar
  const onPaneClick = useCallback(() => {
    setSelectedDocument(null)
    setIsPanelOpen(false)
  }, [])

  // Callback: click en relación en panel → seleccionar nodo relacionado
  const handleRelationClick = useCallback(
    (documentId: string) => {
      const node = nodes.find((n) => n.id === documentId)
      if (node) {
        onNodeClick(null, node)
      }
    },
    [nodes, onNodeClick]
  )

  // Registrar tipos de nodos personalizados
  const nodeTypes = useMemo(
    () => ({
      document: DocumentNode
    }),
    []
  )

  return (
    <div className="w-full h-full relative">
      {/* Canvas del grafo */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as DocumentNodeData
            return data.category_color || '#9ca3af'
          }}
          nodeStrokeWidth={2}
          zoomable
          pannable
        />
      </ReactFlow>

      {/* Panel lateral de detalles */}
      <DocumentDetailPanel
        document={selectedDocument}
        open={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        onNodeClick={handleRelationClick}
      />

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 bg-background border rounded-lg p-3 shadow-md text-xs space-y-2 max-w-xs">
        <h4 className="font-semibold mb-2">Leyenda</h4>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-[#194D95]" />
          <span>Relación manual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gray-400 border-dashed border-t-2" />
          <span>Relación automática</span>
        </div>
        <p className="text-muted-foreground mt-2">
          Click: ver detalles • Doble click: abrir documento
        </p>
      </div>
    </div>
  )
}

// Helper para onConnect (no usado pero requerido por useEdgesState)
function onConnect(connection: Connection) {
  console.log('Connect:', connection)
}
