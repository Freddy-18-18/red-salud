"use client";

import { Stethoscope } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { DoctorCard } from "@/components/ui/doctor-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { SmartSearch } from "@/components/triage/smart-search";
import { useAvailableDoctors } from "@/hooks/use-appointments";

export default function BuscarMedicoPage() {
  const searchParams = useSearchParams();
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<
    string | undefined
  >();

  // When the user comes from a deep link (specialty page → "Ver doctores"
  // or smart-search → "Ver doctores"), preselect the specialty so the page
  // immediately shows the doctor list without needing another click.
  useEffect(() => {
    const specialty = searchParams.get("specialty");
    if (specialty) setSelectedSpecialtyId(specialty);
    else setSelectedSpecialtyId(undefined);
  }, [searchParams]);

  const { doctors, loading } = useAvailableDoctors(selectedSpecialtyId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))]">
            Buscar Médico
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Buscá doctor, especialidad, ciudad — o contanos lo que sentís.
          </p>
        </div>
        <nav className="flex flex-wrap gap-2 text-xs font-medium">
          <Link
            href="/dashboard/buscar-medico/mapa"
            className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-[hsl(var(--foreground))] transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            Vista mapa
          </Link>
          <Link
            href="/dashboard/buscar-medico/favoritos"
            className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-[hsl(var(--foreground))] transition-colors hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            Mis guardados
          </Link>
        </nav>
      </div>

      {/* Single unified search */}
      <SmartSearch />

      {/* Doctor list — only when a specialty has been chosen via deep link */}
      {selectedSpecialtyId && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
              Médicos disponibles
              <span className="ml-1 font-normal text-[hsl(var(--muted-foreground))]">
                ({doctors.length})
              </span>
            </h2>
            <button
              type="button"
              onClick={() => setSelectedSpecialtyId(undefined)}
              className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-300"
            >
              Limpiar filtro
            </button>
          </div>
          {loading ? (
            <SkeletonList count={3} />
          ) : doctors.length > 0 ? (
            <div className="space-y-3">
              {doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  id={doctor.id}
                  slug={(doctor as { slug?: string | null }).slug}
                  name={doctor.profile?.full_name || "Médico"}
                  specialty={doctor.specialty?.name || ""}
                  avatarUrl={doctor.profile?.avatar_url}
                  fee={doctor.consultation_fee}
                  yearsExperience={doctor.years_experience}
                  verified={doctor.verified}
                  sacsVerified={
                    (doctor as { sacs_verified?: boolean | null }).sacs_verified
                  }
                  acceptsTelemedicine={
                    (doctor as { accepts_telemedicine?: boolean | null })
                      .accepts_telemedicine
                  }
                  acceptsInsurance={
                    (doctor as { accepts_insurance?: boolean | null })
                      .accepts_insurance
                  }
                  languages={
                    (doctor as { languages?: string[] | null }).languages
                  }
                  subspecialties={
                    (doctor as { subspecialties?: string[] | null })
                      .subspecialties
                  }
                  totalConsultations={
                    (doctor as { total_consultations?: number | null })
                      .total_consultations
                  }
                  rating={
                    (doctor as { avg_rating?: number | null }).avg_rating ??
                    undefined
                  }
                  reviewCount={
                    (doctor as { review_count?: number }).review_count
                  }
                  onBook={() => {
                    window.location.href = `/dashboard/agendar?doctor=${doctor.id}`;
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Stethoscope}
              title="No hay médicos disponibles"
              description="Aún no hay doctores en esta especialidad."
            />
          )}
        </section>
      )}
    </div>
  );
}
