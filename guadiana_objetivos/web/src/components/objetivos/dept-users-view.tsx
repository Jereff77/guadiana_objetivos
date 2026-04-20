'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { UserWithObjectives } from '@/app/(dashboard)/objetivos/objective-actions'
import type { IncentiveSchema } from '@/app/(dashboard)/incentivos/incentive-actions'
import { UserObjectivesPanel } from './user-objectives-panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// ─── Constantes ───────────────────────────────────────────────────────────────

const MONTHS = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const SOURCE_LABELS: Record<string, string> = {
  dept_responsible: 'Responsable',
  dept_member: 'Miembro',
  area_responsible: 'Resp. Área',
  area_member: 'Miembro Área',
}

const SOURCE_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  dept_responsible: 'default',
  area_responsible: 'secondary',
  dept_member: 'outline',
  area_member: 'outline',
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DeptUsersViewProps {
  users: UserWithObjectives[]
  deptId: string
  month: number
  year: number
  canManage: boolean
  canReview: boolean
  incentiveSchemas: IncentiveSchema[]
  currentUserId: string
}

// ─── Helpers de agrupación ────────────────────────────────────────────────────

interface AreaGroup {
  areaId: string
  areaName: string | null
  responsible: UserWithObjectives | null
  members: UserWithObjectives[]
}

