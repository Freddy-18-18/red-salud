/**
 * @file page.tsx
 * @description Página principal de configuración del médico.
 * Centro de control unificado para todas las preferencias y configuraciones con diseño minimalista.
 * @module Dashboard/Medico/Configuracion
 */

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Clock,
  Users,
  Bell,
  Shield,
  Keyboard,
  Briefcase,
  FileText,
  Palette,
  Eye,
  Activity,
  CreditCard,
  MapPin,
  Calendar,
} from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { ProfileSectionV2 } from "@/components/dashboard/medico/configuracion/profile-section-v2";
import { Skeleton } from "@red-salud/ui";
import dynamic from "next/dynamic";

const LoadingFallback = () => <div className="w-full h-[400px] rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />;

// Lazy load non-critical sections
const RecipeSettingsSection = dynamic(() => import("@/components/dashboard/medico/configuracion/recipe-settings-section").then(mod => mod.RecipeSettingsSection), {
  loading: () => <LoadingFallback />
});
const InfoProfesionalSection = dynamic(() => import("@/components/dashboard/medico/configuracion/info-profesional-section-v2").then(mod => mod.InfoProfesionalSectionV2), {
  loading: () => <LoadingFallback />
});
const DocumentsSection = dynamic(() => import("@/components/dashboard/medico/configuracion/documents-section").then(mod => mod.DocumentsSection), {
  loading: () => <LoadingFallback />
});
const OfficesSection = dynamic(() => import("@/components/dashboard/medico/configuracion/offices-section").then(mod => mod.OfficesSection), {
  loading: () => <LoadingFallback />
});
const ScheduleSection = dynamic(() => import("@/components/dashboard/medico/configuracion/schedule-section").then(mod => mod.ScheduleSection), {
  loading: () => <LoadingFallback />
});
const SecretariesSection = dynamic(() => import("@/components/dashboard/medico/configuracion/secretaries-section").then(mod => mod.SecretariesSection), {
  loading: () => <LoadingFallback />
});
const NotificationsSection = dynamic(() => import("@/components/dashboard/medico/configuracion/notifications-section").then(mod => mod.NotificationsSection), {
  loading: () => <LoadingFallback />
});
const PreferencesSection = dynamic(() => import("@/components/dashboard/medico/configuracion/preferences-section").then(mod => mod.PreferencesSection), {
  loading: () => <LoadingFallback />
});
const SecuritySection = dynamic(() => import("@/components/dashboard/medico/configuracion/security-section").then(mod => mod.SecuritySection), {
  loading: () => <LoadingFallback />
});
const PrivacySection = dynamic(() => import("@/components/dashboard/medico/configuracion/privacy-section").then(mod => mod.PrivacySection), {
  loading: () => <LoadingFallback />
});
const ActivitySection = dynamic(() => import("@/components/dashboard/medico/configuracion/activity-section").then(mod => mod.ActivitySection), {
  loading: () => <LoadingFallback />
});
const BillingSection = dynamic(() => import("@/components/dashboard/medico/configuracion/billing-section").then(mod => mod.BillingSection), {
  loading: () => <Skeleton className="w-full h-[400px] rounded-xl" />
});
const ShortcutsSection = dynamic(() => import("@/components/dashboard/medico/configuracion/shortcuts-section").then(mod => mod.ShortcutsSection), {
  loading: () => <Skeleton className="w-full h-[400px] rounded-xl" />
});
const IntegrationsSection = dynamic(() => import("@/components/dashboard/medico/configuracion/integrations-section").then(mod => mod.IntegrationsSection), {
  loading: () => <Skeleton className="w-full h-[400px] rounded-xl" />
});
// ProfileSection removed from list to avoid duplicate imports (it is imported statically)

/**
 * Tipos de tabs disponibles en la configuración
 */
type TabType =
  | "perfil"
  | "info-profesional"
  | "documentos"
  | "recetas"
  | "consultorios"
  | "horarios"
  | "secretarias"
  | "notificaciones"
  | "preferencias"
  | "seguridad"
  | "privacidad"
  | "integraciones"
  | "actividad"
  | "facturacion"
  | "shortcuts";

