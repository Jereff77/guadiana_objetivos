'use client'

import { useState } from 'react'
import { EvidenceUploader } from './evidence-uploader'
import { ReviewPanel } from './review-panel'

interface Deliverable {
  id: string
  title: string
  description: string | null
  due_date: string | null
  assignee_name: string | null
  status: string
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

  const statusInfo = STATUS_STYLES[deliverable.status] ?? STATUS_STYLES.pending
  const canUpload = currentUserIsAssignee && ['pending', 'rejected'].includes(deliverable.status)
  const canReviewThis = canReview && deliverable.status === 'submitted'

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-background">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{deliverable.title}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>
          {deliverable.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{deliverable.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {deliverable.assignee_name && <span>Asignado a: {deliverable.assignee_name}</span>}
            {deliverable.due_date && <span>Vence: {formatDate(deliverable.due_date)}</span>}
          </div>
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
              onClick={() => setShowReview(!showReview)}
              className="text-xs bg-brand-orange text-white rounded px-2 py-1 hover:bg-brand-orange/90"
            >
              {showReview ? 'Cancelar' : 'Revisar'}
            </button>
          )}
        </div>
      </div>

      {showUpload && (
        <EvidenceUploader
          deliverableId={deliverable.id}
          onSuccess={() => setShowUpload(false)}
        />
      )}

      {showReview && (
        <ReviewPanel
          deliverableId={deliverable.id}
          onSuccess={() => setShowReview(false)}
        />
      )}
    </div>
  )
}
