export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bienvenido a Guadiana Checklists</p>
      </div>

      {/* Stats placeholder cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Checklists activos', value: '--', color: '#004B8D' },
          { label: 'Completados hoy', value: '--', color: '#FF8F1C' },
          { label: 'Pendientes', value: '--', color: '#6B7280' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stat.color }}
              />
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">Implementacion pendiente</p>
          </div>
        ))}
      </div>

      {/* Content placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
            style={{ backgroundColor: '#004B8D' }}
          >
            <span className="text-white text-lg font-bold">G</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Contenido en construccion</h3>
          <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
            El dashboard completo sera implementado en proximas iteraciones.
            Esta es una estructura base del proyecto.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: '#004B8D' }}
            >
              Next.js 14
            </span>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: '#FF8F1C' }}
            >
              Supabase
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full text-white bg-gray-400">
              Tailwind CSS
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
