"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Star, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDoctorProfile } from "@/hooks/use-doctor-profile";
import { supabase } from "@/lib/supabase/client";

interface VerificationGuardProps {
  children: React.ReactNode;
}

export function VerificationGuard({ children }: VerificationGuardProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { profile, loading } = useDoctorProfile(userId || undefined);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        router.push("/login/medico");
      }
      setAuthLoading(false);
    };
    getUser();
  }, [router]);

  // Mostrar loading mientras se verifica
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Si no tiene perfil, mostrar overlay de verificación
  if (!profile) {
    return (
      <div className="relative">
        {/* Contenido con blur */}
        <div className="pointer-events-none blur-sm opacity-50">
          {children}
        </div>

        {/* Overlay de verificación */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full mx-4"
          >
            <Card className="border-2 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">
                  Completa tu Perfil Profesional
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Para acceder a esta sección, necesitas verificar tu identidad
                  como profesional de la salud en Venezuela
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Beneficios */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    ¿Qué obtendrás?
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Gestión completa de tu agenda y citas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Acceso a historiales clínicos de tus pacientes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Sistema de telemedicina integrado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>Emisión de recetas y órdenes médicas digitales</span>
                    </li>
                  </ul>
                </div>

                {/* Proceso de verificación */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    Proceso de Verificación
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                        1
                      </div>
                      <span>Ingresa tu número de cédula venezolana</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                        2
                      </div>
                      <span>Verificamos tu registro en el SACS automáticamente</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                        3
                      </div>
                      <span>Completa tu información profesional</span>
                    </div>
                  </div>
                </div>

                {/* Botón de acción */}
                <Button
                  onClick={() => router.push("/dashboard/medico/perfil/setup")}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  Comenzar Verificación
                </Button>

                <p className="text-xs text-center text-gray-500">
                  La verificación es instantánea y utiliza datos públicos del SACS
                  (Sistema de Atención al Ciudadano en Salud)
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Si tiene perfil, mostrar contenido normal
  return <>{children}</>;
}
