'use client'

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { updateSurveyMeta } from '@/app/(dashboard)/formularios/[id]/editar/section-actions'

interface SurveyPropertiesProps {
  survey: {
    id: string
    name: string
    description: string | null
    category: string | null
  }
  onSaveStart: () => void
  onSaveEnd: (success: boolean) => void
}

export function SurveyProperties({ survey, onSaveStart, onSaveEnd }: SurveyPropertiesProps) {
  const [name, setName] = useState(survey.name)
  const [description, setDescription] = useState(survey.description ?? '')
  const [category, setCategory] = useState(survey.category ?? '')

  // Auto-save con debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (
        name === survey.name &&
        description === (survey.description ?? '') &&
        category === (survey.category ?? '')
      ) return

      onSaveStart()
      try {
        await updateSurveyMeta(survey.id, { name, description, category })
        onSaveEnd(true)
      } catch {
        onSaveEnd(false)
      }
    }, 800)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, description, category])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="survey-name">Nombre del formulario</Label>
        <Input
          id="survey-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del formulario"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="survey-desc">Descripción</Label>
        <Textarea
          id="survey-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción breve del formulario"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="survey-cat">Categoría</Label>
        <Input
          id="survey-cat"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Ej. Auditoría, Ventas, Operaciones…"
        />
      </div>
      <p className="text-xs text-muted-foreground">Los cambios se guardan automáticamente.</p>
    </div>
  )
}
