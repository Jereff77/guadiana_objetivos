'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FileText,
  ClipboardList,
  BarChart3,
  LogOut,
  Users,
  ShieldCheck,
  Target,
  TrendingUp,
  DollarSign,
  BrainCircuit,
  Users2,
  BookOpen,
  Settings2,
  MessageSquare,
  CalendarClock,
  ScrollText,
  Wrench,
  BookMarked,
  Shield,
} from 'lucide-react'
import { logout } from '@/app/(auth)/login/actions'
import { cn } from '@/lib/utils'
import { useChatNotifications } from '@/components/chat/chat-notification-provider'

interface AppSidebarProps {
  permissions?: string[]
  isRoot?: boolean
  user?: { full_name: string | null; avatar_url: string | null; email: string | null } | null
  companyName?: string
  logoUrl?: string | null
}

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  permission?: string
  badge?: number
}

export function AppSidebar({ permissions = [], isRoot = false, user, companyName, logoUrl }: AppSidebarProps) {
  const pathname = usePathname()
  const { totalUnread } = useChatNotifications()

  const has = (key?: string) => {
    if (isRoot) return true
    if (!key) return true
    return permissions.includes(key)
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  // ── Grupos de navegación ──────────────────────────────────────────────────

  const objetivosItems: NavItem[] = [
    { title: 'Dashboard',   href: '/dashboard',   icon: TrendingUp, permission: 'dashboard.view' },
    { title: 'Objetivos',   href: '/objetivos',   icon: Target,     permission: 'objetivos.view' },
    { title: 'Incentivos',  href: '/incentivos',  icon: DollarSign, permission: 'incentivos.view' },
  ]

  const procesosItems: NavItem[] = [
    { title: 'Formularios',  href: '/formularios',  icon: FileText,        permission: 'formularios.view' },
    { title: 'Asignaciones', href: '/asignaciones', icon: ClipboardList,   permission: 'asignaciones.view' },
    { title: 'Resultados',   href: '/resultados',   icon: BarChart3,       permission: 'resultados.view' },
  ]

  const desarrolloItems: NavItem[] = [
    { title: 'Mentoring',    href: '/mentoring',    icon: Users2,    permission: 'mentoring.view' },
    { title: 'Capacitación', href: '/capacitacion', icon: BookOpen,  permission: 'capacitacion.view' },
  ]

  const comunicacionItems: NavItem[] = [
    { title: 'Chat', href: '/chat', icon: MessageSquare, permission: 'chat.view', badge: totalUnread || undefined },
  ]

  const iaItems: NavItem[] = [
    { title: 'Análisis IA',   href: '/ia-verificacion', icon: BrainCircuit,  permission: 'ia.view' },
    { title: 'Tareas',        href: '/ia/tareas',        icon: CalendarClock, permission: 'ia.view' },
    { title: 'Habilidades',   href: '/ia/habilidades',   icon: BookMarked,    permission: 'ia.configure' },
    { title: 'Herramientas',  href: '/ia/herramientas',  icon: Wrench,        permission: 'ia.configure' },
    { title: 'Políticas',     href: '/ia/politicas',     icon: Shield,        permission: 'ia.configure' },
    { title: 'Auditoría',     href: '/ia/auditoria',     icon: ScrollText,    permission: 'ia.configure' },
  ]

  const configItems: NavItem[] = [
    { title: 'Usuarios', href: '/usuarios',              icon: Users,       permission: 'users.view' },
    { title: 'Roles',    href: '/roles',                 icon: ShieldCheck, permission: 'roles.view' },
    { title: 'Sistema',  href: '/configuracion/sistema', icon: Settings2,   permission: 'config.edit' },
  ]

  const visibleObjetivos     = objetivosItems.filter(i => has(i.permission))
  const visibleProcesos      = procesosItems.filter(i => has(i.permission))
  const visibleDesarrollo    = desarrolloItems.filter(i => has(i.permission))
  const visibleComunicacion  = comunicacionItems.filter(i => has(i.permission))
  const visibleIa            = iaItems.filter(i => has(i.permission))
  const visibleConfig        = configItems.filter(i => has(i.permission))

  return (
    <aside className="flex flex-col h-screen w-56 shrink-0 border-r bg-sidebar text-sidebar-foreground">

      {/* Logo */}
      <div className="border-b border-sidebar-border px-3 py-4 shrink-0">
        <Link href="/inicio" className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName ?? 'Logo'}
              className="h-12 w-auto max-w-full object-contain"
            />
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold text-xl"
              style={{ backgroundColor: '#004B8D' }}
            >
              {(companyName ?? 'G').charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-semibold leading-tight truncate text-center w-full">
            {companyName ?? 'Guadiana'}
          </span>
        </Link>
      </div>

      {/* Nav — ocupa todo el espacio disponible con scroll */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-4">

        {/* Objetivos */}
        {visibleObjetivos.length > 0 && (
          <NavGroup label="Objetivos" items={visibleObjetivos} isActive={isActive} />
        )}

        {/* Procesos */}
        {visibleProcesos.length > 0 && (
          <NavGroup label="Procesos" items={visibleProcesos} isActive={isActive} />
        )}

        {/* Desarrollo Humano */}
        {visibleDesarrollo.length > 0 && (
          <NavGroup label="Desarrollo Humano" items={visibleDesarrollo} isActive={isActive} />
        )}

        {/* Comunicación */}
        {visibleComunicacion.length > 0 && (
          <NavGroup label="Comunicación" items={visibleComunicacion} isActive={isActive} />
        )}

        {/* IA */}
        {visibleIa.length > 0 && (
          <NavGroup label="IA" items={visibleIa} isActive={isActive} />
        )}

        {/* Configuración — siempre al final */}
        {visibleConfig.length > 0 && (
          <NavGroup label="Configuración" items={visibleConfig} isActive={isActive} />
        )}

      </nav>

      {/* Usuario + Cerrar sesión — pegado al fondo */}
      <div className="shrink-0 border-t border-sidebar-border px-2 py-2 space-y-1">
        {user && (
          <Link
            href="/usuarios/perfil"
            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-sidebar-accent/60 transition-colors"
          >
            <div className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#004B8D' }}>
              {(user.full_name ?? user.email ?? '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium truncate leading-tight">
                {user.full_name ?? user.email ?? 'Usuario'}
              </span>
              {user.full_name && (
                <span className="text-[10px] text-muted-foreground truncate leading-tight">{user.email}</span>
              )}
            </div>
          </Link>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </form>
      </div>
    </aside>
  )
}

// ── Componente interno NavGroup ───────────────────────────────────────────────

function NavGroup({
  label,
  items,
  isActive,
}: {
  label: string
  items: NavItem[]
  isActive: (href: string) => boolean
}) {
  return (
    <div className="px-2">
      <p className="px-2 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'text-white font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                )}
                style={active ? { backgroundColor: '#194D95' } : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1">{item.title}</span>
                {item.badge && item.badge > 0 && (
                  <span className={cn(
                    'shrink-0 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center',
                    active ? 'bg-white text-[#194D95]' : 'bg-red-500 text-white'
                  )}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
