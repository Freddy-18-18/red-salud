"use client";

import { Users, ArrowRight, Gift } from "lucide-react";

export function ReferralBanner() {
  return (
    <a
      href="/dashboard/referidos"
      className="block p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Gift className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white">
            Invita a tus amigos y gana puntos
          </h3>
          <p className="text-xs text-emerald-100 mt-0.5">
            +200 puntos por cada amigo que se registre
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-white/80 group-hover:translate-x-1 transition-transform flex-shrink-0" />
      </div>
    </a>
  );
}
