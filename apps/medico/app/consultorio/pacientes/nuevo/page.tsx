"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@red-salud/design-system";
import {
  ArrowLeft,
  AlertCircle,
  Stethoscope,
  Save
} from "lucide-react";
import { Alert, AlertDescription } from "@red-salud/design-system";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { validateCedulaWithCNE, isValidVenezuelanCedula, calculateAge } from "@/lib/services/cedula-validation";
import { PatientPrimaryInfo } from "./_components/patient-primary-info";
import { validateEmailFormat, validatePhoneFormat } from "./_utils/validation";
import { enforceVzlaPhone } from "./_utils/phone";

import { Suspense } from "react";

function NuevoPacienteContent() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [currentStep] = useState(1);
  const [validatingCedula, setValidatingCedula] = useState(false);
  const [cedulaFound, setCedulaFound] = useState(false);

  type PatientFormData = {
    cedula: string;
    nombre_completo: string;
    fecha_nacimiento: string;
    genero: string;
    telefono: string;
    email: string;
    direccion: string;
    office_id?: string | undefined;
  };

  const [formData, setFormData] = useState<PatientFormData>({
    cedula: "",
    nombre_completo: "",
    fecha_nacimiento: "",
    genero: "",
    telefono: "",
    email: "",
    direccion: "",
    office_id: typeof window !== "undefined" ? localStorage.getItem("selectedOfficeId") || undefined : undefined,
  });
  const [edad, setEdad] = useState<number | null>(null);

  // Medical data
  const [alergias, setAlergias] = useState<string[]>([]);
  const [condicionesCronicas] = useState<string[]>([]);
  const [medicamentosActuales] = useState<string[]>([]);
  const [notasMedicas, setNotasMedicas] = useState("");
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
        location_id: formData.office_id || null,
      };

      if (existing?.id) {
        await supabase.from("offline_patients").update(payload).eq("id", existing.id);
      } else {
        await supabase.from("offline_patients").insert(payload);
      }

      if (!draftSavedOnce) setDraftSavedOnce(true);
    } catch (err) {
      console.error("Error saving draft:", err);
    }
  }, [formData, alergias, condicionesCronicas, medicamentosActuales, notasMedicas, observaciones, draftSavedOnce]);

  useEffect(() => {
    const ready = formData.cedula.trim().length >= 6 && !!formData.nombre_completo.trim();
    if (!ready || currentStep !== 1) return;
    saveDraft();
    const interval = setInterval(saveDraft, 30000);
    return () => clearInterval(interval);
  }, [formData.cedula, formData.nombre_completo, currentStep, saveDraft]);

  const handleNextStep = useCallback(() => {
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
    router.push(`/consultorio/pacientes/nuevo/consulta?${q}`);
  }, [formData, edad, router]);

  const canProceed = formData.cedula.trim().length >= 6 && formData.nombre_completo.trim().length >= 2;

  return (
    <VerificationGuard>
      {currentStep === 1 ? (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-black dark:via-black dark:to-black">
          <div className="w-full px-4 py-6 pb-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-900 dark:text-white/60 dark:hover:text-white hover:bg-transparent pl-0 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>

          <div className="w-full px-6 py-6 max-w-5xl mx-auto space-y-6">
            {error && (
              <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3">
              {draftSavedOnce && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60 mr-auto">
                  <Save className="h-4 w-4 text-emerald-500" />
                  <span>Borrador guardado automáticamente</span>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full sm:w-auto h-11 px-6 border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10"
              >
                Cancelar
              </Button>

              <Button
                type="button"
                onClick={handleNextStep}
                disabled={!canProceed}
                className="group w-full sm:w-auto relative overflow-hidden h-11 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Stethoscope className="h-4 w-4 mr-2" />
                Continuar al Diagnóstico
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
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-black dark:via-black dark:to-black">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-xl animate-pulse" />
            <div className="relative animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        </div>
      }
    >
      <NuevoPacienteContent />
    </Suspense>
  );
}
