import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const stats = [
  { label: 'Checklists activos', value: '--', colorClass: 'text-[#004B8D]' },
  { label: 'Completados hoy', value: '--', colorClass: 'text-[#FF8F1C]' },
  { label: 'Pendientes', value: '--', colorClass: 'text-muted-foreground' },
]

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" description="Bienvenido a Guadiana Checklists" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${stat.colorClass}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">Implementación pendiente</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full mb-4 text-white text-lg font-bold"
              style={{ backgroundColor: '#004B8D' }}
            >
              G
            </div>
            <h3 className="text-lg font-semibold">Contenido en construcción</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              El dashboard completo será implementado en próximas iteraciones. Esta es la estructura base del proyecto.
            </p>
            <div className="mt-4 flex items-center gap-2 flex-wrap justify-center">
              <Badge style={{ backgroundColor: '#004B8D' }}>Next.js 15</Badge>
              <Badge style={{ backgroundColor: '#FF8F1C' }}>Supabase</Badge>
              <Badge variant="secondary">Tailwind CSS</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
