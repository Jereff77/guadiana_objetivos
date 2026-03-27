'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUser } from '@/app/(dashboard)/usuarios/user-actions'

interface Role {
  id: string
  name: string
  is_root: boolean
  is_active: boolean
}

interface CreateUserFormProps {
  roles: Role[]
}

export function CreateUserForm({ roles }: CreateUserFormProps) {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const result = await createUser({
      email,
      password,
      fullName,
      roleId: roleId || undefined,
    })

    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.userId) {
      router.push(`/usuarios/${result.userId}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="full-name" className="block text-sm font-medium mb-1.5">
          Nombre completo <span className="text-red-500">*</span>
        </label>
        <input
          id="full-name"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={saving}
          placeholder="Ej: Juan García López"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
            placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30
            disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1.5">
          Correo electrónico <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={saving}
          placeholder="usuario@empresa.com"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
            placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30
            disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1.5">
          Contraseña inicial <span className="text-red-500">*</span>
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={saving}
          placeholder="Mínimo 8 caracteres"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
            placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30
            disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground mt-1">
          El usuario podrá cambiarla después desde su perfil.
        </p>
      </div>

      <div>
        <label htmlFor="role-select" className="block text-sm font-medium mb-1.5">
          Rol asignado
        </label>
        <select
          id="role-select"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          disabled={saving}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-brand-blue/30 disabled:opacity-60"
        >
          <option value="">— Sin rol (asignar después) —</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}{role.is_root ? ' (ROOT)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md bg-brand-blue text-white
            px-4 py-2 text-sm font-medium hover:bg-brand-blue/90 disabled:opacity-60
            disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Creando usuario…' : 'Crear usuario'}
        </button>
        <a
          href="/usuarios"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </a>
      </div>
    </form>
  )
}
