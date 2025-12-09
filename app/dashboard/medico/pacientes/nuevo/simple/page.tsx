"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, type PatientFormValues } from "@/lib/validations/patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserPlus, CheckCircle, Loader2, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { validateCedulaWithCNE, isValidVenezuelanCedula, calculateAge } from "@/lib/services/cedula-validation";

export default function NuevoPacienteSimplePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCita = searchParams.get("from") === "cita";
  
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [validatingCedula, setValidatingCedula] = useState(false);
  const [cedulaFound, setCedulaFound] = useState(false);
  const [edad, setEdad] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      cedula: "",
      nombre_completo: "",
      fecha_nacimiento: "",
      genero: undefined, // undefined para que no se seleccione nada por defecto
      telefono: "",
      email: "",
    },
  });

  // Observar valores para efectos secundarios
  const cedulaValue = watch("cedula");
  const fechaNacimientoValue = watch("fecha_nacimiento");
  const generoValue = watch("genero");

  // Calcular edad
  useEffect(() => {
    if (fechaNacimientoValue) {
      const calculatedAge = calculateAge(fechaNacimientoValue);
      setEdad(calculatedAge);
    } else {
      setEdad(null);
    }
  }, [fechaNacimientoValue]);

  // Validar cédula con CNE
  useEffect(() => {
    const validateCedulaDebounced = async () => {
      const cleanCedula = cedulaValue?.trim();
      
      if (cleanCedula && cleanCedula.length >= 6 && isValidVenezuelanCedula(cleanCedula)) {
        setValidatingCedula(true);
        setCedulaFound(false);
        
        try {
          const result = await validateCedulaWithCNE(cleanCedula);
          
          if (result.found && result.nombre_completo) {
            setCedulaFound(true);
            setValue("nombre_completo", result.nombre_completo, { shouldValidate: true });
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
  }, [cedulaValue, setValue]);

  const onSubmit = async (data: PatientFormValues) => {
    setLoading(true);
    setGeneralError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }

      // Verificar si el paciente ya existe
      const { data: existingPatient } = await supabase
        .from("profiles")
        .select("id")
        .eq("cedula", data.cedula)
        .single();

      if (existingPatient) {
        // Crear relación si no existe
        const { error: relationError } = await supabase
          .from("doctor_patients")
          .insert({
            doctor_id: user.id,
            patient_id: existingPatient.id,
            first_consultation_date: new Date().toISOString(),
            last_consultation_date: new Date().toISOString(),
            total_consultations: 0,
          });

        if (relationError && relationError.code !== "23505") {
          throw relationError;
        }

        // Redirigir según de dónde viene
        if (fromCita) {
          router.push(`/dashboard/medico/citas/nueva?paciente=${existingPatient.id}`);
        } else {
          router.push(`/dashboard/medico/pacientes/${existingPatient.id}`);
        }
        return;
      }

      // Crear paciente offline (sin historial clínico)
      // Ajustamos los valores opcionales para que sean null si están vacíos
      const offlinePatientData = {
        doctor_id: user.id,
        cedula: data.cedula,
        nombre_completo: data.nombre_completo,
        fecha_nacimiento: data.fecha_nacimiento || null,
        genero: data.genero || null,
        telefono: data.telefono || null,
        email: data.email || null,
        status: "offline",
      };

      const { data: offlinePatient, error: insertError } = await supabase
        .from("offline_patients")
        .insert(offlinePatientData)
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase.from("user_activity_log").insert({
        user_id: user.id,
        activity_type: "offline_patient_created",
        description: `Paciente registrado: ${data.nombre_completo} (${data.cedula})`,
        status: "success",
      });

      // Redirigir según de dónde viene
      if (fromCita) {
        router.push(`/dashboard/medico/citas/nueva?paciente=${offlinePatient.id}`);
      } else {
        router.push(`/dashboard/medico/pacientes/offline/${offlinePatient.id}`);
      }
    } catch (err: any) {
      console.error("Error creating patient:", err);
      setGeneralError(err.message || "Error al registrar el paciente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VerificationGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Registrar Paciente</h1>
              <p className="text-gray-600 mt-1">Complete la información básica del paciente</p>
            </div>
          </div>
        </div>

        {generalError && (
          <Alert variant="destructive" className="max-w-4xl mx-auto mb-6">
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Información del Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Cédula y Nombre */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cedula" className="text-base font-medium">
                      Cédula <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="cedula"
                        type="text"
                        placeholder="Ej: 12345678"
                        className={`h-12 text-lg ${errors.cedula ? "border-red-500" : ""}`}
                        {...register("cedula")}
                      />
                      {validatingCedula && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        </div>
                      )}
                      {!validatingCedula && cedulaFound && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      )}
                    </div>
                    {errors.cedula && (
                      <p className="text-sm text-red-500">{errors.cedula.message}</p>
                    )}
                    {cedulaFound && !validatingCedula && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Verificado en CNE
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nombre_completo" className="text-base font-medium">
                      Nombre Completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nombre_completo"
                      type="text"
                      placeholder="Ej: Juan Pérez"
                      className={`h-12 text-lg ${cedulaFound ? "bg-green-50 border-green-300" : ""} ${errors.nombre_completo ? "border-red-500" : ""}`}
                      disabled={validatingCedula}
                      {...register("nombre_completo")}
                    />
                    {errors.nombre_completo && (
                      <p className="text-sm text-red-500">{errors.nombre_completo.message}</p>
                    )}
                  </div>
                </div>

                {/* Género */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Género</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={generoValue === "M" ? "default" : "outline"}
                      size="lg"
                      className="h-14 text-base"
                      onClick={() => setValue("genero", "M")}
                    >
                      Masculino
                    </Button>
                    <Button
                      type="button"
                      variant={generoValue === "F" ? "default" : "outline"}
                      size="lg"
                      className="h-14 text-base"
                      onClick={() => setValue("genero", "F")}
                    >
                      Femenino
                    </Button>
                  </div>
                </div>

                {/* Fecha de Nacimiento y Edad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_nacimiento" className="text-base font-medium">
                      Fecha de Nacimiento
                    </Label>
                    <Input
                      id="fecha_nacimiento"
                      type="date"
                      className="h-12 text-lg"
                      {...register("fecha_nacimiento")}
                    />
                  </div>

                  {edad !== null && (
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Edad</Label>
                      <div className="h-12 px-4 rounded-md border bg-gray-50 flex items-center text-lg font-semibold text-gray-700">
                        {edad} años
                      </div>
                    </div>
                  )}
                </div>

                {/* Teléfono y Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-base font-medium">
                      Teléfono
                    </Label>
                    <Input
                      id="telefono"
                      type="tel"
                      placeholder="+58 412 1234567"
                      className="h-12 text-lg"
                      {...register("telefono")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="paciente@ejemplo.com"
                      className={`h-12 text-lg ${errors.email ? "border-red-500" : ""}`}
                      {...register("email")}
                    />
                     {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Nota informativa */}
                <Alert className="bg-blue-50 border-blue-200">
                  <Calendar className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Nota:</strong> El historial clínico del paciente será completado por el médico durante la consulta.
                  </AlertDescription>
                </Alert>

                {/* Botones */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="flex-1 h-14 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Guardar Paciente
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                    size="lg"
                    className="h-14 text-lg px-8"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </VerificationGuard>
  );
}
