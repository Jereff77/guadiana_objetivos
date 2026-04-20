'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createIncentiveSchema,
  updateIncentiveSchema,
  type IncentiveSchema,
  type IncentiveTier,
  type CreateIncentiveSchemaData,
} from '@/app/(dashboard)/incentivos/incentive-actions'

interface OrgDept { id: string; name: string }
interface OrgArea { id: string; name: string; department_id: string }

interface IncentiveSchemaFormProps {
  schema?: IncentiveSchema
  orgDepts: OrgDept[]
  orgAreas: OrgArea[]
}

export function IncentiveSchemaForm({ schema, orgDepts, orgAreas }: IncentiveSchemaFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState<string>(schema?.name ?? '')
  const [periodType, setPeriodType] = useState<'monthly' | 'annual' | 'custom'>(
    schema?.period_type ?? 'monthly'
  )
  const [orgDeptId, setOrgDeptId] = useState<string>(schema?.org_dept_id ?? '')
  const [orgAreaId, setOrgAreaId] = useState<string>(schema?.org_area_id ?? '')
  const [bonusAmount, setBonusAmount] = useState<string>(String(schema?.bonus_amount ?? ''))
  const [validFrom, setValidFrom] = useState<string>(schema?.valid_from ?? '')
  const [validTo, setValidTo] = useState<string>(schema?.valid_to ?? '')
  const [tiers, setTiers] = useState<IncentiveTier[]>(
    schema?.tiers?.length
      ? schema.tiers
      : [
          { min_pct: 1, max_pct: 50, bonus_pct: 50 },
          { min_pct: 51, max_pct: 80, bonus_pct: 80 },
          { min_pct: 81, max_pct: 100, bonus_pct: 100 },
          { min_pct: 101, max_pct: 999, bonus_pct: 115 },
        ]
  )

  function addTier() {
    setTiers((prev) => [...prev, { min_pct: 0, max_pct: 100, bonus_pct: 0 }])
  }

  function removeTier(idx: number) {
    setTiers((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateTier(idx: number, field: keyof IncentiveTier, value: string) {
    setTiers((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, [field]: Number(value) } : t))
    )
  }

  function handleScopeChange(type: 'dept' | 'area', id: string) {
    if (type === 'dept') {
      setOrgDeptId(id)
      setOrgAreaId('')
    } else {
      setOrgAreaId(id)
      setOrgDeptId('')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('El nombre del plan es requerido.')
      return
    }
    if (!bonusAmount || Number(bonusAmount) <= 0) {
      setError('El bono máximo debe ser mayor a 0.')
      return
    }
    if (!validFrom) {
      setError('La fecha de inicio es requerida.')
      return
    }

    const formData: CreateIncentiveSchemaData = {
      name: name.trim(),
      org_dept_id: orgDeptId || null,
      org_area_id: orgAreaId || null,
      role_id: null,
      period_type: periodType,
      base_amount: 0,
      bonus_amount: Number(bonusAmount),
      tiers,
      valid_from: validFrom,
      valid_to: validTo || null,
    }

    startTransition(async () => {
      if (schema) {
        const result = await updateIncentiveSchema(schema.id, formData)
        if (!result.success) { setError(result.error ?? 'Error al actualizar.'); return }
      } else {
        const result = await createIncentiveSchema(formData)
        if (!result.success) { setError(result.error ?? 'Error al crear.'); return }
        // Reset tras crear
        setName('')
        setOrgDeptId('')
        setOrgAreaId('')
        setBonusAmount('')
        setValidFrom('')
        setValidTo('')
        setTiers([
          { min_pct: 1, max_pct: 50, bonus_pct: 50 },
          { min_pct: 51, max_pct: 80, bonus_pct: 80 },
          { min_pct: 81, max_pct: 100, bonus_pct: 100 },
          { min_pct: 101, max_pct: 999, bonus_pct: 115 },
        ])
      }
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Nombre del plan */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Nombre del plan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Plan Gerencia Procesos 2026"
        />
      </div>

      {/* Tipo de período */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Tipo de período <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={periodType}
          onChange={(e) => setPeriodType(e.target.value as 'monthly' | 'annual' | 'custom')}
        >
          <option value="monthly">Mensual — se evalúa cada mes (cierra el último día del mes)</option>
          <option value="annual">Anual — una sola evaluación al 31 de diciembre</option>
          <option value="custom">Personalizado — se evalúa al vencer la vigencia</option>
        </select>
      </div>

      {/* Ámbito: departamento O área */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {orgDepts.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Departamento</label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={orgDeptId}
              onChange={(e) => handleScopeChange('dept', e.target.value)}
            >
              <option value="">— Sin depto específico —</option>
              {orgDepts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        {orgAreas.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Área</label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={orgAreaId}
              onChange={(e) => handleScopeChange('area', e.target.value)}
            >
              <option value="">— Sin área específica —</option>
              {orgAreas.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground -mt-4">
        Selecciona depto o área para limitar el plan. Solo puedes asignarlo dentro de ese ámbito.
      </p>

      {/* Bono máximo */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Bono máximo al 100% <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={bonusAmount}
          onChange={(e) => setBonusAmount(e.target.value)}
          placeholder="Ej: 5000"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Monto que recibe el colaborador al cumplir el 100% de sus objetivos.
        </p>
      </div>

      {/* Vigencia */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Vigencia desde <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Vigencia hasta</label>
          <input
            type="date"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={validTo}
            onChange={(e) => setValidTo(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">Vacío = indefinido.</p>
        </div>
      </div>

      {/* Tramos de cumplimiento */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Tramos de cumplimiento</label>
          <button
            type="button"
            onClick={addTier}
            className="text-xs text-primary hover:underline"
          >
            + Agregar tramo
          </button>
        </div>

        {tiers.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin tramos — el bono siempre será 0.</p>
        )}

        <div className="space-y-2">
          {tiers.map((tier, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded-md border p-2 bg-muted/30">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Desde %</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded border bg-background px-2 py-1 text-sm"
                    value={tier.min_pct}
                    onChange={(e) => updateTier(idx, 'min_pct', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Hasta %</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded border bg-background px-2 py-1 text-sm"
                    value={tier.max_pct}
                    onChange={(e) => updateTier(idx, 'max_pct', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">% del bono</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    className="w-full rounded border bg-background px-2 py-1 text-sm"
                    value={tier.bonus_pct}
                    onChange={(e) => updateTier(idx, 'bonus_pct', e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeTier(idx)}
                className="text-red-500 hover:text-red-700 text-lg leading-none p-1"
                aria-label="Eliminar tramo"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Ej: 1–50% → 50% del bono | 51–80% → 80% | 81–100% → 100% | más de 100% → 115%
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : schema ? 'Actualizar plan' : 'Crear plan'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
