'use client'

import { useState } from 'react'
import { changeUserRole } from '@/app/(dashboard)/usuarios/user-actions'

interface Role {
  id: string
  name: string
  is_root: boolean
  is_active: boolean
}

interface UserRoleSelectorProps {
  userId: string
  currentRoleId: string | null
  roles: Role[]
  viewerIsRoot: boolean
}

export function UserRoleSelector({
  userId,
  currentRoleId,
  roles,
  viewerIsRoot,
}: UserRoleSelectorProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(currentRoleId ?? '')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Filtrar roles según si el viewer es root
  const availableRoles = roles.filter((r) => {
    if (!r.is_active) return false
    if (r.is_root && !viewerIsRoot) return false
    return true
  })

  async function handleSave() {
    if (!selectedRoleId || selectedRoleId === currentRoleId) return

    const newRole = roles.find((r) => r.id === selectedRoleId)
    if (newRole?.is_root && !confirm('¿Asignar rol ROOT? Este usuario tendrá acceso total al sistema.')) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    const result = await changeUserRole(userId, selectedRoleId, reason)
    setSaving(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setReason('')
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const hasChanged = selectedRoleId !== (currentRoleId ?? '')

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Rol actualizado correctamente.
        </div>
      )}

      <div>
        <label htmlFor="role-select" className="block text-sm font-medium mb-1.5">
          Rol asignado
        </label>
        <select
          id="role-select"
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
          disabled={saving}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-brand-blue/30 disabled:opacity-60"
        >
          <option value="">— Sin rol —</option>
          {availableRoles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}{role.is_root ? ' (ROOT)' : ''}
            </option>
          ))}
        </select>
      </div>

      {hasChanged && (
        <>
          <div>
            <label htmlFor="reason" className="block text-sm font-medium mb-1.5">
              Motivo del cambio <span className="text-muted-foreground">(opcional)</span>
            </label>
            <input
              id="reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Promoción a jefe de área"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            Este cambio modifica los accesos del usuario a la plataforma y queda registrado en el log de auditoría.
          </p>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-md bg-brand-blue text-white
              px-4 py-2 text-sm font-medium hover:bg-brand-blue/90 disabled:opacity-60
              disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Guardando…' : 'Confirmar cambio de rol'}
          </button>
        </>
      )}
    </div>
  )
}
