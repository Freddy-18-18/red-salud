import { Search, ArrowLeft } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-xl shadow-sm p-8 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-5">
          <Search className="h-7 w-7 text-gray-400" />
        </div>

        <p className="text-5xl font-bold text-gray-200 mb-3">404</p>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Seccion no encontrada
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          La seccion que buscas no existe o fue movida.
        </p>

        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al dashboard
        </a>
      </div>
    </div>
  );
}
