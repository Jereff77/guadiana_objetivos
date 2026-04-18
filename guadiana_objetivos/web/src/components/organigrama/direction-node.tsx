'use client'

import { useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Plus, Pencil, Users, Star, UserCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MemberCard } from './member-card'
import { type OrgMember, type OrgPosition } from '@/app/(dashboard)/organigrama/organigrama-actions'

export interface DirectionNodeData {
  directionId: string
  name: string
  color: string
  responsibleName: string | null
  responsibleAvatar: string | null
  responsiblePositionName: string | null
  members: OrgMember[]
  positions: OrgPosition[]
  canManage: boolean
  onEdit: (directionId: string) => void
  onAddArea: (directionId: string) => void
  onAddMember: (directionId: string) => void
  onRemoveMember: (memberId: string) => void
  onChangeMemberPosition: (memberId: string, positionId: string) => void
}

export function DirectionNode(props: NodeProps) {
  const d = props.data as unknown as DirectionNodeData
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl shadow-xl bg-white border-4 w-72"
      style={{ borderColor: d.color }}
    >
      {/* Header prominente */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-t-[14px]"
        style={{ backgroundColor: d.color }}
      >
        <Star className="h-5 w-5 text-yellow-300 shrink-0 fill-yellow-300" />
        <span className="text-base font-bold text-white uppercase tracking-wide truncate flex-1">
          {d.name}
        </span>
        {d.canManage && hovered && (
          <button
            onClick={() => d.onEdit(d.directionId)}
            className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white transition-colors shrink-0"
            title="Editar Dirección"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Responsable */}
      <div className="px-4 py-2.5 border-b border-gray-100">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Director / Responsable</span>
        {d.responsibleName ? (
          <div className="flex items-center gap-2 mt-1">
            <div
              className="h-8 w-8 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
              style={{ backgroundColor: d.color }}
            >
              {d.responsibleName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-gray-800 truncate leading-tight">{d.responsibleName}</span>
              {d.responsiblePositionName && (
                <span className="text-[11px] font-medium leading-tight" style={{ color: d.color }}>
                  {d.responsiblePositionName}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <UserCircle2 className="h-5 w-5 shrink-0" />
            <span className="text-xs italic">Sin director asignado</span>
          </div>
        )}
      </div>

      {/* Equipo directo */}
      <div className="px-3 pt-2 pb-1 border-b border-gray-100">
        <div className="flex items-center gap-1.5 px-1 mb-1">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Equipo directo</span>
        </div>
        <div className="space-y-0.5">
          {d.members.length === 0 ? (
            <p className="text-[11px] text-muted-foreground text-center py-1.5">Sin miembros</p>
          ) : (
            d.members.map(m => (
              <MemberCard
                key={m.id}
                id={m.id}
                fullName={m.full_name}
                avatarUrl={m.avatar_url}
                positionName={m.position_name}
                positions={d.positions}
                canManage={d.canManage}
                onRemove={d.onRemoveMember}
                onChangePosition={d.onChangeMemberPosition}
              />
            ))
          )}
        </div>
        {d.canManage && (
          <Button
            size="sm"
            variant="ghost"
            className="w-full h-6 text-[11px] gap-1 text-muted-foreground hover:text-foreground mt-0.5"
            onClick={() => d.onAddMember(d.directionId)}
          >
            <Plus className="h-3 w-3" />
            Agregar al equipo
          </Button>
        )}
      </div>

      {/* Acciones */}
      {d.canManage && (
        <div className="px-3 py-2 flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => d.onAddArea(d.directionId)}
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar Área
          </Button>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        id="dir-out-bottom"
        className="!w-3.5 !h-3.5 !border-2 !border-white"
        style={{ backgroundColor: d.color }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="dir-out-left"
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ backgroundColor: d.color }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="dir-out-right"
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ backgroundColor: d.color }}
      />
    </div>
  )
}
