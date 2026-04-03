"use client";

import {
  Calendar,
  Pill,
  HeartPulse,
  Flame,
  UserCheck,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ImprovementTipsProps {
  tips: string[];
}

/* ------------------------------------------------------------------ */
/*  Tip icon resolver                                                  */
/* ------------------------------------------------------------------ */

interface TipMeta {
  icon: LucideIcon;
  title: string;
  href: string;
}

function resolveTipMeta(tip: string): TipMeta {
  if (tip.includes("chequeo") || tip.includes("cita") || tip.includes("agenda")) {
    return { icon: Calendar, title: "Citas Médicas", href: "/dashboard/agendar" };
  }
  if (tip.includes("medicamento") || tip.includes("tratamiento") || tip.includes("recordatorio")) {
    return { icon: Pill, title: "Medicación", href: "/dashboard/recordatorios" };
  }
  if (tip.includes("vital") || tip.includes("presion") || tip.includes("glucosa")) {
    return { icon: HeartPulse, title: "Signos Vitales", href: "/dashboard/signos-vitales" };
  }
  if (tip.includes("racha") || tip.includes("recompensa") || tip.includes("app")) {
    return { icon: Flame, title: "Actividad", href: "/dashboard/recompensas" };
  }
  if (tip.includes("perfil") || tip.includes("completa")) {
    return { icon: UserCheck, title: "Perfil de Salud", href: "/dashboard/perfil" };
  }
  return { icon: Lightbulb, title: "Consejo", href: "/dashboard" };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ImprovementTips({ tips }: ImprovementTipsProps) {
  if (tips.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        Consejos para Mejorar
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tips.map((tip, idx) => {
          const meta = resolveTipMeta(tip);
          const Icon = meta.icon;

          return (
            <div
              key={idx}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 hover:shadow-sm transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {meta.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {tip}
                  </p>
                </div>
              </div>
              <a
                href={meta.href}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition self-end"
              >
                Ir
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
