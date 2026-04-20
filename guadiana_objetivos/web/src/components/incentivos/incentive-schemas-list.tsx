'use client'

import { useState, useTransition } from 'react'
import {
  deleteIncentiveSchema,
  updateIncentiveSchema,
  type IncentiveSchema,
} from '@/app/(dashboard)/incentivos/incentive-actions'
import { IncentiveSchemaForm } from './incentive-schema-form'

interface OrgDept { id: string; name: string }
interface OrgArea { id: string; name: string; department_id: string }

interface IncentiveSchemasListProps {
  schemas: IncentiveSchema[]
  orgDepts: OrgDept[]
  orgAreas: OrgArea[]
}

export function IncentiveSchemasList({ schemas, orgDepts, orgAreas }: IncentiveSchemasListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este esquema? Solo se puede eliminar si no tiene registros aprobados/pagados.')) return
    setErrors({})
    startTransition(async () => {
      const result = await deleteIncentiveSchema(id)
      if (!result.success) {
        setErrors((prev) => ({ ...prev, [id]: result.error ?? 'Error al eliminar.' }))
      }
    })
  }

  function handleToggleActive(id: string, currentValue: boolean) {
    startTransition(async () => {
      await updateIncentiveSchema(id, { is_active: !currentValue })
    })
  }

  return (
    <div className="space-y-4">
      {schemas.map((schema) => {
        if (editingId === schema.id) {
          return (
            <div key={schema.id} className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Editar esquema</h3>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
              </div>
              <IncentiveSchemaForm
                schema={schema}
                orgDepts={orgDepts}
                orgAreas={orgAreas}
              />
            </div>
          )
        }

        return (
          <div key={schema.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm">
                    {schema.name ?? schema.org_dept_name ?? 'Todos los departamentos'}
                    {schema.role_name && ` · ${schema.role_name}`}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      schema.is_active
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    {schema.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Sueldo base: ${Number(schema.base_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  {' · '}
                  Bono máximo: ${Number(schema.bonus_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  {' · '}
                  Desde: {new Date(schema.valid_from).toLocaleDateString('es-MX')}
                  {schema.valid_to && ` · Hasta: ${new Date(schema.valid_to).toLocaleDateString('es-MX')}`}
                </p>
                {schema.tiers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {schema.tiers.map((tier, i) => (
                      <span
                        key={i}
                        className="text-xs bg-muted px-2 py-0.5 rounded"
                      >
                        {tier.min_pct}–{tier.max_pct}% → +{tier.bonus_pct}%
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggleActive(schema.id, schema.is_active)}
                  disabled={isPending}
                  className="text-xs px-2 py-1 rounded border hover:bg-muted disabled:opacity-50"
                >
                  {schema.is_active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => setEditingId(schema.id)}
                  className="text-xs px-2 py-1 rounded border hover:bg-muted"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(schema.id)}
                  disabled={isPending}
                  className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {errors[schema.id] && (
              <p className="text-xs text-red-600 mt-2">{errors[schema.id]}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
