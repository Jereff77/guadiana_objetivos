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
import { EndNode } from './end-node'
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
const nodeTypes: NodeTypes = { questionNode: QuestionNode, endNode: EndNode }
const edgeTypes: EdgeTypes = { conditionEdge: ConditionEdge }

export const END_NODE_ID = '__end__'

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

    // ── Nodo FIN — siempre presente, a la derecha de todas las secciones ──
    const endX = START_X + sortedSections.length * COL_W
    const endY = START_Y + SECTION_LABEL_H + ROW_GAP
    nodes.push({
      id: END_NODE_ID,
      type: 'endNode',
      position: { x: endX, y: endY },
      draggable: true,
      selectable: false,
      connectable: false,
      data: {},
    })

    return nodes
  }, [sections, questions, options])

  // ── Build edges ──────────────────────────────────────────────────────────

  /** Aristas guardadas en BD (condiciones explícitas) */
  const buildEdges = useCallback((onDelete: (edgeId: string) => void) => {
    return conditions
      .filter(c => c.target_question_id || c.action === 'jump_to_end')
      .map(c => {
        const isEnd  = c.action === 'jump_to_end'
        const isQtoQ = !c.source_option_id
        const opt = options.find(o => o.id === c.source_option_id)
        return {
          id: c.id,
          source: c.source_question_id,
          sourceHandle: isQtoQ ? 'question-out' : `option-${c.source_option_id}`,
          target: isEnd ? END_NODE_ID : c.target_question_id!,
          targetHandle: isEnd ? 'end-input' : 'input',
          type: 'conditionEdge',
          data: {
            optionLabel: isEnd
              ? (isQtoQ ? 'Ir al fin' : `${opt?.label ?? ''} → Fin`)
              : (isQtoQ ? 'Siempre →' : (opt?.label ?? c.condition_value)),
            onDelete,
          },
        }
      })
  }, [conditions, options])

  /** Aristas punteadas que muestran el orden natural (no se guardan en BD).
   *  Solo aparecen entre preguntas consecutivas que NO tienen ya una
   *  condición Q→Q explícita saliendo de la pregunta origen. */
  const buildDefaultEdges = useCallback((): Edge[] => {
    const sortedSections = [...sections].sort((a, b) => a.order - b.order)
    const allQuestions = sortedSections.flatMap(sec =>
      questions.filter(q => q.section_id === sec.id).sort((a, b) => a.order - b.order)
    )

    const defaultEdges: Edge[] = []
    for (let i = 0; i < allQuestions.length - 1; i++) {
      const src = allQuestions[i]
      const tgt = allQuestions[i + 1]
      // Si ya existe un Q→Q explícito saliendo de src, omitir la punteada
      const hasExplicit = conditions.some(
        c => c.source_question_id === src.id && !c.source_option_id
      )
      if (hasExplicit) continue
      defaultEdges.push({
        id: `default-${src.id}-${tgt.id}`,
        source: src.id,
        sourceHandle: 'question-out',
        target: tgt.id,
        targetHandle: 'input',
        type: 'default',
        selectable: false,
        deletable: false,
        style: { stroke: '#22C55E', strokeWidth: 1.5, strokeDasharray: '5 4', opacity: 0.45 },
        data: {},
      })
    }
    return defaultEdges
  }, [sections, questions, conditions])

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
    const explicit = buildEdges(handleDelete) as unknown as Edge[]
    const defaults = buildDefaultEdges()
    setEdges([...explicit, ...defaults])
  }, [buildEdges, buildDefaultEdges, handleDelete, setEdges])

  // ── Create a condition when user draws a connection ───────────────────────
  const handleConnect = useCallback(async (connection: Connection) => {
    const { source, sourceHandle, target } = connection
    if (!source || !sourceHandle || !target) return

    const isTargetEnd = target === END_NODE_ID

    // ── Q → FIN / Q → Q : salto incondicional ───────────────────
    if (sourceHandle === 'question-out') {
      const duplicate = conditions.find(c =>
        c.source_question_id === source &&
        !c.source_option_id &&
        (isTargetEnd ? c.action === 'jump_to_end' : c.target_question_id === target)
      )
      if (duplicate) return

      const action = isTargetEnd ? 'jump_to_end' : 'jump_to_question'
      const result = await createCondition(surveyId, source, null, isTargetEnd ? null : target, action)
      if (!result || 'error' in result) {
        console.error('Error creando condición Q→:', result?.error)
        return
      }

      const newEdge: Edge = {
        id: result.condition.id,
        source,
        sourceHandle,
        target,
        targetHandle: isTargetEnd ? 'end-input' : 'input',
        type: 'conditionEdge',
        data: { optionLabel: isTargetEnd ? 'Ir al fin' : 'Siempre →', onDelete: handleDelete },
      }
      setEdges(prev => [...prev, newEdge])
      return
    }

    // ── Opción → FIN / Opción → Q : salto condicional ───────────
    if (!sourceHandle.startsWith('option-')) return

    const optionId = sourceHandle.replace('option-', '')

    const duplicate = conditions.find(c =>
      c.source_option_id === optionId &&
      (isTargetEnd ? c.action === 'jump_to_end' : c.target_question_id === target)
    )
    if (duplicate) return

    const action = isTargetEnd ? 'jump_to_end' : 'jump_to_question'
    const result = await createCondition(surveyId, source, optionId, isTargetEnd ? null : target, action)
    if (!result || 'error' in result) {
      console.error('Error creando condición opción→:', result?.error)
      return
    }

    const opt = options.find(o => o.id === optionId)
    const newEdge: Edge = {
      id: result.condition.id,
      source,
      sourceHandle,
      target,
      targetHandle: isTargetEnd ? 'end-input' : 'input',
      type: 'conditionEdge',
      data: {
        optionLabel: isTargetEnd ? `${opt?.label ?? ''} → Fin` : (opt?.label ?? optionId),
        onDelete: handleDelete,
      },
    }
    setEdges(prev => [...prev, newEdge])
  }, [conditions, options, surveyId, handleDelete, setEdges])

  return (
    <div style={{ width: '100%', height: '100%' }}>
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
