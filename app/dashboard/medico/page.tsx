"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  Star,
  Sparkles,
  AlertCircle,
  Clock,
  CircleHelp,
  Crown,
  MessageCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDoctorProfile } from "@/hooks/use-doctor-profile";
import { useDashboardWidgets } from "@/hooks/use-dashboard-widgets";
import { useTourGuide } from "@/components/dashboard/tour-guide/tour-guide-provider";
import { supabase } from "@/lib/supabase/client";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { DashboardWidgetGrid } from "@/components/dashboard/medico/dashboard";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { profile, stats, loading, error } = useDoctorProfile(userId || undefined);
  const [needsSetup, setNeedsSetup] = useState(false);
  const { startTour } = useTourGuide();

  // Dashboard widgets state - necesita userId para persistir en Supabase
  const {
    currentMode,
    setMode,
    getWidgetPositions,
    saveLayout,
    resetLayout,
    toggleWidgetVisibility,
    state,
    isLoading: widgetsLoading,
  } = useDashboardWidgets(userId || undefined);

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

  // Función para obtener saludo según la hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  // Get current date info
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const formattedDate = today.toLocaleDateString('es-ES', dateOptions);

  if (authLoading || loading) {
    return null;
  }


  // Main render logic
  const dashboardContent = (
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/20 -z-10" />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 dark:from-primary/25 dark:to-secondary/25 blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-[20%] left-[5%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-secondary/10 to-primary/10 dark:from-secondary/18 dark:to-primary/18 blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, 15, 0],
            y: [0, -15, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-[50%] left-[50%] w-[250px] h-[250px] rounded-full bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/18 dark:to-secondary/18 blur-[80px]"
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="fixed inset-0 opacity-[0.02] dark:opacity-[0.06] -z-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          {/* Header Section */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            data-tour="dashboard-header"
          >
            <div className="space-y-1">
              {/* Greeting with gradient */}
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {getGreeting()},{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Dr. {profile?.nombre_completo?.split(' ')[0] || "Doctor"}
                </span>
              </h1>

              {/* Date and specialty */}
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm capitalize">{formattedDate}</span>
                </div>
                <span className="text-border">•</span>
                <span className="text-sm">
                  {profile?.specialty?.name || profile?.sacs_especialidad || "Médico"}
                </span>
                {(profile?.is_verified || profile?.sacs_verified) && (
                  <>
                    <span className="text-border">•</span>
                    <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                      <Sparkles className="h-3 w-3" />
                      Verificado
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Mode indicator and Actions */}
            <div className="flex items-center gap-2">
              {/* Chat Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => document.dispatchEvent(new CustomEvent('toggle-chat'))}
                className="text-muted-foreground hover:text-primary"
                title="Chat Asistente"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>

              {/* Theme Toggle */}
              <ThemeToggle className="w-9 h-9 border-none bg-transparent hover:bg-muted/50 hidden sm:flex" />

              {/* Tour Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startTour('dashboard-overview')}
                className="text-muted-foreground hover:text-primary"
                title="Iniciar Tour"
                data-tour="help-button"
              >
                <CircleHelp className="h-5 w-5" />
              </Button>

              {/* Mode Badge - Interactive Switch */}
              <motion.div
                key={currentMode}
                initial={{ x: 0 }}
                animate={{ x: [0, -5, 5, -5, 5, 0] }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode(currentMode === 'simple' ? 'pro' : 'simple')}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm border border-border/30 hover:bg-muted/80 hover:border-primary/30 transition-colors select-none"
                title="Click para cambiar modo"
              >
                <span className="text-sm font-medium text-muted-foreground" data-tour="mode-indicator">
                  Modo: <span className={currentMode === 'pro' ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 font-bold" : "text-primary capitalize"}>
                    {currentMode}
                  </span>
                </span>
                {currentMode === 'pro' && (
                  <Crown className="h-4 w-4 text-amber-500 fill-amber-500/20 animate-pulse" />
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Verification Alert */}
          {!profile?.is_verified && !profile?.sacs_verified && (
            <motion.div variants={fadeInUp}>
              <Alert className="bg-yellow-500/10 border-yellow-500/30 dark:bg-yellow-500/15 dark:border-yellow-500/40">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  Tu perfil está pendiente de verificación. Mientras tanto, puedes
                  configurar tu agenda y perfil.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Widget Grid */}
          <motion.div variants={fadeInUp}>
            <DashboardWidgetGrid
              mode={currentMode}
              positions={getWidgetPositions()}
              hiddenWidgets={state.hiddenWidgets}
              onPositionsChange={saveLayout}
              onModeChange={setMode}
              onResetLayout={resetLayout}
              onToggleWidget={toggleWidgetVisibility}
              doctorId={userId || undefined}
              stats={stats}
              profile={profile}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );

  // Setup overlay wrapper
  if (needsSetup) {
    return (
      <div className="relative">
        {/* Dashboard con blur */}
        <div className="pointer-events-none blur-sm opacity-50">
          {dashboardContent}
        </div>

        {/* Overlay de verificación */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-2xl w-full mx-4"
          >
            <Card className="border-2 shadow-2xl bg-card/95 backdrop-blur-xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">
                  Completa tu Perfil Profesional
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Para comenzar a usar Red-Salud, necesitamos verificar tu identidad
                  como profesional de la salud en Venezuela
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Beneficios */}
                <div className="bg-primary/5 rounded-xl p-4 space-y-3 border border-primary/10">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    ¿Qué obtendrás?
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Gestión completa de tu agenda y citas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Acceso a historiales clínicos de tus pacientes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Sistema de telemedicina integrado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>Emisión de recetas y órdenes médicas digitales</span>
                    </li>
                  </ul>
                </div>

                {/* Proceso de verificación */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">
                    Proceso de Verificación
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                        1
                      </div>
                      <span>Ingresa tu número de cédula venezolana</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                        2
                      </div>
                      <span>Verificamos tu registro en el SACS automáticamente</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                        3
                      </div>
                      <span>Completa tu información profesional</span>
                    </div>
                  </div>
                </div>

                {/* Botón de acción */}
                <Button
                  onClick={() => router.push("/dashboard/medico/perfil/setup")}
                  className="w-full h-12 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40"
                  size="lg"
                >
                  Comenzar Verificación
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-xs text-center text-muted-foreground">
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

  // Fallback return
  return dashboardContent;
}
