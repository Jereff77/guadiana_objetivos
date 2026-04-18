import { requirePermission, checkPermission } from '@/lib/permissions'
import { getOrganigrama, getPlatformUsers, getPositions, getDirection } from './organigrama-actions'
import { OrganigramaCanvasLoader } from '@/components/organigrama/organigrama-canvas-loader'

export default async function OrganigramaPage() {
  await requirePermission('organigrama.view')

  const canManage = await checkPermission('organigrama.manage')

  const [departments, users, positions, direction] = await Promise.all([
    getOrganigrama(),
    getPlatformUsers(),
    getPositions(),
    getDirection(),
  ])

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-6 py-4 border-b shrink-0">
        <h1 className="text-xl font-semibold text-gray-900">Organigrama</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Estructura departamental y jerarquías de la empresa
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <OrganigramaCanvasLoader
          initialDepartments={departments}
          initialPositions={positions}
          initialDirection={direction}
          platformUsers={users}
          canManage={canManage}
        />
      </div>
    </div>
  )
}
