'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow, Background, Controls,
  type Node, type Edge,
  useNodesState, useEdgesState,
  MarkerType, Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Plus, Briefcase, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DepartmentNode, type DepartmentNodeData } from './department-node'
import { AreaNode, type AreaNodeData } from './area-node'
import { DirectionNode, type DirectionNodeData } from './direction-node'
import { CreateDepartmentDialog } from './create-department-dialog'
import { EditDepartmentDialog } from './edit-department-dialog'
import { CreateAreaDialog } from './create-area-dialog'
import { CreateDirectionAreaDialog } from './create-direction-area-dialog'
import { DirectionDialog } from './direction-dialog'
import { AssignMemberDialog } from './assign-member-dialog'
import { PositionsManager } from './positions-manager'
import {
  type OrgDepartment, type OrgDirection, type OrgDirectionArea,
  type PlatformUser, type OrgPosition,
  createDepartment, updateDepartment, updateDepartmentPosition,
  createArea, updateAreaPosition, updateAreaResponsible, deleteArea, deleteDepartment,
  assignMember, removeMember, updateMemberPosition,
  assignDepartmentMember, removeDepartmentMember, updateDepartmentMemberPosition,
  createOrUpdateDirection, updateDirectionPosition,
  assignDirectionMember, removeDirectionMember, updateDirectionMemberPosition,
  createDirectionArea, updateDirectionArea, updateDirectionAreaPosition, deleteDirectionArea,
  assignDirectionAreaMember, removeDirectionAreaMember, updateDirectionAreaMemberPosition,
} from '@/app/(dashboard)/organigrama/organigrama-actions'

const NODE_TYPES = { department: DepartmentNode, area: AreaNode, direction: DirectionNode }

const DEPT_Y_START = 80
const AREA_Y_OFFSET = 200
const DEPT_X_GAP = 280
const AREA_X_GAP = 260
const DIR_DEFAULT_X = 400
const DIR_DEFAULT_Y = 50
const DIR_AREA_X_GAP = 340

type Callbacks = {
  onAddArea: (deptId: string, deptName: string) => void
  onEditDept: (deptId: string) => void
  onDeleteDept: (deptId: string) => void
  onAddDeptMember: (deptId: string, deptName: string) => void
  onRemoveDeptMember: (memberId: string) => void
  onChangeDeptMemberPosition: (memberId: string, positionId: string) => void
  onAddMember: (areaId: string, areaName: string) => void
  onRemoveMember: (memberId: string) => void
  onChangeMemberPosition: (memberId: string, positionId: string) => void
  onSetAreaResponsible: (areaId: string, userId: string | null, positionId: string | null) => void
  onDeleteArea: (areaId: string) => void
  onEditDirection: () => void
  onAddDirectionMember: (dirId: string) => void
  onRemoveDirectionMember: (memberId: string) => void
  onChangeDirectionMemberPosition: (memberId: string, positionId: string) => void
  onAddDirectionArea: (dirId: string) => void
  onEditDirectionArea: (areaId: string) => void
  onDeleteDirectionArea: (areaId: string) => void
  onAddDirectionAreaMember: (areaId: string, areaName: string) => void
  onRemoveDirectionAreaMember: (memberId: string) => void
  onChangeDirectionAreaMemberPosition: (memberId: string, positionId: string) => void
}

