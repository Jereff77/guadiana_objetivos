import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'

export const metadata: Metadata = { title: 'Formularios' }
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { SurveysTable } from '@/components/formularios/surveys-table'
import { CreateSurveyDialog } from '@/components/formularios/create-survey-dialog'

export default async function FormulariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: surveys } = await supabase
    .from('form_surveys')
    .select('id, name, description, status, category, version, created_at, updated_at')
    .order('updated_at', { ascending: false })

  const all = surveys ?? []
  const drafts = all.filter((s) => s.status === 'draft')
  const published = all.filter((s) => s.status === 'published')
  const archived = all.filter((s) => s.status === 'archived')

  return (
    <>
      <Header
        title="Formularios"
        description="Gestiona checklists y encuestas de auditoría"
        action={<CreateSurveyDialog />}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Tabs defaultValue="draft">
          <TabsList>
            <TabsTrigger value="draft">
              Borradores
              {drafts.length > 0 && (
                <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium">
                  {drafts.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="published">
              Publicados
              {published.length > 0 && (
                <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium">
                  {published.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archivados
              {archived.length > 0 && (
                <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium">
                  {archived.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draft" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <SurveysTable
                  surveys={drafts}
                  emptyMessage="No hay formularios en borrador. Crea uno nuevo para comenzar."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="published" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <SurveysTable
                  surveys={published}
                  emptyMessage="No hay formularios publicados aún."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archived" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <SurveysTable
                  surveys={archived}
                  emptyMessage="No hay formularios archivados."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
