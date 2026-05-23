import { requirePermission } from '@/lib/permissions'
import { getSessionDetail } from '../inventarios-actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'

interface PageProps {
  params: Promise<{ sessionId: string }>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function DiffBadge({ diff }: { diff: number }) {
  if (diff === 0) return <span className="text-muted-foreground">0</span>
  if (diff > 0) return <span className="font-medium text-green-600 dark:text-green-400">+{diff}</span>
  return <span className="font-medium text-red-600 dark:text-red-400">{diff}</span>
}

export default async function SessionDetailPage({ params }: PageProps) {
  await requirePermission('inventarios.view')

  const { sessionId } = await params
  const result = await getSessionDetail(sessionId)

  if (!result.success || !result.data) notFound()

  const { session, counts } = result.data

  const totalContado = counts.reduce((a, c) => a + c.quantity, 0)
  const totalSistema = counts.reduce((a, c) => a + c.system_stock, 0)
  const diferenciaNeta = totalContado - totalSistema

  return (
    <div className="space-y-6">
      {/* Navegación */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/inventarios" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Inventarios
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{session.name}</span>
      </div>

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{session.name}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <span>Almacén: <strong className="text-foreground">{session.warehouse_id}</strong></span>
            <span>·</span>
            <span>
              Estado:{' '}
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                session.status === 'closed'
                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              }`}>
                {session.status === 'closed' ? 'Cerrado' : 'Activo'}
              </span>
            </span>
            <span>·</span>
            <span>Creado: {formatDate(session.created_at)}</span>
            {session.creator_name && (
              <>
                <span>·</span>
                <span>Por: {session.creator_name}</span>
              </>
            )}
          </div>
        </div>

        {/* Botón imprimir */}
        <Link
          href={`/inventarios/${sessionId}/print`}
          target="_blank"
          className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted transition-colors"
        >
          <Printer className="h-4 w-4" />
          Imprimir / PDF
        </Link>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Productos contados</p>
          <p className="text-2xl font-bold mt-1">{counts.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total contado</p>
          <p className="text-2xl font-bold mt-1">{totalContado.toLocaleString('es-MX')}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total en sistema</p>
          <p className="text-2xl font-bold mt-1">{totalSistema.toLocaleString('es-MX')}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Diferencia neta</p>
          <p className={`text-2xl font-bold mt-1 ${
            diferenciaNeta === 0 ? '' : diferenciaNeta > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {diferenciaNeta > 0 ? '+' : ''}{diferenciaNeta.toLocaleString('es-MX')}
          </p>
        </div>
      </div>

      {/* Tabla de conteos */}
      {counts.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">Esta sesión no tiene conteos registrados.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Código</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Producto</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoría</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Sistema</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Conteo</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Diferencia</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Notas</th>
              </tr>
            </thead>
            <tbody>
              {counts.map((c, i) => (
                <tr key={c.product_id} className={`border-b last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{c.codigo}</td>
                  <td className="px-4 py-2.5 font-medium max-w-[260px] truncate">{c.producto ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.categoria ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{c.system_stock}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">{c.quantity}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    <DiffBadge diff={c.difference} />
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs max-w-[200px] truncate">{c.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
