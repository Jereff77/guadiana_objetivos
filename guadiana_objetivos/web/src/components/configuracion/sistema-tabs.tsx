'use client'

import { useState, useRef } from 'react'
import { Eye, EyeOff, Upload } from 'lucide-react'
import { saveSystemConfig, uploadLogo } from '@/app/(dashboard)/configuracion/sistema/sistema-actions'

interface SistemaTabsProps {
  config: Record<string, string | null>
}

type Tab = 'empresa' | 'branding' | 'smtp'

const TAB_LABELS: Record<Tab, string> = {
  empresa:  'Empresa',
  branding: 'Branding',
  smtp:     'Email SMTP',
}

// ── Input genérico ─────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ' +
  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30 ' +
  'disabled:opacity-60 disabled:cursor-not-allowed'

const saveBtnCls =
  'inline-flex items-center justify-center rounded-md bg-brand-blue text-white ' +
  'px-4 py-2 text-sm font-medium hover:bg-brand-blue/90 disabled:opacity-60 ' +
  'disabled:cursor-not-allowed transition-colors'

// ── Pestaña Empresa ────────────────────────────────────────────────────────

function TabEmpresa({ config }: { config: Record<string, string | null> }) {
  const [nombre,    setNombre]    = useState(config['empresa_nombre']    ?? '')
  const [slogan,    setSlogan]    = useState(config['empresa_slogan']    ?? '')
  const [telefono,  setTelefono]  = useState(config['empresa_telefono']  ?? '')
  const [email,     setEmail]     = useState(config['empresa_email']     ?? '')
  const [direccion, setDireccion] = useState(config['empresa_direccion'] ?? '')
  const [saving, setSaving]  = useState(false)
  const [error,  setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSave() {
    setError(null)
    setSuccess(false)
    if (!nombre.trim()) { setError('El nombre de la empresa es obligatorio'); return }
    setSaving(true)
    const res = await saveSystemConfig({
      empresa_nombre:    nombre.trim(),
      empresa_slogan:    slogan.trim()    || null,
      empresa_telefono:  telefono.trim()  || null,
      empresa_email:     email.trim()     || null,
      empresa_direccion: direccion.trim() || null,
    })
    setSaving(false)
    if (res.error) { setError(res.error) } else { setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
  }

  return (
    <div className="space-y-4">
      {error   && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">Datos de empresa guardados correctamente.</Alert>}

      <Field label="Nombre de la empresa *">
        <input className={inputCls} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Guadiana" disabled={saving} />
      </Field>
      <Field label="Slogan">
        <input className={inputCls} value={slogan} onChange={e => setSlogan(e.target.value)} placeholder="Ej: Líderes en calidad" disabled={saving} />
      </Field>
      <Field label="Teléfono de contacto">
        <input className={inputCls} value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+52 123 456 7890" disabled={saving} />
      </Field>
      <Field label="Email de contacto">
        <input type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} placeholder="contacto@empresa.com" disabled={saving} />
      </Field>
      <Field label="Dirección">
        <textarea
          className={inputCls + ' resize-none'}
          rows={3}
          value={direccion}
          onChange={e => setDireccion(e.target.value)}
          placeholder="Calle, ciudad, estado, CP"
          disabled={saving}
        />
      </Field>

      <button onClick={handleSave} disabled={saving} className={saveBtnCls}>
        {saving ? 'Guardando…' : 'Guardar empresa'}
      </button>
    </div>
  )
}

// ── Pestaña Branding ───────────────────────────────────────────────────────

function TabBranding({ config }: { config: Record<string, string | null> }) {
  const [logoUrl,  setLogoUrl]  = useState(config['branding_logo_url']  ?? null)
  const [colorHex, setColorHex] = useState(config['branding_color_hex'] ?? '#004B8D')
  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [success,   setSuccess]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await uploadLogo(fd)
    setUploading(false)
    if (res.error) { setError(res.error) } else if (res.url) { setLogoUrl(res.url); setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
  }

  async function handleSaveColor() {
    setError(null)
    setSaving(true)
    const res = await saveSystemConfig({ branding_color_hex: colorHex })
    setSaving(false)
    if (res.error) { setError(res.error) } else { setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
  }

  return (
    <div className="space-y-6">
      {error   && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">Branding actualizado correctamente.</Alert>}

      {/* Logo */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Logo de la empresa</p>
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-16 w-auto object-contain rounded border border-border p-1 bg-white" />
          ) : (
            <div className="h-16 w-16 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground text-xs text-center px-1">
              Sin logo
            </div>
          )}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent transition-colors disabled:opacity-60"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploading ? 'Subiendo…' : 'Subir logo'}
            </button>
            <p className="text-[11px] text-muted-foreground">PNG, JPG o SVG. Máx 2 MB.</p>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={handleLogoChange}
        />
      </div>

      {/* Color primario */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Color primario</p>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={colorHex}
            onChange={e => setColorHex(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded border border-input p-0.5"
            disabled={saving}
          />
          <input
            className={inputCls + ' w-32'}
            value={colorHex}
            onChange={e => setColorHex(e.target.value)}
            placeholder="#004B8D"
            pattern="^#[0-9A-Fa-f]{6}$"
            disabled={saving}
          />
          <button onClick={handleSaveColor} disabled={saving} className={saveBtnCls}>
            {saving ? 'Guardando…' : 'Guardar color'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Pestaña SMTP ───────────────────────────────────────────────────────────

function TabSmtp({ config }: { config: Record<string, string | null> }) {
  const [host,      setHost]      = useState(config['smtp_host']       ?? '')
  const [port,      setPort]      = useState(config['smtp_port']       ?? '587')
  const [user,      setUser]      = useState(config['smtp_user']       ?? '')
  const [password,  setPassword]  = useState(config['smtp_password']   ?? '')
  const [fromName,  setFromName]  = useState(config['smtp_from_name']  ?? '')
  const [fromEmail, setFromEmail] = useState(config['smtp_from_email'] ?? '')
  const [secure,    setSecure]    = useState(config['smtp_secure'] === 'true')
  const [showPass,  setShowPass]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [success,   setSuccess]   = useState(false)

  async function handleSave() {
    setError(null)
    setSuccess(false)
    setSaving(true)
    const res = await saveSystemConfig({
      smtp_host:       host.trim()      || null,
      smtp_port:       port.trim()      || '587',
      smtp_user:       user.trim()      || null,
      smtp_password:   password         || null,
      smtp_from_name:  fromName.trim()  || null,
      smtp_from_email: fromEmail.trim() || null,
      smtp_secure:     secure ? 'true' : 'false',
    })
    setSaving(false)
    if (res.error) { setError(res.error) } else { setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
  }

  return (
    <div className="space-y-4">
      {error   && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">Configuración SMTP guardada correctamente.</Alert>}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Servidor SMTP">
          <input className={inputCls} value={host} onChange={e => setHost(e.target.value)} placeholder="smtp.gmail.com" disabled={saving} />
        </Field>
        <Field label="Puerto">
          <input type="number" className={inputCls} value={port} onChange={e => setPort(e.target.value)} placeholder="587" disabled={saving} />
        </Field>
      </div>

      <Field label="Usuario">
        <input className={inputCls} value={user} onChange={e => setUser(e.target.value)} placeholder="usuario@empresa.com" disabled={saving} />
      </Field>

      <Field label="Contraseña">
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            className={inputCls + ' pr-10'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña de la cuenta SMTP"
            disabled={saving}
          />
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre del remitente">
          <input className={inputCls} value={fromName} onChange={e => setFromName(e.target.value)} placeholder="Guadiana" disabled={saving} />
        </Field>
        <Field label="Email del remitente">
          <input type="email" className={inputCls} value={fromEmail} onChange={e => setFromEmail(e.target.value)} placeholder="noreply@empresa.com" disabled={saving} />
        </Field>
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={secure}
          onChange={e => setSecure(e.target.checked)}
          disabled={saving}
          className="h-4 w-4 rounded border border-input accent-brand-blue"
        />
        <span className="text-sm">Conexión segura (TLS/SSL)</span>
      </label>

      <button onClick={handleSave} disabled={saving} className={saveBtnCls}>
        {saving ? 'Guardando…' : 'Guardar SMTP'}
      </button>
    </div>
  )
}

// ── Alert helper ───────────────────────────────────────────────────────────

function Alert({ type, children }: { type: 'error' | 'success'; children: React.ReactNode }) {
  const cls = type === 'error'
    ? 'rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700'
    : 'rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700'
  return <div className={cls}>{children}</div>
}

// ── Componente principal ───────────────────────────────────────────────────

export function SistemaTabs({ config }: SistemaTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('empresa')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-border mb-6">
        {(Object.keys(TAB_LABELS) as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'empresa'  && <TabEmpresa  config={config} />}
      {activeTab === 'branding' && <TabBranding config={config} />}
      {activeTab === 'smtp'     && <TabSmtp     config={config} />}
    </div>
  )
}
