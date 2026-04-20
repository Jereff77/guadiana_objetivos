'use client'

import dynamic from 'next/dynamic'
import { type OrgDepartment, type OrgDirection, type OrgPosition, type PlatformUser } from '@/app/(dashboard)/organigrama/organigrama-actions'

const OrganigramaCanvas = dynamic(
  () => import('./organigrama-canvas').then(m => m.OrganigramaCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        Cargando organigrama…
      </div>
    ),
  }
)

interface OrganigramaCanvasLoaderProps {
  initialDepartments: OrgDepartment[]
  initialPositions: OrgPosition[]
  initialDirection: OrgDirection | null
  platformUsers: PlatformUser[]
  canManage: boolean
}

export function OrganigramaCanvasLoader(props: OrganigramaCanvasLoaderProps) {
  return <OrganigramaCanvas {...props} />
}
