import type { Metadata } from 'next'
import Link from 'next/link'
import { checkPermission, checkIsRoot } from '@/lib/permissions'
import { getActiveAlerts } from '@/app/(dashboard)/dashboard/dashboard-actions'
import { createClient } from '@/lib/supabase/server'
import {
  TrendingUp,
  Target,
  DollarSign,
  BrainCircuit,
  Users2,
  BookOpen,
  FileText,
  ClipboardList,
  BarChart3,
  Users,
  ShieldCheck,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Inicio — Guadiana' }

// ── Tipos locales ────────────────────────────────────────────────────────────

interface ModuleCard {
  title: string
  description: string
  href: string
  icon: React.ElementType
  color: string
  permission: string | null  // null = siempre visible
}

// ── Mapa de severidad → estilos ──────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, { badge: string; icon: React.ElementType }> = {
  critical: { badge: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  warning:  { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertTriangle },
  info:     { badge: 'bg-blue-100 text-blue-700 border-blue-200', icon: Info },
}

function severityStyle(severity: string) {
  return SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.info
}

// ── Componente de alerta ─────────────────────────────────────────────────────

function AlertRow({ alert }: { alert: { id: string; message: string; severity: string; type: string; created_at: string } }) {
  const { badge, icon: Icon } = severityStyle(alert.severity)
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${badge}`}>
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium leading-snug">{alert.message}</p>
        <p className="text-xs opacity-70 mt-0.5">
          {new Date(alert.created_at).toLocaleDateString('es-MX', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </p>
      </div>
    </div>
  )
}

// ── Módulos disponibles ──────────────────────────────────────────────────────

const ALL_MODULES: ModuleCard[] = [
  {
    title: 'Dashboard',
    description: 'KPIs y tendencias de cumplimiento por departamento.',
    href: '/dashboard',
    icon: TrendingUp,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    permission: 'dashboard.view',
  },
  {
    title: 'Objetivos',
    description: 'Gestión de entregables y evidencias por departamento.',
    href: '/objetivos',
    icon: Target,
    color: 'text-green-600 bg-green-50 border-green-200',
    permission: 'objetivos.view',
  },
  {
    title: 'Incentivos',
    description: 'Bonificaciones por cumplimiento de objetivos.',
    href: '/incentivos',
    icon: DollarSign,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    permission: 'incentivos.view',
  },
  {
    title: 'Mentoring',
    description: 'Pares mentor-mentee y seguimiento de sesiones.',
    href: '/mentoring',
    icon: Users2,
    color: 'text-violet-600 bg-violet-50 border-violet-200',
    permission: 'mentoring.view',
  },
  {
    title: 'Capacitación',
    description: 'Catálogo de contenidos, quizzes y rutas de aprendizaje.',
    href: '/capacitacion',
    icon: BookOpen,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    permission: 'capacitacion.view',
  },
  {
    title: 'Análisis IA',
    description: 'Verificación automatizada de evidencias con IA.',
    href: '/ia-verificacion',
    icon: BrainCircuit,
    color: 'text-pink-600 bg-pink-50 border-pink-200',
    permission: 'ia.view',
  },
  {
    title: 'Formularios',
    description: 'Diseñador de checklists y encuestas de auditoría.',
    href: '/formularios',
    icon: FileText,
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    permission: 'formularios.view',
  },
  {
    title: 'Asignaciones',
    description: 'Asignación de formularios a usuarios y sucursales.',
    href: '/asignaciones',
    icon: ClipboardList,
    color: 'text-teal-600 bg-teal-50 border-teal-200',
    permission: 'formularios.assign',
  },
  {
    title: 'Resultados',
    description: 'Respuestas y estadísticas de checklists completados.',
    href: '/resultados',
    icon: BarChart3,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    permission: 'resultados.view',
  },
  {
    title: 'Usuarios',
    description: 'Gestión de perfiles y acceso de usuarios.',
    href: '/usuarios',
    icon: Users,
    color: 'text-slate-600 bg-slate-50 border-slate-200',
    permission: 'users.view',
  },
  {
    title: 'Roles',
    description: 'Configuración de roles y permisos granulares.',
    href: '/roles',
    icon: ShieldCheck,
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    permission: 'roles.view',
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function InicioPage() {
  const isRoot = await checkIsRoot()

  // Cargar nombre y logo desde system_config
  const supabase = await createClient()
  const { data: configRows } = await supabase
    .from('system_config')
    .select('key, value')
    .in('key', ['empresa_nombre', 'empresa_slogan', 'branding_logo_url'])

  const cfg: Record<string, string | null> = {}
  for (const row of configRows ?? []) cfg[row.key] = row.value

  const companyName = cfg['empresa_nombre'] ?? 'Guadiana'
  const companySlogan = cfg['empresa_slogan'] ?? null
  const logoUrl = cfg['branding_logo_url'] ?? null

  // Verificar permisos en paralelo para todos los módulos con permiso
  const permissionKeys = [...new Set(ALL_MODULES.map((m) => m.permission).filter(Boolean))] as string[]
  const permResults = await Promise.all(
    permissionKeys.map((key) => checkPermission(key))
  )
  const permMap = Object.fromEntries(permissionKeys.map((key, i) => [key, permResults[i]]))

  const hasPermission = (key: string | null) => {
    if (isRoot) return true
    if (key === null) return true
    return permMap[key] ?? false
  }

  const visibleModules = ALL_MODULES.filter((m) => hasPermission(m.permission))

  // Alertas pendientes (solo si tiene dashboard.view)
  const canViewAlerts = hasPermission('dashboard.view')
  const alerts = canViewAlerts ? await getActiveAlerts() : []
  const unreadAlerts = alerts.filter((a) => !a.is_read)

  return (
    <div className="space-y-8">
      {/* Header con logo de empresa */}
      <div className="flex flex-col gap-2">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={companyName}
            className="h-20 w-auto object-contain"
          />
        ) : (
          <div
            className="h-20 w-20 rounded-xl flex items-center justify-center text-white text-3xl font-bold"
            style={{ backgroundColor: '#004B8D' }}
          >
            {companyName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{companyName}</h1>
          {companySlogan && (
            <p className="text-muted-foreground text-sm mt-0.5">{companySlogan}</p>
          )}
        </div>
      </div>

      {/* Alertas pendientes */}
      {unreadAlerts.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">
              Alertas pendientes
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({unreadAlerts.length})
              </span>
            </h2>
          </div>
          <div className="space-y-2 max-w-2xl">
            {unreadAlerts.slice(0, 5).map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
            {unreadAlerts.length > 5 && (
              <Link
                href="/dashboard"
                className="text-xs text-primary hover:underline block pt-1"
              >
                Ver todas las alertas en el Dashboard →
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Sin alertas */}
      {canViewAlerts && unreadAlerts.length === 0 && alerts.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-lg border bg-card px-4 py-3 max-w-md">
          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
          Sin alertas pendientes. Todo en orden.
        </div>
      )}

      {/* Módulos accesibles */}
      <section>
        <h2 className="text-base font-semibold mb-4">Acceso rápido</h2>
        {visibleModules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tienes módulos disponibles. Contacta al administrador para solicitar acceso.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleModules.map((mod) => {
              const Icon = mod.icon
              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="group rounded-xl border bg-card p-5 hover:shadow-md transition-shadow flex flex-col gap-3"
                >
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${mod.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {mod.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {mod.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

