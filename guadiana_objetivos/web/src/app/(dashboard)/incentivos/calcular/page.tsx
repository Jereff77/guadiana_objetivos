import { requirePermission } from '@/lib/permissions'
import { calculateIncentivesForPeriod } from '../incentive-actions'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ month?: string; year?: string }>
}

export default async function IncentivosCalcularPage({ searchParams }: PageProps) {
  await requirePermission('incentivos.manage')

  const params = await searchParams
  const now = new Date()
  const month = params.month ? Number(params.month) : now.getMonth() + 1
  const year = params.year ? Number(params.year) : now.getFullYear()

  const result = await calculateIncentivesForPeriod(month, year)

  // Redirigir de vuelta a incentivos con estado del cálculo
  const status = result.success ? 'ok' : 'error'
  const message = result.success
    ? `Calculado: ${result.data?.created ?? 0} nuevos, ${result.data?.updated ?? 0} actualizados.`
    : (result.error ?? 'Error al calcular.')

  redirect(`/incentivos?month=${month}&year=${year}&calc=${status}&msg=${encodeURIComponent(message)}`)
}
