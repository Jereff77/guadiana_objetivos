'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
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
} from 'lucide-react'
import { logout } from '@/app/(auth)/login/actions'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  permissions?: string[]
  isRoot?: boolean
}

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  permission?: string
}

export function AppSidebar({ permissions = [], isRoot = false }: AppSidebarProps) {
  const pathname = usePathname()

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
    { title: 'Dashboard',   href: '/dashboard',      icon: LayoutDashboard },
    { title: 'Formularios', href: '/formularios',    icon: FileText },
    { title: 'Asignaciones',href: '/asignaciones',   icon: ClipboardList },
    { title: 'Resultados',  href: '/resultados',     icon: BarChart3 },
  ]

  const desarrolloItems: NavItem[] = [
    { title: 'Mentoring',    href: '/mentoring',    icon: Users2,    permission: 'mentoring.view' },
    { title: 'Capacitación', href: '/capacitacion', icon: BookOpen,  permission: 'capacitacion.view' },
  ]

  const iaItems: NavItem[] = [
    { title: 'Análisis IA', href: '/ia-verificacion', icon: BrainCircuit, permission: 'ia.view' },
  ]

  const configItems: NavItem[] = [
    { title: 'Usuarios', href: '/usuarios', icon: Users,       permission: 'users.view' },
    { title: 'Roles',    href: '/roles',    icon: ShieldCheck, permission: 'roles.view' },
  ]

  const visibleObjetivos   = objetivosItems.filter(i => has(i.permission))
  const visibleDesarrollo  = desarrolloItems.filter(i => has(i.permission))
  const visibleIa          = iaItems.filter(i => has(i.permission))
  const visibleConfig      = configItems.filter(i => has(i.permission))

  return (
    <aside className="flex flex-col h-screen w-56 shrink-0 border-r bg-sidebar text-sidebar-foreground">

      {/* Logo */}
      <div className="border-b border-sidebar-border px-3 py-3 shrink-0">
        <Link href="/inicio" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white font-bold text-sm"
            style={{ backgroundColor: '#004B8D' }}
          >
            G
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold leading-tight truncate">Guadiana</span>
            <span className="text-xs text-muted-foreground leading-tight truncate">Plataforma</span>
          </div>
        </Link>
      </div>

      {/* Nav — ocupa todo el espacio disponible con scroll */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-4">

        {/* Objetivos */}
        {visibleObjetivos.length > 0 && (
          <NavGroup label="Objetivos" items={visibleObjetivos} isActive={isActive} />
        )}

        {/* Procesos (siempre visible) */}
        <NavGroup label="Procesos" items={procesosItems} isActive={isActive} />

        {/* Desarrollo Humano */}
        {visibleDesarrollo.length > 0 && (
          <NavGroup label="Desarrollo Humano" items={visibleDesarrollo} isActive={isActive} />
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

      {/* Cerrar sesión — pegado al fondo */}
      <div className="shrink-0 border-t border-sidebar-border px-2 py-2">
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
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.title}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
