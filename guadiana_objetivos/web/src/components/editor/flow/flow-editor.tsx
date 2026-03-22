'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { SectionNode } from './section-node'
import { ConditionEdge } from './condition-edge'
import { EdgeConfigPanel } from './edge-config-panel'
import type { Section } from './section-node'
import type { Condition } from './condition-edge'
import type { Question, QuestionOption } from './edge-config-panel'

interface FlowEditorProps {
  sections: Section[]
  questions: Question[]
  options: QuestionOption[]
  conditions: Condition[]
  surveyId: string
}

const nodeTypes = {
  sectionNode: SectionNode,
}

const edgeTypes = {
  conditionEdge: ConditionEdge,
}

export function FlowEditor({
  sections,
  questions,
  options,
  conditions,
  surveyId,
}: FlowEditorProps) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState<'create' | 'edit'>('create')
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null)
  const [sourceNode, setSourceNode] = useState<string | null>(null)
  const [targetNode, setTargetNode] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Crear nodos desde secciones
  const initialNodes = useMemo(() => {
    const centerY = 200
    const nodes: Node[] = [
      {
        id: 'start',
        type: 'input',
        position: { x: 50, y: centerY },
        data: { label: 'Inicio' },
      },
      ...sections.map((s, i) => ({
        id: s.id,
        type: 'sectionNode',
        position: { x: 300 + i * 250, y: centerY },
        data: {
          section: s,
          questionCount: questions.filter((q) => q.section_id === s.id).length,
        },
      })),
      {
        id: 'end',
        type: 'output',
        position: { x: 300 + sections.length * 250, y: centerY },
        data: { label: 'Fin' },
      },
    ]
    return nodes
  }, [sections, questions])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)

  const handleConnect = useCallback(
    (connection: Connection) => {
      setSourceNode(connection.source)
      setTargetNode(connection.target)
      setSelectedCondition(null)
      setPanelMode('create')
      setPanelOpen(true)
    },
    []
  )

  const handleEdgeClick = useCallback((conditionId: string) => {
    const condition = conditions.find((c) => c.id === conditionId)
    if (!condition) return

    setSelectedCondition(condition)
    setPanelMode('edit')
    setPanelOpen(true)
  }, [conditions])

  // Crear aristas desde condiciones
  const initialEdges = useMemo(() => {
    return conditions.map((c) => {
      const sourceSection = sections.find((s) =>
        questions.some((q) => q.id === c.source_question_id && q.section_id === s.id)
      )
      const question = questions.find((q) => q.id === c.source_question_id)
      const option = options.find((o) => o.id === c.source_option_id)

      return {
        id: c.id,
        source: sourceSection?.id ?? '',
        target: c.target_section_id,
        type: 'conditionEdge',
        data: {
          condition: c,
          questionLabel: question?.label ?? '',
          optionLabel: option?.label ?? c.condition_value,
          isInvalid: !sourceSection || !sections.find((s) => s.id === c.target_section_id),
          onEdgeClick: handleEdgeClick,
        },
      }
    })
  }, [conditions, sections, questions, options, handleEdgeClick])

  // Inicializar aristas
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as Record<string, unknown>[])

  // Actualizar aristas cuando cambian las condiciones
  useEffect(() => {
    setEdges(initialEdges as Record<string, unknown>[])
  }, [initialEdges, setEdges])

  const handlePanelSave = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const sourceSection = sourceNode ? sections.find((s) => s.id === sourceNode) : undefined
  const targetSection = targetNode ? sections.find((s) => s.id === targetNode) : undefined

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden">
      <ReactFlow
        key={refreshKey}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      <EdgeConfigPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        mode={panelMode}
        sourceSection={sourceSection}
        targetSection={targetSection}
        condition={selectedCondition}
        questions={questions}
        options={options}
        surveyId={surveyId}
        onSave={handlePanelSave}
      />
    </div>
  )
}