function buildNodes(
  departments: OrgDepartment[],
  positions: OrgPosition[],
  direction: OrgDirection | null,
  canManage: boolean,
  cbs: Callbacks
): Node[] {
  const nodes: Node[] = []

  // ── Nodo Dirección ────────────────────────────────────────────────────────
  if (direction) {
    const dirX = direction.position_x || DIR_DEFAULT_X
    const dirY = direction.position_y || DIR_DEFAULT_Y

    const dirData: DirectionNodeData = {
      directionId: direction.id,
      name: direction.name,
      color: direction.color,
      responsibleName: direction.responsible_name,
      responsibleAvatar: direction.responsible_avatar,
      responsiblePositionName: direction.responsible_position_name,
      members: direction.members,
      positions,
      canManage,
      onEdit: cbs.onEditDirection,
      onAddArea: cbs.onAddDirectionArea,
      onAddMember: cbs.onAddDirectionMember,
      onRemoveMember: cbs.onRemoveDirectionMember,
      onChangeMemberPosition: cbs.onChangeDirectionMemberPosition,
    }

    nodes.push({
      id: `dir-${direction.id}`,
      type: 'direction',
      position: { x: dirX, y: dirY },
      data: dirData as unknown as Record<string, unknown>,
      draggable: canManage,
    })

    // Áreas de la Dirección (horizontales)
    direction.areas.forEach((area, ai) => {
      const side = ai % 2 === 0 ? -1 : 1
      const distance = Math.ceil((ai + 1) / 2) * DIR_AREA_X_GAP
      const areaX = area.position_x || (dirX + side * distance)
      const areaY = area.position_y || dirY

      const areaData: DepartmentNodeData = {
        departmentId: area.id,
        name: area.name,
        color: area.color,
        responsibleName: area.responsible_name,
        responsibleAvatar: area.responsible_avatar,
        responsiblePositionName: area.responsible_position_name,
        members: area.members,
        positions,
        canManage,
        hideAddArea: true,
        onAddArea: () => {},
        onAddMember: cbs.onAddDirectionAreaMember,
        onRemoveMember: cbs.onRemoveDirectionAreaMember,
        onChangeMemberPosition: cbs.onChangeDirectionAreaMemberPosition,
        onEdit: cbs.onEditDirectionArea,
        onDelete: cbs.onDeleteDirectionArea,
      }

      nodes.push({
        id: `dir-area-${area.id}`,
        type: 'department',
        position: { x: areaX, y: areaY },
        data: areaData as unknown as Record<string, unknown>,
        draggable: canManage,
      })
    })
  }

  // ── Departamentos y sus áreas ─────────────────────────────────────────────
  departments.forEach((dept, di) => {
    const deptX = dept.position_x || di * DEPT_X_GAP + 50
    const deptY = dept.position_y || DEPT_Y_START

    const deptData: DepartmentNodeData = {
      departmentId: dept.id,
      name: dept.name,
      color: dept.color,
      responsibleName: dept.responsible_name,
      responsibleAvatar: dept.responsible_avatar,
      responsiblePositionName: dept.responsible_position_name,
      members: dept.members,
      positions,
      canManage,
      onAddArea: cbs.onAddArea,
      onAddMember: cbs.onAddDeptMember,
      onRemoveMember: cbs.onRemoveDeptMember,
      onChangeMemberPosition: cbs.onChangeDeptMemberPosition,
      onEdit: cbs.onEditDept,
      onDelete: cbs.onDeleteDept,
    }

    nodes.push({
      id: `dept-${dept.id}`,
      type: 'department',
      position: { x: deptX, y: deptY },
      data: deptData as unknown as Record<string, unknown>,
      draggable: canManage,
    })

    dept.areas.forEach((area, ai) => {
      const areaX = area.position_x || deptX + (ai - (dept.areas.length - 1) / 2) * AREA_X_GAP
      const areaY = area.position_y || deptY + AREA_Y_OFFSET

      const areaData: AreaNodeData = {
        areaId: area.id,
        name: area.name,
        departmentColor: dept.color,
        members: area.members,
        positions,
        responsibleId: area.responsible_id,
        responsibleName: area.responsible_name,
        responsibleAvatar: area.responsible_avatar,
        responsiblePositionId: area.responsible_position_id,
        responsiblePositionName: area.responsible_position_name,
        canManage,
        onAddMember: cbs.onAddMember,
        onRemoveMember: cbs.onRemoveMember,
        onChangeMemberPosition: cbs.onChangeMemberPosition,
        onSetResponsible: cbs.onSetAreaResponsible,
        onDelete: cbs.onDeleteArea,
      }

      nodes.push({
        id: `area-${area.id}`,
        type: 'area',
        position: { x: areaX, y: areaY },
        data: areaData as unknown as Record<string, unknown>,
        draggable: canManage,
      })
    })
  })

  return nodes
}

