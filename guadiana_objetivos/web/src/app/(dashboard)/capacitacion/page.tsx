import { requirePermission, checkPermission, checkIsRoot } from '@/lib/permissions'
import { getLmsPaths, getMyProgress } from './lms-actions'
import { getCourses, getMyCourseProgress } from './course-actions'
import { PathProgressBar } from '@/components/lms/path-progress-bar'
import { CourseCard } from '@/components/lms/course-card'
import { CourseForm } from '@/components/lms/course-form'

export const metadata = { title: 'Capacitación — Guadiana' }

export default async function CapacitacionPage() {
  await requirePermission('capacitacion.view')

  const [canManage, canEdit, canDelete, isRoot] = await Promise.all([
    checkPermission('capacitacion.manage'),
    checkPermission('capacitacion.edit'),
    checkPermission('capacitacion.delete'),
    checkIsRoot(),
  ])

  const userCanManage = canManage || isRoot
  const userCanEdit   = userCanManage || canEdit
  const userCanDelete = userCanManage || canDelete

  const [coursesResult, pathsResult] = await Promise.all([
    getCourses(userCanManage ? false : true),
    getLmsPaths(true),
  ])

  const allCourses   = coursesResult.success ? (coursesResult.data ?? []) : []
  const publishedPaths = pathsResult.success ? (pathsResult.data ?? []) : []

  // Progreso de cada curso para el usuario actual
  const courseProgressList = await Promise.all(
    allCourses.map(async (course) => {
      const result = await getMyCourseProgress(course.id)
      const progress = result.success ? (result.data ?? []) : []
      return {
        course,
        totalTopics: 0,      // se recalcula en la página de detalle; aquí usamos progreso disponible
        completedTopics: progress.filter(p => p.completed_at !== null).length,
        progressCount: progress.length,
      }
    })
  )

  // Rutas de aprendizaje (legacy — se mantienen si existen)
  const [pathProgressList, myFlatProgress] = await Promise.all([
    Promise.all(
      publishedPaths.map(async (path) => {
        const { getPathProgress } = await import('./lms-actions')
        const result = await getPathProgress(path.id)
        return {
          path,
          total: result.data?.total ?? 0,
          completed: result.data?.completed ?? 0,
          certified: result.data?.certified ?? false,
        }
      })
    ),
    (async () => {
      const { getMyProgress } = await import('./lms-actions')
      return getMyProgress()
    })(),
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Capacitación</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Accede a los cursos de formación y rutas de aprendizaje.
          </p>
        </div>
      </div>

      {/* Rutas de aprendizaje (legacy) */}
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

      {/* Catálogo de cursos */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Cursos disponibles</h2>

        {courseProgressList.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              {userCanManage
                ? 'No hay cursos creados aún. Crea el primero abajo.'
                : 'No hay cursos publicados disponibles.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courseProgressList.map(({ course, completedTopics, progressCount }) => (
              <CourseCard
                key={course.id}
                course={course}
                totalTopics={progressCount}
                completedTopics={completedTopics}
                canManage={userCanManage}
                canEdit={userCanEdit}
                canDelete={userCanDelete}
              />
            ))}
          </div>
        )}
      </section>

      {/* Crear nuevo curso (solo manage) */}
      {userCanManage && (
        <section className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Crear nuevo curso</h2>
          <CourseForm />
        </section>
      )}
    </div>
  )
}
