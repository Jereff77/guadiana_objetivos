'use client'

import Link from 'next/link'

interface Department {
  id: string
  name: string
  description: string | null
  manager_name: string | null
  is_active: boolean
}

interface DepartmentsGridProps {
  departments: Department[]
  canManage: boolean
}

export function DepartmentsGrid({ departments, canManage }: DepartmentsGridProps) {
  const active = departments.filter((d) => d.is_active)

  if (active.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground text-sm">No hay departamentos configurados.</p>
        {canManage && (
          <Link
            href="/objetivos/configurar"
            className="mt-3 inline-flex items-center rounded bg-brand-blue text-white px-4 py-2 text-sm hover:bg-brand-blue/90"
          >
            + Crear departamento
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {active.map((dept) => (
        <Link
          key={dept.id}
          href={`/objetivos/${dept.id}`}
          className="block rounded-lg border bg-card p-4 hover:shadow-md transition-shadow group"
        >
          <h3 className="font-semibold text-base group-hover:text-brand-blue transition-colors">
            {dept.name}
          </h3>
          {dept.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{dept.description}</p>
          )}
          {dept.manager_name && (
            <p className="text-xs text-muted-foreground mt-2">
              Responsable: <strong>{dept.manager_name}</strong>
            </p>
          )}
          <div className="mt-3 text-xs text-brand-blue font-medium">
            Ver objetivos →
          </div>
        </Link>
      ))}
    </div>
  )
}
