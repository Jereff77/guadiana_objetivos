import { requirePermission } from '@/lib/permissions'
import { LmsChatPanel } from './lms-chat-panel'

export const metadata = { title: 'Asistente de Capacitación — Guadiana' }

export default async function LmsChatPage() {
  await requirePermission('capacitacion.view')

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Asistente de Capacitación</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Haz preguntas sobre los contenidos de capacitación y obtén respuestas personalizadas.
        </p>
      </div>

      <LmsChatPanel />
    </div>
  )
}
