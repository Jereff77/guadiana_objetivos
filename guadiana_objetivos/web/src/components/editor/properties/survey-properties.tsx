'use client'

import { useState, useTransition } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { updateSurveyMeta } from '@/app/(dashboard)/formularios/[id]/editar/section-actions'

interface SurveyPropertiesProps {
  survey: {
    id: string
    name: string
    description: string | null
    category: string | null
  }
}

export function SurveyProperties({ survey }: SurveyPropertiesProps) {
  const [name, setName] = useState(survey.name)
  const [description, setDescription] = useState(survey.description ?? '')
  const [category, setCategory] = useState(survey.category ?? '')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleSave() {
    startTransition(async () => {
      await updateSurveyMeta(survey.id, { name, description, category })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

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
      <Button
        size="sm"
        onClick={handleSave}
        disabled={isPending}
        style={{ backgroundColor: '#004B8D' }}
      >
        {saved ? '¡Guardado!' : isPending ? 'Guardando…' : 'Guardar'}
      </Button>
    </div>
  )
}
