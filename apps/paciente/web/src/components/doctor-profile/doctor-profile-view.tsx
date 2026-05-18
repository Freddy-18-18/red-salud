"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import type { FullDoctorProfile } from "@/lib/services/appointments/appointments.types";
import { DoctorProfileHero } from "./doctor-profile-hero";
import { DoctorProfileSidebar } from "./doctor-profile-sidebar";
import {
  DoctorProfileTabs,
  type DoctorProfileTabId,
} from "./doctor-profile-tabs";
import { TabAcerca } from "./tabs/tab-acerca";
import { TabServicios } from "./tabs/tab-servicios";
import { TabUbicacion } from "./tabs/tab-ubicacion";
import { TabTarifas } from "./tabs/tab-tarifas";
import { TabCredenciales } from "./tabs/tab-credenciales";
import { TabResenas } from "./tabs/tab-resenas";

interface DoctorProfileViewProps {
  doctor: FullDoctorProfile;
}

export function DoctorProfileView({ doctor }: DoctorProfileViewProps) {
  const [activeTab, setActiveTab] = useState<DoctorProfileTabId>("acerca");

  const handleBook = () => {
    window.location.href = `/dashboard/agendar?doctor=${doctor.id}`;
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 lg:space-y-6">
      {/* Top breadcrumb */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/dashboard/buscar-medico"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a buscar médicos
        </Link>
        {doctor.sacs_verified && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
            <ShieldCheck className="h-3 w-3" />
            SACS verificado
          </span>
        )}
      </div>

      {/* Layout: hero (full width) + main/aside grid */}
      <DoctorProfileHero doctor={doctor} onBook={handleBook} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
        {/* Main content */}
        <main className="space-y-4">
          <DoctorProfileTabs
            doctor={doctor}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === "acerca" && <TabAcerca doctor={doctor} />}
          {activeTab === "servicios" && <TabServicios doctor={doctor} />}
          {activeTab === "resenas" && <TabResenas doctor={doctor} />}
          {activeTab === "ubicacion" && <TabUbicacion doctor={doctor} />}
          {activeTab === "tarifas" && <TabTarifas doctor={doctor} />}
          {activeTab === "credenciales" && <TabCredenciales doctor={doctor} />}
        </main>

        {/* Sticky sidebar on lg+ */}
        <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto scrollbar-hide">
          <DoctorProfileSidebar doctor={doctor} onBook={handleBook} />
        </aside>
      </div>

      {/* Mobile sticky CTA at bottom (above mobile-tab-bar) */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 backdrop-blur-md p-3 lg:hidden">
        <button
          type="button"
          onClick={handleBook}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-colors"
        >
          <CalendarPlus className="h-4 w-4" />
          Agendar cita
          {doctor.consultation_fee != null && (
            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
              ${doctor.consultation_fee.toFixed(2)}
            </span>
          )}
          {doctor.accepts_new_patients && (
            <CheckCircle2 className="h-3.5 w-3.5 ml-1 opacity-80" />
          )}
        </button>
      </div>

      {/* Spacer to compensate for the mobile sticky CTA so the last tab
          content is not hidden behind it. */}
      <div className="h-20 lg:hidden" aria-hidden />
    </div>
  );
}
