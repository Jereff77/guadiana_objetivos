'use client'

import { useState, useCallback } from 'react'
import { updateUserProfile } from '@/app/(dashboard)/usuarios/user-actions'

interface UserProfileFormProps {
  userId: string
  initialData: {
    full_name: string | null
    phone: string | null
    whatsapp: string | null
    avatar_url: string | null
    email?: string | null
  }
  readOnly?: boolean
}

function fallbackCopy(text: string) {
  const el = document.createElement('textarea')
  el.value = text
  el.style.position = 'fixed'
  el.style.opacity = '0'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

export function UserProfileForm({ userId, initialData, readOnly = false }: UserProfileFormProps) {
  const [fullName, setFullName] = useState(initialData.full_name ?? '')
  const [phone, setPhone] = useState(initialData.phone ?? '')
  const [whatsapp, setWhatsapp] = useState(initialData.whatsapp ?? '')
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatar_url ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = useCallback(() => {
    if (!initialData.email) return
    if (navigator.clipboard) {
      navigator.clipboard.writeText(initialData.email).catch(() => fallbackCopy(initialData.email!))
    } else {
      fallbackCopy(initialData.email)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [initialData.email])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const result = await updateUserProfile(userId, {
      full_name: fullName,
      phone: phone || undefined,
      whatsapp: whatsapp || undefined,
      avatar_url: avatarUrl || undefined,
    })

    setSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Perfil actualizado correctamente.
        </div>
      )}

      {initialData.email != null && (
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Correo electrónico
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={initialData.email}
              disabled
              className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm
                text-muted-foreground cursor-not-allowed opacity-80"
            />
            <button
              type="button"
              onClick={handleCopyEmail}
              title="Copiar correo"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background
                px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground
                transition-colors shrink-0"
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            El correo no puede modificarse desde aquí.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="full-name" className="block text-sm font-medium mb-1.5">
          Nombre completo
        </label>
        <input
          id="full-name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={readOnly || saving}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
            placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30
            disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
          Teléfono
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={readOnly || saving}
          placeholder="+52 55 1234 5678"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
            placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30
            disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="whatsapp" className="block text-sm font-medium mb-1.5">
          WhatsApp
        </label>
        <input
          id="whatsapp"
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          disabled={readOnly || saving}
          placeholder="+521234567890"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
            placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30
            disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Formato E.164 con código de país (ej: +521234567890). Este número se usa para comunicación con la IA.
        </p>
      </div>

      <div>
        <label htmlFor="avatar-url" className="block text-sm font-medium mb-1.5">
          URL de foto de perfil
        </label>
        <input
          id="avatar-url"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          disabled={readOnly || saving}
          placeholder="https://..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
            placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30
            disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      {!readOnly && (
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md bg-brand-blue text-white
            px-4 py-2 text-sm font-medium hover:bg-brand-blue/90 disabled:opacity-60
            disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      )}
    </form>
  )
}
