'use client'

import { useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Plus, Trash2, FolderOpen, UserCircle2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { MemberCard } from './member-card'
import { type OrgPosition } from '@/app/(dashboard)/organigrama/organigrama-actions'

export interface AreaMember {
  id: string
  user_id: string
  position_id: string | null
  position_name: string | null
  full_name: string | null
  avatar_url: string | null
}

export interface AreaNodeData {
  areaId: string
  name: string
  departmentColor: string
  members: AreaMember[]
  positions: OrgPosition[]
  responsibleId: string | null
  responsibleName: string | null
  responsibleAvatar: string | null
  responsiblePositionId: string | null
  responsiblePositionName: string | null
  canManage: boolean
  onAddMember: (areaId: string, areaName: string) => void
  onRemoveMember: (memberId: string) => void
  onChangeMemberPosition: (memberId: string, positionId: string) => void
  onSetResponsible: (areaId: string, userId: string | null, positionId: string | null) => void
  onDelete: (areaId: string) => void
}

export function AreaNode(props: NodeProps) {
  const d = props.data as unknown as AreaNodeData
  const [hovered, setHovered] = useState(false)
  const [showSetResponsible, setShowSetResponsible] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [selectedPositionId, setSelectedPositionId] = useState('')

  const teamMembers = d.members.filter(m => m.user_id !== d.responsibleId)

  function handleSetResponsible() {
    const member = d.members.find(m => m.user_id === selectedMemberId)
    if (!member) return
    const posId = selectedPositionId || member.position_id || null
    d.onSetResponsible(d.areaId, selectedMemberId, posId)
    setShowSetResponsible(false)
    setSelectedMemberId('')
    setSelectedPositionId('')
  }

  function handleClearResponsible() {
    d.onSetResponsible(d.areaId, null, null)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-xl shadow-md bg-white border-2 border-gray-200 w-60"
    >
      <Handle
        type="target"
        position={Position.Top}
        id="area-in"
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-[10px] border-b border-gray-100"
        style={{ backgroundColor: d.departmentColor + '18' }}
      >
        <FolderOpen className="h-3.5 w-3.5 shrink-0" style={{ color: d.departmentColor }} />
        <span className="text-xs font-semibold text-gray-700 truncate flex-1">{d.name}</span>
        {d.canManage && hovered && (
          <button
            onClick={() => d.onDelete(d.areaId)}
            className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors shrink-0"
            title="Eliminar área"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Responsable del área */}
      <div className="px-2 pt-2 pb-1 border-b border-gray-100">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold px-1">Responsable</span>
        {d.responsibleId && d.responsibleName ? (
          <div className="flex items-center gap-2 py-1 px-1 rounded mt-0.5" style={{ backgroundColor: d.departmentColor + '12' }}>
            <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold" style={{ backgroundColor: d.departmentColor }}>
              {d.responsibleName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-semibold text-gray-800 truncate leading-tight">{d.responsibleName}</span>
              {d.responsiblePositionName && (
                <span className="text-[10px] font-medium leading-tight" style={{ color: d.departmentColor }}>{d.responsiblePositionName}</span>
              )}
            </div>
            {d.canManage && (
              <button
                onClick={handleClearResponsible}
                className="p-0.5 rounded hover:bg-red-100 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                title="Quitar responsable"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-muted-foreground py-1 px-1 mt-0.5">
            <UserCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[11px] italic">Sin responsable</span>
          </div>
        )}

        {/* Selector para asignar responsable */}
        {d.canManage && !showSetResponsible && d.members.length > 0 && (
          <button
            onClick={() => setShowSetResponsible(true)}
            className="mt-1 flex items-center gap-1 text-[10px] text-[#004B8D] hover:text-[#003a6e] font-medium px-1"
          >
            <Star className="h-2.5 w-2.5" />
            {d.responsibleId ? 'Cambiar responsable' : 'Designar responsable'}
          </button>
        )}

        {showSetResponsible && d.canManage && (
          <div className="mt-1.5 space-y-1.5 px-1 pb-1">
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger className="h-7 text-[11px]">
                <SelectValue placeholder="Seleccionar miembro..." />
              </SelectTrigger>
              <SelectContent>
                {d.members.map(m => (
                  <SelectItem key={m.user_id} value={m.user_id} className="text-xs">
                    {m.full_name ?? 'Sin nombre'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMemberId && (
              <Select value={selectedPositionId} onValueChange={setSelectedPositionId}>
                <SelectTrigger className="h-7 text-[11px]">
                  <SelectValue placeholder="Puesto del responsable..." />
                </SelectTrigger>
                <SelectContent>
                  {d.positions.map(p => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="flex gap-1">
              <Button size="sm" className="h-6 text-[10px] flex-1 px-2" style={{ backgroundColor: d.departmentColor }} onClick={handleSetResponsible} disabled={!selectedMemberId}>
                Asignar
              </Button>
              <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => { setShowSetResponsible(false); setSelectedMemberId(''); setSelectedPositionId('') }}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Equipo */}
      <div className="px-2 pt-1.5 pb-1">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold px-1">Equipo</span>
        <div className="mt-0.5 space-y-0.5">
          {teamMembers.length === 0 ? (
            <p className="text-[11px] text-muted-foreground text-center py-1.5">Sin miembros en el equipo</p>
          ) : (
            teamMembers.map(m => (
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
      </div>

      {d.canManage && (
        <div className="px-2 pb-2">
          <Button
            size="sm"
            variant="ghost"
            className="w-full h-6 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => d.onAddMember(d.areaId, d.name)}
          >
            <Plus className="h-3 w-3" />
            Asignar usuario
          </Button>
        </div>
      )}
    </div>
  )
}
