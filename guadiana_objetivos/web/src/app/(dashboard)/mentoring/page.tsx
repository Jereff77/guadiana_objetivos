import { requirePermission, checkPermission, checkIsRoot } from '@/lib/permissions'
import { getMentoringPairs } from './mentoring-actions'
import { PairCard } from '@/components/mentoring/pair-card'
import { NewPairForm } from '@/components/mentoring/new-pair-form'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Mentoring — Guadiana' }

export default async function MentoringPage() {
  await requirePermission('mentoring.view')

  const [canManage, isRoot] = await Promise.all([
    checkPermission('mentoring.manage'),
    checkIsRoot(),
  ])

  const supabase = await createClient()
  const [pairsResult, { data: profiles }] = await Promise.all([
    getMentoringPairs(),
    supabase.from('profiles').select('id, full_name').eq('is_active', true).order('full_name'),
  ])

  const pairs = pairsResult.success ? (pairsResult.data ?? []) : []
  const profileList = profiles ?? []

  const activePairs = pairs.filter((p) => p.is_active)
  const inactivePairs = pairs.filter((p) => !p.is_active)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mentoring</h1>
        <p className="text-muted-foreground text-sm">
          Pares mentor-mentee y seguimiento de sesiones.
        </p>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pares activos</p>
          <p className="text-2xl font-bold mt-1">{activePairs.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total sesiones</p>
          <p className="text-2xl font-bold mt-1">
            {pairs.reduce((s, p) => s + (p.sessions_count ?? 0), 0)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Sesiones completadas</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {pairs.reduce((s, p) => s + (p.completed_sessions ?? 0), 0)}
          </p>
        </div>
      </div>

      {/* Crear nuevo par */}
      {(canManage || isRoot) && (
        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Nuevo par de mentoring</h2>
          <NewPairForm profiles={profileList} />
        </section>
      )}

      {/* Pares activos */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Pares activos
          {activePairs.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({activePairs.length})</span>
          )}
        </h2>

        {pairsResult.error && <p className="text-sm text-red-600">{pairsResult.error}</p>}

        {activePairs.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">No hay pares de mentoring activos.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activePairs.map((pair) => (
              <PairCard key={pair.id} pair={pair} canManage={canManage || isRoot} />
            ))}
          </div>
        )}
      </section>

      {/* Pares inactivos */}
      {inactivePairs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
            Pares inactivos ({inactivePairs.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inactivePairs.map((pair) => (
              <PairCard key={pair.id} pair={pair} canManage={canManage || isRoot} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
