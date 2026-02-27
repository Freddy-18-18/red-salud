"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Clock, MessageCircle, CircleHelp, Crown, Sparkles } from "lucide-react";
import { Alert, AlertDescription, Button } from "@red-salud/design-system";
import { useDoctorProfile } from "@/hooks/use-doctor-profile";
import { useDashboardWidgets } from "@/hooks/use-dashboard-widgets";
import { supabase } from "@/lib/supabase/client";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { SpecialtyDashboardSafe } from "@/components/dashboard/medico/specialty-dashboard-loader";
import { ThemeToggle } from "@red-salud/design-system";
import { useCurrentOffice } from "@/hooks/use-current-office";
import { OfficeQuickSelectorDropdown } from "@/components/dashboard/medico/office-quick-selector-dropdown";
import { FullDashboardSkeleton } from "@/components/dashboard/medico/dashboard/dashboard-skeleton";
import { useTourGuide } from "@/hooks/use-tour-guide";
import {
  getSpecialtyExperienceConfig,
  type SpecialtyContext,
} from "@/lib/specialties";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { profile, loading } = useDoctorProfile(
    userId || undefined
  );

  // Dashboard widgets state - necesita userId para persistir en Supabase
  const {
    currentMode,
    setMode,
  } = useDashboardWidgets(userId || undefined);

  // Current office state
  const { currentOffice, allOffices, updateCurrentOffice } = useCurrentOffice();

  // Tour guide
  const { startTour } = useTourGuide();

  // Si no hay perfil de médico, necesita completar setup
  const needsSetup = !loading && !profile && !!userId;

  // MODO PRUEBA: Permitir forzar dashboard de odontología en desarrollo
  // Para usar: agrega ?test=odontologia al URL
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const forceDashboardVariant =
    process.env.NODE_ENV !== "production" && searchParams.get("test") === "odontologia"
      ? ("odontologia" as const)
      : undefined;

  const specialtyExperience = getSpecialtyExperienceConfig({
    specialtySlug: profile?.specialty?.slug,
    specialtyName: profile?.specialty?.name || profile?.profile?.sacs_especialidad || profile?.sacs_especialidad,
    sacsEspecialidad: profile?.profile?.sacs_especialidad || profile?.sacs_especialidad,
    subSpecialties: profile?.subespecialidades,
    forceDashboardVariant,
  });

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        router.push("/login/medico");
      }
      setAuthLoading(false);
    };
    getUser();
  }, [router]);

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
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = today.toLocaleDateString("es-ES", dateOptions);

  if (authLoading || loading) {
    return (
      <div className="relative min-h-screen">
        {/* Background simplificado para loading */}
        <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/20 -z-10" />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <FullDashboardSkeleton />
        </div>
      </div>
    );
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
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 dark:from-primary/25 dark:to-secondary/25 blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-[20%] left-[5%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-secondary/10 to-primary/10 dark:from-secondary/18 dark:to-primary/18 blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, 15, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-[50%] left-[50%] w-[250px] h-[250px] rounded-full bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/18 dark:to-secondary/18 blur-[80px]"
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="fixed inset-0 opacity-[0.02] dark:opacity-[0.06] -z-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
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
          {/* Header Section - Solo en móvil, en desktop está en el layout */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:hidden"
            data-tour="dashboard-header"
          >
            <div className="space-y-1">
              {/* Greeting with gradient */}
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {getGreeting()},{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Dr. {profile?.nombre_completo?.split(" ")[0] || "Doctor"}
                </span>
              </h1>

              {/* Date and specialty */}
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm capitalize">{formattedDate}</span>
                </div>

                {/* Current Office - Opción A: Dropdown */}
                {currentOffice && (
                  <>
                    <span className="text-border">•</span>
                    <OfficeQuickSelectorDropdown
                      currentOffice={currentOffice}
                      offices={allOffices}
                      onChange={updateCurrentOffice}
                    />
                  </>
                )}

                <span className="text-border">•</span>
                <span className="text-sm">
                  {profile?.specialty?.name ||
                    profile?.sacs_especialidad ||
                    "Médico"}
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
                onClick={() =>
                  document.dispatchEvent(new CustomEvent("toggle-chat"))
                }
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
                onClick={() => startTour("dashboard-overview")}
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
                onClick={() =>
                  setMode(currentMode === "simple" ? "pro" : "simple")
                }
                className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm border border-border/30 hover:bg-muted/80 hover:border-primary/30 transition-colors select-none"
                title="Click para cambiar modo"
              >
                <span
                  className="text-sm font-medium text-muted-foreground"
                  data-tour="mode-indicator"
                >
                  Modo:{" "}
                  <span
                    className={
                      currentMode === "pro"
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 font-bold"
                        : "text-primary capitalize"
                    }
                  >
                    {currentMode}
                  </span>
                </span>
                {currentMode === "pro" && (
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
                  Tu perfil está pendiente de verificación. Mientras tanto,
                  puedes configurar tu agenda y perfil.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Test Mode Alert */}
          {forceDashboardVariant && (
            <motion.div variants={fadeInUp}>
              <Alert className="bg-purple-500/10 border-purple-500/30 dark:bg-purple-500/15 dark:border-purple-500/40">
                <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                <AlertDescription className="text-purple-700 dark:text-purple-300">
                  <strong>MODO PRUEBA:</strong> Estás viendo el dashboard de
                  Odontología forzado para desarrollo. En producción, esto se
                  detectará automáticamente según tu especialidad SACS.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Specialty Dashboard - Dynamically loads from SpecialtyConfig */}
          <motion.div variants={fadeInUp}>
            <SpecialtyDashboardSafe
              config={specialtyExperience}
              userId={userId || undefined}
              subSpecialties={profile?.subespecialidades}
              profileName={profile?.nombre_completo}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );

  // Setup overlay wrapper - usar nuevo componente de verificación
  if (needsSetup) {
    return (
      <VerificationGuard>
        {dashboardContent}
      </VerificationGuard>
    );
  }

  // Fallback return
  return dashboardContent;
}
