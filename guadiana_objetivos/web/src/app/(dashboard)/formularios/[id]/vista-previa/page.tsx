import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PreviewClient } from './preview-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PreviewPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
    .in('section_id', (sections ?? []).map((s) => s.id))
    .order('order', { ascending: true })

  const { data: options } = await supabase
    .from('form_question_options')
    .select('id, question_id, label, value, score, order, is_default')
    .in('question_id', (questions ?? []).map((q) => q.id))
    .order('order', { ascending: true })

  const { data: conditions } = await supabase
    .from('form_conditions')
    .select('*')
    .eq('survey_id', id)

  return (
    <PreviewClient
      survey={survey}
      sections={sections ?? []}
      questions={questions ?? []}
      options={options ?? []}
      conditions={conditions ?? []}
    />
  )
}
