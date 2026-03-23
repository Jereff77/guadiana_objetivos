import { notFound } from 'next/navigation'
import { requirePermission } from '@/lib/permissions'
import { getLmsContent, getMyProgress, startContent } from '../lms-actions'
import { ContentViewer } from './content-viewer'
import { createClient } from '@/lib/supabase/server'

interface ContentPageProps {
  params: Promise<{ contentId: string }>
}

const typeLabels: Record<string, string> = {
  pdf: 'PDF',
  video: 'Video',
  text: 'Texto',
  quiz: 'Evaluación',
}

const typeBadgeColors: Record<string, string> = {
  pdf: 'bg-orange-100 text-orange-700',
  video: 'bg-purple-100 text-purple-700',
  text: 'bg-blue-100 text-blue-700',
  quiz: 'bg-green-100 text-green-700',
}

export default async function ContentPage({ params }: ContentPageProps) {
  await requirePermission('capacitacion.view')

  const { contentId } = await params

  const [contentResult, progressResult] = await Promise.all([
    getLmsContent(contentId),
    getMyProgress(),
  ])

  if (!contentResult.success || !contentResult.data) {
    notFound()
  }

  const content = contentResult.data
  const myProgress = progressResult.success ? (progressResult.data ?? []) : []
  const progress = myProgress.find((p) => p.content_id === contentId)

  // Registrar inicio de progreso server-side (sin depender de Server Actions en Client Components)
  await startContent(contentId)

  // Generar URL firmada para PDFs almacenados en bucket privado
  let pdfSignedUrl: string | null = null
  if (content.content_type === 'pdf' && content.storage_path) {
    const supabase = await createClient()
    const { data: signedData } = await supabase.storage
      .from('lms-content')
      .createSignedUrl(content.storage_path, 3600) // 1 hora de validez
    pdfSignedUrl = signedData?.signedUrl ?? null
  }

  const typeLabel = typeLabels[content.content_type] ?? content.content_type
  const badgeColor = typeBadgeColors[content.content_type] ?? 'bg-gray-100 text-gray-700'

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}
          >
            {typeLabel}
          </span>
          {content.category && (
            <span className="text-xs text-muted-foreground">{content.category}</span>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{content.title}</h1>
        {content.description && (
          <p className="text-sm text-muted-foreground">{content.description}</p>
        )}
      </div>

      {/* Contenido interactivo */}
      <ContentViewer content={content} progress={progress} pdfSignedUrl={pdfSignedUrl} />
    </div>
  )
}

export async function generateMetadata({ params }: ContentPageProps) {
  const { contentId } = await params
  const result = await getLmsContent(contentId)
  const title = result.data?.title ?? 'Contenido'
  return { title: `${title} — Capacitación` }
}
