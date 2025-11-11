"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, UserPlus, AlertCircle, CheckCircle, Loader2, Save, Printer, Sparkles, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VerificationGuard } from "@/components/dashboard/medico/verification-guard";
import { validateCedulaWithCNE, isValidVenezuelanCedula, calculateAge } from "@/lib/services/cedula-validation";
import { Badge } from "@/components/ui/badge";
import { MedicalWorkspace } from "@/components/dashboard/medico/medical-workspace";

export default function NuevoPacientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [validatingCedula, setValidatingCedula] = useState(false);
  const [cedulaFound, setCedulaFound] = useState(false);
  
  const [formData, setFormData] = useState({
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

  // Calcular edad
  useEffect(() => {
    if (formData.fecha_nacimiento) {
      const calculatedAge = calculateAge(formData.fecha_nacimiento);
      setEdad(calculatedAge);
    } else {
      setEdad(null);
    }
  }, [formData.fecha_nacimiento]);

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

  const handleNextStep = () => {
    if (!formData.cedula || !formData.nombre_completo) {
      setError("La cédula y el nombre completo son obligatorios");
      return;
    }
    setError(null);
    setCurrentStep(2);
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

      const { data: offlinePatient, error: insertError} = await supabase
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
    } catch (err: any) {
      console.error("Error creating patient:", err);
      setError(err.message || "Error al registrar el paciente");
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 1) {
    return (
      <VerificationGuard>
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-6 py-4">
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
          <div className="max-w-6xl mx-auto px-6 py-8">
            {error && (
              <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Identificación */}
                <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Identificación</h2>
                      <p className="text-sm text-gray-500">Datos de identificación del paciente</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cedula" className="text-sm font-medium text-gray-700">
                        Cédula <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="cedula"
                          type="text"
                          placeholder="Ej: 12345678"
                          value={formData.cedula}
                          onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                          required
                          className="pr-10 h-11"
                        />
                        {validatingCedula && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          </div>
                        )}
                        {!validatingCedula && cedulaFound && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                      </div>
                      {cedulaFound && !validatingCedula && (
                        <p className="text-xs text-green-600 flex items-center gap-1 animate-in fade-in">
                          <CheckCircle className="h-3 w-3" />
                          Verificado en CNE
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nombre_completo" className="text-sm font-medium text-gray-700">
                        Nombre Completo <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nombre_completo"
                        type="text"
                        placeholder="Ej: Juan Pérez"
                        value={formData.nombre_completo}
                        onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                        required
                        disabled={validatingCedula}
                        className={`h-11 ${cedulaFound ? "bg-green-50 border-green-300" : ""}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Género</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={formData.genero === "M" ? "default" : "outline"}
                        className="h-11 justify-start"
                        onClick={() => setFormData({ ...formData, genero: "M" })}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded-full border-2 ${formData.genero === "M" ? "border-white bg-white" : "border-gray-400"}`}>
                            {formData.genero === "M" && <div className="h-2 w-2 rounded-full bg-blue-600 m-auto mt-0.5" />}
                          </div>
                          Masculino
                        </div>
                      </Button>
                      <Button
                        type="button"
                        variant={formData.genero === "F" ? "default" : "outline"}
                        className="h-11 justify-start"
                        onClick={() => setFormData({ ...formData, genero: "F" })}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded-full border-2 ${formData.genero === "F" ? "border-white bg-white" : "border-gray-400"}`}>
                            {formData.genero === "F" && <div className="h-2 w-2 rounded-full bg-blue-600 m-auto mt-0.5" />}
                          </div>
                          Femenino
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Información Personal */}
                <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
                      <p className="text-sm text-gray-500">Datos demográficos y de contacto</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fecha_nacimiento" className="text-sm font-medium text-gray-700">
                        Fecha de Nacimiento
                      </Label>
                      <Input
                        id="fecha_nacimiento"
                        type="date"
                        value={formData.fecha_nacimiento}
                        onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edad" className="text-sm font-medium text-gray-700">
                        Edad
                      </Label>
                      <div className="relative">
                        <Input
                          id="edad"
                          type="text"
                          value={edad !== null ? `${edad} años` : ""}
                          disabled
                          placeholder="Se calcula automáticamente"
                          className="h-11 bg-gray-50"
                        />
                        {edad !== null && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Badge variant="secondary" className="text-xs">
                              {edad} años
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                        Teléfono
                      </Label>
                      <Input
                        id="telefono"
                        type="tel"
                        placeholder="+58 412 1234567"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="paciente@ejemplo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Progress Card */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                  <h3 className="text-lg font-semibold mb-2">Progreso del Registro</h3>
                  <p className="text-sm text-blue-100 mb-4">Complete los datos básicos para continuar</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <span className="text-sm">Paso 1: Información Básica</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-50">
                      <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <span className="text-sm">Paso 2: Diagnóstico Médico</span>
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-white rounded-xl border p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Información Importante</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p>La cédula se verifica automáticamente con el CNE</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p>La edad se calcula automáticamente según la fecha de nacimiento</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p>Los campos marcados con * son obligatorios</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button 
                    type="button" 
                    onClick={handleNextStep} 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    disabled={!formData.cedula || !formData.nombre_completo}
                  >
                    Continuar al Diagnóstico
                    <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.back()}
                    className="w-full h-12"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </VerificationGuard>
    );
  }

  return (
    <VerificationGuard>
      <MedicalWorkspace
        paciente={{
          cedula: formData.cedula,
          nombre_completo: formData.nombre_completo,
          edad: edad,
          genero: formData.genero,
        }}
        alergias={alergias}
        setAlergias={setAlergias}
        condicionesCronicas={condicionesCronicas}
        setCondicionesCronicas={setCondicionesCronicas}
        medicamentosActuales={medicamentosActuales}
        setMedicamentosActuales={setMedicamentosActuales}
        notasMedicas={notasMedicas}
        setNotasMedicas={setNotasMedicas}
        diagnosticos={diagnosticos}
        setDiagnosticos={setDiagnosticos}
        onSave={handleSubmit}
        onBack={() => setCurrentStep(1)}
        loading={loading}
      />
    </VerificationGuard>
  );
}
