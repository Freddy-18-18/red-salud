"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Star, 
  Loader2, 
  Shield, 
  UserPlus, 
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  Video,
  FileText,
  BarChart3,
  MessageSquare,
  Bell,
  CreditCard,
  Settings,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Bone,
  Pill,
  FlaskConical,
  Ambulance,
  Building2,
  UsersRound,
  Baby,
  Venus,
  Pause,
  Play
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import { Alert, AlertDescription } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@red-salud/design-system";
import { SpecialtyCombobox } from "@red-salud/design-system";
import { useDoctorProfile } from "@/hooks/use-doctor-profile";
import { supabase } from "@/lib/supabase/client";
import { useVerification } from "@/lib/contexts/verification-context";

type Step = "welcome" | "verify-sacs" | "verify-manual" | "success";
type VerificationMode = "sacs" | "manual";

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
  };
  message: string;
  razon_rechazo?: string;
}

const BENEFICIOS = [
  {
    icon: Calendar,
    title: "Gestión de Agenda",
    description: "Organiza tu día con citas automáticas, recordatorios y agenda dinámica"
  },
  {
    icon: Users,
    title: "Historia Clínica Digital",
    description: "Acceso completo a historiales de pacientes con formato estructurado"
  },
  {
    icon: Video,
    title: "Telemedicina",
    description: "Consultas por videollamada integradas con historial clínico"
  },
  {
    icon: FileText,
    title: "Recetas Digitales",
    description: "Emite recetas y órdenes con validez legal automática"
  },
  {
    icon: MessageSquare,
    title: "Chat con Pacientes",
    description: "Comunicación directa, segura y cifrada con tus pacientes"
  },
  {
    icon: BarChart3,
    title: "Estadísticas en Tiempo Real",
    description: "Dashboard con métricas de consultas, ingresos y productividad"
  },
  {
    icon: Bell,
    title: "Notificaciones Push",
    description: "Alertas instantáneas de citas, mensajes y actualizaciones"
  },
  {
    icon: CreditCard,
    title: "Pagos Integrados",
    description: "Cobros online, facturación automática y reportes fiscales"
  },
  {
    icon: Brain,
    title: "IA Asistencial",
    description: "Asistencia con IA para diagnósticos y sugerencias de tratamiento"
  },
  {
    icon: Building2,
    title: "Red de Especialistas",
    description: "Referencia y contrarreferencia con otros profesionales"
  }
];

const ICONOS_ESPECIALIDADES = [
  { icon: Stethoscope, label: "Medicina General" },
  { icon: Heart, label: "Cardiología" },
  { icon: Brain, label: "Neurología" },
  { icon: Eye, label: "Oftalmología" },
  { icon: Bone, label: "Ortopedia" },
  { icon: Pill, label: "Farmacia" },
  { icon: FlaskConical, label: "Laboratorio" },
  { icon: Ambulance, label: "Emergencias" },
  { icon: UsersRound, label: "Medicina Familiar" },
  { icon: Activity, label: "Medicina Interna" },
  { icon: Baby, label: "Pediatría" },
  { icon: Venus, label: "Ginecología" },
];

const ESPECIALIDADES_LISTA = [
  "Medicina General",
  "Cardiología",
  "Neurología",
  "Oftalmología",
  "Ortopedia",
  "Farmacia",
  "Laboratorio",
  "Emergencias",
  "Medicina Familiar",
  "Medicina Interna",
  "Pediatría",
  "Ginecología",
  "Cirugía General",
  "Dermatología",
  "Endocrinología",
  "Gastroenterología",
  "Nefrología",
  "Neumonología",
  "Oncología",
  "Psiquiatría",
  "Reumatología",
  "Urología",
  "Anestesiología",
  "Radiología",
  "Patología",
  "Medicina Preventiva",
  "Nutriología",
  "Fisioterapia",
  "Odontología",
  "Optometría",
  "Fonoaudiología",
  "Terapia Ocupacional",
  "Psicología",
  "Trabajo Social",
];

const ITEMS_PER_CAROUSEL = 6;

interface VerificationGuardProps {
  children: React.ReactNode;
}

