'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, CheckCircle, Loader2, AlertCircle, Clock, Copy, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SectionsPanel } from '@/components/editor/sections-panel'
import { PropertiesPanel } from '@/components/editor/properties-panel'
import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { publishSurvey, createNewVersion } from '@/app/(dashboard)/formularios/actions'

const FlowEditor = dynamic(
  () => import('@/components/editor/flow/flow-editor').then(m => m.FlowEditor),
  { ssr: false, loading: () => <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">Cargando editor de flujo…</div> }
)
import { useEditorSaveStatus, type SaveStatus } from '@/hooks/use-auto-save'

type SurveyStatus = 'draft' | 'published' | 'archived'

export interface Section {
  id: string
  title: string
  description: string | null
  order: number
}

export interface Question {
  id: string
  section_id: string
  label: string
  description: string | null
  type: string
  required: boolean
  order: number
  placeholder: string | null
  help_text: string | null
  metadata: Record<string, unknown> | null
}

export interface QuestionOption {
  id: string
  question_id: string
  label: string
  value: string | null
  score: number | null
  order: number
  is_default: boolean
}

export interface Condition {
  id: string
  survey_id: string
  source_question_id: string
  source_option_id: string | null
  condition_value: string
  target_section_id: string | null
  target_question_id: string | null
  action: string
  created_at: string
}

export type SelectedElement =
  | { kind: 'survey' }
  | { kind: 'section'; id: string }
  | { kind: 'question'; id: string }

interface EditorClientProps {
  survey: {
    id: string
    name: string
    description: string | null
    status: SurveyStatus
    category: string | null
    version: number
  }
  initialSections: Section[]
  initialQuestions: Question[]
  initialOptions: QuestionOption[]
  initialConditions: Condition[]
}

const statusLabels: Record<SurveyStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Guardando…</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span className="text-green-600">Guardado</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3 w-3 text-destructive" />
          <span className="text-destructive">Error al guardar</span>
        </>
      )}
    </div>
  )
}

export function EditorClient({
  survey,
  initialSections,
  initialQuestions,
  initialOptions,
  initialConditions,
}: EditorClientProps) {
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [options, setOptions] = useState<QuestionOption[]>(initialOptions)
  const [conditions] = useState<Condition[]>(initialConditions)
  const [selected, setSelected] = useState<SelectedElement>({ kind: 'survey' })
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [creatingVersion, setCreatingVersion] = useState(false)
  const [activeTab, setActiveTab] = useState<'estructura' | 'flujo'>('estructura')
  const { status: saveStatus, onSaveStart, onSaveEnd } = useEditorSaveStatus()

  async function handlePublish() {
    setPublishing(true)
    setPublishError(null)
    const result = await publishSurvey(survey.id)
    if (result?.error) {
      setPublishError(result.error)
    }
    setPublishing(false)
  }

  async function handleCreateNewVersion() {
    setCreatingVersion(true)
    await createNewVersion(survey.id)
    setCreatingVersion(false)
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <Link href="/formularios">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span className="font-semibold text-sm truncate">{survey.name}</span>
          <Badge variant="secondary" className="shrink-0">
            {statusLabels[survey.status]}
          </Badge>
          <span className="text-xs text-muted-foreground shrink-0">v{survey.version}</span>
        </div>
        <SaveIndicator status={saveStatus} />
        <div className="flex items-center gap-2">
          {saveStatus === 'idle' && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Auto-guardado activo</span>
            </div>
          )}
          <Link href={`/formularios/${survey.id}/vista-previa`}>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Vista previa
            </Button>
          </Link>
          {survey.status === 'draft' && (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={publishing}
              style={{ backgroundColor: '#004B8D' }}
            >
              <Send className="h-4 w-4 mr-2" />
              {publishing ? 'Publicando…' : 'Publicar'}
            </Button>
          )}
          {survey.status === 'published' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCreateNewVersion}
              disabled={creatingVersion}
            >
              <Copy className="h-4 w-4 mr-2" />
              {creatingVersion ? 'Creando versión…' : 'Crear nueva versión'}
            </Button>
          )}
        </div>
      </header>

      {/* Validation error */}
      {publishError && (
        <div className="flex items-center gap-2 bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {publishError}
        </div>
      )}

      {/* Tabs: Estructura / Flujo */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'estructura' | 'flujo')} className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-4 mt-2 w-fit shrink-0">
          <TabsTrigger value="estructura">Estructura</TabsTrigger>
          <TabsTrigger value="flujo">Flujo</TabsTrigger>
        </TabsList>

        {/* Content area: relative wrapper so each tab fills via absolute positioning */}
        <div className="relative flex-1 overflow-hidden">
          <TabsContent value="estructura" className="absolute inset-0 flex overflow-hidden mt-0 data-[state=inactive]:hidden">
            {/* Two-panel layout */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left panel: structure */}
              <div className="w-72 shrink-0 border-r flex flex-col overflow-hidden">
                <SectionsPanel
                  surveyId={survey.id}
                  sections={sections}
                  questions={questions}
                  selected={selected}
                  onSelect={setSelected}
                  onSectionsChange={setSections}
                  onQuestionsChange={setQuestions}
                />
              </div>

              {/* Right panel: properties */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <PropertiesPanel
                  surveyId={survey.id}
                  survey={survey}
                  sections={sections}
                  questions={questions}
                  options={options}
                  selected={selected}
                  onSectionsChange={setSections}
                  onQuestionsChange={setQuestions}
                  onOptionsChange={setOptions}
                  onSaveStart={onSaveStart}
                  onSaveEnd={onSaveEnd}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="flujo" className="absolute inset-0 mt-0 data-[state=inactive]:hidden">
            <FlowEditor
              sections={sections}
              questions={questions}
              options={options}
              conditions={conditions}
              surveyId={survey.id}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
