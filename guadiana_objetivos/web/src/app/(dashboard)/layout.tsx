import type { ReactNode } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { getUserPermissions, checkIsRoot } from '@/lib/permissions'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [permissions, isRoot] = await Promise.all([
    getUserPermissions(),
    checkIsRoot(),
  ])

  return (
    <SidebarProvider>
      <AppSidebar permissions={permissions} isRoot={isRoot} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
