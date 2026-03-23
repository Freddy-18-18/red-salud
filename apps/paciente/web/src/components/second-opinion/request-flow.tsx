"use client";

import { useRouter } from "next/navigation";
import {
  Check,
  FileText,
  Stethoscope,
  User,
  MessageSquare,
  Monitor,
  ClipboardCheck,
  Loader2,
  Video,
  Building2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import {
  useSecondOpinionFlow,
  type RequestStep,
} from "@/hooks/use-second-opinion";
import { ReviewerSelector } from "@/components/second-opinion/reviewer-selector";
import type { MedicalRecordSummary, ReviewerDoctor } from "@/lib/services/second-opinion-service";

// --- Step Indicator ---

interface StepInfo {
  key: RequestStep;
  label: string;
  icon: typeof FileText;
}

const STEPS: StepInfo[] = [
  { key: "record", label: "Consulta", icon: FileText },
  { key: "specialty", label: "Especialidad", icon: Stethoscope },
  { key: "doctor", label: "Doctor", icon: User },
  { key: "reason", label: "Motivo", icon: MessageSquare },
  { key: "type", label: "Tipo", icon: Monitor },
  { key: "review", label: "Confirmar", icon: ClipboardCheck },
];

function FlowStepIndicator({
  currentStep,
  currentStepIndex,
}: {
  currentStep: RequestStep;
  currentStepIndex: number;
}) {
  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isCurrent = step.key === currentStep;
          const StepIcon = step.icon;

          return (
            <div
              key={step.key}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    isComplete
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                        ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isCurrent
                      ? "text-emerald-700"
                      : isComplete
                        ? "text-gray-700"
                        : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 rounded ${
                    index < currentStepIndex ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-emerald-700">
            Paso {currentStepIndex + 1} de {STEPS.length}
          </span>
          <span className="text-sm text-gray-500">
            {STEPS[currentStepIndex]?.label}
          </span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((step, index) => (
            <div
              key={step.key}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                index < currentStepIndex
                  ? "bg-emerald-500"
                  : index === currentStepIndex
                    ? "bg-emerald-600"
                    : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Record Selector ---

function RecordSelector({
  records,
  loading,
  selected,
  onSelect,
  onContinue,
}: {
  records: MedicalRecordSummary[];
  loading: boolean;
  selected: MedicalRecordSummary | null;
  onSelect: (record: MedicalRecordSummary) => void;
  onContinue: () => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p className="text-sm">Cargando tus consultas...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No tienes consultas previas
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Necesitas al menos una consulta con un diagnostico para solicitar una
          segunda opinion.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Selecciona la consulta
        </h2>
        <p className="text-gray-500 text-sm">
          Elige cual diagnostico quieres que sea revisado por otro especialista
        </p>
      </div>

      <div className="space-y-3">
        {records.map((record) => {
          const isSelected = selected?.id === record.id;
          return (
            <button
              key={record.id}
              onClick={() => onSelect(record)}
              className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                  : "border-gray-100 hover:border-emerald-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {record.diagnosis}
                    </h3>
                    {isSelected && (
                      <div className="shrink-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Dr. {record.doctor_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-3 w-3" />
                      {record.specialty_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(record.created_at).toLocaleDateString("es-VE", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {record.notes && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                      {record.notes}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={onContinue}
          disabled={!selected}
          className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

// --- Specialty Selector ---

function SpecialtySelector({
  specialties,
  selectedId,
  onSelect,
  onContinue,
  onBack,
}: {
  specialties: { id: string; name: string }[];
  selectedId: string | null;
  onSelect: (id: string, name: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Especialidad del revisor
        </h2>
        <p className="text-gray-500 text-sm">
          Selecciona la especialidad del doctor que revisara tu diagnostico
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {specialties.map((specialty) => {
          const isSelected = selectedId === specialty.id;
          return (
            <button
              key={specialty.id}
              onClick={() => onSelect(specialty.id, specialty.name)}
              className={`p-4 border-2 rounded-xl text-left transition-all flex items-center gap-3 ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50 shadow-sm"
                  : "border-gray-100 hover:border-emerald-200 hover:bg-gray-50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <Stethoscope className="h-5 w-5" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-900">
                  {specialty.name}
                </span>
                {isSelected && (
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* All specialties option */}
      <p className="text-xs text-gray-400 text-center">
        Solo se muestran especialidades relacionadas a tus consultas previas
      </p>

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
        >
          Volver
        </button>
        <button
          onClick={onContinue}
          disabled={!selectedId}
          className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

// --- Reason Step ---

function ReasonStep({
  reason,
  patientNotes,
  onReasonChange,
  onNotesChange,
  onContinue,
  onBack,
}: {
  reason: string;
  patientNotes: string;
  onReasonChange: (reason: string) => void;
  onNotesChange: (notes: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Motivo de la segunda opinion
        </h2>
        <p className="text-gray-500 text-sm">
          Explica por que quieres una segunda opinion sobre tu diagnostico
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            Razon principal *
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Ej: Quiero confirmar el diagnostico con otro especialista antes de iniciar el tratamiento..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Minimo 20 caracteres
          </p>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            Notas adicionales (opcional)
          </label>
          <textarea
            id="notes"
            value={patientNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Ej: Desde que recibí el diagnostico he notado nuevos sintomas como..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
          />
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">
            Tu informacion medica sera compartida
          </p>
          <p className="text-xs text-blue-600 mt-0.5">
            Al enviar esta solicitud, consientes que tu historial medico y
            diagnostico original sean compartidos con el doctor revisor.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
        >
          Volver
        </button>
        <button
          onClick={onContinue}
          disabled={reason.trim().length < 20}
          className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

// --- Consultation Type Step ---

function ConsultationTypeStep({
  selected,
  onSelect,
  onContinue,
  onBack,
}: {
  selected: "remote" | "in_person";
  onSelect: (type: "remote" | "in_person") => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const options = [
    {
      value: "remote" as const,
      label: "Consulta remota",
      description:
        "El especialista revisara tu caso de forma remota y te enviara su opinion por la plataforma.",
      icon: Video,
      benefits: [
        "Mas rapido",
        "Sin desplazamiento",
        "Disponible a nivel nacional",
      ],
    },
    {
      value: "in_person" as const,
      label: "Consulta presencial",
      description:
        "Agenda una cita presencial con el especialista para una evaluacion en persona.",
      icon: Building2,
      benefits: [
        "Examen fisico",
        "Consulta detallada",
        "Contacto directo",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Tipo de consulta
        </h2>
        <p className="text-gray-500 text-sm">
          Elige como quieres recibir la segunda opinion
        </p>
      </div>

      <div className="space-y-4">
        {options.map((option) => {
          const isSelected = selected === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`w-full p-5 border-2 rounded-xl text-left transition-all ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50/50 shadow-md"
                  : "border-gray-100 hover:border-emerald-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {option.label}
                    </h3>
                    {isSelected && (
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {option.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {option.benefits.map((benefit) => (
                      <span
                        key={benefit}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          isSelected
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
        >
          Volver
        </button>
        <button
          onClick={onContinue}
          className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

// --- Review Step ---

function ReviewStep({
  state,
  loading,
  error,
  onSubmit,
  onBack,
}: {
  state: {
    selectedRecord: MedicalRecordSummary | null;
    selectedSpecialtyName: string | null;
    selectedDoctor: ReviewerDoctor | null;
    reason: string;
    patientNotes: string;
    consultationType: "remote" | "in_person";
  };
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const doctorInitials =
    state.selectedDoctor?.profile.nombre_completo
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Revisa tu solicitud
        </h2>
        <p className="text-gray-500 text-sm">
          Verifica que todos los datos sean correctos antes de enviar
        </p>
      </div>

      <div className="space-y-4">
        {/* Original diagnosis */}
        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Diagnostico a revisar
          </h4>
          <p className="text-sm font-semibold text-gray-900">
            {state.selectedRecord?.diagnosis}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Dr. {state.selectedRecord?.doctor_name} —{" "}
            {state.selectedRecord?.specialty_name}
          </p>
        </div>

        {/* Reviewer */}
        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Especialista revisor
          </h4>
          <div className="flex items-center gap-3">
            {state.selectedDoctor?.profile.avatar_url ? (
              <img
                src={state.selectedDoctor.profile.avatar_url}
                alt={state.selectedDoctor.profile.nombre_completo}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <span className="text-sm font-semibold text-emerald-600">
                  {doctorInitials}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Dr. {state.selectedDoctor?.profile.nombre_completo}
              </p>
              <p className="text-xs text-gray-500">
                {state.selectedSpecialtyName}
              </p>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Motivo
          </h4>
          <p className="text-sm text-gray-700">{state.reason}</p>
          {state.patientNotes && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Notas adicionales:</p>
              <p className="text-sm text-gray-600">{state.patientNotes}</p>
            </div>
          )}
        </div>

        {/* Consultation type */}
        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Tipo de consulta
          </h4>
          <div className="flex items-center gap-2">
            {state.consultationType === "remote" ? (
              <Video className="h-4 w-4 text-emerald-600" />
            ) : (
              <Building2 className="h-4 w-4 text-emerald-600" />
            )}
            <p className="text-sm font-medium text-gray-900">
              {state.consultationType === "remote"
                ? "Consulta remota"
                : "Consulta presencial"}
            </p>
          </div>
        </div>

        {/* Fee notice */}
        {state.selectedDoctor?.consultation_fee && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Costo estimado: $
                  {state.selectedDoctor.consultation_fee.toFixed(2)}
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  El costo final sera confirmado por el especialista al aceptar
                  la solicitud
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition disabled:opacity-40"
        >
          Volver
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-40 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar solicitud"
          )}
        </button>
      </div>
    </div>
  );
}

// --- Main Flow Component ---

export function RequestFlow() {
  const router = useRouter();
  const flow = useSecondOpinionFlow();

  const handleSubmit = async () => {
    const requestId = await flow.submitRequest();
    if (requestId) {
      router.push(`/dashboard/segunda-opinion/${requestId}`);
    }
  };

  return (
    <div className="space-y-8">
      <FlowStepIndicator
        currentStep={flow.state.step}
        currentStepIndex={flow.currentStepIndex}
      />

      {/* Step content */}
      {flow.state.step === "record" && (
        <RecordSelector
          records={flow.medicalRecords}
          loading={flow.loadingRecords}
          selected={flow.state.selectedRecord}
          onSelect={flow.selectRecord}
          onContinue={flow.nextStep}
        />
      )}

      {flow.state.step === "specialty" && (
        <SpecialtySelector
          specialties={flow.specialties}
          selectedId={flow.state.selectedSpecialtyId}
          onSelect={flow.selectSpecialty}
          onContinue={flow.nextStep}
          onBack={flow.prevStep}
        />
      )}

      {flow.state.step === "doctor" && (
        <ReviewerSelector
          doctors={flow.reviewerDoctors}
          loading={flow.loadingDoctors}
          selected={flow.state.selectedDoctor}
          onSelect={flow.selectDoctor}
          onContinue={flow.nextStep}
          onBack={flow.prevStep}
        />
      )}

      {flow.state.step === "reason" && (
        <ReasonStep
          reason={flow.state.reason}
          patientNotes={flow.state.patientNotes}
          onReasonChange={flow.setReason}
          onNotesChange={flow.setPatientNotes}
          onContinue={flow.nextStep}
          onBack={flow.prevStep}
        />
      )}

      {flow.state.step === "type" && (
        <ConsultationTypeStep
          selected={flow.state.consultationType}
          onSelect={flow.setConsultationType}
          onContinue={flow.nextStep}
          onBack={flow.prevStep}
        />
      )}

      {flow.state.step === "review" && (
        <ReviewStep
          state={flow.state}
          loading={flow.loadingSubmit}
          error={flow.error}
          onSubmit={handleSubmit}
          onBack={flow.prevStep}
        />
      )}
    </div>
  );
}
