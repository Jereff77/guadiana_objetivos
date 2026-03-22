'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'

// Heights used to position handles exactly (must match CSS below)
export const HEADER_H = 56   // h-14 — section label + question label
export const OPTION_H  = 40  // h-10 — each option row

export interface QuestionNodeData {
  questionId: string
  questionLabel: string
  sectionTitle: string
  questionType: string
  options: Array<{ id: string; label: string }>
}

export function QuestionNode(props: NodeProps) {
  const d = props.data as unknown as QuestionNodeData
  const isConnectable = ['boolean', 'single_choice'].includes(d.questionType)

  return (
    <div className="rounded-lg border-2 border-[#004B8D] bg-white shadow-sm w-56 overflow-visible">
      {/* ── Target handle: receives arrows from other options ── */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ top: HEADER_H / 2 }}
        className="!w-3 !h-3 !bg-[#004B8D]"
      />

      {/* ── Header: section + question ── */}
      <div className="h-14 flex flex-col justify-center px-3 border-b border-gray-100">
        <span className="text-[9px] font-semibold text-[#004B8D] uppercase tracking-wide truncate">
          {d.sectionTitle}
        </span>
        <span className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">
          {d.questionLabel}
        </span>
      </div>

      {/* ── Options with per-option source handles ── */}
      {isConnectable && d.options.length > 0 ? (
        d.options.map((opt, i) => (
          <div
            key={opt.id}
            className="h-10 flex items-center px-3 border-b last:border-b-0 border-gray-50 relative"
          >
            <span className="text-sm text-gray-700 truncate pr-4">{opt.label}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={`option-${opt.id}`}
              style={{ top: HEADER_H + i * OPTION_H + OPTION_H / 2 }}
              className="!w-3 !h-3 !bg-[#FF8F1C]"
            />
          </div>
        ))
      ) : (
        <div className="h-10 flex items-center px-3">
          <span className="text-xs text-gray-400 italic">
            {isConnectable ? 'Sin opciones' : 'Solo como destino'}
          </span>
        </div>
      )}
    </div>
  )
}
