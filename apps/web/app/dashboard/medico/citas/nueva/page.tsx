"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@red-salud/ui";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { searchConsultationReasons } from "@/lib/data/consultation-reasons";

// React Hook Form & Zod
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentSchema, AppointmentFormValues } from "@/lib/validations/appointment";

// Components
import { PatientSelector } from "@/components/citas/nueva/patient-selector";
import { AppointmentForm } from "@/components/citas/nueva/appointment-form";
import { SummaryView } from "@/components/citas/nueva/summary-view";

function NuevaCitaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictingAppointments, setConflictingAppointments] = useState<any[]>([]);

  const [schedules, setSchedules] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);

  // Obtener fecha, hora y paciente de los parámetros URL
  const dateParam = searchParams.get("date");
  const hourParam = searchParams.get("hour");
  const pacienteParam = searchParams.get("paciente");

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      paciente_id: pacienteParam || "",
      fecha: dateParam ? format(new Date(dateParam), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      hora: hourParam ? `${hourParam.padStart(2, "0")}:00` : "09:00",
      duracion_minutos: 30,
      tipo_cita: "presencial",
      motivo: "",
      notas_internas: "",
      precio: "",
      metodo_pago: "efectivo",
      enviar_recordatorio: true,
    },
  });

  const { watch, handleSubmit } = form;
  const fecha = watch("fecha");
  const hora = watch("hora");
  const motivo = watch("motivo");

  // Validar que la fecha no sea pasada
  const getMinDate = () => {
    return format(new Date(), "yyyy-MM-dd");
  };

  const getMinTime = () => {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");

    // Si es hoy, la hora mínima es la actual + 15 minutos
    if (fecha === today) {
      const minTime = new Date(now.getTime() + 15 * 60000); // +15 minutos
      return format(minTime, "HH:mm");
    }
    return "00:00";
  };

  // Validar que la hora seleccionada no sea pasada
  const isTimeValid = () => {
    if (!fecha || !hora) return true;

    const selectedDateTime = new Date(`${fecha}T${hora}:00`);
    const now = new Date();

    return selectedDateTime > now;
  };

  // Estado para sugerencias de motivo
  const [motivoSuggestions, setMotivoSuggestions] = useState<string[]>([]);

  // Función para obtener el término actual (después de la última coma)
  const getCurrentMotivo = (text: string) => {
    const lastCommaIndex = text.lastIndexOf(",");
    if (lastCommaIndex === -1) {
      return text.trim();
    }
    return text.substring(lastCommaIndex + 1).trim();
  };

  // Actualizar sugerencias cuando cambia el motivo
  useEffect(() => {
    if (!motivo) {
      setMotivoSuggestions([]);
      return;
    }
    const currentTerm = getCurrentMotivo(motivo);
    if (currentTerm.length >= 2) {
      const suggestions = searchConsultationReasons(currentTerm);
      setMotivoSuggestions(suggestions);
    } else {
      setMotivoSuggestions([]);
    }
  }, [motivo]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Cargar pacientes registrados
      const { data: registeredPatients } = await supabase
        .from("doctor_patients")
        .select(`
          patient_id,
          patient:profiles!doctor_patients_patient_id_fkey(
            id,
            nombre_completo,
            email
          )
        `)
        .eq("doctor_id", user.id);

      // Cargar pacientes offline
      const { data: offlinePatients } = await supabase
        .from("offline_patients")
        .select("id, nombre_completo, cedula")
        .eq("doctor_id", user.id)
        .eq("status", "offline");

      const allPatients = [
        ...(registeredPatients?.map((rp: any) => ({
          id: rp.patient.id,
          nombre_completo: rp.patient.nombre_completo,
          email: rp.patient.email,
          cedula: null,
          type: "registered",
        })) || []),
        ...(offlinePatients?.map((op: any) => ({
          id: op.id,
          nombre_completo: op.nombre_completo,
          email: null,
          cedula: op.cedula,
          type: "offline",
        })) || []),
      ];

      setPatients(allPatients);

      // Cargar horarios
      const { data: schedulesData } = await supabase
        .from("doctor_schedules")
        .select("*")
        .eq("doctor_id", user.id);
      setSchedules(schedulesData || []);

      // Cargar consultorios
      const { data: officesData } = await supabase
        .from("doctor_offices")
        .select("id, nombre")
        .eq("doctor_id", user.id);
      setOffices(officesData || []);

    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Verificar conflictos de horario
  const checkTimeConflicts = async (fecha: string, hora: string, duracion: number) => {
    if (!fecha || !hora) return;

    setCheckingConflict(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDateTime = new Date(`${fecha}T${hora}:00`);
      const endDateTime = new Date(startDateTime.getTime() + duracion * 60000);

      // Buscar citas que se solapen con el horario seleccionado
      const { data: conflicts } = await supabase
        .from('appointments')
        .select(`
          id,
          fecha_hora,
          duracion_minutos,
          motivo,
          paciente:profiles!appointments_paciente_id_fkey(nombre_completo),
          offline_patient:offline_patients!appointments_offline_patient_id_fkey(nombre_completo)
        `)
        .eq('medico_id', user.id)
        .gte('fecha_hora', startDateTime.toISOString())
        .lt('fecha_hora', endDateTime.toISOString())
        .neq('status', 'cancelada');

      // También verificar citas que empiezan antes pero terminan durante el horario seleccionado
      const { data: conflictsOverlapping } = await supabase
        .from('appointments')
        .select(`
          id,
          fecha_hora,
          duracion_minutos,
          motivo,
          paciente:profiles!appointments_paciente_id_fkey(nombre_completo),
          offline_patient:offline_patients!appointments_offline_patient_id_fkey(nombre_completo)
        `)
        .eq('medico_id', user.id)
        .lt('fecha_hora', startDateTime.toISOString())
        .neq('status', 'cancelada');

      // Filtrar las que realmente se solapan
      const overlapping = conflictsOverlapping?.filter(apt => {
        const aptStart = new Date(apt.fecha_hora);
        const aptEnd = new Date(aptStart.getTime() + apt.duracion_minutos * 60000);
        return aptEnd > startDateTime;
      }) || [];

      const allConflicts = [...(conflicts || []), ...overlapping];
      setConflictingAppointments(allConflicts);

      if (allConflicts.length > 0) {
        const conflictList = allConflicts.map(apt => {
          const patientName = apt.paciente?.nombre_completo || apt.offline_patient?.nombre_completo || 'Paciente';
          const time = format(new Date(apt.fecha_hora), 'HH:mm');
          return `${time} - ${patientName}`;
        }).join(', ');

        setError(
          `⚠️ Conflicto de horario: Ya tienes ${allConflicts.length} cita(s) programada(s): ${conflictList}. ` +
          `Por favor, elige otro horario.`
        );
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error checking conflicts:', err);
    } finally {
      setCheckingConflict(false);
    }
  };

  // Verificar conflictos cuando cambian fecha, hora o duración
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      const duracion = value.duracion_minutos;
      if (fecha && hora && duracion) {
        const timeoutId = setTimeout(() => {
          checkTimeConflicts(fecha, hora, duracion);
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    });
    return () => subscription.unsubscribe();
  }, [fecha, hora]);

  const onSubmit = async (data: AppointmentFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }

      let finalPacienteId = data.paciente_id;
      let isOffline = false;

      // Handle NEW patient creation
      if (data.paciente_id === "NEW" && data.new_patient_data) {
        try {
          const { data: newPatient, error: createError } = await supabase
            .from("offline_patients")
            .insert({
              doctor_id: user.id,
              nombre_completo: data.new_patient_data.nombre_completo,
              cedula: data.new_patient_data.cedula,
              email: data.new_patient_data.email || null,
              status: "offline"
            })
            .select('id')
            .single();

          if (createError) throw createError;
          finalPacienteId = newPatient.id;
          isOffline = true;
        } catch (createErr: any) {
          console.error("Error creating offline patient:", createErr);
          setError("Error al registrar el nuevo paciente: " + createErr.message);
          setLoading(false);
          return;
        }
      } else {
        const selectedPatient = patients.find(p => p.id === data.paciente_id);
        isOffline = selectedPatient?.type === "offline";
      }

      // Validar que la hora no sea pasada (aunque zod ya lo hace)
      if (!isTimeValid()) {
        setError("La fecha y hora seleccionadas ya pasaron. Por favor, elige una hora futura.");
        setLoading(false);
        return;
      }

      // VALIDACIÓN CRÍTICA: Verificar conflictos una última vez antes de guardar
      const startDateTime = new Date(`${data.fecha}T${data.hora}:00`);
      const endDateTime = new Date(startDateTime.getTime() + data.duracion_minutos * 60000);

      const { data: finalConflictCheck } = await supabase
        .from('appointments')
        .select('id, fecha_hora, duracion_minutos')
        .eq('medico_id', user.id)
        .neq('status', 'cancelada');

      // Verificar solapamiento
      const hasConflict = finalConflictCheck?.some(apt => {
        const aptStart = new Date(apt.fecha_hora);
        const aptEnd = new Date(aptStart.getTime() + apt.duracion_minutos * 60000);
        return (
          (startDateTime >= aptStart && startDateTime < aptEnd) ||
          (endDateTime > aptStart && endDateTime <= aptEnd) ||
          (startDateTime <= aptStart && endDateTime >= aptEnd)
        );
      });

      if (hasConflict) {
        setError('⛔ No se puede crear la cita: Ya existe una cita programada en este horario. Por favor, elige otro horario.');
        setLoading(false);
        return;
      }

      // Validar conflictos (usando finalPacienteId si es necesario, pero el conflicto es por horario)
      // ... (existing conflict check logic logic remains mostly same but we use finalPacienteId logic below)

      // Combinar fecha y hora
      const fechaHora = new Date(`${data.fecha}T${data.hora}:00`);

      // Determinar color según tipo de cita
      const colors: Record<string, string> = {
        presencial: "#3B82F6",
        telemedicina: "#10B981",
        urgencia: "#EF4444",
        seguimiento: "#8B5CF6",
        primera_vez: "#F59E0B",
      };

      // Generar URL de videollamada si es telemedicina (solo para pacientes registrados)
      const appointmentId = crypto.randomUUID();
      const meetingUrl = data.tipo_cita === "telemedicina" && !isOffline
        ? `https://meet.jit.si/cita-${appointmentId.substring(0, 8)}`
        : null;

      // Preparar datos de la cita
      const appointmentData: any = {
        id: appointmentId,
        medico_id: user.id,
        fecha_hora: fechaHora.toISOString(),
        duracion_minutos: data.duracion_minutos,
        tipo_cita: data.tipo_cita,
        motivo: data.motivo,
        notas_internas: data.notas_internas || null,
        status: "pendiente",
        color: colors[data.tipo_cita] || colors.presencial,
        price: data.precio ? parseFloat(data.precio) : null,
        meeting_url: meetingUrl,
        location_id: searchParams.get("officeId") || null,
        metodo_pago: data.metodo_pago,
        enviar_recordatorio: data.enviar_recordatorio,
      };

      // Asignar el ID correcto según el tipo de paciente
      if (isOffline) {
        appointmentData.offline_patient_id = finalPacienteId;
        appointmentData.paciente_id = null;
      } else {
        appointmentData.paciente_id = finalPacienteId;
        appointmentData.offline_patient_id = null;
      }

      console.log("📝 Intentando crear cita con datos:", appointmentData);
      console.log("📍 location_id enviado:", appointmentData.location_id);

      // Lógica robusta de inserción con reintento si falta la columna o hay error de FK
      let result;
      try {
        result = await supabase
          .from("appointments")
          .insert(appointmentData)
          .select()
          .single();

        if (result.error) throw result.error;
      } catch (firstError: any) {
        // PGRST204: Column not found
        // 42703: Undefined column (Postgres)
        // 23503: Foreign key violation (Postgres)
        const isSchemaError = firstError?.code === "PGRST204" || firstError?.code === "42703";
        const isFKError = firstError?.code === "23503";

        if (isSchemaError || isFKError) {
          console.warn(`⚠️ Error de base de datos detectado (${firstError?.code}). Reintentando sin ubicación...`);
          if (isFKError) console.error("❌ Error de FK original:", firstError.message);

          // Creamos una copia sin location_id
          const { location_id, ...fallbackData } = appointmentData;

          result = await supabase
            .from("appointments")
            .insert(fallbackData)
            .select()
            .single();

          if (result.error) throw result.error;
        } else {
          throw firstError;
        }
      }

      const createdAppointment = result.data;
      console.log("✅ Cita creada exitosamente:", createdAppointment);

      // Log de actividad
      await supabase.from("user_activity_log").insert({
        user_id: user.id,
        activity_type: "appointment_created",
        description: `Cita creada para ${fechaHora.toLocaleString()} ${searchParams.get("officeId") ? `en consultorio` : ""
          }`,
        status: "success",
      });

      router.push("/dashboard/medico/citas");
    } catch (err: any) {
      console.error("💥 Error creating appointment (FULL):", JSON.stringify(err, null, 2));
      console.error("💥 Error creating appointment (raw):", err);

      let errorMessage = "Error al crear la cita";
      if (err?.message) errorMessage = err.message;
      if (err?.details) errorMessage += ` (${err.details})`;

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VerificationGuard>
      <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-6 sm:py-6 pb-24 sm:pb-6">
        {/* Header minimalista */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </button>

        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 border-red-300 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* Conflictos detectados */}


        {conflictingAppointments.length > 0 && !error && (
          <Alert className="mb-6 border-yellow-300 bg-yellow-50">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="font-semibold mb-2">⚠️ Citas existentes en este horario:</div>
              <ul className="list-disc list-inside space-y-1">
                {conflictingAppointments.map((apt) => {
                  const patientName = apt.paciente?.nombre_completo || apt.offline_patient?.nombre_completo || 'Paciente';
                  return (
                    <li key={apt.id} className="text-sm">
                      {format(new Date(apt.fecha_hora), "HH:mm")} - {patientName} ({apt.motivo || 'Sin motivo'})
                    </li>
                  );
                })}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                <PatientSelector
                  patients={patients}
                  loadingPatients={loadingPatients}
                />

                <AppointmentForm
                  getMinDate={getMinDate}
                  getMinTime={getMinTime}
                  isTimeValid={isTimeValid}
                  motivoSuggestions={motivoSuggestions}
                  patients={patients}
                  schedules={schedules}
                  offices={offices}
                  selectedOfficeId={searchParams.get("officeId")}
                />
              </div>

              {/* Sidebar - Resumen compacto - Mobile: Bottom fixed / Desktop: Sticky sidebar */}
              <div className="fixed bottom-0 left-0 right-0 z-20 p-2 sm:hidden bg-background/80 backdrop-blur-md border-t border-border shadow-lg">
                <SummaryView loading={loading} patients={patients} isMobile={true} />
              </div>

              <div className="hidden sm:block">
                <SummaryView loading={loading} patients={patients} />
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </VerificationGuard>
  );
}

export default function NuevaCitaPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    }>
      <NuevaCitaContent />
    </Suspense>
  );
}
