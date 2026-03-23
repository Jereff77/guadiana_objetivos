import { requirePermission, checkPermission, checkIsRoot } from '@/lib/permissions'
import {
  getLmsContents,
  getLmsPaths,
  getMyProgress,
  getPathProgress,
} from './lms-actions'
import { ContentCard } from '@/components/lms/content-card'
import { PathProgressBar } from '@/components/lms/path-progress-bar'
import { ContentForm } from '@/components/lms/content-form'
import { ManageSection } from './manage-section'

export const metadata = { title: 'Capacitación — Guadiana' }

interface CapacitacionPageProps {
  searchParams: Promise<{ categoria?: string }>
}

export default async function CapacitacionPage({ searchParams }: CapacitacionPageProps) {
  await requirePermission('capacitacion.view')

  const { categoria } = await searchParams

  const [canManage, isRoot] = await Promise.all([
    checkPermission('capacitacion.manage'),
    checkIsRoot(),
  ])

  const userCanManage = canManage || isRoot

  const [contentsResult, pathsResult, progressResult] = await Promise.all([
    getLmsContents(userCanManage ? false : true),
    getLmsPaths(true),
    getMyProgress(),
  ])

  const allContents = contentsResult.success ? (contentsResult.data ?? []) : []
  const publishedPaths = pathsResult.success ? (pathsResult.data ?? []) : []
  const myProgress = progressResult.success ? (progressResult.data ?? []) : []

  // Construir mapa de progreso por content_id
  const progressMap = new Map(myProgress.map((p) => [p.content_id, p]))

  // Filtrar por categoría
  const filteredContents = categoria
    ? allContents.filter((c) => c.category === categoria)
    : allContents

  // Categorías únicas disponibles
  const categories = Array.from(
    new Set(allContents.map((c) => c.category).filter((c): c is string => Boolean(c))),
  ).sort()

  // Progreso de rutas
  const pathProgressList = await Promise.all(
    publishedPaths.map(async (path) => {
      const result = await getPathProgress(path.id)
      return {
        path,
        total: result.data?.total ?? 0,
        completed: result.data?.completed ?? 0,
        certified: result.data?.certified ?? false,
      }
    }),
  )

  // Contenidos publicados (para usuarios sin manage) o todos (para manage)
  const visibleContents = userCanManage
    ? filteredContents
    : filteredContents.filter((c) => c.is_published)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Capacitación</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Accede a los contenidos de formación y rutas de aprendizaje.
          </p>
        </div>
      </div>

      {/* Rutas de aprendizaje */}
      {pathProgressList.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Rutas de aprendizaje</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pathProgressList.map(({ path, total, completed, certified }) => (
              <PathProgressBar
                key={path.id}
                path={path}
                total={total}
                completed={completed}
                certified={certified}
              />
            ))}
          </div>
        </section>
      )}

      {/* Catálogo de contenidos */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-semibold">Catálogo de contenidos</h2>

          {categories.length > 0 && (
            <form method="GET" className="flex items-center gap-2">
              <label htmlFor="cat-filter" className="text-sm text-muted-foreground">
                Categoría:
              </label>
              <select
                id="cat-filter"
                name="categoria"
                defaultValue={categoria ?? ''}
                className="rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                onChange={(e) => {
                  const form = e.currentTarget.closest('form') as HTMLFormElement
                  form.submit()
                }}
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </form>
          )}
        </div>

        {visibleContents.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              {categoria
                ? `No hay contenidos publicados en la categoría "${categoria}".`
                : 'No hay contenidos publicados disponibles.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleContents.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                progress={progressMap.get(content.id)}
                canManage={userCanManage}
                onStart={() => {}}
              />
            ))}
          </div>
        )}
      </section>

      {/* Secciones de gestión (solo para manage) */}
      {userCanManage && (
        <ManageSection paths={pathsResult.success ? (pathsResult.data ?? []) : []} />
      )}

      {/* Formulario de creación (solo para manage) */}
      {userCanManage && (
        <section className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Crear nuevo contenido</h2>
          <ContentForm />
        </section>
      )}
    </div>
  )
}