function buildEdges(departments: OrgDepartment[], direction: OrgDirection | null): Edge[] {
  const edges: Edge[] = []

  // Dept → Área
  departments.forEach(dept => {
    dept.areas.forEach(area => {
      edges.push({
        id: `edge-${dept.id}-${area.id}`,
        source: `dept-${dept.id}`,
        target: `area-${area.id}`,
        sourceHandle: 'dept-out',
        targetHandle: 'area-in',
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: dept.color },
        style: { stroke: dept.color, strokeWidth: 2 },
      })
    })
  })

  if (direction) {
    // Dirección → Departamentos
    departments.forEach(dept => {
      edges.push({
        id: `edge-dir-dept-${dept.id}`,
        source: `dir-${direction.id}`,
        target: `dept-${dept.id}`,
        sourceHandle: 'dir-out-bottom',
        targetHandle: 'dept-in',
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: direction.color },
        style: { stroke: direction.color, strokeWidth: 2 },
      })
    })

    // Dirección → Áreas de Dirección (horizontal)
    direction.areas.forEach((area, ai) => {
      const srcHandle = ai % 2 === 0 ? 'dir-out-left' : 'dir-out-right'
      edges.push({
        id: `edge-dir-area-${area.id}`,
        source: `dir-${direction.id}`,
        target: `dir-area-${area.id}`,
        sourceHandle: srcHandle,
        targetHandle: 'dept-in',
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: direction.color },
        style: { stroke: direction.color, strokeWidth: 2 },
      })
    })
  }

  return edges
}

interface OrganigramaCanvasProps {
  initialDepartments: OrgDepartment[]
  initialPositions: OrgPosition[]
  initialDirection: OrgDirection | null
  platformUsers: PlatformUser[]
  canManage: boolean
}

