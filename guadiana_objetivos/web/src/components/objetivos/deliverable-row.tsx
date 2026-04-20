'use client'

import { useState } from 'react'
import { Download, ExternalLink, FileText, Loader2 } from 'lucide-react'
import { EvidenceUploader } from './evidence-uploader'
import { ReviewPanel } from './review-panel'
import { getEvidencesByDeliverable } from '../../app/(dashboard)/objetivos/deliverable-actions'
import type { Evidence, Review } from '../../app/(dashboard)/objetivos/deliverable-actions'

interface Deliverable {
  id: string
  objective_id: string
  title: string
  description: string | null
  due_date: string | null
  assignee_id: string | null
  assignee_name: string | null
  status: string
  created_at: string
  evidences?: Evidence[]
  latest_review?: Review | null
}

interface DeliverableRowProps {
  deliverable: Deliverable
  canReview: boolean
  currentUserIsAssignee: boolean
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending:   { label: 'Pendiente',  className: 'bg-gray-100 text-gray-600' },
  submitted: { label: 'Enviado',    className: 'bg-yellow-100 text-yellow-700' },
  approved:  { label: 'Aprobado',   className: 'bg-green-100 text-green-700' },
  rejected:  { label: 'Rechazado',  className: 'bg-red-100 text-red-600' },
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

export function DeliverableRow({
  deliverable,
  canReview,
  currentUserIsAssignee,
}: DeliverableRowProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [showEvidences, setShowEvidences] = useState(false)
  const [loadedEvidences, setLoadedEvidences] = useState<Evidence[] | null>(null)
  const [loadingEvidences, setLoadingEvidences] = useState(false)

  const statusInfo = STATUS_STYLES[deliverable.status] ?? STATUS_STYLES.pending
  const canUpload = currentUserIsAssignee && ['pending', 'rejected'].includes(deliverable.status)
  const canReviewThis = canReview && deliverable.status === 'submitted'

  const evidencesToShow = loadedEvidences ?? deliverable.evidences ?? []
  const hasEvidences = evidencesToShow.length > 0

  async function handleOpenReview() {
    if (!showReview) {
      setShowReview(true)
      if (loadedEvidences === null) {
        setLoadingEvidences(true)
        try {
          const evidences = await getEvidencesByDeliverable(deliverable.id)
          setLoadedEvidences(evidences)
        } catch {
          setLoadedEvidences([])
        } finally {
          setLoadingEvidences(false)
        }
      }
    } else {
      setShowReview(false)
    }
  }

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-background">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{deliverable.title}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
            {hasEvidences && (
              <button
                type="button"
                onClick={() => setShowEvidences(!showEvidences)}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                {showEvidences ? `Ocultar evidencias (${evidencesToShow.length})` : `Ver evidencias (${evidencesToShow.length})`}
              </button>
            )}
          </div>
          {deliverable.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{deliverable.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {deliverable.assignee_name && <span>Asignado a: {deliverable.assignee_name}</span>}
            {deliverable.due_date && <span>Vence: {formatDate(deliverable.due_date)}</span>}
          </div>

          {/* Mostrar revisión previa si existe */}
          {deliverable.latest_review && (
            <div className={`mt-2 text-xs p-2 rounded ${
              deliverable.latest_review.verdict === 'approved'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <strong>{deliverable.latest_review.verdict === 'approved' ? '✓ Aprobado' : '✕ Rechazado'}</strong>
              {deliverable.latest_review.comment && <span className="ml-1">— {deliverable.latest_review.comment}</span>}
              <span className="ml-1 text-muted-foreground">({deliverable.latest_review.reviewer_name})</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canUpload && (
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="text-xs bg-brand-blue text-white rounded px-2 py-1 hover:bg-brand-blue/90"
            >
              {showUpload ? 'Cancelar' : 'Subir evidencia'}
            </button>
          )}
          {canReviewThis && (
            <button
              onClick={handleOpenReview}
              disabled={loadingEvidences}
              className="text-xs bg-brand-orange text-white rounded px-2 py-1 hover:bg-brand-orange/90 disabled:opacity-60 flex items-center gap-1"
            >
              {loadingEvidences && <Loader2 className="h-3 w-3 animate-spin" />}
              {showReview ? 'Cancelar' : 'Revisar'}
            </button>
          )}
        </div>
      </div>

      {/* Evidencias */}
      {showEvidences && hasEvidences && (
        <div className="ml-4 space-y-2">
          {evidencesToShow.map((ev) => (
            <EvidenceView key={ev.id} evidence={ev} />
          ))}
        </div>
      )}

      {showUpload && (
        <EvidenceUploader
          deliverableId={deliverable.id}
          onSuccess={() => setShowUpload(false)}
        />
      )}

      {showReview && (
        <ReviewPanel
          deliverableId={deliverable.id}
          evidences={evidencesToShow}
          isLoadingEvidences={loadingEvidences}
          onSuccess={() => setShowReview(false)}
        />
      )}
    </div>
  )
}

function getOriginalFilename(storagePath: string): string {
  const filename = storagePath.split('/').pop() ?? storagePath
  const parts = filename.split('_')
  return parts.length >= 3 ? parts.slice(2).join('_') : filename
}

// Componente para mostrar una evidencia
function EvidenceView({ evidence }: { evidence: Evidence }) {
  const renderContent = () => {
    // Archivo subido a Storage
    if (evidence.storage_path) {
      return (
        <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs flex-1 truncate">{getOriginalFilename(evidence.storage_path)}</span>
          <a
            href={`/api/objetivos/evidence?path=${encodeURIComponent(evidence.storage_path)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-blue hover:underline flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            Descargar
          </a>
        </div>
      )
    }

    // URL externa
    if (evidence.evidence_url) {
      return (
        <a
          href={evidence.evidence_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-brand-blue hover:underline truncate flex-1">
            {evidence.evidence_url}
          </span>
        </a>
      )
    }

    // Texto
    if (evidence.text_content) {
      return (
        <div className="p-2 rounded bg-muted/30">
          <p className="text-xs whitespace-pre-wrap break-words">{evidence.text_content}</p>
        </div>
      )
    }

    return null
  }

  return (
    <div className="border rounded-md p-2 bg-background">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">
          Enviado por {evidence.submitter_name || 'Usuario'}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(evidence.submitted_at).toLocaleDateString('es-MX', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
          })}
        </span>
      </div>
      {renderContent()}
      {evidence.notes && (
        <p className="text-xs text-muted-foreground mt-2 italic">Nota: {evidence.notes}</p>
      )}
    </div>
  )
}
