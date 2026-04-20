'use client'

import Link from 'next/link'
import type { OrgDeptForObjectives } from '@/app/(dashboard)/objetivos/dept-actions'

const ROLE_LABELS: Record<OrgDeptForObjectives['userRole'], { label: string; className: string }> = {
  direction: { label: 'Dirección', className: 'bg-purple-100 text-purple-700' },
  dept_responsible: { label: 'Responsable', className: 'bg-blue-100 text-blue-700' },
  area_responsible: { label: 'Área', className: 'bg-green-100 text-green-700' },
  member: { label: 'Miembro', className: 'bg-gray-100 text-gray-600' },
  none: { label: '', className: '' },
}

interface DepartmentsGridProps {
  departments: OrgDeptForObjectives[]
}

export function DepartmentsGrid({ departments }: DepartmentsGridProps) {
  if (departments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground text-sm">
          No estás asignado a ningún departamento en el organigrama.
        </p>
        <Link
          href="/organigrama"
          className="mt-3 inline-flex items-center rounded bg-brand-blue text-white px-4 py-2 text-sm hover:bg-brand-blue/90"
        >
          Ver organigrama
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {departments.map((dept) => {
        const role = ROLE_LABELS[dept.userRole]
        return (
          <Link
            key={dept.id}
            href={`/objetivos/${dept.id}`}
            className="block rounded-lg border bg-card hover:shadow-md transition-shadow group overflow-hidden"
          >
            {/* Franja de color */}
            <div className="h-1.5 w-full" style={{ backgroundColor: dept.color }} />

            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-base group-hover:text-brand-blue transition-colors leading-tight">
                  {dept.name}
                </h3>
                {dept.userRole !== 'none' && (
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${role.className}`}>
                    {role.label}
                  </span>
                )}
              </div>

              {dept.responsible_name && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div
                    className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                    style={{ backgroundColor: dept.color }}
                  >
                    {dept.responsible_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{dept.responsible_name}</p>
                    {dept.responsible_position_name && (
                      <p className="text-[10px] leading-tight truncate" style={{ color: dept.color }}>
                        {dept.responsible_position_name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-3 text-xs font-medium" style={{ color: dept.color }}>
                Ver objetivos →
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
