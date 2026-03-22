'use client'

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react'
import { X } from 'lucide-react'

export type ConditionEdgeData = {
  optionLabel: string
  onDelete?: (edgeId: string) => void
}

export function ConditionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY })
  const d = data as ConditionEdgeData | undefined

  return (
    <>
      <BaseEdge
        path={edgePath}
        stroke="#FF8F1C"
        strokeWidth={2}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'auto',
          }}
          className="flex items-center gap-1 bg-white border border-[#FF8F1C] rounded px-2 py-0.5 shadow-sm nodrag nopan"
        >
          <span className="text-[11px] text-[#FF8F1C] font-medium whitespace-nowrap max-w-[120px] truncate">
            {d?.optionLabel ?? ''}
          </span>
          {d?.onDelete && (
            <button
              onClick={() => d.onDelete!(id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Eliminar condición"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
