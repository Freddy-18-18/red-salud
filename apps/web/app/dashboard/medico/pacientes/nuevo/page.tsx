"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@red-salud/ui";
import { Input } from "@red-salud/ui";
import { Label } from "@red-salud/ui";
import { ArrowLeft, UserPlus, AlertCircle, CheckCircle, Loader2, Sparkles, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@red-salud/ui";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { validateCedulaWithCNE, isValidVenezuelanCedula, calculateAge } from "@/lib/services/cedula-validation";
import { Badge } from "@red-salud/ui";
import { MedicalWorkspace } from "@/components/dashboard/medico/medical-workspace";
import { PatientPrimaryInfo } from "./_components/patient-primary-info";
import { validateEmailFormat, validatePhoneFormat } from "./_utils/validation";
import { enforceVzlaPhone, validateVzlaPhone } from "./_utils/phone";

import { Suspense } from "react";

function NuevoPacienteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCita = searchParams.get("from") === "cita";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [validatingCedula, setValidatingCedula] = useState(false);
  const [cedulaFound, setCedulaFound] = useState(false);

  // Si viene de cita, mostrar mensaje y no redirigir automáticamente
  // El usuario ya está en la página correcta

  type PatientFormData = {
    cedula: string;
    nombre_completo: string;
    fecha_nacimiento: string;
    genero: string;
    telefono: string;
    email: string;
    direccion: string;
  };

  const [formData, setFormData] = useState<PatientFormData>({
    cedula: "",
    nombre_completo: "",
    fecha_nacimiento: "",
    genero: "",
    telefono: "",
    email: "",
    direccion: "",
  });
  const [edad, setEdad] = useState<number | null>(null);

  // Medical data
  const [alergias, setAlergias] = useState<string[]>([]);
  const [condicionesCronicas, setCondicionesCronicas] = useState<string[]>([]);
  const [medicamentosActuales, setMedicamentosActuales] = useState<string[]>([]);
  const [notasMedicas, setNotasMedicas] = useState("");
  const [diagnosticos, setDiagnosticos] = useState<string[]>([]);
  const [observaciones, setObservaciones] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [telefonoError, setTelefonoError] = useState<string | null>(null);
  const [draftSavedOnce, setDraftSavedOnce] = useState(false);
  const [ageError, setAgeError] = useState<string | null>(null);

  // Calcular edad
  useEffect(() => {
    if (formData.fecha_nacimiento) {
      const calculatedAge = calculateAge(formData.fecha_nacimiento);
      setEdad(calculatedAge);
    } else {
      setEdad(null);
    }
  }, [formData.fecha_nacimiento]);

  useEffect(() => {
    if (edad === null) {
      setAgeError(null);
      return;
    }
    if (edad < 0) {
      setAgeError("La edad no puede ser negativa");
    } else if (edad > 150) {
      setAgeError("La edad no puede superar 150 años");
    } else {
      setAgeError(null);
    }
  }, [edad]);

  // Validar cédula
  useEffect(() => {
    const validateCedulaDebounced = async () => {
      const cleanCedula = formData.cedula.trim();

      if (cleanCedula.length >= 6 && isValidVenezuelanCedula(cleanCedula)) {
        setValidatingCedula(true);
        setCedulaFound(false);

        try {
          const result = await validateCedulaWithCNE(cleanCedula);

          if (result.found && result.nombre_completo) {
            setCedulaFound(true);
            setFormData((prev) => ({
              ...prev,
              nombre_completo: result.nombre_completo!,
            }));
          } else {
            setCedulaFound(false);
          }
        } catch (err) {
          console.error("Error validating cedula:", err);
          setCedulaFound(false);
        } finally {
          setValidatingCedula(false);
        }
      } else {
        setValidatingCedula(false);
        setCedulaFound(false);
      }
    };

    const debounce = setTimeout(validateCedulaDebounced, 400);
    return () => clearTimeout(debounce);
  }, [formData.cedula]);



  useEffect(() => {
    setEmailError(validateEmailFormat(formData.email));
  }, [formData.email]);
  useEffect(() => {
    setTelefonoError(validatePhoneFormat(formData.telefono));
  }, [formData.telefono]);

  useEffect(() => {
    const { formatted } = enforceVzlaPhone(formData.telefono);
    if (formatted !== formData.telefono) setFormData((prev) => ({ ...prev, telefono: formatted }));
    // Removed immediate validation to prevent error on load
  }, []);

  const saveDraft = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: existing } = await supabase
        .from("offline_patients")
        .select("id")
        .eq("doctor_id", user.id)
        .eq("cedula", formData.cedula)
        .maybeSingle();
      const payload: Record<string, unknown> = {
        doctor_id: user.id,
        cedula: formData.cedula,
        nombre_completo: formData.nombre_completo,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        genero: formData.genero || null,
        telefono: formData.telefono || null,
        email: formData.email || null,
        direccion: formData.direccion || null,
        alergias: alergias.length > 0 ? alergias : null,
        condiciones_cronicas: condicionesCronicas.length > 0 ? condicionesCronicas : null,
        medicamentos_actuales: medicamentosActuales.length > 0 ? medicamentosActuales : null,
        notas_medico: (notasMedicas || observaciones) ? `${notasMedicas}${observaciones ? `\n\nObservaciones:\n${observaciones}` : ""}` : null,
        status: "draft",
      };
      if (existing?.id) {
        await supabase.from("offline_patients").update(payload).eq("id", existing.id);
      } else {
        await supabase.from("offline_patients").insert(payload);
      }
      if (!draftSavedOnce) setDraftSavedOnce(true);
    } catch { }
  }, [supabase, formData, alergias, condicionesCronicas, medicamentosActuales, notasMedicas, observaciones, draftSavedOnce]);

  useEffect(() => {
    const ready = formData.cedula.trim().length >= 6 && !!formData.nombre_completo.trim();
    if (!ready || currentStep !== 1) return;
    saveDraft();
    const interval = setInterval(saveDraft, 30000);
    return () => clearInterval(interval);
  }, [formData.cedula, formData.nombre_completo, currentStep, saveDraft]);

  const handleNextStep = () => {
    if (!formData.cedula || !formData.nombre_completo) {
      setError("La cédula y el nombre completo son obligatorios");
      return;
    }
    setError(null);
    const q = new URLSearchParams({
      cedula: formData.cedula,
      nombre: formData.nombre_completo,
      edad: edad ? String(edad) : "",
      genero: formData.genero || "",
    }).toString();
    router.push(`/dashboard/medico/pacientes/nuevo/consulta?${q}`);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }

      if (!formData.cedula || formData.cedula.length < 6) {
        setError("La cédula es requerida y debe tener al menos 6 dígitos");
        setLoading(false);
        return;
      }

      const { data: existingPatient } = await supabase
        .from("profiles")
        .select("id")
        .eq("cedula", formData.cedula)
        .single();

      if (existingPatient) {
        const { error: relationError } = await supabase
          .from("doctor_patients")
          .insert({
            doctor_id: user.id,
            patient_id: existingPatient.id,
            first_consultation_date: new Date().toISOString(),
            last_consultation_date: new Date().toISOString(),
            total_consultations: 0,
            notes: notasMedicas || null,
          });

        if (relationError && relationError.code !== "23505") {
          throw relationError;
        }

        router.push(`/dashboard/medico/pacientes/${existingPatient.id}`);
        return;
      }

      const notasConDiagnosticos = notasMedicas +
        (diagnosticos.length > 0 ? `\n\nDiagnósticos:\n${diagnosticos.join("\n")}` : "");

      const { data: offlinePatient, error: insertError } = await supabase
        .from("offline_patients")
        .insert({
          doctor_id: user.id,
          cedula: formData.cedula,
          nombre_completo: formData.nombre_completo,
          fecha_nacimiento: formData.fecha_nacimiento || null,
          genero: formData.genero || null,
          telefono: formData.telefono || null,
          email: formData.email || null,
          direccion: formData.direccion || null,
          alergias: alergias.length > 0 ? alergias : null,
          condiciones_cronicas: condicionesCronicas.length > 0 ? condicionesCronicas : null,
          medicamentos_actuales: medicamentosActuales.length > 0 ? medicamentosActuales : null,
          notas_medico: notasConDiagnosticos || null,
          status: "offline",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase.from("user_activity_log").insert({
        user_id: user.id,
        activity_type: "offline_patient_created",
        description: `Paciente offline registrado: ${formData.nombre_completo} (${formData.cedula})`,
        status: "success",
      });

      router.push(`/dashboard/medico/pacientes/offline/${offlinePatient.id}`);
    } catch (err) {
      console.error("Error creating patient:", err);
      setError(err instanceof Error ? err.message : "Error al registrar el paciente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VerificationGuard>
      {currentStep === 1 ? (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
            <div className="w-full px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </Button>
                  <div className="h-6 w-px bg-gray-300" />
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">Nuevo Paciente</h1>
                      <p className="text-sm text-gray-600">Complete la información básica del paciente</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                      <span className="text-xs font-medium text-gray-700">Paso 1</span>
                    </div>
                    <div className="h-px w-8 bg-gray-300"></div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                      <span className="text-xs text-gray-400">Paso 2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="w-full px-6 py-8">
            {error && (
              <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-6">
              {/* Main Form */}
              <div>
                <PatientPrimaryInfo
                  formData={formData}
                  setFormData={(data) => setFormData(data)}
                  edad={edad}
                  cedulaFound={cedulaFound}
                  validatingCedula={validatingCedula}
                  alergias={alergias}
                  setAlergias={setAlergias}
                  notasMedicas={notasMedicas}
                  setNotasMedicas={setNotasMedicas}
                  observaciones={observaciones}
                  setObservaciones={setObservaciones}
                  emailError={emailError}
                  telefonoError={telefonoError}
                  ageError={ageError}
                  dateMin={new Date(new Date().setFullYear(new Date().getFullYear() - 150)).toISOString().split("T")[0]}
                  dateMax={new Date().toISOString().split("T")[0]}
                  enforcePhonePrefix={(v) => {
                    const { formatted, error } = enforceVzlaPhone(v);
                    setFormData({ ...formData, telefono: formatted });
                    setTelefonoError(error);
                  }}
                />
              </div>
            </div>
            {/* Actions (desktop estático, móvil/tables fijo) */}
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 lg:static lg:mt-10 lg:w-full lg:justify-end">
              <Button
                type="button"
                onClick={handleNextStep}
                className="h-11 px-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-colors"
                disabled={!formData.cedula || !formData.nombre_completo}
                aria-label="Continuar al diagnóstico"
              >
                Continuar al Diagnóstico
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="h-11 px-5 transition-colors"
                aria-label="Cancelar"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </VerificationGuard>
  );
}

export default function NuevoPacientePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      }
    >
      <NuevoPacienteContent />
    </Suspense>
  );
}
