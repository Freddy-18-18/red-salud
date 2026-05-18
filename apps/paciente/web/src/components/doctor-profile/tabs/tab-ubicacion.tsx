"use client";

import { ExternalLink, MapPin, Phone } from "lucide-react";

import type { FullDoctorProfile } from "@/lib/services/appointments/appointments.types";

interface TabUbicacionProps {
  doctor: FullDoctorProfile;
}

export function TabUbicacion({ doctor }: TabUbicacionProps) {
  const address = doctor.clinic_address?.trim();
  const phone = doctor.clinic_phone?.trim();
  const mapsHref = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null;

  return (
    <section
      role="tabpanel"
      aria-label="Ubicación del consultorio"
      className="space-y-4"
    >
      <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <h2 className="inline-flex items-center gap-2 text-base font-bold text-[hsl(var(--foreground))]">
          <MapPin className="h-4 w-4 text-emerald-600" />
          Consultorio
        </h2>
        {address ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-[hsl(var(--foreground))]">{address}</p>
            {[doctor.profile.city, doctor.profile.state]
              .filter(Boolean)
              .join(", ") && (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {[doctor.profile.city, doctor.profile.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            {mapsHref && (
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ver en Google Maps
              </a>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm italic text-[hsl(var(--muted-foreground))]">
            Este doctor aún no ha registrado la dirección de su consultorio.
          </p>
        )}
      </article>

      {phone && (
        <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--foreground))]">
            <Phone className="h-4 w-4 text-emerald-600" />
            Teléfono del consultorio
          </h3>
          <a
            href={`tel:${phone}`}
            className="mt-2 inline-flex items-center text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300"
          >
            {phone}
          </a>
          <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
            Para confirmaciones de cita o emergencias contactate por la app —
            así queda registro.
          </p>
        </article>
      )}
    </section>
  );
}
