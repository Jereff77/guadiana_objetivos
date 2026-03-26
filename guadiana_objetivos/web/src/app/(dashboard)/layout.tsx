import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { PreviewBanner } from '@/components/layout/preview-banner'
import { getUserPermissions, checkIsRoot } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const previewRoleId = cookieStore.get('guadiana_preview_role')?.value ?? null

  // Obtener nombre del rol en preview (si aplica)
  let previewRoleName: string | null = null
  if (previewRoleId) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('roles')
      .select('name')
      .eq('id', previewRoleId)
      .single()
    previewRoleName = data?.name ?? null
  }

  const [permissions, isRoot] = await Promise.all([
    getUserPermissions(),
    checkIsRoot(),
  ])

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar permissions={permissions} isRoot={isRoot} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {previewRoleName && <PreviewBanner roleName={previewRoleName} />}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
