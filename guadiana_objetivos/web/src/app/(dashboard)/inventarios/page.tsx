import { requirePermission } from '@/lib/permissions'
import { getInventorySessions, getWarehouses } from './inventarios-actions'
import Link from 'next/link'
import { Package, ChevronRight } from 'lucide-react'

export const metadata = { title: 'Inventarios — Guadiana' }

interface PageProps {
  searchParams: Promise<{ warehouse?: string; status?: string }>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default async function InventariosPage({ searchParams }: PageProps) {
  await requirePermission('inventarios.view')

  const params = await searchParams
  const warehouseFilter = params.warehouse ?? ''
  const statusFilter = params.status ?? 'all'

  const [sessionsResult, warehouses] = await Promise.all([
    getInventorySessions({
      warehouse_id: warehouseFilter || undefined,
      status: statusFilter,
    }),
    getWarehouses(),
  ])

  const sessions = sessionsResult.success ? (sessionsResult.data ?? []) : []
  const canViewAll = sessionsResult.canViewAll ?? false

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventarios</h1>
          <p className="text-muted-foreground text-sm">
            {canViewAll
              ? 'Sesiones de conteo físico de todos los usuarios'
              : 'Tus sesiones de conteo físico capturadas desde la app'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <form className="flex items-end gap-3 flex-wrap">
        {canViewAll && (
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Almacén</label>
            <select
              name="warehouse"
              defaultValue={warehouseFilter}
              className="rounded-md border bg-background px-3 py-1.5 text-sm min-w-[160px]"
            >
              <option value="">Todos</option>
              {warehouses.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Estado</label>
          <select
            name="status"
            defaultValue={statusFilter}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">Todos</option>
            <option value="active">Activo</option>
            <option value="closed">Cerrado</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-secondary text-secondary-foreground px-4 py-1.5 text-sm hover:bg-secondary/80"
        >
          Filtrar
        </button>
      </form>

      {/* Error */}
      {!sessionsResult.success && (
        <p className="text-sm text-red-600">{sessionsResult.error}</p>
      )}

      {/* Lista */}
      {sessions.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No hay sesiones de inventario registradas.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Almacén</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                {canViewAll && <th className="px-4 py-3 text-left font-medium text-muted-foreground">Creado por</th>}
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Productos</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={s.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.warehouse_id}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.status === 'closed'
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {s.status === 'closed' ? 'Cerrado' : 'Activo'}
                    </span>
                  </td>
                  {canViewAll && <td className="px-4 py-3 text-muted-foreground">{s.creator_name ?? '—'}</td>}
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(s.created_at)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.item_count}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/inventarios/${s.id}`}
                      className="flex items-center gap-1 text-primary hover:underline text-xs"
                    >
                      Ver <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {sessions.length} {sessions.length === 1 ? 'sesión' : 'sesiones'} encontradas
      </p>
    </div>
  )
}
