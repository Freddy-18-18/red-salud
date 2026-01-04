"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMedicalSpecialties, useAvailableDoctors, useAvailableTimeSlots, useCreateAppointment } from "@/hooks/use-appointments";
import { ArrowLeft, Video, MapPin, Phone, Check } from "lucide-react";
import { SpecialtyGrid } from "@/components/dashboard/paciente/components/specialty-grid";
import { DoctorSelector } from "@/components/dashboard/paciente/components/doctor-selector";
import { DateTimePicker } from "@/components/dashboard/paciente/components/date-time-picker";
import { ConsultationTypeSelector } from "@/components/dashboard/paciente/components/consultation-type-selector";
import { AppointmentSummary } from "@/components/dashboard/paciente/components/appointment-summary";
import Link from "next/link";
import { es } from "date-fns/locale";

export default function NuevaCitaPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [consultationType, setConsultationType] = useState<"video" | "presencial" | "telefono">(
    "video"
  );
  const [reason, setReason] = useState("");

  const router = useRouter();
  const { specialties } = useMedicalSpecialties(true); // Solo especialidades con médicos
  const { doctors } = useAvailableDoctors(selectedSpecialty || undefined);
  const { timeSlots, loading: timeSlotsLoading } = useAvailableTimeSlots(
    selectedDoctor || undefined,
    selectedDate?.toISOString().split("T")[0]
  );
  const { create, loading: creating } = useCreateAppointment();
  
  // Estado para búsqueda de especialidades
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
    };

    checkUser();
  }, [router]);

  

  const handleSubmit = async () => {
    if (!userId || !selectedDoctor || !selectedDate || !selectedTime) return;

    const result = await create(userId, {
      doctor_id: selectedDoctor,
      appointment_date: selectedDate.toISOString().split("T")[0],
      appointment_time: selectedTime,
      consultation_type: consultationType,
      reason: reason || undefined,
    });

    if (result.success) {
      router.push("/dashboard/paciente/citas");
    }
  };

  const selectedDoctorData = doctors.find((d) => d.id === selectedDoctor);
  const availableTimeSlots = timeSlots.filter((slot) => slot.available);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard/paciente/citas">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Agendar Nueva Cita</h1>
        <p className="text-muted-foreground mt-1">
          Sigue los pasos para agendar tu cita médica
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s ? <Check className="h-5 w-5" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`flex-1 h-1 mx-2 ${step > s ? "bg-primary" : "bg-muted"}`}
              />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <SpecialtyGrid
          specialties={specialties as any}
          selectedSpecialty={selectedSpecialty}
          onSelected={(id) => { setSelectedSpecialty(id); setSelectedDoctor(""); }}
          onContinue={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <DoctorSelector
          doctors={doctors as any}
          selectedDoctor={selectedDoctor}
          selectedSpecialtyName={specialties.find(s => s.id === selectedSpecialty)?.name}
          onSelect={setSelectedDoctor}
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <DateTimePicker
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          timeSlots={timeSlots as any}
          timeSlotsLoading={timeSlotsLoading}
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
          onBack={() => setStep(2)}
          onContinue={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Consulta</CardTitle>
            <CardDescription>Completa la información de tu cita</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ConsultationTypeSelector consultationType={consultationType} onChange={setConsultationType} />
            <div>
              <Label htmlFor="reason">Motivo de la Consulta (Opcional)</Label>
              <Textarea id="reason" placeholder="Describe brevemente el motivo de tu consulta..." value={reason} onChange={(e) => setReason(e.target.value)} rows={4} className="mt-2" />
            </div>
            <AppointmentSummary doctorName={selectedDoctorData?.profile?.nombre_completo} doctorFee={selectedDoctorData?.tarifa_consulta ?? null} date={selectedDate} time={selectedTime} type={consultationType} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">Atrás</Button>
              <Button onClick={handleSubmit} disabled={creating} className="flex-1">{creating ? "Agendando..." : "Confirmar Cita"}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
