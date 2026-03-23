import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requirePermission } from '@/lib/permissions'
import { getCourse, startTopic } from '../../course-actions'
import { getLmsContent } from '../../lms-actions'
import { getSurveyForTopic } from './survey-topic-actions'
import { SurveyTopicViewer } from './survey-topic-viewer'
import { TopicContentViewer } from './topic-content-viewer'
import { createClient } from '@/lib/supabase/server'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TopicPageProps {
  params: Promise<{ courseId: string; topicId: string }>
}

export default async function TopicPage({ params }: TopicPageProps) {
  await requirePermission('capacitacion.view')

  const { courseId, topicId } = await params

  const courseResult = await getCourse(courseId)
  if (!courseResult.success || !courseResult.data) notFound()

  const course = courseResult.data
  const topics = course.topics
  const topicIndex = topics.findIndex(t => t.id === topicId)
  if (topicIndex === -1) notFound()

  const topic      = topics[topicIndex]
  const prevTopic  = topicIndex > 0 ? topics[topicIndex - 1] : null
  const nextTopic  = topicIndex < topics.length - 1 ? topics[topicIndex + 1] : null

  // Registrar inicio del tema (server-side, ignoreDuplicates)
  await startTopic(courseId, topicId)

  // ── Tema tipo 'content' ───────────────────────────────────────────────────
  if (topic.topic_type === 'content' && topic.content_id) {
    const contentResult = await getLmsContent(topic.content_id)
    if (!contentResult.success || !contentResult.data) notFound()

    const content = contentResult.data

    // Signed URL para PDF
    let pdfSignedUrl: string | null = null
    if (content.content_type === 'pdf' && content.storage_path) {
      const supabase = await createClient()
      const { data: signed } = await supabase.storage
        .from('lms-content')
        .createSignedUrl(content.storage_path, 3600)
      pdfSignedUrl = signed?.signedUrl ?? null
    }

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <TopicNav
          courseId={courseId}
          courseTitle={course.title}
          topicTitle={topic.title}
          prevTopic={prevTopic}
          nextTopic={nextTopic}
        />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{topic.title}</h1>
          {topic.description && (
            <p className="text-sm text-muted-foreground">{topic.description}</p>
          )}
        </div>

        <TopicContentViewer
          content={content}
          pdfSignedUrl={pdfSignedUrl}
          courseId={courseId}
          topicId={topicId}
          nextTopicId={nextTopic?.id ?? null}
        />
      </div>
    )
  }

  // ── Tema tipo 'survey' ────────────────────────────────────────────────────
  if (topic.topic_type === 'survey' && topic.survey_id) {
    const surveyResult = await getSurveyForTopic(topic.survey_id)
    if (!surveyResult.success || !surveyResult.data) notFound()

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <TopicNav
          courseId={courseId}
          courseTitle={course.title}
          topicTitle={topic.title}
          prevTopic={prevTopic}
          nextTopic={nextTopic}
        />

        <div className="space-y-2">
          <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium">
            Evaluación
          </span>
          <h1 className="text-2xl font-bold tracking-tight">{topic.title}</h1>
          {topic.description && (
            <p className="text-sm text-muted-foreground">{topic.description}</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6">
          <SurveyTopicViewer
            survey={surveyResult.data}
            courseId={courseId}
            topicId={topicId}
            nextTopicId={nextTopic?.id ?? null}
            courseTitle={course.title}
          />
        </div>
      </div>
    )
  }

  notFound()
}

// ── Componente de navegación ──────────────────────────────────────────────────

function TopicNav({
  courseId,
  courseTitle,
  topicTitle,
  prevTopic,
  nextTopic,
}: {
  courseId: string
  courseTitle: string
  topicTitle: string
  prevTopic: { id: string; title: string } | null
  nextTopic: { id: string; title: string } | null
}) {
  return (
    <div className="space-y-3">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/capacitacion" className="hover:text-foreground transition-colors">
          Capacitación
        </Link>
        <span>/</span>
        <Link href={`/capacitacion/${courseId}`} className="hover:text-foreground transition-colors truncate max-w-[160px]">
          {courseTitle}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[160px]">{topicTitle}</span>
      </nav>

      {/* Prev / Next */}
      <div className="flex items-center justify-between gap-2">
        {prevTopic ? (
          <Link
            href={`/capacitacion/${courseId}/${prevTopic.id}`}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="truncate max-w-[160px]">{prevTopic.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {nextTopic ? (
          <Link
            href={`/capacitacion/${courseId}/${nextTopic.id}`}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="truncate max-w-[160px]">{nextTopic.title}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: TopicPageProps) {
  const { courseId, topicId } = await params
  const result = await getCourse(courseId)
  const topic = result.data?.topics.find(t => t.id === topicId)
  const title = topic?.title ?? 'Tema'
  const courseTitle = result.data?.title ?? 'Curso'
  return { title: `${title} — ${courseTitle}` }
}
