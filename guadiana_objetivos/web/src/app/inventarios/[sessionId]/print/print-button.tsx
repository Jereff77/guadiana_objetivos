'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        padding: '8px 20px',
        background: '#004B8D',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      Imprimir / Guardar PDF
    </button>
  )
}
