import { requirePermission } from '@/lib/permissions'
import { getTasks } from './task-actions'
import { TasksClient } from './tasks-client'
import { CalendarClock } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Tareas Programadas — Guadiana' }

export default async function TareasPage() {
  await requirePermission('ia.view')

  const { data: tasks = [] } = await getTasks()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tareas Programadas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            La IA ejecuta estas tareas automáticamente y envía los resultados por email.
          </p>
        </div>
        <Link
          href="/ia/chat"
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-muted transition-colors"
        >
          <CalendarClock className="h-4 w-4" />
          Programar nueva tarea en el chat
        </Link>
      </div>

      <TasksClient initialTasks={tasks} />
    </div>
  )
}
