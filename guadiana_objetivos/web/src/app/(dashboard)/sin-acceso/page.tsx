import Link from 'next/link'

export const metadata = { title: 'Sin acceso — Guadiana' }

export default function SinAccesoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl mb-4">🔒</div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Acceso restringido</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        No tienes los permisos necesarios para acceder a esta sección.
        Si crees que esto es un error, contacta al administrador del sistema.
      </p>
      <Link
        href="/inicio"
        className="inline-flex items-center gap-2 rounded-md bg-brand-blue text-white
          px-4 py-2 text-sm font-medium hover:bg-brand-blue/90 transition-colors"
      >
        ← Volver al inicio
      </Link>
    </div>
  )
}