function buildHierarchy(users: UserWithObjectives[]) {
  const deptResponsible = users.find((u) => u.source === 'dept_responsible') ?? null
  const deptMembers = users.filter((u) => u.source === 'dept_member')

  // Agrupar por área
  const areaMap = new Map<string, AreaGroup>()
  for (const u of users) {
    if (u.source !== 'area_responsible' && u.source !== 'area_member') continue
    const areaId = u.area_id ?? '__unknown__'
    if (!areaMap.has(areaId)) {
      areaMap.set(areaId, { areaId, areaName: u.area_name, responsible: null, members: [] })
    }
    const group = areaMap.get(areaId)!
    if (u.source === 'area_responsible') group.responsible = u
    else group.members.push(u)
  }

  return { deptResponsible, deptMembers, areas: Array.from(areaMap.values()) }
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function DeptUsersView({
  users,
  deptId,
  month,
  year,
  canManage,
  canReview,
  incentiveSchemas,
  currentUserId,
}: DeptUsersViewProps) {
  const router = useRouter()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const selectedUser = selectedUserId
    ? (users.find((u) => u.userId === selectedUserId) ?? null)
    : null

  function handlePeriodSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const m = form.get('month') as string
    const y = form.get('year') as string
    const url = new URL(window.location.href)
    url.searchParams.set('month', m)
    url.searchParams.set('year', y)
    router.push(url.pathname + url.search)
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const { deptResponsible, deptMembers, areas } = buildHierarchy(users)

  const cardProps = {
    canOpen: (u: UserWithObjectives) => canManage || canReview || u.userId === currentUserId,
    onSelect: (userId: string) => setSelectedUserId(userId),
  }

  return (
    <>
      {/* Encabezado de período */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Equipo — <strong>{MONTHS[month]} {year}</strong>
          <span className="ml-2 text-muted-foreground/70">
            ({users.length} persona{users.length !== 1 ? 's' : ''})
          </span>
        </p>
        <form onSubmit={handlePeriodSubmit} className="flex items-center gap-2">
          <select
            name="month"
            defaultValue={month}
            className="rounded border border-input bg-background px-2 py-1.5 text-sm"
          >
            {MONTHS.slice(1).map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            name="year"
            defaultValue={year}
            className="rounded border border-input bg-background px-2 py-1.5 text-sm"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Button type="submit" size="sm" variant="secondary">Ver</Button>
        </form>
      </div>

      {users.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">
            No hay miembros configurados en este departamento.
          </p>
        </div>
      )}

      {/* Árbol jerárquico */}
      {users.length > 0 && (
        <div className="space-y-1">
          {/* Responsable del departamento */}
          {deptResponsible && (
            <UserCard
              user={deptResponsible}
              canOpen={cardProps.canOpen(deptResponsible)}
              onSelect={() => cardProps.onSelect(deptResponsible.userId)}
              level="dept-head"
            />
          )}

          {/* Miembros directos del departamento */}
          {deptMembers.length > 0 && (
            <div className="ml-4 pl-4 border-l-2 border-l-muted space-y-1">
              {deptMembers.map((u) => (
                <UserCard
                  key={u.userId}
                  user={u}
                  canOpen={cardProps.canOpen(u)}
                  onSelect={() => cardProps.onSelect(u.userId)}
                  level="dept-member"
                />
              ))}
            </div>
          )}

          {/* Áreas */}
          {areas.map((area) => (
            <div key={area.areaId} className="space-y-1">
              {/* Encabezado de área + responsable */}
              <div className="flex items-center gap-2 mt-3 mb-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  {area.areaName ?? 'Área'}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {area.responsible && (
                <UserCard
                  user={area.responsible}
                  canOpen={cardProps.canOpen(area.responsible)}
                  onSelect={() => cardProps.onSelect(area.responsible!.userId)}
                  level="area-head"
                />
              )}

              {/* Miembros del área */}
              {area.members.length > 0 && (
                <div className="ml-4 pl-4 border-l-2 border-l-muted space-y-1">
                  {area.members.map((u) => (
                    <UserCard
                      key={u.userId}
                      user={u}
                      canOpen={cardProps.canOpen(u)}
                      onSelect={() => cardProps.onSelect(u.userId)}
                      level="area-member"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sheet lateral */}
      {selectedUser && (
        <UserObjectivesPanel
          user={selectedUser}
          deptId={deptId}
          month={month}
          year={year}
          canManage={canManage}
          canReview={canReview}
          incentiveSchemas={incentiveSchemas}
          open={true}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </>
  )
}

// ─── UserCard ─────────────────────────────────────────────────────────────────

type CardLevel = 'dept-head' | 'dept-member' | 'area-head' | 'area-member'

function UserCard({
  user,
  canOpen,
  onSelect,
  level,
}: {
  user: UserWithObjectives
  canOpen: boolean
  onSelect: () => void
  level: CardLevel
}) {
  const pctColor =
    user.completionPct >= 80
      ? 'text-green-600'
      : user.completionPct >= 50
      ? 'text-yellow-600'
      : 'text-red-500'

  const isHead = level === 'dept-head' || level === 'area-head'

  return (
    <Card className={`hover:shadow-md transition-shadow ${isHead ? 'border-l-4 border-l-brand-blue/40' : ''}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className={isHead ? 'h-11 w-11 shrink-0' : 'h-9 w-9 shrink-0'}>
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.userName ?? ''} />}
            <AvatarFallback className="bg-brand-blue/10 text-brand-blue text-sm font-semibold">
              {getInitials(user.userName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className={`font-semibold truncate ${isHead ? 'text-sm' : 'text-sm'}`}>
              {user.userName ?? 'Usuario sin nombre'}
            </p>
            {user.positionName && (
              <p className="text-xs text-muted-foreground truncate">{user.positionName}</p>
            )}
          </div>

          <Badge variant={SOURCE_BADGE_VARIANT[user.source] ?? 'outline'} className="shrink-0 text-xs">
            {SOURCE_LABELS[user.source] ?? user.source}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {user.objectives.length} objetivo{user.objectives.length !== 1 ? 's' : ''}
            </span>
            <span className={`font-semibold ${pctColor}`}>
              {user.completionPct}% cumplimiento
            </span>
          </div>
          <Progress value={user.completionPct} className="h-1.5" />
        </div>

        {user.incentiveRecord && (
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-xs">
              Incentivo: {user.incentiveRecord.status === 'draft'
                ? 'En proceso'
                : user.incentiveRecord.status === 'approved'
                ? 'Aprobado'
                : 'Pagado'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              ${user.incentiveRecord.calculated_amount.toLocaleString('es-MX')}
            </span>
          </div>
        )}

        {canOpen ? (
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={onSelect}>
            Ver objetivos
          </Button>
        ) : (
          <p className="text-xs text-center text-muted-foreground py-1">Sin acceso</p>
        )}
      </CardContent>
    </Card>
  )
}