export function OrganigramaCanvas({
  initialDepartments, initialPositions, initialDirection, platformUsers, canManage,
}: OrganigramaCanvasProps) {
  const [departments, setDepartments] = useState<OrgDepartment[]>(initialDepartments)
  const [positions, setPositions] = useState<OrgPosition[]>(initialPositions)
  const [direction, setDirection] = useState<OrgDirection | null>(initialDirection)

  // ── Refs para acceso estable desde callbacks ──────────────────────────────
  const deptsRef = useRef(departments)
  const posRef = useRef(positions)
  const dirRef = useRef(direction)
  useEffect(() => { deptsRef.current = departments }, [departments])
  useEffect(() => { posRef.current = positions }, [positions])
  useEffect(() => { dirRef.current = direction }, [direction])

  // ── Diálogos ─────────────────────────────────────────────────────────────
  const [deptDialog, setDeptDialog] = useState(false)
  const [editDeptDialog, setEditDeptDialog] = useState<OrgDepartment | null>(null)
  const [positionsDialog, setPositionsDialog] = useState(false)
  const [areaDialog, setAreaDialog] = useState<{ deptId: string; deptName: string } | null>(null)
  const [memberDialog, setMemberDialog] = useState<{ areaId: string; areaName: string } | null>(null)
  const [deptMemberDialog, setDeptMemberDialog] = useState<{ deptId: string; deptName: string } | null>(null)
  const [directionDialog, setDirectionDialog] = useState(false)
  const [dirAreaDialog, setDirAreaDialog] = useState(false)
  const [dirMemberDialog, setDirMemberDialog] = useState<{ dirId: string } | null>(null)
  const [dirAreaMemberDialog, setDirAreaMemberDialog] = useState<{ areaId: string; areaName: string } | null>(null)
  const [editDirAreaDialog, setEditDirAreaDialog] = useState<OrgDirectionArea | null>(null)

  // ── Callbacks estables (deps vacíos, usan refs) ───────────────────────────
  const callbacks = useMemo<Callbacks>(() => ({
    onAddArea: (deptId, deptName) => setAreaDialog({ deptId, deptName }),
    onAddDeptMember: (deptId, deptName) => setDeptMemberDialog({ deptId, deptName }),
    onRemoveDeptMember: async (memberId) => {
      const res = await removeDepartmentMember(memberId)
      if (!res.error) setDepartments(prev => prev.map(d => ({ ...d, members: d.members.filter(m => m.id !== memberId) })))
    },
    onChangeDeptMemberPosition: async (memberId, positionId) => {
      const res = await updateDepartmentMemberPosition(memberId, positionId)
      if (!res.error) {
        const pos = posRef.current.find(p => p.id === positionId)
        setDepartments(prev => prev.map(d => ({
          ...d, members: d.members.map(m =>
            m.id === memberId ? { ...m, position_id: positionId, position_name: pos?.name ?? null } : m
          ),
        })))
      }
    },
    onEditDept: (deptId) => {
      const dept = deptsRef.current.find(d => d.id === deptId)
      if (dept) setEditDeptDialog(dept)
    },
    onDeleteDept: async (deptId) => {
      const res = await deleteDepartment(deptId)
      if (!res.error) setDepartments(prev => prev.filter(d => d.id !== deptId))
    },
    onAddMember: (areaId, areaName) => setMemberDialog({ areaId, areaName }),
    onRemoveMember: async (memberId) => {
      const res = await removeMember(memberId)
      if (!res.error) setDepartments(prev => prev.map(d => ({
        ...d, areas: d.areas.map(a => ({ ...a, members: a.members.filter(m => m.id !== memberId) })),
      })))
    },
    onChangeMemberPosition: async (memberId, positionId) => {
      const res = await updateMemberPosition(memberId, positionId)
      if (!res.error) {
        const pos = posRef.current.find(p => p.id === positionId)
        setDepartments(prev => prev.map(d => ({
          ...d, areas: d.areas.map(a => ({
            ...a, members: a.members.map(m =>
              m.id === memberId ? { ...m, position_id: positionId, position_name: pos?.name ?? null } : m
            ),
          })),
        })))
      }
    },
    onSetAreaResponsible: async (areaId, userId, positionId) => {
      const res = await updateAreaResponsible(areaId, userId, positionId)
      if (!res.error) {
        const pos = positionId ? posRef.current.find(p => p.id === positionId) : undefined
        setDepartments(prev => prev.map(d => ({
          ...d, areas: d.areas.map(a => {
            if (a.id !== areaId) return a
            const member = userId ? a.members.find(m => m.user_id === userId) : null
            return {
              ...a,
              responsible_id: userId,
              responsible_name: member?.full_name ?? null,
              responsible_avatar: member?.avatar_url ?? null,
              responsible_position_id: positionId,
              responsible_position_name: pos?.name ?? null,
            }
          }),
        })))
      }
    },
    onDeleteArea: async (areaId) => {
      const res = await deleteArea(areaId)
      if (!res.error) setDepartments(prev => prev.map(d => ({
        ...d, areas: d.areas.filter(a => a.id !== areaId),
      })))
    },

    // ── Dirección ──────────────────────────────────────────────────────────
    onEditDirection: () => setDirectionDialog(true),
    onAddDirectionMember: (dirId) => setDirMemberDialog({ dirId }),
    onRemoveDirectionMember: async (memberId) => {
      const res = await removeDirectionMember(memberId)
      if (!res.error) setDirection(prev => prev ? { ...prev, members: prev.members.filter(m => m.id !== memberId) } : prev)
    },
    onChangeDirectionMemberPosition: async (memberId, positionId) => {
      const res = await updateDirectionMemberPosition(memberId, positionId)
      if (!res.error) {
        const pos = posRef.current.find(p => p.id === positionId)
        setDirection(prev => prev ? {
          ...prev,
          members: prev.members.map(m => m.id === memberId ? { ...m, position_id: positionId, position_name: pos?.name ?? null } : m),
        } : prev)
      }
    },
    onAddDirectionArea: () => setDirAreaDialog(true),

    // ── Áreas de Dirección ─────────────────────────────────────────────────
    onEditDirectionArea: (areaId) => {
      const area = dirRef.current?.areas.find(a => a.id === areaId)
      if (area) setEditDirAreaDialog(area)
    },
    onDeleteDirectionArea: async (areaId) => {
      const res = await deleteDirectionArea(areaId)
      if (!res.error) setDirection(prev => prev ? { ...prev, areas: prev.areas.filter(a => a.id !== areaId) } : prev)
    },
    onAddDirectionAreaMember: (areaId, areaName) => setDirAreaMemberDialog({ areaId, areaName }),
    onRemoveDirectionAreaMember: async (memberId) => {
      const res = await removeDirectionAreaMember(memberId)
      if (!res.error) setDirection(prev => prev ? {
        ...prev,
        areas: prev.areas.map(a => ({ ...a, members: a.members.filter(m => m.id !== memberId) })),
      } : prev)
    },
    onChangeDirectionAreaMemberPosition: async (memberId, positionId) => {
      const res = await updateDirectionAreaMemberPosition(memberId, positionId)
      if (!res.error) {
        const pos = posRef.current.find(p => p.id === positionId)
        setDirection(prev => prev ? {
          ...prev,
          areas: prev.areas.map(a => ({
            ...a,
            members: a.members.map(m => m.id === memberId ? { ...m, position_id: positionId, position_name: pos?.name ?? null } : m),
          })),
        } : prev)
      }
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])

  // ── Nodos y aristas ───────────────────────────────────────────────────────
  const [nodes, setNodes, onNodesChange] = useNodesState(
    buildNodes(departments, positions, direction, canManage, callbacks)
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges(departments, direction))

  // Sincroniza datos preservando posiciones actuales
  const isFirst = useRef(true)
  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    setNodes(prev => {
      const posMap = new Map(prev.map(n => [n.id, n.position]))
      return buildNodes(departments, positions, direction, canManage, callbacks).map(n => ({
        ...n,
        position: posMap.get(n.id) ?? n.position,
      }))
    })
    setEdges(buildEdges(departments, direction))
  }, [departments, positions, direction, canManage, callbacks, setNodes, setEdges])

  // ── Drag: persiste posición en BD y en estado ─────────────────────────────
  const onNodeDragStop = useCallback(async (_: React.MouseEvent, node: Node) => {
    if (!canManage) return
    const { x, y } = node.position
    if (node.id.startsWith('dir-area-')) {
      const id = node.id.replace('dir-area-', '')
      await updateDirectionAreaPosition(id, x, y)
      setDirection(prev => prev ? {
        ...prev,
        areas: prev.areas.map(a => a.id === id ? { ...a, position_x: x, position_y: y } : a),
      } : prev)
    } else if (node.id.startsWith('dir-')) {
      const id = node.id.replace('dir-', '')
      await updateDirectionPosition(id, x, y)
      setDirection(prev => prev ? { ...prev, position_x: x, position_y: y } : prev)
    } else if (node.id.startsWith('dept-')) {
      const id = node.id.replace('dept-', '')
      await updateDepartmentPosition(id, x, y)
      setDepartments(prev => prev.map(d => d.id === id ? { ...d, position_x: x, position_y: y } : d))
    } else if (node.id.startsWith('area-')) {
      const id = node.id.replace('area-', '')
      await updateAreaPosition(id, x, y)
      setDepartments(prev => prev.map(d => ({
        ...d, areas: d.areas.map(a => a.id === id ? { ...a, position_x: x, position_y: y } : a),
      })))
    }
  }, [canManage])

  // ── Handlers ─────────────────────────────────────────────────────────────

  async function handleSaveDirection(name: string, color: string, responsibleId: string | null, responsiblePositionId: string | null) {
    const res = await createOrUpdateDirection(name, color, responsibleId, responsiblePositionId)
    if (res.error) throw new Error(res.error)
    const responsible = responsibleId ? platformUsers.find(u => u.id === responsibleId) : undefined
    const pos = responsiblePositionId ? positions.find(p => p.id === responsiblePositionId) : undefined
    setDirection(prev => ({
      id: res.id!,
      name, color,
      position_x: prev?.position_x ?? DIR_DEFAULT_X,
      position_y: prev?.position_y ?? DIR_DEFAULT_Y,
      responsible_id: responsibleId,
      responsible_name: responsible?.full_name ?? null,
      responsible_avatar: responsible?.avatar_url ?? null,
      responsible_position_id: responsiblePositionId,
      responsible_position_name: pos?.name ?? null,
      members: prev?.members ?? [],
      areas: prev?.areas ?? [],
    }))
  }

  async function handleCreateDirectionArea(name: string, color: string) {
    if (!direction) return
    const res = await createDirectionArea(direction.id, name, color)
    if (res.error) throw new Error(res.error)
    setDirection(prev => prev ? {
      ...prev,
      areas: [...prev.areas, {
        id: res.id!,
        direction_id: prev.id,
        name, color,
        position_x: 0, position_y: 0,
        responsible_id: null, responsible_name: null, responsible_avatar: null,
        responsible_position_id: null, responsible_position_name: null,
        members: [],
      }],
    } : prev)
  }

  async function handleEditDirectionArea(
    id: string, name: string, color: string,
    responsibleId: string | null, responsiblePositionId: string | null
  ) {
    const res = await updateDirectionArea(id, { name, color, responsible_id: responsibleId, responsible_position_id: responsiblePositionId })
    if (res.error) throw new Error(res.error)
    const responsible = responsibleId ? platformUsers.find(u => u.id === responsibleId) : undefined
    const pos = responsiblePositionId ? positions.find(p => p.id === responsiblePositionId) : undefined
    setDirection(prev => prev ? {
      ...prev,
      areas: prev.areas.map(a => a.id === id ? {
        ...a, name, color,
        responsible_id: responsibleId,
        responsible_name: responsible?.full_name ?? null,
        responsible_avatar: responsible?.avatar_url ?? null,
        responsible_position_id: responsiblePositionId,
        responsible_position_name: pos?.name ?? null,
      } : a),
    } : prev)
  }

  async function handleCreateDepartment(name: string, color: string, responsibleId?: string, responsiblePositionId?: string) {
    const res = await createDepartment(name, color, responsibleId)
    if (res.error) throw new Error(res.error)
    const responsible = responsibleId ? platformUsers.find(u => u.id === responsibleId) : undefined
    const pos = responsiblePositionId ? positions.find(p => p.id === responsiblePositionId) : undefined
    if (responsibleId && responsiblePositionId) {
      await updateDepartment(res.id!, { responsible_position_id: responsiblePositionId })
    }
    setDepartments(prev => [...prev, {
      id: res.id!, name, color, position_x: 0, position_y: 0,
      responsible_id: responsibleId ?? null,
      responsible_name: responsible?.full_name ?? null,
      responsible_avatar: responsible?.avatar_url ?? null,
      responsible_position_id: responsiblePositionId ?? null,
      responsible_position_name: pos?.name ?? null,
      members: [],
      areas: [],
    }])
  }

  async function handleEditDepartment(
    id: string, name: string, color: string,
    responsibleId: string | null, responsiblePositionId: string | null
  ) {
    const res = await updateDepartment(id, {
      name, color,
      responsible_id: responsibleId,
      responsible_position_id: responsiblePositionId,
    })
    if (res.error) throw new Error(res.error)
    const responsible = responsibleId ? platformUsers.find(u => u.id === responsibleId) : undefined
    const pos = responsiblePositionId ? positions.find(p => p.id === responsiblePositionId) : undefined
    setDepartments(prev => prev.map(d => d.id === id ? {
      ...d, name, color,
      responsible_id: responsibleId,
      responsible_name: responsible?.full_name ?? null,
      responsible_avatar: responsible?.avatar_url ?? null,
      responsible_position_id: responsiblePositionId,
      responsible_position_name: pos?.name ?? null,
    } : d))
  }

  async function handleCreateArea(name: string) {
    if (!areaDialog) return
    const res = await createArea(areaDialog.deptId, name)
    if (res.error) throw new Error(res.error)
    setDepartments(prev => prev.map(d =>
      d.id === areaDialog.deptId
        ? { ...d, areas: [...d.areas, {
            id: res.id!, department_id: d.id, name,
            position_x: 0, position_y: 0,
            responsible_id: null, responsible_name: null, responsible_avatar: null,
            responsible_position_id: null, responsible_position_name: null,
            members: [],
          }] }
        : d
    ))
  }

  async function handleAssignMember(userId: string, positionId: string) {
    if (!memberDialog) return
    const res = await assignMember(memberDialog.areaId, userId, positionId)
    if (res.error) throw new Error(res.error)
    const user = platformUsers.find(u => u.id === userId)
    const pos = positions.find(p => p.id === positionId)
    setDepartments(prev => prev.map(d => ({
      ...d, areas: d.areas.map(a =>
        a.id === memberDialog.areaId
          ? { ...a, members: [...a.members, {
              id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              user_id: userId, position_id: positionId,
              position_name: pos?.name ?? null,
              full_name: user?.full_name ?? null,
              avatar_url: user?.avatar_url ?? null,
            }] }
          : a
      ),
    })))
  }

  async function handleAssignDeptMember(userId: string, positionId: string) {
    if (!deptMemberDialog) return
    const res = await assignDepartmentMember(deptMemberDialog.deptId, userId, positionId)
    if (res.error) throw new Error(res.error)
    const user = platformUsers.find(u => u.id === userId)
    const pos = positions.find(p => p.id === positionId)
    setDepartments(prev => prev.map(d =>
      d.id === deptMemberDialog.deptId
        ? { ...d, members: [...d.members, {
            id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            user_id: userId, position_id: positionId,
            position_name: pos?.name ?? null,
            full_name: user?.full_name ?? null,
            avatar_url: user?.avatar_url ?? null,
          }] }
        : d
    ))
  }

  async function handleAssignDirectionMember(userId: string, positionId: string) {
    if (!direction) return
    const res = await assignDirectionMember(direction.id, userId, positionId)
    if (res.error) throw new Error(res.error)
    const user = platformUsers.find(u => u.id === userId)
    const pos = positions.find(p => p.id === positionId)
    setDirection(prev => prev ? { ...prev, members: [...prev.members, {
      id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      user_id: userId, position_id: positionId,
      position_name: pos?.name ?? null,
      full_name: user?.full_name ?? null,
      avatar_url: user?.avatar_url ?? null,
    }] } : prev)
  }

  async function handleAssignDirectionAreaMember(userId: string, positionId: string) {
    if (!dirAreaMemberDialog) return
    const res = await assignDirectionAreaMember(dirAreaMemberDialog.areaId, userId, positionId)
    if (res.error) throw new Error(res.error)
    const user = platformUsers.find(u => u.id === userId)
    const pos = positions.find(p => p.id === positionId)
    setDirection(prev => prev ? {
      ...prev,
      areas: prev.areas.map(a => a.id === dirAreaMemberDialog.areaId ? {
        ...a, members: [...a.members, {
          id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          user_id: userId, position_id: positionId,
          position_name: pos?.name ?? null,
          full_name: user?.full_name ?? null,
          avatar_url: user?.avatar_url ?? null,
        }],
      } : a),
    } : prev)
  }

  // ── Listas de ya-asignados para evitar duplicados ─────────────────────────
  const assignedInArea = useMemo(() => {
    if (!memberDialog) return []
    for (const d of departments) {
      const area = d.areas.find(a => a.id === memberDialog.areaId)
      if (area) return area.members.map(m => m.user_id)
    }
    return []
  }, [memberDialog, departments])

  const assignedInDept = useMemo(() => {
    if (!deptMemberDialog) return []
    const dept = departments.find(d => d.id === deptMemberDialog.deptId)
    return dept ? dept.members.map(m => m.user_id) : []
  }, [deptMemberDialog, departments])

  const assignedInDir = useMemo(() => {
    if (!dirMemberDialog) return []
    return direction ? direction.members.map(m => m.user_id) : []
  }, [dirMemberDialog, direction])

  const assignedInDirArea = useMemo(() => {
    if (!dirAreaMemberDialog) return []
    const area = direction?.areas.find(a => a.id === dirAreaMemberDialog.areaId)
    return area ? area.members.map(m => m.user_id) : []
  }, [dirAreaMemberDialog, direction])

  // Para el EditDepartmentDialog reutilizado en áreas de Dirección
  const editDirAreaAsDept = editDirAreaDialog
    ? { ...editDirAreaDialog, members: [], areas: [] } as unknown as OrgDepartment
    : null

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={NODE_TYPES}
        nodesDraggable={canManage}
        snapToGrid
        snapGrid={[20, 20]}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} color="#d1d5db" size={1.5} />
        <Controls showInteractive={false} />

        {canManage && (
          <Panel position="top-left">
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                className="gap-2 shadow-md"
                style={{ backgroundColor: direction?.color ?? '#1e293b' }}
                onClick={() => setDirectionDialog(true)}
              >
                <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                {direction ? 'Dirección' : 'Crear Dirección'}
              </Button>
              <Button size="sm" className="gap-2 shadow-md" style={{ backgroundColor: '#004B8D' }} onClick={() => setDeptDialog(true)}>
                <Plus className="h-4 w-4" />
                Nuevo Departamento
              </Button>
              <Button size="sm" variant="outline" className="gap-2 shadow-md bg-white" onClick={() => setPositionsDialog(true)}>
                <Briefcase className="h-4 w-4" />
                Puestos
              </Button>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {/* ── Diálogos Dirección ── */}
      <DirectionDialog
        open={directionDialog}
        direction={direction}
        users={platformUsers}
        positions={positions}
        onClose={() => setDirectionDialog(false)}
        onSave={handleSaveDirection}
      />

      <CreateDirectionAreaDialog
        open={dirAreaDialog}
        onClose={() => setDirAreaDialog(false)}
        onCreate={handleCreateDirectionArea}
      />

      <EditDepartmentDialog
        open={!!editDirAreaDialog}
        department={editDirAreaAsDept}
        users={platformUsers}
        positions={positions}
        onClose={() => setEditDirAreaDialog(null)}
        onSave={handleEditDirectionArea}
      />

      <AssignMemberDialog
        open={!!dirMemberDialog}
        areaName="Equipo de la Dirección"
        users={platformUsers}
        positions={positions}
        alreadyAssigned={assignedInDir}
        onClose={() => setDirMemberDialog(null)}
        onAssign={handleAssignDirectionMember}
      />

      <AssignMemberDialog
        open={!!dirAreaMemberDialog}
        areaName={dirAreaMemberDialog ? `Equipo de ${dirAreaMemberDialog.areaName}` : ''}
        users={platformUsers}
        positions={positions}
        alreadyAssigned={assignedInDirArea}
        onClose={() => setDirAreaMemberDialog(null)}
        onAssign={handleAssignDirectionAreaMember}
      />

      {/* ── Diálogos Departamento ── */}
      <CreateDepartmentDialog
        open={deptDialog}
        users={platformUsers}
        positions={positions}
        onClose={() => setDeptDialog(false)}
        onCreate={handleCreateDepartment}
      />

      <EditDepartmentDialog
        open={!!editDeptDialog}
        department={editDeptDialog}
        users={platformUsers}
        positions={positions}
        onClose={() => setEditDeptDialog(null)}
        onSave={handleEditDepartment}
      />

      <PositionsManager
        open={positionsDialog}
        positions={positions}
        onClose={() => setPositionsDialog(false)}
        onChange={setPositions}
      />

      <CreateAreaDialog
        open={!!areaDialog}
        departmentName={areaDialog?.deptName ?? ''}
        onClose={() => setAreaDialog(null)}
        onCreate={handleCreateArea}
      />

      <AssignMemberDialog
        open={!!memberDialog}
        areaName={memberDialog?.areaName ?? ''}
        users={platformUsers}
        positions={positions}
        alreadyAssigned={assignedInArea}
        onClose={() => setMemberDialog(null)}
        onAssign={handleAssignMember}
      />

      <AssignMemberDialog
        open={!!deptMemberDialog}
        areaName={deptMemberDialog ? `Equipo de ${deptMemberDialog.deptName}` : ''}
        users={platformUsers}
        positions={positions}
        alreadyAssigned={assignedInDept}
        onClose={() => setDeptMemberDialog(null)}
        onAssign={handleAssignDeptMember}
      />
    </div>
  )
}
