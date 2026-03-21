/**
 * T-501: Prueba de integración – Componente RunsTable
 */
import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { RunsTable } from '../runs-table'

type Profile = { id: string; first_name: string | null; last_name: string | null }

const mockProfile: Profile = { id: 'user-1', first_name: 'Ana', last_name: 'García' }

const mockRun = {
  id: 'run-001',
  survey_id: 'survey-1',
  respondent_id: 'user-1',
  branch_id: null,
  started_at: '2026-03-20T08:00:00Z',
  completed_at: '2026-03-20T09:00:00Z',
  status: 'completed',
  form_surveys: { name: 'Checklist Operativo' } as { name: string }[] | { name: string } | null,
}

const profileMap = new Map<string, Profile>([['user-1', mockProfile]])

describe('RunsTable', () => {
  it('muestra mensaje vacío cuando no hay ejecuciones', () => {
    render(<RunsTable runs={[]} profileMap={new Map()} />)
    expect(screen.getByText(/no se encontraron ejecuciones/i)).toBeInTheDocument()
  })

  it('renderiza una fila por ejecución', () => {
    render(<RunsTable runs={[mockRun]} profileMap={profileMap} />)
    expect(screen.getByText('Checklist Operativo')).toBeInTheDocument()
  })

  it('muestra el nombre del respondente desde profileMap', () => {
    render(<RunsTable runs={[mockRun]} profileMap={profileMap} />)
    expect(screen.getByText('Ana García')).toBeInTheDocument()
  })

  it('usa fallback de ID cuando no hay perfil', () => {
    render(<RunsTable runs={[mockRun]} profileMap={new Map()} />)
    // fallback: respondent_id primeros 8 chars + ellipsis
    expect(screen.getByText('user-1…')).toBeInTheDocument()
  })

  it('muestra badge de estado "Completado" en la celda de estado', () => {
    render(<RunsTable runs={[mockRun]} profileMap={profileMap} />)
    // "Completado" aparece como header de columna (th) Y como badge (div)
    // Verificamos que existe al menos un elemento que no sea un th
    const matches = screen.getAllByText('Completado')
    const badge = matches.find((el) => el.tagName !== 'TH')
    expect(badge).toBeInTheDocument()
  })

  it('muestra badge "En progreso" para status in_progress', () => {
    const inProgressRun = { ...mockRun, status: 'in_progress', completed_at: null }
    render(<RunsTable runs={[inProgressRun]} profileMap={profileMap} />)
    expect(screen.getByText('En progreso')).toBeInTheDocument()
  })

  it('renderiza el enlace de detalle apuntando a /resultados/[id]', () => {
    render(<RunsTable runs={[mockRun]} profileMap={profileMap} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/resultados/run-001')
  })

  it('soporta form_surveys como array', () => {
    const runWithArray = {
      ...mockRun,
      form_surveys: [{ name: 'Checklist Array' }] as { name: string }[] | { name: string } | null,
    }
    render(<RunsTable runs={[runWithArray]} profileMap={profileMap} />)
    expect(screen.getByText('Checklist Array')).toBeInTheDocument()
  })

  it('muestra "—" cuando form_surveys es null', () => {
    const runWithNull = { ...mockRun, form_surveys: null }
    render(<RunsTable runs={[runWithNull]} profileMap={profileMap} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
