import type { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col"
        style={{ backgroundColor: '#004B8D' }}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div
            className="w-8 h-8 rounded flex items-center justify-center font-bold text-white text-sm"
            style={{ backgroundColor: '#FF8F1C' }}
          >
            G
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Guadiana</p>
            <p className="text-white/60 text-xs">Checklists</p>
          </div>
        </div>

        {/* Navigation placeholder */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-white/90 hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <span className="w-4 h-4 rounded-sm bg-white/20" />
            Dashboard
          </a>
          <div className="pt-4">
            <p className="text-white/40 text-xs uppercase tracking-wider px-3 mb-2">
              Navegacion
            </p>
            {['Checklists', 'Reportes', 'Configuracion'].map((item) => (
              <a
                key={item}
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-white/60 hover:bg-white/10 hover:text-white/90 transition-colors text-sm cursor-not-allowed"
              >
                <span className="w-4 h-4 rounded-sm bg-white/10" />
                {item}
              </a>
            ))}
          </div>
        </nav>

        {/* Footer del sidebar */}
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-white/40 text-xs text-center">MVP v0.1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-700 font-medium text-sm">Plataforma de gestión de checklists</h2>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-semibold px-2 py-1 rounded text-white"
                style={{ backgroundColor: '#FF8F1C' }}
              >
                Coming Soon
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