export function VerificationGuard({ children }: VerificationGuardProps) {
  const router = useRouter();
  // Read verification state from layout context (avoids redundant Supabase calls on every page)
  const { isVerified: contextIsVerified, userId: contextUserId, isLoading: contextIsLoading } = useVerification();

  const [userId, setUserId] = useState<string | null>(contextUserId);
  const [authLoading, setAuthLoading] = useState(!contextUserId);
  const [isVerified, setIsVerified] = useState(contextIsVerified);
  const [checkingVerification, setCheckingVerification] = useState(!contextUserId && !contextIsVerified);
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [verificationMode, setVerificationMode] = useState<VerificationMode>("sacs");
  
  // Estados del formulario
  const [cedula, setCedula] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<"V" | "E">("V");
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Modo manual
  const [manualNombre, setManualNombre] = useState("");
  const [manualCedula, setManualCedula] = useState("");
  const [manualTipo, setManualTipo] = useState<"V" | "E">("V");
  const [manualEspecialidad, setManualEspecialidad] = useState("");
  
  // Carrusel de especialidades
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  
  const totalCarousels = Math.ceil(ICONOS_ESPECIALIDADES.length / ITEMS_PER_CAROUSEL);
  
  useEffect(() => {
    if (carouselPaused || currentStep !== "welcome") return;
    
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % totalCarousels);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [carouselPaused, currentStep, totalCarousels]);
  
  const { profile, loading: profileLoading } = useDoctorProfile(userId || undefined);

  useEffect(() => {
    // Si ya tenemos userId del contexto del layout, no hace falta volver a buscarlo
    if (contextUserId) {
      setUserId(contextUserId);
      setAuthLoading(false);
      return;
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        router.push("/login");
      }
      setAuthLoading(false);
    };
    getUser();
  }, [router, contextUserId]);

  useEffect(() => {
    // Si el contexto ya confirmó la verificación, no hace falta repetir la query
    if (!contextIsLoading && contextIsVerified) {
      setIsVerified(true);
      setCheckingVerification(false);
      return;
    }

    const checkVerification = async () => {
      if (!userId) return;

      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role, sacs_verificado, cedula_verificada")
          .eq("id", userId)
          .single();

        if (profileData) {
          const verified = 
            profileData.role === "medico" && 
            (profileData.sacs_verificado === true || profileData.cedula_verificada === true);
          
          setIsVerified(verified);

          if (verified && !profile && !profileLoading) {
            await createDoctorDetails(userId);
          }
        }
      } catch (error) {
        console.error("Error checking verification:", error);
      } finally {
        setCheckingVerification(false);
      }
    };

    if (userId && !profileLoading) {
      checkVerification();
    }
  }, [userId, profile, profileLoading, contextIsVerified, contextIsLoading]);

  const createDoctorDetails = async (doctorId: string) => {
    try {
      const { error } = await supabase
        .from("doctor_details")
        .insert({
          profile_id: doctorId,
          verified: true,
          sacs_verified: true,
        });

      if (!error) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error creating doctor_details:", error);
    }
  };

  const handleVerifySACS = async () => {
    if (!cedula || !userId) return;
    
    setVerifying(true);
    setVerificationResult(null);

    // Timeout de 2 minutos (el scraping del SACS puede tomar tiempo)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("timeout")), 120000)
    );

    try {
      const session = await supabase.auth.getSession();
      const fetchPromise = fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-doctor-sacs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.data.session?.access_token}`,
          },
          body: JSON.stringify({
            cedula,
            tipo_documento: tipoDocumento,
            user_id: userId,
          }),
        }
      );

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      const data = await response.json();
      setVerificationResult(data);
      
      if (data.verified) {
        setCurrentStep("success");
      }
    } catch (error: any) {
      console.error("Error verificando SACS:", error);
      
      let errorMessage = "Error al conectar con el servicio de verificación.";
      
      if (error.message === "timeout") {
        errorMessage = "El servicio de verificación está tardando más de lo normal. Por favor intenta de nuevo en unos segundos.";
      } else if (error.message?.includes("Failed to fetch") || error.name === "TypeError") {
        errorMessage = "No se pudo conectar con el servicio de verificación. Verifica tu conexión a internet.";
      }
      
      setVerificationResult({
        success: false,
        verified: false,
        message: errorMessage,
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleRegisterAfterSacs = async () => {
    if (!userId || !verificationResult?.verified || !verificationResult.data) return;

    setLoading(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'medico',
          nombre_completo: verificationResult.data.nombre_completo,
          cedula: verificationResult.data.cedula,
          nacionalidad: verificationResult.data.tipo_documento,
          cedula_verificada: true,
          sacs_verificado: true,
        })
        .eq('id', userId);

      if (profileError) {
        throw new Error(profileError.message);
      }

      const { error: doctorDetailsError } = await supabase
        .from('doctor_details')
        .upsert(
          {
            profile_id: userId,
            verified: true,
            sacs_verified: true,
          },
          { onConflict: 'profile_id' }
        );

      if (doctorDetailsError) {
        throw new Error(doctorDetailsError.message);
      }

      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo registrar el perfil.';
      alert(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerification = async () => {
    if (!manualNombre || !manualCedula || !manualEspecialidad || !userId) {
      alert("Por favor completa todos los campos");
      return;
    }
    
    setLoading(true);
    console.log("=== INICIO VERIFICACIÓN MANUAL ===");
    console.log("1. Datos recibidos:", { manualNombre, manualCedula, manualEspecialidad, manualTipo, userId });

    try {
      console.log("2. Obteniendo usuario de Supabase...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("2b. Error de autenticación:", authError);
        alert(`Error de autenticación: ${authError.message}`);
        setLoading(false);
        return;
      }
      
      console.log("2b. Usuario obtenido:", user?.id);

      if (!user) {
        alert("No se pudo obtener el usuario. Por favor inicia sesión nuevamente.");
        setLoading(false);
        return;
      }

      // Primero verificar si ya existe doctor_details
      console.log("3. Verificando si doctor_details existe...");
      const { data: existingDoctor, error: checkError } = await supabase
        .from("doctor_details")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      console.log("3b. Resultado verificación doctor_details:", { existingDoctor, checkError });

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("3c. Error checking doctor_details:", checkError);
      }

      // Actualizar perfil (incluyendo especialidad)
      console.log("4. Actualizando perfil en tabla 'profiles'...", {
        userId: user.id,
        data: {
          nombre_completo: manualNombre,
          cedula: manualCedula,
          // tipo_documento no existe en profiles, usamos nacionalidad
          nacionalidad: manualTipo, // V o E
          especialidad: manualEspecialidad,
          cedula_verificada: true,
          role: "medico",
        }
      });
      
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          nombre_completo: manualNombre,
          cedula: manualCedula,
          nacionalidad: manualTipo,
          especialidad: manualEspecialidad,
          cedula_verificada: true,
          role: "medico",
        })
        .eq("id", user.id);

      console.log("4b. Resultado update profile:", { profileError });

      if (profileError) {
        console.error("4c. ERROR actualizando profile:", profileError);
        alert(`Error al actualizar perfil: ${profileError.message}`);
        setLoading(false);
        return;
      }

      console.log("5. Perfil actualizado exitosamente!");

      // Solo crear doctor_details si no existe
      if (!existingDoctor) {
        console.log("6. Creando doctor_details...", { profile_id: user.id });
        const { error: doctorError } = await supabase
          .from("doctor_details")
          .insert({
            profile_id: user.id,
            verified: false,
            sacs_verified: false,
          });

        console.log("6b. Resultado insert doctor_details:", { doctorError });

        if (doctorError) {
          console.error("6c. ERROR creating doctor_details:", doctorError);
          alert(`Error al crear doctor_details: ${doctorError.message}`);
        } else {
          console.log("6d. doctor_details creado exitosamente!");
        }
      } else {
        console.log("6. doctor_details ya existe, omitiendo creación");
      }

      console.log("=== VERIFICACIÓN MANUAL COMPLETADA ===");
      setCurrentStep("success");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("=== ERROR EN VERIFICACIÓN MANUAL ===", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Atajo rápido: si el layout ya confirmó verificación, renderizar hijos sin spinner
  if (!contextIsLoading && contextIsVerified) {
    return <>{children}</>;
  }

  if (authLoading || profileLoading || checkingVerification) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none blur-sm opacity-50">
        {children}
      </div>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-3xl max-h-[95vh] overflow-hidden"
        >
          <Card className="border-2 shadow-2xl h-full flex flex-col">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Completa tu Perfil Profesional</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Verifica tu identidad como profesional de la salud en Venezuela
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 lg:p-6">
              <AnimatePresence mode="wait">
                {currentStep === "welcome" && (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20">
                        <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                          <Star className="h-5 w-5 text-primary" />
                          ¿Qué obtendrás?
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {BENEFICIOS.slice(0, 6).map((beneficio, index) => (
                            <div key={index} className="flex items-start gap-1.5">
                              <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center shrink-0">
                                <beneficio.icon className="h-3 w-3 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-xs">{beneficio.title}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div 
                        className="bg-muted/50 rounded-xl p-3"
                        onMouseEnter={() => setCarouselPaused(true)}
                        onMouseLeave={() => setCarouselPaused(false)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-sm">Suite por Especialidad</h3>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setCarouselIndex((prev) => (prev - 1 + totalCarousels) % totalCarousels)}
                              className="p-1 rounded-full hover:bg-muted transition-colors"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                            <span className="text-[10px] text-muted-foreground">
                              {carouselIndex + 1}/{totalCarousels}
                            </span>
                            <button
                              onClick={() => setCarouselIndex((prev) => (prev + 1) % totalCarousels)}
                              className="p-1 rounded-full hover:bg-muted transition-colors"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setCarouselPaused(!carouselPaused)}
                              className="p-1 rounded-full hover:bg-muted transition-colors ml-1"
                            >
                              {carouselPaused ? <Play className="h-2.5 w-2.5" /> : <Pause className="h-2.5 w-2.5" />}
                            </button>
                          </div>
                        </div>
                        
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={carouselIndex}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="grid grid-cols-4 gap-1.5">
                              {ICONOS_ESPECIALIDADES
                                .slice(carouselIndex * ITEMS_PER_CAROUSEL, (carouselIndex + 1) * ITEMS_PER_CAROUSEL)
                                .map((esp, index) => (
                                  <div 
                                    key={`${carouselIndex}-${index}`} 
                                    className="flex flex-col items-center gap-0.5 p-1.5 bg-background rounded-lg border"
                                  >
                                    <esp.icon className="h-4 w-4 text-primary" />
                                    <span className="text-[9px] text-center text-muted-foreground leading-tight">{esp.label}</span>
                                  </div>
                                ))}
                            </div>
                          </motion.div>
                        </AnimatePresence>
                        
                        <p className="text-[9px] text-muted-foreground mt-2 text-center">
                          +{ICONOS_ESPECIALIDADES.length} especialidades
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <Button
                        onClick={() => {
                          setVerificationMode("sacs");
                          setCurrentStep("verify-sacs");
                        }}
                        className="w-full h-10 text-sm"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Verificar con SACS
                        <ChevronRight className="h-3 w-3 ml-2" />
                      </Button>
                      <Button
                        onClick={() => {
                          setVerificationMode("manual");
                          setCurrentStep("verify-manual");
                        }}
                        variant="outline"
                        className="w-full h-10 text-sm"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Registro Manual
                      </Button>
                    </div>
                  </motion.div>
                )}

                {currentStep === "verify-sacs" && (
                  <motion.div
                    key="verify-sacs"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold">Verificación SACS</h3>
                      <p className="text-muted-foreground">Ingresa tu número de cédula venezolana</p>
                    </div>

                    <div className="max-w-md mx-auto space-y-4">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-3">
                          <Label>Tipo</Label>
                          <Select value={tipoDocumento} onValueChange={(v) => setTipoDocumento(v as "V" | "E")}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="V">V</SelectItem>
                              <SelectItem value="E">E</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-9">
                          <Label>Número de Cédula</Label>
                          <Input
                            type="text"
                            placeholder="12345678"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                            maxLength={10}
                            disabled={verifying || verificationResult?.verified}
                            className="h-10"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleVerifySACS}
                        disabled={verifying || !cedula || verificationResult?.verified}
                        className="w-full h-12"
                        size="lg"
                      >
                        {verifying ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Verificando...
                          </>
                        ) : verificationResult?.verified ? (
                          <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Verificado
                          </>
                        ) : (
                          <>
                            <Shield className="h-5 w-5 mr-2" />
                            Verificar con SACS
                          </>
                        )}
                      </Button>

                      {verificationResult && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          {verificationResult.verified ? (
                            <Alert className="border-green-500 bg-green-50 dark:bg-green-950/30">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <AlertDescription>
                                <div className="space-y-2">
                                  <p className="font-semibold text-green-900 dark:text-green-100">
                                    ¡Verificación Exitosa!
                                  </p>
                                  <div className="text-sm space-y-1">
                                    <p><strong>Nombre:</strong> {verificationResult.data?.nombre_completo}</p>
                                    <p><strong>Profesión:</strong> {verificationResult.data?.profesion_principal}</p>
                                    <p><strong>Especialidad:</strong> {verificationResult.data?.especialidad_display}</p>
                                  </div>
                                </div>
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <Alert variant="destructive">
                              <XCircle className="h-5 w-5" />
                              <AlertDescription>
                                <p className="font-semibold mb-1">Verificación Fallida</p>
                                <p className="text-sm">{verificationResult.message}</p>
                              </AlertDescription>
                            </Alert>
                          )}
                        </motion.div>
                      )}

                      {verificationResult?.verified && (
                        <Button
                          onClick={() => window.location.reload()}
                          className="w-full h-12"
                          size="lg"
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Acceder a la Plataforma
                        </Button>
                      )}
                    </div>

                    <div className="text-center pt-4">
                      <Button
                        variant="ghost"
                        onClick={() => setCurrentStep("welcome")}
                      >
                        ← Volver
                      </Button>
                    </div>
                  </motion.div>
                )}

                {currentStep === "verify-manual" && (
                  <motion.div
                    key="verify-manual"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold">Registro Manual</h3>
                      <p className="text-muted-foreground">Para profesionales no registrados en SACS</p>
                    </div>

                    <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
                      <AlertDescription className="text-sm">
                        <strong>Nota:</strong> Tu perfil será marcado como "pendiente de verificación" hasta que el equipo de Red-Salud valide tu información.
                      </AlertDescription>
                    </Alert>

                    <div className="max-w-md mx-auto space-y-4">
                      <div>
                        <Label>Nombre Completo</Label>
                        <Input
                          placeholder="Dr. Juan Pérez"
                          value={manualNombre}
                          onChange={(e) => setManualNombre(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-3">
                          <Label>Tipo</Label>
                          <Select value={manualTipo} onValueChange={(v) => setManualTipo(v as "V" | "E")}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="V">V</SelectItem>
                              <SelectItem value="E">E</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-9">
                          <Label>Número de Cédula</Label>
                          <Input
                            type="text"
                            placeholder="12345678"
                            value={manualCedula}
                            onChange={(e) => setManualCedula(e.target.value.replace(/\D/g, ""))}
                            maxLength={10}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Especialidad / Profesión</Label>
                        <SpecialtyCombobox
                          value={manualEspecialidad}
                          onChange={setManualEspecialidad}
                          allowedSpecialties={ESPECIALIDADES_LISTA}
                          placeholder="Escribe tu especialidad..."
                        />
                      </div>

                      <Button
                        onClick={handleManualVerification}
                        disabled={loading || !manualNombre || !manualCedula || !manualEspecialidad}
                        className="w-full h-12"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Creando Perfil...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Crear Perfil
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="text-center pt-4">
                      <Button
                        variant="ghost"
                        onClick={() => setCurrentStep("welcome")}
                      >
                        ← Volver
                      </Button>
                    </div>
                  </motion.div>
                )}

                {currentStep === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {verificationMode === 'sacs' && verificationResult?.verified && verificationResult.data ? (
                      <>
                        <div className="text-center">
                          <h3 className="text-xl font-bold">Confirma tus datos</h3>
                          <p className="text-muted-foreground">
                            Estos datos fueron obtenidos del SACS. Verifica que estén correctos antes de registrarte.
                          </p>
                        </div>

                        <div className="rounded-xl border bg-muted/30 p-4">
                          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <dt className="text-muted-foreground">Nombre completo</dt>
                              <dd className="font-medium">{verificationResult.data.nombre_completo}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Cédula</dt>
                              <dd className="font-medium">{verificationResult.data.tipo_documento}-{verificationResult.data.cedula}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Profesión</dt>
                              <dd className="font-medium">{verificationResult.data.profesion_principal}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">Matrícula</dt>
                              <dd className="font-medium">{verificationResult.data.matricula_principal}</dd>
                            </div>
                            <div className="sm:col-span-2">
                              <dt className="text-muted-foreground">Especialidad</dt>
                              <dd className="font-medium">{verificationResult.data.especialidad_display}</dd>
                            </div>
                          </dl>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={handleRegisterAfterSacs}
                            disabled={loading}
                            className="w-full h-12"
                            size="lg"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Registrando...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Registrar
                              </>
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            onClick={() => setCurrentStep('verify-sacs')}
                            className="w-full"
                            type="button"
                          >
                            ← Volver
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center">
                          <h3 className="text-xl font-bold">Registro completado</h3>
                          <p className="text-muted-foreground">Redirigiendo…</p>
                        </div>
                        <div className="flex justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
