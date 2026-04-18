'use client'

import { useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Plus, Trash2, Building2, UserCircle2, Pencil, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MemberCard } from './member-card'
import { type OrgDepartmentMember, type OrgPosition } from '@/app/(dashboard)/organigrama/organigrama-actions'

export interface DepartmentNodeData {
  departmentId: string
  name: string
  color: string
  responsibleName: string | null
  responsibleAvatar: string | null
  responsiblePositionName: string | null
  members: OrgDepartmentMember[]
  positions: OrgPosition[]
  canManage: boolean
  hideAddArea?: boolean
  onAddArea: (departmentId: string, departmentName: string) => void
  onAddMember: (departmentId: string, departmentName: string) => void
  onRemoveMember: (memberId: string) => void
  onChangeMemberPosition: (memberId: string, positionId: string) => void
  onEdit: (departmentId: string) => void
  onDelete: (departmentId: string) => void
}

export function DepartmentNode(props: NodeProps) {
  const d = props.data as unknown as DepartmentNodeData
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-xl shadow-md bg-white border-2 w-56"
      style={{ borderColor: d.color }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-t-[10px]"
        style={{ backgroundColor: d.color }}
      >
        <Building2 className="h-4 w-4 text-white shrink-0" />
        <span className="text-sm font-semibold text-white truncate flex-1">{d.name}</span>
        {d.canManage && hovered && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => d.onEdit(d.departmentId)}
              className="p-0.5 rounded hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Editar departamento"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => d.onDelete(d.departmentId)}
              className="p-0.5 rounded hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Eliminar departamento"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Responsable */}
      <div className="px-3 py-2 border-b border-gray-100">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Responsable</span>
        {d.responsibleName ? (
          <div className="flex items-center gap-2 mt-1">
            <div className="h-6 w-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: d.color }}>
              {d.responsibleName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-gray-800 truncate leading-tight">{d.responsibleName}</span>
              {d.responsiblePositionName && (
                <span className="text-[10px] font-medium leading-tight" style={{ color: d.color }}>{d.responsiblePositionName}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <UserCircle2 className="h-4 w-4 shrink-0" />
            <span className="text-xs italic">Sin responsable</span>
          </div>
        )}
      </div>

      {/* Equipo directo */}
      <div className="px-2 pt-1.5 pb-1 border-b border-gray-100">
        <div className="flex items-center gap-1 px-1 mb-0.5">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Equipo directo</span>
        </div>
        <div className="space-y-0.5">
          {d.members.length === 0 ? (
            <p className="text-[11px] text-muted-foreground text-center py-1">Sin miembros</p>
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
            onClick={() => d.onAddMember(d.departmentId, d.name)}
          >
            <Plus className="h-3 w-3" />
            Agregar al equipo
          </Button>
        )}
      </div>

      {/* Agregar área */}
      {d.canManage && !d.hideAddArea && (
        <div className="px-3 py-2">
          <Button
            size="sm"
            variant="ghost"
            className="w-full h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => d.onAddArea(d.departmentId, d.name)}
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar Área
          </Button>
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        id="dept-in"
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ backgroundColor: d.color }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="dept-out"
        className="!w-3 !h-3 !border-2 !border-white"
        style={{ backgroundColor: d.color }}
      />
    </div>
  )
}
