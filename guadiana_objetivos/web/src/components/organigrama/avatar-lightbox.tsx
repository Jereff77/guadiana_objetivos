'use client'

import { useEffect, useState, type ReactNode } from 'react'

interface AvatarLightboxProps {
  src: string
  name: string
  className?: string
  style?: React.CSSProperties
}

export function AvatarLightbox({ src, name, className = '', style }: AvatarLightboxProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <>
      <img
        src={src}
        alt={name ?? ''}
        className={`cursor-zoom-in ${className}`}
        style={style}
        onClick={() => setOpen(true)}
      />
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div className="flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
            <img
              src={src}
              alt={name ?? ''}
              className="max-w-xs max-h-xs rounded-2xl shadow-2xl object-cover"
            />
            <span className="text-sm text-white font-medium">{name}</span>
          </div>
        </div>
      )}
    </>
  )
}
