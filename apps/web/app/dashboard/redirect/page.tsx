/**
 * Página de redirección automática
 * 
 * Esta página es interceptada por proxy.ts que automáticamente
 * redirige al usuario a /dashboard/{role} basado en su rol
 */

export default function DashboardRedirect() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  )
}
