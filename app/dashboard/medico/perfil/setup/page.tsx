"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  User,
  Stethoscope,
  Shield,
  ArrowRight,
  ArrowLeft,
  Search,
} from "lucide-react";

interface VerificationResult {
  success: boolean;
  verified: boolean;
  data?: {
    cedula: string;
    tipo_documento: string;
    nombre_completo: string;
    profesion_principal: string;
    matricula_principal: string;
    especialidad_display: string;
    es_medico_humano: boolean;
    es_veterinario: boolean;
    tiene_postgrados: boolean;
    profesiones: any[];
    postgrados: any[];
  };
  message: string;
  razon_rechazo?: string;
  error?: string;
}

export default function DoctorSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Step 1: Verificación SACS
  const [cedula, setCedula] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<"V" | "E">("V");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Step 2: Información Profesional
  const [specialtyId, setSpecialtyId] = useState("");
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [filteredSpecialties, setFilteredSpecialties] = useState<any[]>([]);
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [recommendedSpecialty, setRecommendedSpecialty] = useState<any>(null);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    checkAuth();
    loadSpecialties();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login/medico");
      return;
    }
    setUserId(user.id);
  };

  const loadSpecialties = async () => {
    const { data, error } = await supabase
      .from("specialties")
      .select("*")
      .eq("active", true)
      .order("name");

    if (!error && data) {
      setSpecialties(data);
      setFilteredSpecialties(data);
    }
  };

  // Filtrar especialidades cuando cambia la búsqueda
  useEffect(() => {
    if (!specialtySearch.trim()) {
      setFilteredSpecialties(specialties);
      return;
    }

    const query = specialtySearch.toLowerCase();
    const filtered = specialties.filter((specialty) =>
      specialty.name.toLowerCase().includes(query) ||
      specialty.description?.toLowerCase().includes(query)
    );
    setFilteredSpecialties(filtered);
  }, [specialtySearch, specialties]);

  const handleVerifySACS = async () => {
    if (!cedula || cedula.length < 6) {
      alert("Por favor ingresa una cédula válida");
      return;
    }

    setVerifying(true);
    setVerificationResult(null);

    try {
      // Llamar a la Edge Function de Supabase
      const { data, error } = await supabase.functions.invoke("verify-doctor-sacs", {
        body: {
          cedula,
          tipo_documento: tipoDocumento,
          user_id: userId,
        },
      });

      if (error) {
        throw error;
      }

      setVerificationResult(data as VerificationResult);

      // Si la verificación fue exitosa, auto-llenar datos
      if (data.verified && data.data) {
        setLicenseNumber(data.data.matricula_principal);
        // Buscar especialidad que coincida con SACS
        const matchingSpecialty = specialties.find(
          (s) => s.name.toUpperCase().includes(data.data.especialidad_display.toUpperCase()) ||
                 data.data.especialidad_display.toUpperCase().includes(s.name.toUpperCase())
        );
        if (matchingSpecialty) {
          setRecommendedSpecialty(matchingSpecialty);
          setSpecialtyId(matchingSpecialty.id);
        }
      }
    } catch (error: any) {
      console.error("Error verificando SACS:", error);
      setVerificationResult({
        success: false,
        verified: false,
        error: error.message || "Error al verificar con SACS",
        message: "No se pudo conectar con el servicio de verificación. Por favor intenta más tarde.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleCompleteSetup = async () => {
    if (!verificationResult?.verified) {
      alert("Debes completar la verificación SACS primero");
      return;
    }

    if (!specialtyId || !licenseNumber || !yearsExperience) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    setLoading(true);

    try {
      // Crear perfil de médico (usando nombres actuales de la BD)
      const { data: doctorData, error: profileError } = await supabase
        .from("doctor_details")
        .insert({
          profile_id: userId,
          especialidad_id: specialtyId,
          licencia_medica: verificationResult.data?.matricula_principal,
          anos_experiencia: parseInt(yearsExperience),
          verified: true,
          sacs_verified: true,
          sacs_data: verificationResult.data,
        })
        .select()
        .single();

      if (profileError) {
        console.error("Error creating doctor profile:", profileError);
        throw new Error(profileError.message || "Error al crear perfil de médico");
      }

      // Actualizar perfil base con datos SACS
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          nombre_completo: verificationResult.data?.nombre_completo,
          cedula: verificationResult.data?.cedula,
          cedula_verificada: true,
          sacs_verificado: true,
          sacs_nombre: verificationResult.data?.nombre_completo,
          sacs_matricula: verificationResult.data?.matricula_principal,
          sacs_especialidad: verificationResult.data?.especialidad_display,
          sacs_fecha_verificacion: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        throw new Error(updateError.message || "Error al actualizar perfil");
      }

      // Redirigir al dashboard
      router.push("/dashboard/medico");
    } catch (error: any) {
      console.error("Error completando setup:", error);
      const errorMessage = error?.message || error?.error_description || "Error desconocido al guardar tu perfil";
      alert("Error al guardar tu perfil: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}>
                {step > 1 ? <CheckCircle className="h-6 w-6" /> : "1"}
              </div>
              <span className="font-medium hidden sm:inline">Verificación SACS</span>
            </div>
            <div className="w-16 h-1 bg-gray-200">
              <div className={`h-full transition-all ${step >= 2 ? "bg-blue-600 w-full" : "w-0"}`} />
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}>
                2
              </div>
              <span className="font-medium hidden sm:inline">Información Profesional</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Verificación SACS</CardTitle>
                      <CardDescription>
                        Verifica tu identidad como profesional de la salud en Venezuela
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Formulario de Cédula */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-1">
                        <Label htmlFor="tipo">Tipo</Label>
                        <Select value={tipoDocumento} onValueChange={(v) => setTipoDocumento(v as "V" | "E")}>
                          <SelectTrigger id="tipo">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="V">V</SelectItem>
                            <SelectItem value="E">E</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor="cedula">Número de Cédula</Label>
                        <Input
                          id="cedula"
                          type="text"
                          placeholder="12345678"
                          value={cedula}
                          onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                          maxLength={10}
                          disabled={verifying || verificationResult?.verified}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleVerifySACS}
                      disabled={verifying || !cedula || verificationResult?.verified}
                      className="w-full"
                      size="lg"
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Verificando con SACS...
                        </>
                      ) : verificationResult?.verified ? (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Verificado Exitosamente
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5 mr-2" />
                          Verificar con SACS
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Resultado de Verificación */}
                  {verificationResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {verificationResult.verified ? (
                        <Alert className="border-green-500 bg-green-50">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <AlertDescription>
                            <div className="space-y-3">
                              <p className="font-semibold text-green-900">
                                ¡Verificación Exitosa!
                              </p>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Nombre:</span>
                                  <span className="font-medium text-gray-900">
                                    {verificationResult.data?.nombre_completo}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Profesión:</span>
                                  <span className="font-medium text-gray-900">
                                    {verificationResult.data?.profesion_principal}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Matrícula:</span>
                                  <span className="font-medium text-gray-900">
                                    {verificationResult.data?.matricula_principal}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Especialidad:</span>
                                  <span className="font-medium text-gray-900">
                                    {verificationResult.data?.especialidad_display}
                                  </span>
                                </div>
                                {verificationResult.data?.tiene_postgrados && (
                                  <Badge className="bg-purple-100 text-purple-800">
                                    Con Postgrados
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert variant="destructive">
                          <XCircle className="h-5 w-5" />
                          <AlertDescription>
                            <p className="font-semibold mb-2">Verificación Fallida</p>
                            <p className="text-sm">{verificationResult.message}</p>
                            {verificationResult.razon_rechazo === "MEDICO_VETERINARIO" && (
                              <p className="text-sm mt-2">
                                Red-Salud es exclusivamente para profesionales de salud humana.
                              </p>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </motion.div>
                  )}

                  {/* Información sobre SACS */}
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-blue-900 text-sm">
                      ¿Qué es el SACS?
                    </h4>
                    <p className="text-sm text-blue-800">
                      El Sistema de Atención al Ciudadano en Salud (SACS) es el registro oficial
                      de profesionales de la salud en Venezuela. Verificamos tu identidad
                      automáticamente consultando esta base de datos pública.
                    </p>
                  </div>

                  {/* Botón Continuar */}
                  {verificationResult?.verified && (
                    <Button
                      onClick={() => setStep(2)}
                      className="w-full"
                      size="lg"
                    >
                      Continuar
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle>Información Profesional</CardTitle>
                      <CardDescription>
                        Completa tu perfil médico para comenzar a usar Red-Salud
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Datos del SACS (solo lectura) */}
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-blue-900 text-sm">
                      Datos Verificados del SACS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Nombre Completo:</span>
                        <p className="font-medium text-gray-900">
                          {verificationResult?.data?.nombre_completo}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Matrícula:</span>
                        <p className="font-medium text-gray-900">
                          {verificationResult?.data?.matricula_principal}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Especialidad Recomendada del SACS */}
                    {recommendedSpecialty && !specialtySearch && (
                      <div>
                        <Label>Especialidad Recomendada (según SACS)</Label>
                        <Card 
                          className="mt-2 cursor-pointer hover:shadow-md transition-shadow border-2 border-green-500 bg-green-50"
                          onClick={() => {
                            setSpecialtyId(recommendedSpecialty.id);
                            setSpecialtySearch(recommendedSpecialty.name);
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-green-900">
                                  {recommendedSpecialty.name}
                                </h3>
                                <p className="text-sm text-green-700 mt-1">
                                  {recommendedSpecialty.description}
                                </p>
                                <Badge className="mt-2 bg-green-600">
                                  Recomendada según tu registro SACS
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Buscador de Especialidad */}
                    <div>
                      <Label htmlFor="specialty-search">
                        {recommendedSpecialty && !specialtySearch ? "O busca otra especialidad" : "Especialidad *"}
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="specialty-search"
                          placeholder="Buscar especialidad..."
                          value={specialtySearch}
                          onChange={(e) => setSpecialtySearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      {/* Grid 4x1 de especialidades filtradas */}
                      {specialtySearch && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm text-gray-600">
                            {filteredSpecialties.length} especialidad{filteredSpecialties.length !== 1 ? "es" : ""} encontrada{filteredSpecialties.length !== 1 ? "s" : ""}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {filteredSpecialties.slice(0, 8).map((specialty) => (
                              <Card
                                key={specialty.id}
                                className={`cursor-pointer hover:shadow-md transition-all ${
                                  specialtyId === specialty.id 
                                    ? "border-2 border-blue-500 bg-blue-50" 
                                    : "hover:border-blue-300"
                                }`}
                                onClick={() => {
                                  setSpecialtyId(specialty.id);
                                  setSpecialtySearch(specialty.name);
                                }}
                              >
                                <CardContent className="p-4">
                                  <h3 className="font-semibold text-sm mb-1">
                                    {specialty.name}
                                  </h3>
                                  {specialty.description && (
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                      {specialty.description}
                                    </p>
                                  )}
                                  {specialtyId === specialty.id && (
                                    <Badge className="mt-2 bg-blue-600">
                                      Seleccionada
                                    </Badge>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          {filteredSpecialties.length > 8 && (
                            <p className="text-xs text-gray-500 text-center">
                              Mostrando 8 de {filteredSpecialties.length} resultados. Refina tu búsqueda para ver más.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Especialidad seleccionada */}
                      {specialtyId && !specialtySearch && !recommendedSpecialty && (
                        <div className="mt-3">
                          <Card className="border-blue-500 bg-blue-50">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">Especialidad seleccionada:</p>
                                  <p className="font-semibold text-blue-900">
                                    {specialties.find(s => s.id === specialtyId)?.name}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSpecialtyId("");
                                    setSpecialtySearch("");
                                  }}
                                >
                                  Cambiar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="experience">Años de Experiencia *</Label>
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        max="60"
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value)}
                        placeholder="5"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Años de experiencia profesional en el área de la salud
                      </p>
                    </div>
                  </div>

                  {/* Nota sobre datos adicionales */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      <strong>Nota:</strong> Podrás agregar más información como ubicación, horarios, 
                      tarifas y biografía desde tu perfil después de completar el registro.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Atrás
                    </Button>
                    <Button
                      onClick={handleCompleteSetup}
                      disabled={loading}
                      className="flex-1"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Completar Registro
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
