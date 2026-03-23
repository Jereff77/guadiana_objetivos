'use client'

import { useState } from 'react'
import Link from 'next/link'
import { activateUser, deactivateUser } from '@/app/(dashboard)/usuarios/user-actions'

interface UserRow {
  id: string
  full_name: string | null
  email: string
  role_name: string | null
  is_active: boolean
  whatsapp: string | null
  last_seen: string | null
}

interface UsersTableProps {
  users: UserRow[]
  canEdit: boolean
  canActivate: boolean
  canChangeRole: boolean
  currentUserId: string
}

// Colores de badge por nombre de rol
const roleColors: Record<string, string> = {
  root: 'bg-amber-100 text-amber-800 border-amber-200',
  Administrador: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
  'Jefe de Área': 'bg-purple-100 text-purple-700 border-purple-200',
  Auditor: 'bg-teal-100 text-teal-700 border-teal-200',
  Asesor: 'bg-green-100 text-green-700 border-green-200',
  Operario: 'bg-gray-100 text-gray-600 border-gray-200',
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function UsersTable({
  users,
  canEdit,
  canActivate,
  canChangeRole,
  currentUserId,
}: UsersTableProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Roles únicos para filtro
  const uniqueRoles = [...new Set(users.map((u) => u.role_name).filter(Boolean))] as string[]

  const filtered = users.filter((u) => {
    const statusMatch =
      filter === 'all' || (filter === 'active' ? u.is_active : !u.is_active)
    const roleMatch = roleFilter === 'all' || u.role_name === roleFilter
    return statusMatch && roleMatch
  })

  async function handleToggle(id: string, isActive: boolean) {
    setLoading(id)
    setError(null)
    const result = isActive ? await deactivateUser(id) : await activateUser(id)
    setLoading(null)
    if (result.error) setError(result.error)
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
        >
          <option value="all">Todos los roles</option>
          {uniqueRoles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <span className="text-sm text-muted-foreground">
          {filtered.length} de {users.length} usuarios
        </span>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rol</th>
              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">WhatsApp</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Último acceso</th>
              {(canEdit || canActivate || canChangeRole) && (
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((user) => {
              const roleColor = roleColors[user.role_name ?? ''] ?? 'bg-gray-100 text-gray-600 border-gray-200'
              const isSelf = user.id === currentUserId

              return (
                <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{user.full_name ?? '(sin nombre)'}</div>
                    <div className="text-xs text-muted-foreground">{user.email || '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    {user.role_name ? (
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${roleColor}`}>
                        {user.role_name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin rol</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {user.whatsapp ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(user.last_seen)}
                  </td>
                  {(canEdit || canActivate || canChangeRole) && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && (
                          <Link
                            href={`/usuarios/${user.id}`}
                            className="text-xs text-brand-blue hover:underline font-medium"
                          >
                            Editar
                          </Link>
                        )}
                        {canActivate && !isSelf && (
                          <button
                            onClick={() => handleToggle(user.id, user.is_active)}
                            disabled={loading === user.id}
                            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                          >
                            {loading === user.id
                              ? '…'
                              : user.is_active ? 'Desactivar' : 'Activar'}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No hay usuarios que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
