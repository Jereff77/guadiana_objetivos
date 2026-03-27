'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { changeUserPassword } from '@/app/(dashboard)/usuarios/user-actions'

interface ChangePasswordFormProps {
  userId: string
}

export function ChangePasswordForm({ userId }: ChangePasswordFormProps) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setSaving(true)
    const result = await changeUserPassword(userId, password)
    setSaving(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setPassword('')
      setConfirm('')
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Contraseña actualizada correctamente.
        </div>
      )}

      <div>
        <label htmlFor="new-password" className="block text-sm font-medium mb-1.5">
          Nueva contraseña
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={saving}
            placeholder="Mínimo 8 caracteres"
            className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm
              placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30
              disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium mb-1.5">
          Confirmar contraseña
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirm ? 'text' : 'password'}
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={saving}
            placeholder="Repite la contraseña"
            className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm
              placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30
              disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center rounded-md bg-brand-blue text-white
          px-4 py-2 text-sm font-medium hover:bg-brand-blue/90 disabled:opacity-60
          disabled:cursor-not-allowed transition-colors"
      >
        {saving ? 'Guardando…' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}
