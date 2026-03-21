import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SurveyActionsMenu } from './survey-actions-menu'

type SurveyStatus = 'draft' | 'published' | 'archived'

interface Survey {
  id: string
  name: string
  description: string | null
  status: SurveyStatus
  category: string | null
  version: number
  created_at: string
  updated_at: string
}

interface SurveysTableProps {
  surveys: Survey[]
  emptyMessage: string
}

const statusLabels: Record<SurveyStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
}

const statusVariants: Record<SurveyStatus, 'secondary' | 'default' | 'outline'> = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
}

export function SurveysTable({ surveys, emptyMessage }: SurveysTableProps) {
  if (surveys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full mb-4"
          style={{ backgroundColor: '#004B8D20' }}
        >
          <FileText className="h-6 w-6" style={{ color: '#004B8D' }} />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead className="hidden md:table-cell">Categoría</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="hidden sm:table-cell">Versión</TableHead>
          <TableHead className="hidden lg:table-cell">Actualizado</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {surveys.map((survey) => (
          <TableRow key={survey.id}>
            <TableCell>
              <div className="font-medium">{survey.name}</div>
              {survey.description && (
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {survey.description}
                </div>
              )}
            </TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
              {survey.category ?? '—'}
            </TableCell>
            <TableCell>
              <Badge
                variant={statusVariants[survey.status]}
                style={
                  survey.status === 'published'
                    ? { backgroundColor: '#004B8D', color: 'white' }
                    : undefined
                }
              >
                {statusLabels[survey.status]}
              </Badge>
            </TableCell>
            <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
              v{survey.version}
            </TableCell>
            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(survey.updated_at), {
                addSuffix: true,
                locale: es,
              })}
            </TableCell>
            <TableCell>
              <SurveyActionsMenu id={survey.id} status={survey.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
