'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteRole, updateRole } from '@/app/(dashboard)/roles/role-actions'

interface Role {
  id: string
  name: string
  description: string | null
  is_root: boolean
  is_active: boolean
  user_count: number
}

interface RolesTableProps {
  roles: Role[]
  canManage: boolean
}

export function RolesTable({ roles, canManage }: RolesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este rol? Esta acción no se puede deshacer.')) return
    setDeletingId(id)
    setError(null)
    const result = await deleteRole(id)
    setDeletingId(null)
    if (result.error) setError(result.error)
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    setError(null)
    const result = await updateRole(id, { is_active: !currentActive })
    if (result.error) setError(result.error)
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rol</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Descripción</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Usuarios</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Estado</th>
              {canManage && (
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{role.name}</span>
                    {role.is_root && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                        ROOT
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {role.description ?? '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-semibold">
                    {role.user_count}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      role.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {role.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                {canManage && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {!role.is_root && (
                        <>
                          <Link
                            href={`/roles/${role.id}`}
                            className="text-xs text-brand-blue hover:underline font-medium"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleToggleActive(role.id, role.is_active)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            {role.is_active ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleDelete(role.id)}
                            disabled={role.user_count > 0 || deletingId === role.id}
                            className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                            title={role.user_count > 0 ? 'Tiene usuarios asignados' : 'Eliminar rol'}
                          >
                            {deletingId === role.id ? 'Eliminando…' : 'Eliminar'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {roles.length === 0 && (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="px-4 py-8 text-center text-muted-foreground">
                  No hay roles registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
