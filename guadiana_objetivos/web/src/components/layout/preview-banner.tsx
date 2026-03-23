'use client'

import { stopRolePreview } from '@/app/(dashboard)/roles/preview-actions'

interface PreviewBannerProps {
  roleName: string
}

export function PreviewBanner({ roleName }: PreviewBannerProps) {
  return (
    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between shrink-0 gap-4">
      <span className="text-sm font-medium">
        Vista previa activa: <strong>{roleName}</strong>
        {' '}— La app se muestra como si fueras este rol.
      </span>
      <form action={stopRolePreview}>
        <button
          type="submit"
          className="text-sm font-semibold underline hover:no-underline whitespace-nowrap"
        >
          Salir de vista previa
        </button>
      </form>
    </div>
  )
}
