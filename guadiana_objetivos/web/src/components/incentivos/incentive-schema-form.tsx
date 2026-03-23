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

interface Department {
  id: string
  name: string
}

interface Role {
  id: string
  name: string
  is_root: boolean
}

interface IncentiveSchemaFormProps {
  schema?: IncentiveSchema
  departments: Department[]
  roles: Role[]
}

const EMPTY_TIER: IncentiveTier = { min_pct: 0, max_pct: 100, bonus_pct: 0 }

export function IncentiveSchemaForm({ schema, departments, roles }: IncentiveSchemaFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [departmentId, setDepartmentId] = useState<string>(schema?.department_id ?? '')
  const [roleId, setRoleId] = useState<string>(schema?.role_id ?? '')
  const [baseAmount, setBaseAmount] = useState<string>(String(schema?.base_amount ?? ''))
  const [validFrom, setValidFrom] = useState<string>(schema?.valid_from ?? '')
  const [validTo, setValidTo] = useState<string>(schema?.valid_to ?? '')
  const [tiers, setTiers] = useState<IncentiveTier[]>(
    schema?.tiers?.length ? schema.tiers : [{ min_pct: 80, max_pct: 89, bonus_pct: 50 }, { min_pct: 90, max_pct: 100, bonus_pct: 100 }]
  )

  function addTier() {
    setTiers((prev) => [...prev, { ...EMPTY_TIER }])
  }

  function removeTier(idx: number) {
    setTiers((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateTier(idx: number, field: keyof IncentiveTier, value: string) {
    setTiers((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, [field]: Number(value) } : t))
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const formData: CreateIncentiveSchemaData = {
      department_id: departmentId || null,
      role_id: roleId || null,
      base_amount: Number(baseAmount),
      tiers,
      valid_from: validFrom,
      valid_to: validTo || null,
    }

    startTransition(async () => {
      if (schema) {
        const result = await updateIncentiveSchema(schema.id, formData)
        if (!result.success) {
          setError(result.error ?? 'Error al actualizar.')
          return
        }
      } else {
        const result = await createIncentiveSchema(formData)
        if (!result.success) {
          setError(result.error ?? 'Error al crear.')
          return
        }
      }
      router.push('/incentivos/configurar')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Departamento */}
      <div>
        <label className="block text-sm font-medium mb-1">Departamento</label>
        <select
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
        >
          <option value="">— Todos los departamentos —</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Deja vacío para aplicar a todos los departamentos.
        </p>
      </div>

      {/* Rol */}
      <div>
        <label className="block text-sm font-medium mb-1">Rol</label>
        <select
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
        >
          <option value="">— Todos los roles —</option>
          {roles.filter((r) => !r.is_root).map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Monto base */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Monto base <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={baseAmount}
          onChange={(e) => setBaseAmount(e.target.value)}
          placeholder="Ej: 5000.00"
        />
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
          <p className="text-xs text-muted-foreground mt-1">Deja vacío para vigencia indefinida.</p>
        </div>
      </div>

      {/* Niveles de bonificación */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Niveles de bonificación</label>
          <button
            type="button"
            onClick={addTier}
            className="text-xs text-primary hover:underline"
          >
            + Agregar nivel
          </button>
        </div>

        {tiers.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Sin niveles configurados. El bono base es 0%.
          </p>
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
                    max="100"
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
                    max="100"
                    className="w-full rounded border bg-background px-2 py-1 text-sm"
                    value={tier.max_pct}
                    onChange={(e) => updateTier(idx, 'max_pct', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Bono %</label>
                  <input
                    type="number"
                    min="0"
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
                aria-label="Eliminar nivel"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Ejemplo: De 80% a 89% → bono del 50% sobre el monto base.
        </p>
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : schema ? 'Actualizar esquema' : 'Crear esquema'}
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
