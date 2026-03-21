'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
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
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Formularios', href: '/formularios', icon: FileText },
  { title: 'Asignaciones', href: '/asignaciones', icon: ClipboardList },
  { title: 'Resultados', href: '/resultados', icon: BarChart3 },
]

const settingsItems = [
  { title: 'Configuraci\u00f3n', href: '/configuracion', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-2 py-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-3">
        <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:justify-center">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white font-bold text-sm"
            style={{ backgroundColor: '#004B8D' }}
          >
            G
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold leading-tight truncate">Guadiana</span>
            <span className="text-xs text-muted-foreground leading-tight truncate">Checklists</span>
          </div>
        </div>
      </SidebarHeader>
    </Sidebar>
  )
}
