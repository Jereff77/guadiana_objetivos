'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PermissionsMatrix } from './permissions-matrix'
import { createRole, updateRole, setRolePermissions } from '@/app/(dashboard)/roles/role-actions'

interface PlatformModule {
  id: string
  key: string
  label: string
  module: string
  sort_order: number
}

interface RoleFormProps {
  mode: 'create' | 'edit'
  roleId?: string
  initialName?: string
  initialDescription?: string
  initialPermissions?: string[]
  isRoot?: boolean
  modules: PlatformModule[]
}

export function RoleForm({
  mode,
  roleId,
  initialName = '',
  initialDescription = '',
  initialPermissions = [],
  isRoot = false,
  modules,
}: RoleFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [selectedKeys, setSelectedKeys] = useState<string[]>(initialPermissions)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre del rol es obligatorio')
      return
    }

    setSaving(true)
    setError(null)

    if (mode === 'create') {
      const result = await createRole({ name, description })
      if (result.error) {
        setError(result.error)
        setSaving(false)
        return
      }
      if (result.id) {
        await setRolePermissions(result.id, selectedKeys)
        router.push('/roles')
      }
    } else if (roleId) {
      const nameChanged = name !== initialName || description !== initialDescription
      if (nameChanged) {
        const result = await updateRole(roleId, { name, description })
        if (result.error) {
          setError(result.error)
          setSaving(false)
          return
        }
      }
      const permResult = await setRolePermissions(roleId, selectedKeys)
      if (permResult.error) {
        setError(permResult.error)
        setSaving(false)
        return
      }
      router.push('/roles')
    }

    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Datos básicos */}
      <div className="space-y-4">
        <div>
          <label htmlFor="role-name" className="block text-sm font-medium mb-1.5">
            Nombre del rol <span className="text-red-500">*</span>
          </label>
          <input
            id="role-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isRoot || saving}
            placeholder="Ej: Gerente de Ventas"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
              placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30
              disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="role-desc" className="block text-sm font-medium mb-1.5">
            Descripción
          </label>
          <textarea
            id="role-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isRoot || saving}
            rows={2}
            placeholder="Describe brevemente las responsabilidades de este rol"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
              placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30
              disabled:opacity-60 disabled:cursor-not-allowed resize-none"
          />
        </div>
      </div>

      {/* Matriz de permisos */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Permisos del rol</h3>
        <PermissionsMatrix
          modules={modules}
          selectedKeys={selectedKeys}
          isRoot={isRoot}
          disabled={saving}
          onChange={setSelectedKeys}
        />
      </div>

      {/* Acciones */}
      {!isRoot && (
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-md bg-brand-blue text-white
              px-4 py-2 text-sm font-medium hover:bg-brand-blue/90 disabled:opacity-60
              disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Guardando…' : mode === 'create' ? 'Crear rol' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/roles')}
            disabled={saving}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </button>
        </div>
      )}
    </form>
  )
}
