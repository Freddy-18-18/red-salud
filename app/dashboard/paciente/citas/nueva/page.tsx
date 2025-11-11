"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useMedicalSpecialties,
  useAvailableDoctors,
  useAvailableTimeSlots,
  useCreateAppointment,
} from "@/hooks/use-appointments";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Video, MapPin, Phone, Check, Search, User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSpecialties, setFilteredSpecialties] = useState(specialties);

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

  // Filtrar especialidades cuando cambia la búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSpecialties(specialties);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = specialties.filter((specialty) => {
      const nameMatch = specialty.name?.toLowerCase().includes(query);
      const descMatch = specialty.description?.toLowerCase().includes(query);
      return nameMatch || descMatch;
    });
    
    console.log('🔍 Search query:', query);
    console.log('📋 All specialties:', specialties.length, specialties);
    console.log('✅ Filtered specialties:', filtered.length, filtered);
    
    setFilteredSpecialties(filtered);
  }, [searchQuery, specialties]);

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

      {/* Step 1: Especialidad */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Selecciona una Especialidad</CardTitle>
            <CardDescription>Elige el tipo de consulta que necesitas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar especialidad (ej: Cardiología, Pediatría, Dermatología...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Contador de resultados */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {filteredSpecialties.length} especialidad{filteredSpecialties.length !== 1 ? "es" : ""} disponible{filteredSpecialties.length !== 1 ? "s" : ""}
              </span>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="h-auto p-0 text-primary hover:text-primary/80"
                >
                  Limpiar búsqueda
                </Button>
              )}
            </div>

            {/* Grid de especialidades - 4 columnas x 3 filas */}
            {filteredSpecialties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {filteredSpecialties.slice(0, 12).map((specialty) => (
                  <button
                    key={specialty.id}
                    onClick={() => {
                      setSelectedSpecialty(specialty.id);
                      setSelectedDoctor("");
                    }}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedSpecialty === specialty.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <h3 className="font-semibold text-sm">{specialty.name}</h3>
                    {specialty.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {specialty.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No se encontraron especialidades que coincidan con "{searchQuery}"
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="mt-4"
                >
                  Ver todas las especialidades
                </Button>
              </div>
            )}

            <Button
              onClick={() => setStep(2)}
              disabled={!selectedSpecialty}
              className="w-full"
            >
              Continuar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Doctor */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Selecciona un Doctor</CardTitle>
            <CardDescription>
              {doctors.length} doctor{doctors.length !== 1 ? "es" : ""} disponible{doctors.length !== 1 ? "s" : ""} en {specialties.find(s => s.id === selectedSpecialty)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {doctors.length > 0 ? (
              <>
                <div className="space-y-3">
                  {doctors.map((doctor: any) => (
                    <button
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor.id)}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                        selectedDoctor === doctor.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "hover:border-primary/50 hover:shadow"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {doctor.profile?.avatar_url ? (
                            <img
                              src={doctor.profile.avatar_url}
                              alt={doctor.profile?.nombre_completo || "Doctor"}
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-semibold text-primary">
                              {doctor.profile?.nombre_completo?.charAt(0) || "D"}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">
                                Dr. {doctor.profile?.nombre_completo || "Médico"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {doctor.specialty?.name}
                              </p>
                            </div>
                            {doctor.verified && (
                              <Badge className="bg-green-100 text-green-800">
                                Verificado
                              </Badge>
                            )}
                          </div>
                          <div className="mt-2 space-y-1">
                            {doctor.anos_experiencia > 0 && (
                              <p className="text-sm text-gray-600">
                                ⭐ {doctor.anos_experiencia} años de experiencia
                              </p>
                            )}
                            {doctor.tarifa_consulta && (
                              <p className="text-sm font-medium text-green-600">
                                💵 ${doctor.tarifa_consulta.toFixed(2)} por consulta
                              </p>
                            )}
                            {(doctor.direccion || doctor.ciudad) && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {doctor.ciudad && doctor.estado 
                                  ? `${doctor.ciudad}, ${doctor.estado}`
                                  : doctor.direccion || doctor.ciudad || doctor.estado}
                              </p>
                            )}
                            {doctor.telefono && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {doctor.telefono}
                              </p>
                            )}
                            {doctor.horario && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Horarios disponibles
                              </p>
                            )}
                            {doctor.biografia && (
                              <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                                {doctor.biografia}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Atrás
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!selectedDoctor}
                    className="flex-1"
                  >
                    Continuar
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay médicos disponibles
                </h3>
                <p className="text-gray-600 mb-4">
                  Aún no hay médicos verificados en esta especialidad
                </p>
                <Button variant="outline" onClick={() => setStep(1)}>
                  Elegir Otra Especialidad
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Fecha y Hora */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Selecciona Fecha y Hora</CardTitle>
            <CardDescription>Elige cuándo quieres tu consulta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block">Fecha</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={es}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>
              <div>
                <Label className="mb-2 block">Hora Disponible</Label>
                {selectedDate ? (
                  timeSlotsLoading ? (
                    <p className="text-sm text-muted-foreground">Cargando horarios...</p>
                  ) : availableTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`p-2 border rounded text-sm ${
                            selectedTime === slot.time
                              ? "border-primary bg-primary text-primary-foreground"
                              : "hover:border-primary/50"
                          }`}
                        >
                          {slot.time.slice(0, 5)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay horarios disponibles para esta fecha
                    </p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Selecciona una fecha primero
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Atrás
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!selectedDate || !selectedTime}
                className="flex-1"
              >
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Detalles */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Consulta</CardTitle>
            <CardDescription>Completa la información de tu cita</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-2 block">Tipo de Consulta</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setConsultationType("video")}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${
                    consultationType === "video"
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                >
                  <Video className="h-6 w-6" />
                  <span className="text-sm font-medium">Videollamada</span>
                </button>
                <button
                  onClick={() => setConsultationType("presencial")}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${
                    consultationType === "presencial"
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                >
                  <MapPin className="h-6 w-6" />
                  <span className="text-sm font-medium">Presencial</span>
                </button>
                <button
                  onClick={() => setConsultationType("telefono")}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${
                    consultationType === "telefono"
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                >
                  <Phone className="h-6 w-6" />
                  <span className="text-sm font-medium">Teléfono</span>
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Motivo de la Consulta (Opcional)</Label>
              <Textarea
                id="reason"
                placeholder="Describe brevemente el motivo de tu consulta..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            {/* Resumen */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h3 className="font-semibold mb-3">Resumen de la Cita</h3>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Doctor:</span>{" "}
                  {selectedDoctorData?.profile?.nombre_completo}
                </p>
                <p>
                  <span className="text-muted-foreground">Fecha:</span>{" "}
                  {selectedDate?.toLocaleDateString("es-ES")}
                </p>
                <p>
                  <span className="text-muted-foreground">Hora:</span>{" "}
                  {selectedTime?.slice(0, 5)}
                </p>
                <p>
                  <span className="text-muted-foreground">Tipo:</span>{" "}
                  {consultationType === "video"
                    ? "Videollamada"
                    : consultationType === "presencial"
                    ? "Presencial"
                    : "Teléfono"}
                </p>
                {selectedDoctorData?.tarifa_consulta && (
                  <p className="font-semibold mt-2">
                    Total: ${selectedDoctorData.tarifa_consulta.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                Atrás
              </Button>
              <Button onClick={handleSubmit} disabled={creating} className="flex-1">
                {creating ? "Agendando..." : "Confirmar Cita"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
