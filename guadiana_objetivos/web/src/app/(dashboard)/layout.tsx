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

  const supabaseUser = await createClient()
  const { data: { user } } = await supabaseUser.auth.getUser()

  let userProfile: { full_name: string | null; avatar_url: string | null; email: string | null } | null = null
  if (user) {
    const { data: profile } = await supabaseUser
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()
    userProfile = {
      full_name: profile?.full_name ?? null,
      avatar_url: profile?.avatar_url ?? null,
      email: user.email ?? null,
    }
  }

  const [permissions, isRoot] = await Promise.all([
    getUserPermissions(),
    checkIsRoot(),
  ])

  // Cargar config del sistema para el sidebar
  const { data: configRows } = await supabaseUser
    .from('system_config')
    .select('key, value')
    .in('key', ['empresa_nombre', 'branding_logo_url'])

  const configMap: Record<string, string | null> = {}
  for (const row of configRows ?? []) configMap[row.key] = row.value

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        permissions={permissions}
        isRoot={isRoot}
        user={userProfile}
        companyName={configMap['empresa_nombre'] ?? undefined}
        logoUrl={configMap['branding_logo_url'] ?? null}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {previewRoleName && <PreviewBanner roleName={previewRoleName} />}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
