"use client";

import { AlertCircle } from "lucide-react";

import { BookingDetails } from "@/components/booking/booking-details";
import { BookingSuccess } from "@/components/booking/booking-success";
import { BookingSummary } from "@/components/booking/booking-summary";
import { CalendarPicker } from "@/components/booking/calendar-picker";
import { DoctorList } from "@/components/booking/doctor-list";
import { SpecialtyGrid } from "@/components/booking/specialty-grid";
import { StepIndicator } from "@/components/booking/step-indicator";
import { TimeSlotGrid } from "@/components/booking/time-slot-grid";
import { useBooking } from "@/hooks/use-booking";


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
  const booking = useBooking();
  const { state } = booking;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      {state.step !== "success" && (
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Agendar Cita
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Encuentra tu doctor y agenda tu consulta en minutos
            </p>
          </div>

          <StepIndicator
            currentStep={state.step}
            currentStepIndex={booking.currentStepIndex}
            onStepClick={(step) => {
              // Only allow going back to completed steps
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

      {/* Global error (not step-specific) */}
      {booking.error && state.step !== "confirm" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{booking.error}</p>
        </div>
      )}

      {/* Step 1: Specialty */}
      {state.step === "specialty" && (
        <SpecialtyGrid
          specialties={booking.specialties}
          loading={booking.loadingSpecialties}
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
