import type { ReactNode } from 'react'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { getUserPermissions, checkIsRoot } from '@/lib/permissions'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [permissions, isRoot] = await Promise.all([
    getUserPermissions(),
    checkIsRoot(),
  ])

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar permissions={permissions} isRoot={isRoot} />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  )
}
