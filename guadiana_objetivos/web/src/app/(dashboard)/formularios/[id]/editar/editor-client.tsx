'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SectionsPanel } from '@/components/editor/sections-panel'
import { PropertiesPanel } from '@/components/editor/properties-panel'
import { publishSurvey } from '@/app/(dashboard)/formularios/actions'

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
}

const statusLabels: Record<SurveyStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
}

export function EditorClient({
  survey,
  initialSections,
  initialQuestions,
  initialOptions,
}: EditorClientProps) {
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [options, setOptions] = useState<QuestionOption[]>(initialOptions)
  const [selected, setSelected] = useState<SelectedElement>({ kind: 'survey' })
  const [publishing, setPublishing] = useState(false)

  async function handlePublish() {
    setPublishing(true)
    await publishSurvey(survey.id)
    setPublishing(false)
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <Save className="h-4 w-4 mr-2" />
            Guardado
          </Button>
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
        </div>
      </header>

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
          />
        </div>
      </div>
    </div>
  )
}
