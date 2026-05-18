"use client";

import {
  GraduationCap,
  Info,
  MapPin,
  MessageSquareText,
  Stethoscope,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { FullDoctorProfile } from "@/lib/services/appointments/appointments.types";

export type DoctorProfileTabId =
  | "acerca"
  | "servicios"
  | "resenas"
  | "ubicacion"
  | "tarifas"
  | "credenciales";

interface TabDef {
  id: DoctorProfileTabId;
  label: string;
  icon: LucideIcon;
  /** Hide the tab completely if false */
  show: (d: FullDoctorProfile) => boolean;
}

const TABS: TabDef[] = [
  {
    id: "acerca",
    label: "Acerca",
    icon: Info,
    show: () => true,
  },
  {
    id: "servicios",
    label: "Servicios",
    icon: Stethoscope,
    show: (d) =>
      Boolean(
        (d.subspecialties && d.subspecialties.length) ||
          (d.specialization_areas && d.specialization_areas.length) ||
          (d.conditions_treated && d.conditions_treated.length) ||
          (d.age_groups && d.age_groups.length) ||
          d.accepts_telemedicine,
      ),
  },
  {
    id: "resenas",
    label: "Reseñas",
    icon: MessageSquareText,
    show: () => true,
  },
  {
    id: "ubicacion",
    label: "Ubicación",
    icon: MapPin,
    show: (d) => Boolean(d.clinic_address || d.clinic_phone),
  },
  {
    id: "tarifas",
    label: "Tarifas",
    icon: Wallet,
    show: (d) =>
      d.consultation_fee != null ||
      d.accepts_insurance != null ||
      Boolean(d.accepted_insurances && d.accepted_insurances.length),
  },
  {
    id: "credenciales",
    label: "Credenciales",
    icon: GraduationCap,
    show: (d) =>
      Boolean(
        d.university ||
          d.medical_license ||
          d.college_number ||
          (d.certifications && d.certifications.length) ||
          (d.awards && d.awards.length) ||
          (d.publications && d.publications.length) ||
          (d.associations && d.associations.length) ||
          (d.work_experience && d.work_experience.length),
      ),
  },
];

interface DoctorProfileTabsProps {
  doctor: FullDoctorProfile;
  activeTab: DoctorProfileTabId;
  onTabChange: (id: DoctorProfileTabId) => void;
}

export function DoctorProfileTabs({
  doctor,
  activeTab,
  onTabChange,
}: DoctorProfileTabsProps) {
  const visible = TABS.filter((t) => t.show(doctor));

  return (
    <nav
      role="tablist"
      aria-label="Secciones del perfil del doctor"
      className="overflow-x-auto scrollbar-hide -mx-1 px-1"
    >
      <div className="inline-flex min-w-full gap-1 border-b border-[hsl(var(--border))]">
        {visible.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(tab.id)}
              className={`relative inline-flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-emerald-600"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
