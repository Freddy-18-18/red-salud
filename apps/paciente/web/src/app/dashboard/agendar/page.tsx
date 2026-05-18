"use client";

import { useEffect, useState } from "react";
import { AlertCircle, FileText, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { BookingDetails } from "@/components/booking/booking-details";
import { BookingSuccess } from "@/components/booking/booking-success";
import { BookingSummary } from "@/components/booking/booking-summary";
import { CalendarPicker } from "@/components/booking/calendar-picker";
import { DoctorList } from "@/components/booking/doctor-list";
import { SpecialtySearch } from "@/components/booking/specialty-search";
import { StepIndicator } from "@/components/booking/step-indicator";
import { TimeSlotGrid } from "@/components/booking/time-slot-grid";
import { useBooking } from "@/hooks/use-booking";
import type { Specialty } from "@/lib/services/booking-service";

interface ReferralSnapshot {
  id: string;
  specialty_id: string;
  reason: string;
  urgency: "electivo" | "prioritario" | "urgente";
  status: string;
  expires_at: string | null;
  target_specialty: { id: string; name: string };
}

// Direct specialties query via API route
function useDirectSpecialties() {
  const q = useQuery({
    queryKey: ["direct-specialties-v2"],
    queryFn: async () => {
      const res = await fetch("/api/specialties");
      if (!res.ok) throw new Error("Failed to fetch specialties");
      const { data } = await res.json();
      return (data || []) as Specialty[];
    },
  });
  return { specialties: q.data ?? [], loading: q.isLoading };
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  return date.toLocaleDateString("es-VE", options);
}

export default function AgendarCitaPage() {
  const searchParams = useSearchParams();
  const preselectedSpecialtyId = searchParams.get("specialty");
  const referralId = searchParams.get("referral");

  const booking = useBooking({ preselectedSpecialtyId, referralId });
  const { state } = booking;
  const directSpecialties = useDirectSpecialties();

  // Load referral snapshot to show contextual banner + auto-fill reason
  const [referral, setReferral] = useState<ReferralSnapshot | null>(null);
  useEffect(() => {
    if (!referralId) return;
    let cancelled = false;
    fetch(`/api/referrals/${referralId}/snapshot`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j?.data) return;
        setReferral(j.data);
        // Auto-fill reason if the user hasn't typed anything yet.
        if (!booking.state.reason && j.data.reason) {
          booking.setReason(j.data.reason);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralId]);

  // Lock body AND html scroll while on this route. The wizard owns the
  // viewport — every step fits inside the inner scroll area, never on the
  // page itself. Need both because some browsers scroll the html element
  // and others the body.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  return (
    // Viewport-locked layout at ALL breakpoints. The dashboard layout owns:
    //   - navbar (h-16 = 4rem)
    //   - main padding: p-4 + pb-20 on mobile (6rem total) / p-6 on lg (3rem)
    //   - mobile-tab-bar lives inside that pb-20 reserved space
    // Use dvh to handle iOS mobile browser chrome collapsing.
    // Each step's inner column owns its scroll — the page itself never scrolls.
    <div className="max-w-5xl mx-auto flex flex-col gap-3 h-[calc(100dvh-10rem)] lg:h-[calc(100dvh-7rem)] overflow-hidden">
      {/* Compact header: title row + inline step indicator share the same
          slim band so they don't eat the viewport. */}
      {state.step !== "success" && (
        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-[hsl(var(--foreground))] sm:text-xl">
                Agendar Cita
              </h1>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                Encuentra tu doctor y agenda tu consulta en minutos
              </p>
            </div>
          </div>

          <StepIndicator
            currentStep={state.step}
            currentStepIndex={booking.currentStepIndex}
            onStepClick={(step) => {
              const targetIdx = [
                "specialty",
                "doctor",
                "date",
                "time",
                "details",
                "confirm",
              ].indexOf(step);
              if (targetIdx < booking.currentStepIndex) {
                booking.goToStep(step);
              }
            }}
          />
        </div>
      )}

      {/* Referral context banner — shown across every step except success */}
      {referral && state.step !== "success" && (
        <div className="shrink-0 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <FileText className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
              Agendando con tu referencia de {referral.target_specialty.name}
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-900/85 dark:text-emerald-200/85">
              Pre-seleccionamos la especialidad y el motivo. Cuando confirmes
              la cita, el contexto clínico viajará al especialista que elijas.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-white/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
            <ShieldCheck className="h-3 w-3" />
            Referencia
          </span>
        </div>
      )}

      {/* Global error (not step-specific) */}
      {booking.error && state.step !== "confirm" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{booking.error}</p>
        </div>
      )}

      {/* Step 1: Specialty */}
      {state.step === "specialty" && (
        <SpecialtySearch
          specialties={directSpecialties.specialties}
          loading={directSpecialties.loading}
          selected={state.specialty}
          onSelect={booking.selectSpecialty}
          onContinue={booking.nextStep}
        />
      )}

      {/* Step 2: Doctor */}
      {state.step === "doctor" && (
        <DoctorList
          doctors={booking.doctors}
          loading={booking.loadingDoctors}
          selected={state.doctor}
          specialtyName={state.specialty?.name || ""}
          filters={booking.doctorFilters}
          onFiltersChange={booking.setDoctorFilters}
          onSelect={booking.selectDoctor}
          onBack={booking.prevStep}
          onContinue={booking.nextStep}
        />
      )}

      {/* Step 3: Date */}
      {state.step === "date" && (
        <CalendarPicker
          availableDates={booking.availableDates}
          loading={booking.loadingDates}
          selectedDate={state.date}
          doctorName={state.doctor?.profile.full_name || ""}
          onSelectDate={booking.selectDate}
          onBack={booking.prevStep}
          onContinue={booking.nextStep}
        />
      )}

      {/* Step 4: Time */}
      {state.step === "time" && (
        <TimeSlotGrid
          groups={booking.timeSlotGroups}
          loading={booking.loadingSlots}
          selectedSlot={state.timeSlot}
          dateLabel={state.date ? formatDateLabel(state.date) : ""}
          onSelect={booking.selectTimeSlot}
          onBack={booking.prevStep}
          onContinue={booking.nextStep}
        />
      )}

      {/* Step 5: Details */}
      {state.step === "details" && (
        <BookingDetails
          appointmentType={state.appointmentType}
          reason={state.reason}
          notes={state.notes}
          onTypeChange={booking.setAppointmentType}
          onReasonChange={booking.setReason}
          onNotesChange={booking.setNotes}
          onBack={booking.prevStep}
          onContinue={booking.nextStep}
        />
      )}

      {/* Step 6: Confirm */}
      {state.step === "confirm" && (
        <BookingSummary
          state={state}
          loading={booking.loadingSubmit}
          error={booking.error}
          onConfirm={booking.confirmAppointment}
          onBack={booking.prevStep}
        />
      )}

      {/* Step 7: Success */}
      {state.step === "success" && (
        <BookingSuccess
          state={state}
          appointment={booking.createdAppointment}
          onBookAnother={booking.resetBooking}
        />
      )}
    </div>
  );
}
