"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Star,
  MessageSquare,
  FileText,
  Video,
  Activity,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDoctorProfile } from "@/hooks/use-doctor-profile";
import { supabase } from "@/lib/supabase/client";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { profile, stats, loading, error } = useDoctorProfile(userId || undefined);
  const [needsSetup, setNeedsSetup] = useState(false);

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

  useEffect(() => {
    // Si no hay perfil de médico, necesita completar setup
    if (!loading && !profile && userId) {
      setNeedsSetup(true);
    }
  }, [profile, loading, userId]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Definir stats y actions
  const quickStats = [
    {
      title: "Citas Hoy",
      value: stats?.todayAppointments || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pacientes Totales",
      value: stats?.totalPatients || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Consultas Completadas",
      value: stats?.completedAppointments || 0,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Calificación",
      value: profile?.average_rating?.toFixed(1) || "0.0",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  const quickActions = [
    {
      title: "Ver Agenda",
      description: "Gestiona tus citas del día",
      icon: Calendar,
      href: "/dashboard/medico/citas",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Pacientes",
      description: "Lista de tus pacientes",
      icon: Users,
      href: "/dashboard/medico/pacientes",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Mensajes",
      description: "Comunicación con pacientes",
      icon: MessageSquare,
      href: "/dashboard/medico/mensajeria",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Telemedicina",
      description: "Consultas virtuales",
      icon: Video,
      href: "/dashboard/medico/telemedicina",
      color: "from-teal-500 to-teal-600",
    },
    {
      title: "Recetas",
      description: "Gestionar prescripciones",
      icon: FileText,
      href: "/dashboard/medico/recetas",
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Estadísticas",
      description: "Ver métricas y reportes",
      icon: TrendingUp,
      href: "/dashboard/medico/estadisticas",
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  // Filtrar acciones según módulos habilitados
  const enabledModules = profile?.specialty?.modules_config || {};
  const filteredActions = quickActions.filter((action) => {
    const moduleKey = action.href.split("/").pop();
    if (moduleKey === "citas") return (enabledModules as any).citas !== false;
    if (moduleKey === "pacientes") return (enabledModules as any).historial !== false;
    if (moduleKey === "mensajeria") return (enabledModules as any).mensajeria !== false;
    if (moduleKey === "telemedicina") return (enabledModules as any).telemedicina !== false;
    if (moduleKey === "recetas") return (enabledModules as any).recetas !== false;
    return true;
  });

  // Función para obtener saludo según la hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  // Renderizar dashboard con overlay si necesita setup
  const renderDashboard = () => (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, Dr. {profile?.nombre_completo?.split(' ')[0] || "Doctor"}
          </h1>
          <p className="text-gray-600 mt-2">
            {profile?.specialty?.name || profile?.sacs_especialidad || "Médico"} •{" "}
            {profile?.is_verified || profile?.sacs_verified ? "Verificado ✓" : "Pendiente de verificación"}
          </p>
        </motion.div>

        {/* Alerta si no está verificado */}
        {!profile?.is_verified && (
          <motion.div variants={fadeInUp}>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tu perfil está pendiente de verificación. Mientras tanto, puedes
                configurar tu agenda y perfil.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeInUp}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Acceso Rápido
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.title}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(action.href)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`bg-gradient-to-br ${action.color} p-3 rounded-lg`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Próximas Citas */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Citas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center py-8">
                No hay citas programadas para hoy
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );

  if (needsSetup) {
    return (
      <div className="relative">
        {/* Dashboard con blur */}
        <div className="pointer-events-none blur-sm opacity-50">
          {renderDashboard()}
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
                  Para comenzar a usar Red-Salud, necesitamos verificar tu identidad
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Si no necesita setup, renderizar dashboard normal
  return renderDashboard();
}
