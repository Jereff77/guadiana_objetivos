'use client'

import React, { useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { QuestionNode, HEADER_H, OPTION_H } from './question-node'
import { ConditionEdge } from './condition-edge'
import { createCondition, deleteCondition } from '@/app/(dashboard)/formularios/[id]/editar/section-actions'

export interface Section {
  id: string
  title: string
  description: string | null
  order: number
}

export interface Question {
  id: string
  section_id: string
  label: string
  type: string
  order: number
}

export interface QuestionOption {
  id: string
  question_id: string
  label: string
  value: string | null
  order: number
}

export interface Condition {
  id: string
  survey_id: string
  source_question_id: string
  source_option_id: string | null
  condition_value: string
  target_section_id: string | null
  target_question_id: string | null
  action: string
  created_at: string
}

interface FlowEditorProps {
  sections: Section[]
  questions: Question[]
  options: QuestionOption[]
  conditions: Condition[]
  surveyId: string
}

// ── Node & edge type registrations (outside component to avoid re-renders) ──
const nodeTypes: NodeTypes = { questionNode: QuestionNode }
const edgeTypes: EdgeTypes = { conditionEdge: ConditionEdge }

// ── Canvas layout constants ──
const COL_W   = 280   // horizontal spacing between section columns
const ROW_GAP = 20    // vertical gap between question nodes
const SECTION_LABEL_H = 32  // px above the first question for the section label
const START_X = 60
const START_Y = 60

export function FlowEditor({
  sections,
  questions,
  options,
  conditions,
  surveyId,
}: FlowEditorProps) {

  // ── Build nodes ──────────────────────────────────────────────────────────
  const buildNodes = useCallback(() => {
    const nodes: Node[] = []
    const sortedSections = [...sections].sort((a, b) => a.order - b.order)

    sortedSections.forEach((sec, colIdx) => {
      const x = START_X + colIdx * COL_W
      const sectionQuestions = questions
        .filter(q => q.section_id === sec.id)
        .sort((a, b) => a.order - b.order)

      // Section label node (non-interactive background label)
      nodes.push({
        id: `section-label-${sec.id}`,
        type: 'default',
        selectable: false,
        draggable: false,
        connectable: false,
        position: { x, y: START_Y },
        style: {
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 8,
          padding: '4px 12px',
          fontSize: 11,
          fontWeight: 700,
          color: '#1D4ED8',
          pointerEvents: 'none',
          width: 200,
          height: SECTION_LABEL_H,
          display: 'flex',
          alignItems: 'center',
        },
        data: { label: `Sección ${sec.order}: ${sec.title}` },
      })

      // Question nodes stacked below the label
      let yOffset = START_Y + SECTION_LABEL_H + ROW_GAP

      sectionQuestions.forEach(q => {
        const qOptions = options
          .filter(o => o.question_id === q.id)
          .sort((a, b) => a.order - b.order)

        const nodeHeight = HEADER_H + Math.max(qOptions.length, 1) * OPTION_H

        nodes.push({
          id: q.id,
          type: 'questionNode',
          position: { x, y: yOffset },
          data: {
            questionId: q.id,
            questionLabel: q.label,
            sectionTitle: sec.title,
            questionType: q.type,
            options: qOptions.map(o => ({ id: o.id, label: o.label })),
          },
        })

        yOffset += nodeHeight + ROW_GAP
      })
    })

    return nodes
  }, [sections, questions, options])

  // ── Build edges ──────────────────────────────────────────────────────────
  const buildEdges = useCallback((onDelete: (edgeId: string) => void) => {
    return conditions
      .filter(c => c.target_question_id)
      .map(c => {
        const opt = options.find(o => o.id === c.source_option_id)
        return {
          id: c.id,
          source: c.source_question_id,
          sourceHandle: `option-${c.source_option_id}`,
          target: c.target_question_id!,
          targetHandle: 'input',
          type: 'conditionEdge',
          data: {
            optionLabel: opt?.label ?? c.condition_value,
            onDelete,
          },
        }
      })
  }, [conditions, options])

  // ── State ────────────────────────────────────────────────────────────────
  const [nodes, , onNodesChange] = useNodesState(buildNodes())
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  // ── Delete a condition ───────────────────────────────────────────────────
  const handleDelete = useCallback(async (edgeId: string) => {
    await deleteCondition(edgeId, surveyId)
    setEdges(prev => prev.filter(e => e.id !== edgeId))
  }, [surveyId, setEdges])

  // ── Sync edges when conditions/options change ────────────────────────────
  useEffect(() => {
    setEdges(buildEdges(handleDelete) as unknown as Edge[])
  }, [buildEdges, handleDelete, setEdges])

  // ── Create a condition when user connects option → question ───────────────
  const handleConnect = useCallback(async (connection: Connection) => {
    const { source, sourceHandle, target } = connection
    if (!source || !sourceHandle || !target) return
    if (!sourceHandle.startsWith('option-')) return

    const optionId = sourceHandle.replace('option-', '')

    // Avoid duplicates: same option already connected
    const duplicate = conditions.find(
      c => c.source_option_id === optionId && c.target_question_id === target
    )
    if (duplicate) return

    const result = await createCondition(surveyId, source, optionId, target)
    if (!result || 'error' in result) {
      console.error('Error creando condición:', result?.error)
      return
    }

    // Optimistically add edge
    const opt = options.find(o => o.id === optionId)
    const newEdge: Edge = {
      id: result.condition.id,
      source,
      sourceHandle,
      target,
      targetHandle: 'input',
      type: 'conditionEdge',
      data: { optionLabel: opt?.label ?? optionId, onDelete: handleDelete },
    }
    setEdges(prev => [...prev, newEdge])
  }, [conditions, options, surveyId, handleDelete, setEdges])

  return (
    <div className="w-full h-full flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        deleteKeyCode={null}   // prevent accidental node deletion with keyboard
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