/**
 * Configuración de cada tab
 */
interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: "perfil" | "consultorio" | "sistema" | "cuenta";
}

/**
 * Definición de todos los tabs de configuración organizados por categoría
 */
const TABS: TabConfig[] = [
  { id: "perfil", label: "Perfil Básico", icon: User, description: "Datos personales", category: "perfil" },
  { id: "info-profesional", label: "Info. Profesional", icon: Briefcase, description: "Bio y certificados", category: "perfil" },
  { id: "documentos", label: "Documentos", icon: FileText, description: "Verificación", category: "perfil" },
  { id: "recetas", label: "Recetas", icon: FileText, description: "Plantillas", category: "perfil" },
  { id: "consultorios", label: "Consultorios", icon: MapPin, description: "Ubicaciones", category: "consultorio" },
  { id: "horarios", label: "Horarios", icon: Clock, description: "Atención", category: "consultorio" },
  { id: "integraciones", label: "Integraciones", icon: Calendar, description: "Google Calendar", category: "consultorio" },
  { id: "secretarias", label: "Secretarias", icon: Users, description: "Equipo", category: "consultorio" },
  { id: "notificaciones", label: "Notificaciones", icon: Bell, description: "Alertas", category: "sistema" },
  { id: "preferencias", label: "Preferencias", icon: Palette, description: "Tema e idioma", category: "sistema" },
  { id: "shortcuts", label: "Atajos", icon: Keyboard, description: "Teclas rápidas", category: "sistema" },
  { id: "seguridad", label: "Seguridad", icon: Shield, description: "Cuenta", category: "cuenta" },
  { id: "privacidad", label: "Privacidad", icon: Eye, description: "Datos", category: "cuenta" },
  { id: "actividad", label: "Actividad", icon: Activity, description: "Historial", category: "cuenta" },
  { id: "facturacion", label: "Facturación", icon: CreditCard, description: "Pagos", category: "cuenta" },
];

import { Suspense, useEffect } from "react";

function ConfiguracionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Obtener el tab activo directamente de la URL sin estado duplicado
  let tabFromUrl = searchParams.get("tab");

  if (tabFromUrl === "configuracion-recetas") {
    tabFromUrl = "recetas";
  }

  // Redirigir si estamos en el tab de recetas
  useEffect(() => {
    if (tabFromUrl === "recetas") {
      router.push("/dashboard/medico/recetas/configuracion");
    }
  }, [tabFromUrl, router]);

  const activeTab = (tabFromUrl && TABS.some(t => t.id === tabFromUrl)) ? (tabFromUrl as TabType) : "perfil";

  const renderTabContent = () => {
    switch (activeTab) {
      case "perfil": return <ProfileSectionV2 />;
      case "info-profesional": return <InfoProfesionalSection />;
      case "documentos": return <DocumentsSection />;
      case "recetas": return <RecipeSettingsSection />;
      case "consultorios": return <OfficesSection />;
      case "horarios": return <ScheduleSection />;
      case "integraciones": return <IntegrationsSection />;
      case "secretarias": return <SecretariesSection />;
      case "notificaciones": return <NotificationsSection />;
      case "preferencias": return <PreferencesSection />;
      case "shortcuts": return <ShortcutsSection />;
      case "seguridad": return <SecuritySection />;
      case "privacidad": return <PrivacySection />;
      case "actividad": return <ActivitySection />;
      case "facturacion": return <BillingSection />;
      default: return <ProfileSectionV2 />;
    }
  };

  return (
    <VerificationGuard>
      {activeTab === "perfil" ? (
        // Perfil V2 usa su propio layout completo
        <ProfileSectionV2 />
      ) : (
        // Otras secciones usan el layout profesional full-width
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div className="w-full h-full px-8 py-8">
            {/* Content Area con animaciones fluidas */}
            <div className="relative">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden"
              >
                <div className="p-10">
                  {renderTabContent()}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </VerificationGuard>
  );
}

export default function ConfiguracionMedicoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      }
    >
      <ConfiguracionContent />
    </Suspense>
  );
}
