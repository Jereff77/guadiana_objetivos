import { getSessionDetail } from '@/app/(dashboard)/inventarios/inventarios-actions'
import { notFound } from 'next/navigation'
import { PrintButton } from './print-button'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ sessionId: string }>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function PrintPage({ params }: PageProps) {
  const { sessionId } = await params
  const result = await getSessionDetail(sessionId)

  if (!result.success || !result.data) notFound()

  const { session, counts } = result.data

  const totalContado = counts.reduce((a, c) => a + c.quantity, 0)
  const totalSistema = counts.reduce((a, c) => a + c.system_stock, 0)
  const diferenciaNeta = totalContado - totalSistema

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
        body { font-family: system-ui, sans-serif; font-size: 13px; color: #111; background: #fff; }
        .container { max-width: 900px; margin: 0 auto; padding: 24px 32px; }
        h1 { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
        .meta { font-size: 12px; color: #555; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 12px; }
        .meta span { display: flex; gap: 4px; }
        .meta strong { color: #111; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .summary-card { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; }
        .summary-card .label { font-size: 11px; color: #6b7280; margin-bottom: 2px; }
        .summary-card .value { font-size: 20px; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        thead th { background: #f3f4f6; border-bottom: 1px solid #d1d5db; padding: 8px 10px; text-align: left; font-weight: 600; color: #374151; }
        thead th.num { text-align: right; }
        tbody td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
        tbody td.num { text-align: right; font-variant-numeric: tabular-nums; }
        tbody tr:nth-child(even) { background: #f9fafb; }
        .diff-pos { color: #15803d; font-weight: 600; }
        .diff-neg { color: #dc2626; font-weight: 600; }
        .diff-zero { color: #9ca3af; }
        .footer { margin-top: 24px; font-size: 11px; color: #9ca3af; text-align: right; }
        .status-badge { display: inline-block; border-radius: 999px; padding: 1px 8px; font-size: 11px; font-weight: 500; }
        .status-closed { background: #f1f5f9; color: #475569; }
        .status-active { background: #dcfce7; color: #15803d; }
      `}</style>

      <div className="container">
        {/* Botón imprimir (solo pantalla) */}
        <div className="no-print" style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <PrintButton />
        </div>

        {/* Encabezado del reporte */}
        <h1>{session.name}</h1>
        <div className="meta">
          <span>Almacén: <strong>{session.warehouse_id}</strong></span>
          <span>Estado: <span className={`status-badge ${session.status === 'closed' ? 'status-closed' : 'status-active'}`}>{session.status === 'closed' ? 'Cerrado' : 'Activo'}</span></span>
          <span>Fecha: <strong>{formatDate(session.created_at)}</strong></span>
          {session.creator_name && <span>Capturado por: <strong>{session.creator_name}</strong></span>}
        </div>

        {/* Resumen */}
        <div className="summary">
          <div className="summary-card">
            <div className="label">Productos</div>
            <div className="value">{counts.length}</div>
          </div>
          <div className="summary-card">
            <div className="label">Total contado</div>
            <div className="value">{totalContado.toLocaleString('es-MX')}</div>
          </div>
          <div className="summary-card">
            <div className="label">Total sistema</div>
            <div className="value">{totalSistema.toLocaleString('es-MX')}</div>
          </div>
          <div className="summary-card">
            <div className="label">Diferencia neta</div>
            <div className={`value ${diferenciaNeta === 0 ? 'diff-zero' : diferenciaNeta > 0 ? 'diff-pos' : 'diff-neg'}`}>
              {diferenciaNeta > 0 ? '+' : ''}{diferenciaNeta.toLocaleString('es-MX')}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th className="num">Sistema</th>
              <th className="num">Conteo</th>
              <th className="num">Diferencia</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            {counts.map((c) => (
              <tr key={c.product_id}>
                <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{c.codigo}</td>
                <td>{c.producto ?? '—'}</td>
                <td style={{ color: '#6b7280' }}>{c.categoria ?? '—'}</td>
                <td className="num">{c.system_stock}</td>
                <td className="num" style={{ fontWeight: 600 }}>{c.quantity}</td>
                <td className={`num ${c.difference === 0 ? 'diff-zero' : c.difference > 0 ? 'diff-pos' : 'diff-neg'}`}>
                  {c.difference > 0 ? '+' : ''}{c.difference}
                </td>
                <td style={{ color: '#6b7280', fontSize: 11 }}>{c.notes ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="footer">
          Generado el {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </>
  )
}
