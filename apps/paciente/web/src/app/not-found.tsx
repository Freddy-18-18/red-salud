import { Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Search className="h-8 w-8 text-gray-400" />
        </div>

        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pagina no encontrada
        </h1>
        <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
          La pagina que buscas no existe o fue movida.
        </p>

        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition"
        >
          <Home className="h-4 w-4" />
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
