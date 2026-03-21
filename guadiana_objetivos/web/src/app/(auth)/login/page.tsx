export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header con color corporativo */}
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: '#004B8D' }}
            >
              <span className="text-white text-2xl font-bold">G</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Guadiana Checklists</h1>
            <p className="text-sm text-gray-500 mt-1">Plataforma de gestión de checklists</p>
          </div>

          {/* Placeholder content */}
          <div
            className="text-center py-6 rounded-md"
            style={{ backgroundColor: '#FF8F1C', opacity: 0.1 }}
          />
          <div className="text-center py-6 rounded-md border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Login - Coming Soon</p>
            <p className="text-gray-300 text-sm mt-1">Implementación pendiente en T-104</p>
          </div>

          <div className="mt-6">
            <button
              type="button"
              disabled
              className="w-full py-2 px-4 rounded-md text-white font-medium cursor-not-allowed opacity-60"
              style={{ backgroundColor: '#004B8D' }}
            >
              Iniciar sesión
            </button>
          </div>

          <div className="mt-4 text-center">
            <span
              className="text-xs font-semibold px-2 py-1 rounded"
              style={{ backgroundColor: '#FF8F1C', color: '#fff' }}
            >
              MVP
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
