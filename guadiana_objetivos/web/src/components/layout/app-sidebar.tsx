'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  BarChart3,
  LogOut,
  FolderOpen,
  ChevronDown,
  Users,
  ShieldCheck,
  Target,
  TrendingUp,
  DollarSign,
  BrainCircuit,
  Users2,
} from 'lucide-react'
import { logout } from '@/app/(auth)/login/actions'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

const checklistItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Formularios', href: '/formularios', icon: FileText },
  { title: 'Asignaciones', href: '/asignaciones', icon: ClipboardList },
  { title: 'Resultados', href: '/resultados', icon: BarChart3 },
]

const adminItems = [
  { title: 'Usuarios', href: '/usuarios', icon: Users, permission: 'users.view' },
  { title: 'Roles', href: '/roles', icon: ShieldCheck, permission: 'roles.view' },
]

interface AppSidebarProps {
  permissions?: string[]
  isRoot?: boolean
}

export function AppSidebar({ permissions = [], isRoot = false }: AppSidebarProps) {
  const pathname = usePathname()

  const hasPermission = (key: string) => isRoot || permissions.includes(key)

  // Sección Procesos (Checklists)
  const isProcessActive = checklistItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  )
  const [isProcessOpen, setIsProcessOpen] = useState(false)
  const processTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sección Administración
  const adminVisible = adminItems.filter((item) => hasPermission(item.permission))
  const isAdminActive = adminItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  )
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const adminTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIsProcessOpen(isProcessActive)
    setIsAdminOpen(isAdminActive)
  }, [pathname, isProcessActive, isAdminActive])

  // Handlers Procesos
  const onProcessEnter = () => {
    if (processTimerRef.current) clearTimeout(processTimerRef.current)
    setIsProcessOpen(true)
  }
  const onProcessLeave = () => {
    processTimerRef.current = setTimeout(() => {
      if (!isProcessActive) setIsProcessOpen(false)
    }, 150)
  }

  // Handlers Admin
  const onAdminEnter = () => {
    if (adminTimerRef.current) clearTimeout(adminTimerRef.current)
    setIsAdminOpen(true)
  }
  const onAdminLeave = () => {
    adminTimerRef.current = setTimeout(() => {
      if (!isAdminActive) setIsAdminOpen(false)
    }, 150)
  }

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="border-b border-sidebar-border px-2 py-3">
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
      </SidebarHeader>

      <SidebarContent>
        {/* ── Sección: Administración ── */}
        {adminVisible.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem
                  onMouseEnter={onAdminEnter}
                  onMouseLeave={onAdminLeave}
                >
                  <Collapsible open={isAdminOpen} onOpenChange={setIsAdminOpen}>
                    <SidebarMenuButton isActive={isAdminActive && !isAdminOpen} className="w-full">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Administración</span>
                      <ChevronDown
                        className={cn(
                          'ml-auto h-4 w-4 shrink-0 transition-transform duration-200',
                          isAdminOpen && 'rotate-180'
                        )}
                      />
                    </SidebarMenuButton>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {adminVisible.map((item) => {
                          const active = pathname === item.href || pathname.startsWith(item.href + '/')
                          return (
                            <SidebarMenuSubItem key={item.href}>
                              <SidebarMenuSubButton asChild isActive={active}>
                                <Link
                                  href={item.href}
                                  className={cn('flex items-center gap-2', active && 'font-medium')}
                                >
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* ── Sección: Objetivos (M1 + M2 + M3) ── */}
        {(hasPermission('objetivos.view') || hasPermission('dashboard.view') || hasPermission('incentivos.view')) && (
          <SidebarGroup>
            <SidebarGroupLabel>Objetivos</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {hasPermission('dashboard.view') && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === '/dashboard' || pathname.startsWith('/dashboard/')}
                    >
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {hasPermission('objetivos.view') && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === '/objetivos' || pathname.startsWith('/objetivos/')}
                    >
                      <Link href="/objetivos" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>Objetivos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {hasPermission('incentivos.view') && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === '/incentivos' || pathname.startsWith('/incentivos/')}
                    >
                      <Link href="/incentivos" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Incentivos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* ── Sección: Procesos (Checklists M5) ── */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem
              onMouseEnter={onProcessEnter}
              onMouseLeave={onProcessLeave}
            >
              <Collapsible open={isProcessOpen} onOpenChange={setIsProcessOpen}>
                <SidebarMenuButton isActive={isProcessActive && !isProcessOpen} className="w-full">
                  <FolderOpen className="h-4 w-4" />
                  <span>Procesos</span>
                  <ChevronDown
                    className={cn(
                      'ml-auto h-4 w-4 shrink-0 transition-transform duration-200',
                      isProcessOpen && 'rotate-180'
                    )}
                  />
                </SidebarMenuButton>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {checklistItems.map((item) => {
                      const active =
                        pathname === item.href || pathname.startsWith(item.href + '/')
                      return (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton asChild isActive={active}>
                            <Link
                              href={item.href}
                              className={cn('flex items-center gap-2', active && 'font-medium')}
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* ── Sección: Mentoring (M6) ── */}
        {hasPermission('mentoring.view') && (
          <SidebarGroup>
            <SidebarGroupLabel>Desarrollo Humano</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/mentoring' || pathname.startsWith('/mentoring/')}
                  >
                    <Link href="/mentoring" className="flex items-center gap-2">
                      <Users2 className="h-4 w-4" />
                      <span>Mentoring</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* ── Sección: IA y Verificación (M4) ── */}
        {(hasPermission('ia.view') || hasPermission('ia.configure')) && (
          <SidebarGroup>
            <SidebarGroupLabel>IA</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/ia-verificacion' || pathname.startsWith('/ia-verificacion/')}
                  >
                    <Link href="/ia-verificacion" className="flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4" />
                      <span>Análisis IA</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-2 py-2">
        <form action={logout}>
          <SidebarMenuButton
            type="submit"
            className="w-full text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </SidebarMenuButton>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
