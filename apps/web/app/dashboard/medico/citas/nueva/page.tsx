"use client";

import { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { format } from "date-fns";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@red-salud/ui";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { searchConsultationReasons } from "@/lib/data/consultation-reasons";
import { appointmentSchema, AppointmentFormValues } from "@red-salud/core/validations";

// Componentes nuevos
import { CompactAppointmentForm } from "@/components/citas/nueva/compact-appointment-form";
import { AppointmentConfirmationModal } from "@/components/citas/nueva/confirmation-modal";

import { useAppointmentForm } from "@/hooks/use-appointment-form";

function NuevaCitaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado derivado del hook personalizado
  const {
    loading,
    error: hookError,
    checkingConflict,
    conflictingAppointments,
    patients,
    isInitialLoad,
    checkTimeConflicts,
    submitAppointment,
    getMinDate,
    getMinTime,
    isTimeValid,
    saveFormToLocalStorage,
    loadFormFromLocalStorage,
  } = useAppointmentForm();

  // Parámetros URL
  const dateParam = searchParams.get("date");
  const hourParam = searchParams.get("hour");
  const pacienteParam = searchParams.get("paciente");

  // Cargar datos previos del localStorage
  const savedFormData = useMemo(() => loadFormFromLocalStorage(), [loadFormFromLocalStorage]);

  // Estado local
  const advancedMode = searchParams.get("modo") === "clinico";
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Inicializar formulario con datos guardados o parámetros URL
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      paciente_id: savedFormData?.paciente_id || pacienteParam || "",
      fecha:
        savedFormData?.fecha ||
        (dateParam ? format(new Date(dateParam), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")),
      hora:
        savedFormData?.hora ||
        (hourParam ? `${hourParam.padStart(2, "0")}:00` : "09:00"),
      duracion_minutos: savedFormData?.duracion_minutos || 30,
      tipo_cita: savedFormData?.tipo_cita || "presencial",
      motivo: savedFormData?.motivo || "",
      notas_internas: savedFormData?.notas_internas || "",
      precio: savedFormData?.precio || "",
      metodo_pago: savedFormData?.metodo_pago || "efectivo",
      enviar_recordatorio: savedFormData?.enviar_recordatorio ?? true,
      diagnostico_preliminar: savedFormData?.diagnostico_preliminar || "",
      antecedentes_relevantes: savedFormData?.antecedentes_relevantes || "",
      medicamentos_actuales: savedFormData?.medicamentos_actuales || "",
      alergias: savedFormData?.alergias || "",
      notas_clinicas: savedFormData?.notas_clinicas || "",
    },
  });

  const { watch, handleSubmit, getValues } = form;
  const motivo = watch("motivo");

  // Sugerencias de motivo
  const [motivoSuggestions, setMotivoSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!motivo) {
      setMotivoSuggestions([]);
      return;
    }

    const lastCommaIndex = motivo.lastIndexOf(",");
    const currentTerm =
      lastCommaIndex === -1 ? motivo.trim() : motivo.substring(lastCommaIndex + 1).trim();

    if (currentTerm.length >= 2) {
      const suggestions = searchConsultationReasons(currentTerm);
      setMotivoSuggestions(suggestions);
    } else {
      setMotivoSuggestions([]);
    }
  }, [motivo]);

  // Guardar formulario en localStorage cuando cambia
  // Guardar formulario en localStorage cuando cambia
   
  useEffect(() => {
    const subscription = watch((data) => {
      saveFormToLocalStorage(data);
    });
    return () => subscription.unsubscribe();
  }, [watch, saveFormToLocalStorage]);

  // Manejar conflictos con debounce
  const handleConflictCheck = useCallback(
    async (fecha: string, hora: string, duracion: number) => {
      await checkTimeConflicts(fecha, hora, duracion);
    },
    [checkTimeConflicts]
  );

  // Enviar formulario
  const onSubmit = async () => {
    // Mostrar modal de confirmación
    setShowConfirmation(true);
  };

  // Confirmar envío desde modal
  const handleConfirmSubmit = useCallback(async () => {
    const formData = getValues();
    await submitAppointment(formData);
    setShowConfirmation(false);
  }, [getValues, submitAppointment]);

  const pacienteId = watch("paciente_id");
  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === pacienteId),
    [pacienteId, patients]
  );

  return (
    <VerificationGuard>
      <div className="h-[calc(100vh-3rem)] bg-background px-4 sm:px-6 py-4 overflow-auto">
        <div className="w-full">
          {/* Back Button - Inline */}
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Volver a citas</span>
          </button>

          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Formulario compacto */}
              <div className="bg-card rounded-lg shadow-sm border border-border">
                <div className="p-4">
                  <CompactAppointmentForm
                    getMinDate={getMinDate}
                    getMinTime={getMinTime}
                    isTimeValid={isTimeValid}
                    motivoSuggestions={motivoSuggestions}
                    patients={patients}
                    checkingConflict={checkingConflict}
                    conflictingAppointments={conflictingAppointments}
                    error={hookError}
                    onConflictCheck={handleConflictCheck}
                    advancedMode={advancedMode}
                    isInitialLoad={isInitialLoad}
                  />
                </div>
              </div>

              {/* Acciones - Fixed al fondo */}
              <div className="flex gap-3 justify-end sticky bottom-0 bg-background py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !watch("paciente_id")}
                  _data-tour="submit-button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? "Creando..." : "Crear Cita"}
                </Button>
              </div>
            </form>
          </FormProvider>

          {/* Modal de confirmación */}
          <AppointmentConfirmationModal
            open={showConfirmation}
            onConfirm={handleConfirmSubmit}
            onCancel={() => setShowConfirmation(false)}
            isLoading={loading}
            formData={getValues()}
            selectedPatientName={selectedPatient?.nombre_completo}
          />
        </div>
      </div>
    </VerificationGuard>
  );
}

export default function NuevaCitaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      }
    >
      <NuevaCitaContent />
    </Suspense>
  );
}

