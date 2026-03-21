import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex flex-col">
        <h1 className="text-sm font-semibold leading-tight">{title}</h1>
        {description && (
          <p className="text-xs text-muted-foreground leading-tight">{description}</p>
        )}
      </div>
    </header>
  )
}
