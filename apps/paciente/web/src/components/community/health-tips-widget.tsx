"use client";

import { Lightbulb, ArrowRight, BookOpen } from "lucide-react";
import { useDailyTip } from "@/hooks/use-community";

const FALLBACK_TIPS = [
  "Recuerda beber al menos 8 vasos de agua al dia para mantenerte hidratado.",
  "Realizar 30 minutos de actividad fisica diaria mejora tu salud cardiovascular.",
  "Dormir entre 7 y 9 horas cada noche es fundamental para tu bienestar.",
  "Incluye al menos 5 porciones de frutas y verduras en tu alimentacion diaria.",
  "Las consultas preventivas anuales pueden detectar problemas de salud a tiempo.",
];

export function HealthTipsWidget() {
  const { tip, loading } = useDailyTip();

  const fallbackTip =
    FALLBACK_TIPS[new Date().getDate() % FALLBACK_TIPS.length];

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-xl h-32" />
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-emerald-800 mb-1">
            Tip del dia
          </h3>

          {tip ? (
            <>
              <p className="text-sm text-emerald-700 line-clamp-2 mb-2">
                {tip.summary || tip.title || fallbackTip}
              </p>
              {tip.id && (
                <a
                  href={`/dashboard/articulos/${tip.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <BookOpen className="h-3 w-3" />
                  Leer articulo completo
                  <ArrowRight className="h-3 w-3" />
                </a>
              )}
            </>
          ) : (
            <p className="text-sm text-emerald-700">{fallbackTip}</p>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-emerald-100">
        <a
          href="/dashboard/comunidad"
          className="flex-1 text-center px-2 py-1.5 bg-white/60 rounded-lg text-xs font-medium text-emerald-700 hover:bg-white/80 transition-colors"
        >
          Comunidad
        </a>
        <a
          href="/dashboard/articulos"
          className="flex-1 text-center px-2 py-1.5 bg-white/60 rounded-lg text-xs font-medium text-emerald-700 hover:bg-white/80 transition-colors"
        >
          Articulos de salud
        </a>
      </div>
    </div>
  );
}
