import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditorClient } from './editor-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('form_surveys').select('name').eq('id', id).single()
  return { title: data?.name ? `Editar · ${data.name}` : 'Editor de Formulario' }
}

export default async function EditorPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Cargar formulario con secciones y preguntas
  const { data: survey } = await supabase
    .from('form_surveys')
    .select('id, name, description, status, category, version')
    .eq('id', id)
    .single()

  if (!survey) notFound()

  const { data: sections } = await supabase
    .from('form_sections')
    .select('id, title, description, order')
    .eq('survey_id', id)
    .order('order', { ascending: true })

  const { data: questions } = await supabase
    .from('form_questions')
    .select('id, section_id, label, description, type, required, order, placeholder, help_text, metadata')
    .in(
      'section_id',
      (sections ?? []).map((s) => s.id)
    )
    .order('order', { ascending: true })

  const { data: options } = await supabase
    .from('form_question_options')
    .select('id, question_id, label, value, score, order, is_default')
    .in(
      'question_id',
      (questions ?? []).map((q) => q.id)
    )
    .order('order', { ascending: true })

  const { data: conditions } = await supabase
    .from('form_conditions')
    .select('*')
    .eq('survey_id', id)

  return (
    <EditorClient
      survey={survey}
      initialSections={sections ?? []}
      initialQuestions={questions ?? []}
      initialOptions={options ?? []}
      initialConditions={conditions ?? []}
    />
  )
}
