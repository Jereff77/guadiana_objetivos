import { requirePermission, checkPermission } from '@/lib/permissions'
import { getDocuments, getCategories } from './documento-actions'
import { getDocumentsGraph } from './graph-actions'
import { DocumentsTabs } from '@/components/documentos/documents-tabs'
import { UploadDocumentDialog } from '@/components/documentos/upload-document-dialog'

export const metadata = {
  title: 'Documentos | Guadiana Objetivos',
}

export default async function DocumentosPage() {
  await requirePermission('documentos.view')

  // Fetch paralelo de documentos, categorías, datos del grafo y permisos
  const [docsResult, catsResult, graphResult, canUpload, canManage, canChat] = await Promise.all([
    getDocuments(),
    getCategories(),
    getDocumentsGraph(),
    checkPermission('documentos.upload'),
    checkPermission('documentos.manage'),
    checkPermission('documentos.chat'),
  ])

  const documents = docsResult.data || []
  const categories = catsResult.data || []
  const graphData = graphResult.data || { documents: [], relations: [], categories: [] }

  return (
    <div className="h-screen flex flex-col">
      {/* Header con título y botón de subida */}
      <div className="p-4 border-b bg-background flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documentos</h1>
          <p className="text-sm text-muted-foreground">
            Repositorio centralizado de documentos empresariales
          </p>
        </div>

        <div className="flex gap-2">
          {canChat && (
            <a
              href="/documentos/chat"
              className="px-4 py-2 bg-white border border-[#194D95] text-[#194D95] hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>💬</span>
              <span>Chat de documentos</span>
            </a>
          )}
          {canUpload && (
            <UploadDocumentDialog categories={categories} />
          )}
        </div>
      </div>

      {/* Wrapper con tabs Lista/Grafo */}
      <div className="flex-1 overflow-hidden">
        <DocumentsTabs
          initialDocuments={documents}
          initialGraphData={graphData}
          categories={categories}
        />
      </div>
    </div>
  )
}
