'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import type {
  Section,
  Question,
  QuestionOption,
  SelectedElement,
} from '@/app/(dashboard)/formularios/[id]/editar/editor-client'
import { SurveyProperties } from './properties/survey-properties'
import { SectionProperties } from './properties/section-properties'
import { QuestionProperties } from './properties/question-properties'

interface PropertiesPanelProps {
  surveyId: string
  survey: {
    id: string
    name: string
    description: string | null
    category: string | null
  }
  sections: Section[]
  questions: Question[]
  options: QuestionOption[]
  selected: SelectedElement
  onSectionsChange: (sections: Section[]) => void
  onQuestionsChange: (questions: Question[]) => void
  onOptionsChange: (options: QuestionOption[]) => void
  onSaveStart: () => void
  onSaveEnd: (success: boolean) => void
}

export function PropertiesPanel({
  surveyId,
  survey,
  sections,
  questions,
  options,
  selected,
  onSectionsChange,
  onQuestionsChange,
  onOptionsChange,
  onSaveStart,
  onSaveEnd,
}: PropertiesPanelProps) {
  const selectedSection =
    selected.kind === 'section'
      ? sections.find((s) => s.id === selected.id) ?? null
      : null

  const selectedQuestion =
    selected.kind === 'question'
      ? questions.find((q) => q.id === selected.id) ?? null
      : null

  const questionOptions = selectedQuestion
    ? options.filter((o) => o.question_id === selectedQuestion.id)
    : []

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b">
        <span className="text-sm font-medium">
          {selected.kind === 'survey' && 'Propiedades del formulario'}
          {selected.kind === 'section' && 'Propiedades de la sección'}
          {selected.kind === 'question' && 'Propiedades de la pregunta'}
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {selected.kind === 'survey' && (
            <SurveyProperties
              survey={survey}
              onSaveStart={onSaveStart}
              onSaveEnd={onSaveEnd}
            />
          )}
          {selected.kind === 'section' && selectedSection && (
            <SectionProperties
              section={selectedSection}
              sections={sections}
              questions={questions}
              onSectionsChange={onSectionsChange}
              onQuestionsChange={onQuestionsChange}
              onSaveStart={onSaveStart}
              onSaveEnd={onSaveEnd}
            />
          )}
          {selected.kind === 'question' && selectedQuestion && (
            <QuestionProperties
              surveyId={surveyId}
              question={selectedQuestion}
              options={questionOptions}
              questions={questions}
              onQuestionsChange={onQuestionsChange}
              onSaveStart={onSaveStart}
              onSaveEnd={onSaveEnd}
              onOptionsChange={(newOptions) => {
                const otherOptions = options.filter(
                  (o) => o.question_id !== selectedQuestion.id
                )
                onOptionsChange([...otherOptions, ...newOptions])
              }}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
