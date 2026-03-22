'use client'

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react'

export interface Condition {
  id: string
  survey_id: string
  source_question_id: string
  source_option_id: string | null
  condition_value: string
  target_section_id: string
  action: string
  created_at: string
}

export type ConditionEdgeData = {
  condition: Condition
  questionLabel: string
  optionLabel: string
  isInvalid?: boolean
  onEdgeClick?: (conditionId: string) => void
}

export function ConditionEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  const edgeData = data as ConditionEdgeData | undefined
  const isInvalid = edgeData?.isInvalid ?? false
  const strokeColor = isInvalid ? '#ef4444' : '#004B8D'
  const labelText = edgeData ? `${edgeData.questionLabel}: ${edgeData.optionLabel}` : ''

  const handleClick = () => {
    if (edgeData?.onEdgeClick && edgeData?.condition) {
      edgeData.onEdgeClick(edgeData.condition.id)
    }
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        stroke={strokeColor}
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            background: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            border: `1px solid ${strokeColor}`,
            color: strokeColor,
            pointerEvents: 'auto',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          onClick={handleClick}
          title={labelText}
        >
          {labelText}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
