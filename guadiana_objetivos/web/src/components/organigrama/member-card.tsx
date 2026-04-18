'use client'

import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { type OrgPosition } from '@/app/(dashboard)/organigrama/organigrama-actions'

interface MemberCardProps {
  id: string
  fullName: string | null
  avatarUrl: string | null
  positionName: string | null
  positions: OrgPosition[]
  canManage: boolean
  onRemove: (memberId: string) => void
  onChangePosition: (memberId: string, positionId: string) => void
}

export function MemberCard({
  id, fullName, avatarUrl, positionName, positions, canManage, onRemove, onChangePosition,
}: MemberCardProps) {
  const [showPositions, setShowPositions] = useState(false)
  const initials = (fullName ?? '?').charAt(0).toUpperCase()

  return (
    <div className="relative">
      <div className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-50 group">
        {avatarUrl ? (
          <img src={avatarUrl} alt={fullName ?? ''} className="h-6 w-6 rounded-full object-cover shrink-0" />
        ) : (
          <div className="h-6 w-6 rounded-full bg-[#004B8D] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {initials}
          </div>
        )}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs font-medium text-gray-800 truncate leading-tight">{fullName ?? 'Usuario'}</span>
          {canManage ? (
            <button
              type="button"
              onClick={() => setShowPositions(v => !v)}
              className="flex items-center gap-0.5 w-fit text-[10px] font-medium text-[#004B8D] hover:text-[#003a6e] leading-tight"
            >
              {positionName ?? 'Sin puesto'}
              <ChevronDown className="h-2.5 w-2.5" />
            </button>
          ) : (
            <span className="text-[10px] text-muted-foreground leading-tight">{positionName ?? 'Sin puesto'}</span>
          )}
        </div>
        {canManage && (
          <button
            onClick={() => onRemove(id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-100 text-red-500 shrink-0"
            title="Quitar miembro"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Dropdown de cambio de puesto */}
      {showPositions && canManage && (
        <div className="absolute left-8 top-8 z-50 bg-white border rounded-md shadow-lg min-w-40 divide-y">
          {positions.map(pos => (
            <button
              key={pos.id}
              type="button"
              onClick={() => { onChangePosition(id, pos.id); setShowPositions(false) }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors"
            >
              {pos.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
