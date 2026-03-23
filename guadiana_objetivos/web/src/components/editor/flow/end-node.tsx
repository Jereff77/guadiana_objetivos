'use client'

import { Handle, Position } from '@xyflow/react'
import { CheckCircle2 } from 'lucide-react'

export function EndNode() {
  return (
    <div
      className="rounded-xl border-2 border-gray-400 bg-gray-800 shadow-md flex flex-col items-center justify-center gap-1 w-28 h-20 relative select-none"
    >
      {/* Solo acepta conexiones entrantes */}
      <Handle
        type="target"
        position={Position.Left}
        id="end-input"
        style={{ top: '50%' }}
        className="!w-3 !h-3 !bg-gray-400 !border-white !border-2"
      />

      <CheckCircle2 className="h-6 w-6 text-green-400" />
      <span className="text-xs font-bold text-white uppercase tracking-widest">
        Fin
      </span>
      <span className="text-[9px] text-gray-400 leading-none">del checklist</span>
    </div>
  )
}
