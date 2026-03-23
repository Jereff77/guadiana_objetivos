'use client'

import { useRef, useLayoutEffect, useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export const HEADER_H = 56   // px: approx height of the header block
export const OPTION_H = 40   // px: approx height of each option row

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

  const rootRef     = useRef<HTMLDivElement>(null)
  const optionRefs  = useRef<(HTMLDivElement | null)[]>([])
  const headerRef   = useRef<HTMLDivElement>(null)

  // Handle positions (top px relative to node root, as React Flow expects)
  const [headerMid, setHeaderMid] = useState(24)   // header center estimate
  const [sourceTops, setSourceTops] = useState<number[]>(
    d.options.map((_, i) => 56 + i * 40 + 20)        // initial estimate
  )

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    // Header center — shared by target (left) and question-out (right) handles
    if (headerRef.current) {
      const h = headerRef.current.offsetTop + headerRef.current.offsetHeight / 2
      setHeaderMid(h)
    }

    // Source handles: center of each option row
    const tops = optionRefs.current.map(el => {
      if (!el) return 0
      return el.offsetTop + el.offsetHeight / 2
    })
    if (tops.length > 0) setSourceTops(tops)
  }, [d.options.length])

  return (
    <div
      ref={rootRef}
      className="rounded-lg border-2 border-[#004B8D] bg-white shadow-sm w-56"
      style={{ position: 'relative' }}
    >
      {/* ── Target handle (left) ──────────────────────────── */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ top: headerMid }}
        className="!w-3 !h-3 !bg-[#004B8D] !border-white !border-2"
      />

      {/* ── Q→Q source handle (right, header level) ───────── */}
      <Handle
        type="source"
        position={Position.Right}
        id="question-out"
        style={{ top: headerMid }}
        className="!w-3 !h-3 !bg-[#22C55E] !border-white !border-2"
      />

      {/* ── Header ────────────────────────────────────────── */}
      <div
        ref={headerRef}
        className="px-3 pt-2 pb-2 border-b border-gray-100"
      >
        <p className="text-[9px] font-bold text-[#004B8D] uppercase tracking-wide truncate leading-tight">
          {d.sectionTitle}
        </p>
        <p className="text-sm font-semibold text-gray-800 truncate leading-snug mt-0.5">
          {d.questionLabel}
        </p>
      </div>

      {/* ── Options ───────────────────────────────────────── */}
      {isConnectable && d.options.length > 0 ? (
        d.options.map((opt, i) => (
          <div
            key={opt.id}
            ref={el => { optionRefs.current[i] = el }}
            className="flex items-center px-3 py-2 border-b last:border-b-0 border-gray-50 pr-6"
          >
            <span className="text-sm text-gray-700 truncate">{opt.label}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={`option-${opt.id}`}
              style={{ top: sourceTops[i] ?? 56 + i * 40 + 20 }}
              className="!w-3 !h-3 !bg-[#FF8F1C] !border-white !border-2"
            />
          </div>
        ))
      ) : (
        <div className="px-3 py-2.5">
          <span className="text-xs text-gray-400 italic">Sin opciones de flujo</span>
        </div>
      )}

    </div>
  )
}
