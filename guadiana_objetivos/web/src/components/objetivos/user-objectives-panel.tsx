'use client'

import { useRouter } from 'next/navigation'
import type { UserWithObjectives } from '@/app/(dashboard)/objetivos/objective-actions'
import type { IncentiveSchema } from '@/app/(dashboard)/incentivos/incentive-actions'
import { ObjectiveCard } from './objective-card'
import { DeliverableRow } from './deliverable-row'
import { CreateObjectiveForUserForm } from './create-objective-for-user-form'
import { UserIncentiveSection } from './user-incentive-section'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useState } from 'react'
import { deleteObjective } from '@/app/(dashboard)/objetivos/objective-actions'
import { toast } from 'sonner'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

const SOURCE_LABELS: Record<string, string> = {
  dept_responsible: 'Responsable',
  dept_member: 'Miembro',
  area_responsible: 'Resp. Área',
  area_member: 'Miembro Área',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserObjectivesPanelProps {
  user: UserWithObjectives
  deptId: string
  month: number
  year: number
  canManage: boolean
  canReview: boolean
  incentiveSchemas: IncentiveSchema[]
  open: boolean
  onClose: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function UserObjectivesPanel({
  user,
  deptId,
  month,
  year,
  canManage,
  canReview,
  incentiveSchemas,
  open,
  onClose,
}: UserObjectivesPanelProps) {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)

  const pctColor =
    user.completionPct >= 80
      ? 'text-green-600'
      : user.completionPct >= 50
      ? 'text-yellow-600'
      : 'text-red-500'

  async function handleDeleteObjective(id: string) {
    const result = await deleteObjective(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Objetivo eliminado')
      router.refresh()
    }
  }

  function handleObjectiveCreated() {
    setShowCreateForm(false)
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto" side="right">
        <SheetHeader className="pb-4">
          {/* Info del usuario */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 shrink-0">
              {user.avatarUrl && (
                <AvatarImage src={user.avatarUrl} alt={user.userName ?? ''} />
              )}
              <AvatarFallback className="bg-brand-blue/10 text-brand-blue font-semibold">
                {getInitials(user.userName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base leading-tight">
                {user.userName ?? 'Sin nombre'}
              </SheetTitle>
              {user.positionName && (
                <p className="text-sm text-muted-foreground">{user.positionName}</p>
              )}
              <Badge variant="outline" className="mt-1 text-xs">
                {SOURCE_LABELS[user.source] ?? user.source}
              </Badge>
            </div>
          </div>

          {/* Progreso global */}
          <div className="space-y-1 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {user.objectives.length} objetivo{user.objectives.length !== 1 ? 's' : ''}
              </span>
              <span className={`font-semibold ${pctColor}`}>
                {user.completionPct}% cumplimiento
              </span>
            </div>
            <Progress value={user.completionPct} className="h-2" />
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* ── Sección de Objetivos ── */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Objetivos
              </h3>
              {canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setShowCreateForm((v) => !v)}
                >
                  {showCreateForm ? 'Cancelar' : '+ Nuevo objetivo'}
                </Button>
              )}
            </div>

            {/* Formulario inline */}
            {showCreateForm && canManage && (
              <div className="rounded-lg border p-4 bg-muted/30">
                <CreateObjectiveForUserForm
                  orgDeptId={deptId}
                  assigneeId={user.userId}
                  month={month}
                  year={year}
                  onSuccess={handleObjectiveCreated}
                />
              </div>
            )}

            {/* Lista de objetivos */}
            {user.objectives.length === 0 && !showCreateForm && (
              <p className="text-sm text-muted-foreground text-center py-6">
                Sin objetivos en este período.
              </p>
            )}

            {user.objectives.map((obj) => (
              <div key={obj.id} className="space-y-2">
                <ObjectiveCard
                  objective={obj}
                  canManage={canManage}
                  onDelete={handleDeleteObjective}
                />
                {obj.deliverables.length === 0 ? (
                  <p className="text-xs text-muted-foreground pl-3">
                    Sin entregable configurado
                  </p>
                ) : (
                  <div className="pl-3 space-y-2">
                    {obj.deliverables.map((deliv) => (
                      <DeliverableRow
                        key={deliv.id}
                        deliverable={deliv}
                        canReview={canReview}
                        currentUserIsAssignee={deliv.assignee_id === user.userId}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>

          <Separator />

          {/* ── Sección de Incentivo ── */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Plan de incentivo
            </h3>
            <UserIncentiveSection
              userId={user.userId}
              orgDeptId={deptId}
              month={month}
              year={year}
              incentiveSchemas={incentiveSchemas}
              currentRecord={user.incentiveRecord}
              userCompletionPct={user.completionPct}
              canManage={canManage}
            />
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}
