import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requirePermission, checkPermission, checkIsRoot } from '@/lib/permissions'
import { getCourse, getMyCourseProgress, updateCourse } from '../course-actions'
import { getLmsContents, getPublishedSurveys } from '../lms-actions'
import { TopicEditor } from '@/components/lms/topic-editor'
import {
  CheckCircle2,
  Circle,
  Loader2,
  Play,
  FileText,
  AlignLeft,
  ClipboardList,
  BookOpen,
} from 'lucide-react'
import type { LmsCourseTopic } from '../course-actions'

interface CoursePageProps {
  params: Promise<{ courseId: string }>
}

const topicIcon = (topic: LmsCourseTopic) => {
  if (topic.topic_type === 'survey') return ClipboardList
  const ct = topic.lms_content?.content_type
  if (ct === 'video') return Play
  if (ct === 'pdf')   return FileText
  if (ct === 'text')  return AlignLeft
  if (ct === 'quiz')  return ClipboardList
  return BookOpen
}

export default async function CoursePage({ params }: CoursePageProps) {
  await requirePermission('capacitacion.view')

  const { courseId } = await params

  const [canManage, canEdit, canDelete, isRoot] = await Promise.all([
    checkPermission('capacitacion.manage'),
    checkPermission('capacitacion.edit'),
    checkPermission('capacitacion.delete'),
    checkIsRoot(),
  ])

  const userCanManage = canManage || isRoot
  const userCanEdit   = userCanManage || canEdit

  const [courseResult, progressResult] = await Promise.all([
    getCourse(courseId),
    getMyCourseProgress(courseId),
  ])

  if (!courseResult.success || !courseResult.data) notFound()

  const course = courseResult.data
  if (!course.is_published && !userCanManage) notFound()

  const myProgress = progressResult.success ? (progressResult.data ?? []) : []
  const progressMap = new Map(myProgress.map(p => [p.topic_id, p]))

  const topics = course.topics
  const totalTopics = topics.length
  const completedTopics = myProgress.filter(p => p.completed_at !== null).length
  const progressPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  // Datos para el editor de temas (solo manage)
  const [contentsResult, surveysResult] = userCanManage
    ? await Promise.all([getLmsContents(false), getPublishedSurveys()])
    : [{ success: true, data: [] }, { success: true, data: [] }]

  const allContents = contentsResult.success ? (contentsResult.data ?? []) : []
  const publishedSurveys = surveysResult.success ? (surveysResult.data ?? []) : []

  const typeLabels: Record<string, string> = {
    pdf: 'PDF', video: 'Video', text: 'Texto', quiz: 'Evaluación rápida', survey: 'Evaluación',
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/capacitacion" className="hover:text-foreground transition-colors">
          Capacitación
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{course.title}</span>
      </nav>

      {/* Header del curso */}
      <div className="space-y-4">
        {course.cover_url && (
          <div className="h-48 w-full overflow-hidden rounded-lg">
            <img src={course.cover_url} alt={course.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            {course.category && (
              <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-medium">
                {course.category}
              </span>
            )}
            <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
            {course.description && (
              <p className="text-sm text-muted-foreground">{course.description}</p>
            )}
          </div>

          {/* Botón publicar/despublicar (manage) */}
          {userCanEdit && (
            <form action={async () => {
              'use server'
              await updateCourse(courseId, { is_published: !course.is_published })
            }}>
              <button
                type="submit"
                className={`rounded-md border text-xs font-medium px-3 py-1.5 transition-colors ${
                  course.is_published
                    ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                    : 'border-green-300 text-green-700 hover:bg-green-50'
                }`}
              >
                {course.is_published ? 'Despublicar' : 'Publicar curso'}
              </button>
            </form>
          )}
        </div>

        {/* Barra de progreso global */}
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Tu progreso</span>
            <span className="text-muted-foreground">{completedTopics} / {totalTopics} temas completados</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Temario */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Temario</h2>

        {topics.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">Este curso no tiene temas aún.</p>
          </div>
        ) : (
          <ol className="space-y-2">
            {topics.map((topic, index) => {
              const prog = progressMap.get(topic.id)
              const isCompleted = Boolean(prog?.completed_at)
              const inProgress  = prog && !isCompleted
              const Icon = topicIcon(topic)

              const typeLabel = topic.topic_type === 'survey'
                ? 'Evaluación'
                : typeLabels[topic.lms_content?.content_type ?? ''] ?? 'Contenido'

              return (
                <li key={topic.id}>
                  <Link
                    href={`/capacitacion/${courseId}/${topic.id}`}
                    className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 hover:bg-muted/40 transition-colors group"
                  >
                    {/* Estado */}
                    <div className="shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : inProgress ? (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/50" />
                      )}
                    </div>

                    {/* Número */}
                    <span className="text-xs font-bold text-muted-foreground w-5 shrink-0 text-center">
                      {index + 1}
                    </span>

                    {/* Ícono tipo */}
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors truncate block">
                        {topic.title}
                      </span>
                      {topic.description && (
                        <span className="text-xs text-muted-foreground truncate block">{topic.description}</span>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {typeLabel}
                      </span>
                      {!topic.is_required && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-700 px-2 py-0.5 text-[10px] font-medium">
                          Opcional
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      {/* Editor de temario (solo manage) */}
      {userCanManage && (
        <section className="rounded-lg border bg-card p-6 space-y-4">
          <TopicEditor
            courseId={courseId}
            initialTopics={topics}
            allContents={allContents.map(c => ({ id: c.id, title: c.title, content_type: c.content_type }))}
            publishedSurveys={publishedSurveys}
          />
        </section>
      )}
    </div>
  )
}

export async function generateMetadata({ params }: CoursePageProps) {
  const { courseId } = await params
  const result = await getCourse(courseId)
  const title = result.data?.title ?? 'Curso'
  return { title: `${title} — Capacitación` }
}
