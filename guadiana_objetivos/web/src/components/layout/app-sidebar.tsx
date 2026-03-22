'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  FolderOpen,
  ChevronDown,
} from 'lucide-react'
import { logout } from '@/app/(auth)/login/actions'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

const settingsItems = [
  { title: 'Configuración', href: '/configuracion', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  const isProcessActive = checklistItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  )

  const [isOpen, setIsOpen] = useState(isProcessActive)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isProcessActive) setIsOpen(true)
  }, [isProcessActive])

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 150)
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
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <SidebarMenuButton isActive={isProcessActive && !isOpen} className="w-full">
                  <FolderOpen className="h-4 w-4" />
                  <span>Procesos</span>
                  <ChevronDown
                    className={cn(
                      'ml-auto h-4 w-4 shrink-0 transition-transform duration-200',
                      isOpen && 'rotate-180'
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

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
