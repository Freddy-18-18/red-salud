"use client";

import { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { format } from "date-fns";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { searchConsultationReasons } from "@/lib/data/consultation-reasons";
import { appointmentSchema, AppointmentFormValues } from "@/lib/validations/appointment";

// Componentes nuevos
import { CompactAppointmentForm } from "@/components/citas/nueva/compact-appointment-form";
import { AppointmentConfirmationModal } from "@/components/citas/nueva/confirmation-modal";
import { TourButton } from "@/components/citas/nueva/tour-button";
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
    loadingPatients,
    isInitialLoad,
    checkTimeConflicts,
    submitAppointment,
    clearError,
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
  const [advancedMode, setAdvancedMode] = useState(false);
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
  const onSubmit = async (data: AppointmentFormValues) => {
    // Mostrar modal de confirmación
    setShowConfirmation(true);
  };

  // Confirmar envío desde modal
  const handleConfirmSubmit = useCallback(async () => {
    const formData = getValues();
    await submitAppointment(formData);
    setShowConfirmation(false);
  }, [getValues, submitAppointment]);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === watch("paciente_id")),
    [watch("paciente_id"), patients]
  );

  return (
    <VerificationGuard>
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-8 max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="page-title flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Nueva Cita</h1>
              <p className="text-gray-600 mt-1">Crea una cita con pacientes registrados u offline</p>
            </div>
            <div className="flex items-center gap-2">
              <TourButton tourType="nueva-cita" />
              <button
                type="button"
                onClick={() => setAdvancedMode(!advancedMode)}
                data-tour="advanced-toggle"
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  advancedMode
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {advancedMode ? "Modo Simple" : "Modo Avanzado"}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Formulario compacto */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
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

              {/* Acciones */}
              <div className="flex gap-3 justify-end">
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
                  data-tour="submit-button"
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
