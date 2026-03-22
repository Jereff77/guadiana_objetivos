'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Badge } from '@/components/ui/badge'

export interface Section {
  id: string
  title: string
  description: string | null
  order: number
}

export type SectionNodeData = {
  section: Section
  questionCount: number
}

export function SectionNode(props: NodeProps) {
  const { data } = props
  const nodeData = data as SectionNodeData
  return (
    <div className="rounded-lg border-2 border-[#004B8D] bg-white px-4 py-3 shadow-sm min-w-[180px]">
      <Handle type="target" position={Position.Left} />
      <div className="text-xs text-muted-foreground">Sección {nodeData.section.order}</div>
      <div className="font-semibold text-sm">{nodeData.section.title}</div>
      <Badge variant="outline" className="text-xs mt-1">
        {nodeData.questionCount} {nodeData.questionCount === 1 ? 'pregunta' : 'preguntas'}
      </Badge>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
