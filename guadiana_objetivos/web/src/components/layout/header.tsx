import type { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'

interface HeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function Header({ title, description, action }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold leading-tight">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground leading-tight">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  )
}
