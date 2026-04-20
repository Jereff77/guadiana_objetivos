'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  assignIncentivePlanToUser,
  type IncentiveSchema,
  type IncentiveTier,
} from '@/app/(dashboard)/incentivos/incentive-actions'
import type { UserWithObjectives } from '@/app/(dashboard)/objetivos/objective-actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return amount.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function calcEstimatedBonus(tiers: IncentiveTier[], bonusAmount: number, completionPct: number): number {
  const sorted = [...tiers].sort((a, b) => b.min_pct - a.min_pct)
  for (const tier of sorted) {
    if (completionPct >= tier.min_pct && completionPct <= tier.max_pct) {
      return bonusAmount * (tier.bonus_pct / 100)
    }
  }
  return 0
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'En proceso',
  approved: 'Aprobado',
  paid: 'Pagado',
}

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'outline',
  approved: 'secondary',
  paid: 'default',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface UserIncentiveSectionProps {
  userId: string
  orgDeptId: string
  month: number
  year: number
  incentiveSchemas: IncentiveSchema[]
  currentRecord: UserWithObjectives['incentiveRecord']
  userCompletionPct: number
  canManage: boolean
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function UserIncentiveSection({
  userId,
  orgDeptId,
  month,
  year,
  incentiveSchemas,
  currentRecord,
  userCompletionPct,
  canManage,
}: UserIncentiveSectionProps) {
  const router = useRouter()
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>('')
  const [assigning, setAssigning] = useState(false)
  const [showChangeForm, setShowChangeForm] = useState(false)

  // Encontrar el schema activo del record actual
  const activeSchema = currentRecord?.schema_id
    ? incentiveSchemas.find((s) => s.id === currentRecord.schema_id)
    : null

  async function handleAssignPlan() {
    if (!selectedSchemaId) {
      toast.error('Selecciona un plan de incentivo.')
      return
    }
    setAssigning(true)
    const result = await assignIncentivePlanToUser(
      userId,
      orgDeptId,
      selectedSchemaId,
      month,
      year
    )
    setAssigning(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Plan asignado correctamente.')
      setShowChangeForm(false)
      router.refresh()
    }
  }

  // ── Sin plan asignado ──────────────────────────────────────────────────────

  if (!currentRecord) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-dashed p-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Sin plan de incentivo asignado</p>
          {canManage && incentiveSchemas.length > 0 && (
            <PlanSelector
              schemas={incentiveSchemas}
              selectedSchemaId={selectedSchemaId}
              onSelect={setSelectedSchemaId}
              onAssign={handleAssignPlan}
              assigning={assigning}
            />
          )}
          {canManage && incentiveSchemas.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No hay planes de incentivo configurados para este departamento.
            </p>
          )}
        </div>
      </div>
    )
  }

  // ── Con plan asignado ──────────────────────────────────────────────────────

  const estimatedBonus = activeSchema
    ? calcEstimatedBonus(
        activeSchema.tiers ?? [],
        activeSchema.bonus_amount,
        userCompletionPct
      )
    : currentRecord.calculated_amount

  return (
    <div className="space-y-4">
      {/* Estado del record */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">
            {activeSchema?.name ?? 'Plan asignado'}
          </p>
          {activeSchema?.org_dept_name && (
            <p className="text-xs text-muted-foreground">{activeSchema.org_dept_name}</p>
          )}
        </div>
        <Badge variant={STATUS_BADGE[currentRecord.status] ?? 'outline'}>
          {STATUS_LABELS[currentRecord.status] ?? currentRecord.status}
        </Badge>
      </div>

      {/* Detalles del plan */}
      {activeSchema && (
        <>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-muted/40 p-3 space-y-0.5">
              <p className="text-xs text-muted-foreground">Bono máximo</p>
              <p className="font-semibold">{formatCurrency(activeSchema.bonus_amount)}</p>
            </div>
            <div className="rounded-md bg-muted/40 p-3 space-y-0.5">
              <p className="text-xs text-muted-foreground">Bono estimado</p>
              <p className="font-semibold text-brand-blue">{formatCurrency(estimatedBonus)}</p>
            </div>
          </div>

          {/* Tramos */}
          {activeSchema.tiers && activeSchema.tiers.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Tramos del plan
              </p>
              <div className="space-y-1">
                {[...activeSchema.tiers]
                  .sort((a, b) => a.min_pct - b.min_pct)
                  .map((tier, i) => {
                    const isActive =
                      userCompletionPct >= tier.min_pct &&
                      userCompletionPct <= tier.max_pct
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between text-xs rounded px-2 py-1 ${
                          isActive
                            ? 'bg-brand-blue/10 text-brand-blue font-semibold'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <span>
                          {tier.min_pct}% – {tier.max_pct}%
                        </span>
                        <span>
                          {tier.bonus_pct}% del bono
                          {' '}({formatCurrency(activeSchema.bonus_amount * (tier.bonus_pct / 100))})
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Cumplimiento actual */}
          <div className="rounded-md bg-muted/30 px-3 py-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Cumplimiento actual: <strong>{userCompletionPct}%</strong>
            </span>
            <span className="font-semibold text-brand-blue">
              Bono estimado: {formatCurrency(estimatedBonus)}
            </span>
          </div>
        </>
      )}

      {/* Cambiar plan */}
      {canManage && (
        <>
          <Separator />
          {!showChangeForm ? (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setShowChangeForm(true)}
            >
              Cambiar plan
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Seleccionar nuevo plan:</p>
              <PlanSelector
                schemas={incentiveSchemas}
                selectedSchemaId={selectedSchemaId}
                onSelect={setSelectedSchemaId}
                onAssign={handleAssignPlan}
                assigning={assigning}
                cancelLabel="Cancelar"
                onCancel={() => setShowChangeForm(false)}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Selector de plan ─────────────────────────────────────────────────────────

function PlanSelector({
  schemas,
  selectedSchemaId,
  onSelect,
  onAssign,
  assigning,
  cancelLabel,
  onCancel,
}: {
  schemas: IncentiveSchema[]
  selectedSchemaId: string
  onSelect: (id: string) => void
  onAssign: () => void
  assigning: boolean
  cancelLabel?: string
  onCancel?: () => void
}) {
  return (
    <div className="space-y-2">
      <select
        value={selectedSchemaId}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">Seleccionar plan...</option>
        {schemas.map((schema) => (
          <option key={schema.id} value={schema.id}>
            {schema.name ?? schema.org_dept_name ?? 'Sin nombre'} — Bono máx.{' '}
            {schema.bonus_amount.toLocaleString('es-MX', {
              style: 'currency',
              currency: 'MXN',
              minimumFractionDigits: 0,
            })}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <Button size="sm" onClick={onAssign} disabled={assigning || !selectedSchemaId}>
          {assigning ? 'Asignando...' : 'Asignar plan'}
        </Button>
        {onCancel && (
          <Button size="sm" variant="outline" onClick={onCancel}>
            {cancelLabel ?? 'Cancelar'}
          </Button>
        )}
      </div>
    </div>
  )
}
