"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@red-salud/design-system";
import { appointmentFormSchema, type AppointmentFormValues } from "@red-salud/sdk-medico";
import { format } from "date-fns";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { FormProvider, type Resolver, type SubmitHandler, useForm } from "react-hook-form";

import { AppointmentForm } from "@/components/citas/nueva/appointment-form";
import { PatientSelector } from "@/components/citas/nueva/patient-selector";
import { SummaryView } from "@/components/citas/nueva/summary-view";
import { RecurrenceFields, type RecurrenceConfig } from "@/components/citas/recurrence-fields";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { searchConsultationReasons } from "@/lib/data/consultation-reasons";
import { useAppointmentSeries, type RecurrenceType } from "@/hooks/use-appointment-series";
import { supabase } from "@/lib/supabase/client";

interface Patient {
  id: string;
  nombre_completo: string;
  email: string | null;
  cedula: string | null;
  type: "registered" | "offline";
}

interface TimeRange {
  inicio: string;
  fin: string;
}

interface DaySchedule {
  activo: boolean;
  horarios: TimeRange[];
}

interface Schedule {
  office_id?: string;
  horarios?: {
    [key: string]: DaySchedule;
  };
}

interface Office {
  id: string;
  nombre: string;
}

interface AppointmentConflict {
  id: string;
  fecha_hora: string;
  duracion_minutos: number;
  motivo: string | null;
  paciente: { nombre_completo: string } | { nombre_completo: string }[] | null;
  offline_patient: { nombre_completo: string } | { nombre_completo: string }[] | null;
}

interface RegisteredPatientResult {
  patient_id: string;
  patient: {
    id: string;
    nombre_completo: string;
    email: string | null;
  } | {
    id: string;
    nombre_completo: string;
    email: string | null;
  }[] | null;
}

function NuevaCitaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [conflictingAppointments, setConflictingAppointments] = useState<AppointmentConflict[]>([]);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [doctorSpecialty, setDoctorSpecialty] = useState<string>('Medicina Interna');

  // ── Citas recurrentes ────────────────────────────────────────────────────
  const [recurrenceConfig, setRecurrenceConfig] = useState<RecurrenceConfig>({
    enabled: false,
    type: "weekly",
    interval: 1,
    days: [],
    endsOn: "never",
    endDate: "",
    maxCount: 10,
  });
  const [seriesDoctorId, setSeriesDoctorId] = useState<string | null>(null);
  const { createSeries } = useAppointmentSeries(seriesDoctorId);

  // Obtener fecha, hora y paciente de los parámetros URL
  const dateParam = searchParams.get("date");
  const hourParam = searchParams.get("hour");
  const pacienteParam = searchParams.get("paciente");
  const officeParam = searchParams.get("officeId");

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema) as unknown as Resolver<AppointmentFormValues>,
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

  const loadData = useCallback(async () => {
      try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setSeriesDoctorId(user.id);

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
        ...(registeredPatients?.map((rp: RegisteredPatientResult) => {
          const p = Array.isArray(rp.patient) ? rp.patient[0] : rp.patient;
          return {
            id: p?.id,
            nombre_completo: p?.nombre_completo,
            email: p?.email,
            cedula: null,
            type: "registered",
          };
        }) || []),
        ...(offlinePatients?.map((op: { id: string; nombre_completo: string; cedula: string | null }) => ({
          id: op.id,
          nombre_completo: op.nombre_completo,
          email: null,
          cedula: op.cedula,
          type: "offline",
        })) || []),
      ];

      setPatients(allPatients as Patient[]);

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

      // Cargar especialidad del médico
      const { data: profileData } = await supabase
        .from('profiles')
        .select('sacs_especialidad, specialty_id, specialties(name)')
        .eq('id', user.id)
        .single();

      const specialty =
        profileData?.sacs_especialidad ||
        (profileData?.specialties as { name?: string } | null)?.name ||
        'Medicina Interna';
      setDoctorSpecialty(specialty);

    } catch (err: unknown) {
      console.error("Error loading data:", err);
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Verificar conflictos de horario
  const checkTimeConflicts = useCallback(async (fecha: string, hora: string, duracion: number) => {
    if (!fecha || !hora) return;

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
          const getVal = (obj: unknown) => Array.isArray(obj) ? (obj[0] as { nombre_completo?: string })?.nombre_completo : (obj as { nombre_completo?: string })?.nombre_completo;
          const patientName = getVal(apt.paciente) || getVal(apt.offline_patient) || 'Paciente';
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
    } catch (err: unknown) {
      console.error('Error checking conflicts:', err);
    } finally {
      // Done
    }
  }, []);

  // Verificar conflictos cuando cambian fecha, hora o duración
  useEffect(() => {
    const subscription = watch((value) => {
      const duracion = value.duracion_minutos;
      if (fecha && hora && duracion) {
        const timeoutId = setTimeout(() => {
          checkTimeConflicts(fecha, hora, duracion);
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    });
    return () => subscription.unsubscribe();
  }, [fecha, hora, watch, checkTimeConflicts]);

  const onSubmit: SubmitHandler<AppointmentFormValues> = useCallback(async (data) => {
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
          // Intentar crear el paciente
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

          if (createError) {
            // Si ya existe (violación de key única), recuperar el existente
            if (createError.code === '23505') {
              console.log("Paciente ya existe, recuperando ID...");
              const { data: existingPatient, error: fetchError } = await supabase
                .from("offline_patients")
                .select("id")
                .eq("doctor_id", user.id)
                .eq("cedula", data.new_patient_data.cedula)
                .single();

              if (fetchError || !existingPatient) {
                console.error("Error fetching existing patient:", fetchError);
                throw new Error("El paciente ya existe pero no se pudo recuperar su información.");
              }

              finalPacienteId = existingPatient.id;
              isOffline = true;
            } else {
              // Otros errores
              throw createError;
            }
          } else {
            // Creado exitosamente
            finalPacienteId = (newPatient as { id: string } | null)?.id || data.paciente_id;
            isOffline = true;
          }
        } catch (createErr: unknown) {
          console.error("Error creating offline patient:", createErr);
          setError("Error al registrar el nuevo paciente: " + (createErr instanceof Error ? createErr.message : "Error desconocido"));
          setLoading(false);
          return;
        }
      } else {
        const selectedPatient = (patients as { id: string, type?: string }[]).find(p => p.id === data.paciente_id);
        isOffline = selectedPatient?.type === "offline";
      }

      // Validar que la hora no sea pasada
      const selectedDateTime = new Date(`${data.fecha}T${data.hora}:00`);
      if (selectedDateTime < new Date()) {
        setError("La fecha y hora seleccionadas ya pasaron. Por favor, elige una hora futura.");
        setLoading(false);
        return;
      }

      const resolvedOfficeId = officeParam || (typeof window !== "undefined" ? localStorage.getItem("selectedOfficeId") : null);
      if (!resolvedOfficeId) {
        setError("Debes seleccionar un consultorio antes de crear la cita.");
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
      const hasConflict = finalConflictCheck?.some((apt: { fecha_hora: string; duracion_minutos: number }) => {
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

      // Generar URL de videollamada if telemedicine
      const appointmentId = crypto.randomUUID();
      const meetingUrl = data.tipo_cita === "telemedicina" && !isOffline
        ? `https://meet.jit.si/cita-${appointmentId.substring(0, 8)}`
        : null;

      // Preparar datos de la cita
      const appointmentData: Record<string, unknown> = {
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
        metodo_pago: data.metodo_pago,
        enviar_recordatorio: data.enviar_recordatorio,
        location_id: resolvedOfficeId,
      };

      if (isOffline) {
        appointmentData.offline_patient_id = finalPacienteId;
        appointmentData.paciente_id = null;
      } else {
        appointmentData.paciente_id = finalPacienteId;
        appointmentData.offline_patient_id = null;
      }

      let appointmentId_final = appointmentId;

      if (recurrenceConfig.enabled) {
        // ── Serie recurrente ──────────────────────────────────────────────
        const resolvedOfficeIdForSeries = officeParam || (typeof window !== "undefined" ? localStorage.getItem("selectedOfficeId") : null);
        await createSeries(
          {
            recurrence_type:     recurrenceConfig.type as RecurrenceType,
            recurrence_interval: recurrenceConfig.interval,
            recurrence_days:     recurrenceConfig.days,
            starts_on:           data.fecha,
            ends_on:             recurrenceConfig.endsOn === "date" ? (recurrenceConfig.endDate || undefined) : undefined,
            max_occurrences:     recurrenceConfig.endsOn === "count" ? (recurrenceConfig.maxCount ?? 10) : undefined,
            duracion_minutos:    data.duracion_minutos,
            tipo_cita:           data.tipo_cita,
            motivo:              data.motivo,
            notas_internas:      data.notas_internas || undefined,
            precio:              data.precio ? parseFloat(data.precio) : undefined,
            metodo_pago:         data.metodo_pago,
            hora:                data.hora,
          },
          isOffline ? null : (finalPacienteId ?? null),
          isOffline ? (finalPacienteId ?? null) : null,
          resolvedOfficeIdForSeries ?? null
        );
      } else {
        // ── Cita única ────────────────────────────────────────────────────
        const result = await supabase
          .from("appointments")
          .insert(appointmentData)
          .select()
          .single();

        if (result.error) throw result.error;
        appointmentId_final = appointmentId;
      }

      // ──── Guardar detalles dentales si existen ────────────────────────────
      if (!recurrenceConfig.enabled && data.dental_details && 
          (data.dental_details.procedureCode || 
           data.dental_details.toothNumbers?.length || 
           data.dental_details.chairId)) {
        
        const dentalData = {
          appointment_id: appointmentId_final,
          chair_id: data.dental_details.chairId || null,
          hygienist_id: data.dental_details.hygienistId || null,
          assistant_id: data.dental_details.assistantId || null,
          procedure_code: data.dental_details.procedureCode || null,
          procedure_name: data.dental_details.procedureName || null,
          tooth_numbers: data.dental_details.toothNumbers || [],
          surfaces: data.dental_details.surfaces || [],
          quadrant: data.dental_details.quadrant || null,
          requires_anesthesia: data.dental_details.requiresAnesthesia || false,
          anesthesia_type: data.dental_details.anesthesiaType || null,
          requires_sedation: data.dental_details.requiresSedation || false,
          sedation_type: data.dental_details.sedationType || null,
          materials_needed: data.dental_details.materialsNeeded || [],
          materials_prepared: data.dental_details.materialsPrepared || false,
          special_equipment: data.dental_details.specialEquipment || [],
          estimated_cost: data.dental_details.estimatedCost || null,
          insurance_authorization: data.dental_details.insuranceAuthorization || null,
          preop_notes: data.dental_details.preopNotes || "",
          postop_notes: data.dental_details.postopNotes || "",
          complications: data.dental_details.complications || "",
        };

        const dentalResult = await supabase
          .from("dental_appointment_details")
          .insert(dentalData);

        if (dentalResult.error) {
          console.error("Error saving dental details:", dentalResult.error);
          // No bloqueamos la creación de la cita si falla el detalle dental
        }
      }

      await supabase.from("user_activity_log").insert({
        user_id: user.id,
        activity_type: recurrenceConfig.enabled ? "appointment_series_created" : "appointment_created",
        description: recurrenceConfig.enabled
          ? `Serie de citas (${recurrenceConfig.type}) creada desde ${fechaHora.toLocaleString()}`
          : `Cita creada para ${fechaHora.toLocaleString()}`,
        status: "success",
      });
      void appointmentId_final; // used above for dental details

      router.push("/consultorio/citas");
    } catch (err: unknown) {
      console.error("Error creating appointment:", err);
      setError(err instanceof Error ? err.message : "Error al crear la cita");
    } finally {
      setLoading(false);
    }
  }, [officeParam, patients, router, recurrenceConfig, createSeries]);

  return (
    <VerificationGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-3 py-4 sm:px-6 sm:py-6 pb-24 sm:pb-6">
        {/* Header minimalista */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </button>

        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 border-red-300 bg-red-50 dark:bg-red-950/50 dark:border-red-800">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-300 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* Conflictos detectados */}


        {conflictingAppointments.length > 0 && !error && (
          <Alert className="mb-6 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/50 dark:border-yellow-800">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-300">
              <div className="font-semibold mb-2">⚠️ Citas existentes en este horario:</div>
              <ul className="list-disc list-inside space-y-1">
                {conflictingAppointments.map((apt: AppointmentConflict) => {
                  const getVal = (obj: unknown) => Array.isArray(obj) ? (obj[0] as { nombre_completo?: string })?.nombre_completo : (obj as { nombre_completo?: string })?.nombre_completo;
                  const patientName = getVal(apt.paciente) || getVal(apt.offline_patient) || 'Paciente';
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
          <form onSubmit={handleSubmit(onSubmit as (data: AppointmentFormValues) => Promise<void>)}>
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
                  selectedOfficeId={officeParam}
                  doctorSpecialty={doctorSpecialty}
                />

                {/* ── Cita Recurrente ──────────────────────────────────── */}
                <RecurrenceFields
                  value={recurrenceConfig}
                  onChange={setRecurrenceConfig}
                  startDate={form.getValues("fecha") || format(new Date(), "yyyy-MM-dd")}
                  startTime={hora || "09:00"}
                  duration={form.getValues("duracion_minutos") ?? 30}
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
