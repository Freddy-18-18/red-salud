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
  Settings,
  Keyboard,
  Briefcase,
  FileText,
  Palette,
  Eye,
  Activity,
  CreditCard,
  MapPin,
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
const InfoProfesionalSection = dynamic(() => import("@/components/dashboard/medico/configuracion/info-profesional-section").then(mod => mod.InfoProfesionalSection), {
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

  const handleTabChange = (tabId: TabType) => {
    const newUrl = tabId === "perfil"
      ? "/dashboard/medico/configuracion"
      : `/dashboard/medico/configuracion?tab=${tabId}`;
    router.push(newUrl, { scroll: false });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "perfil": return <ProfileSectionV2 />;
      case "info-profesional": return <InfoProfesionalSection />;
      case "documentos": return <DocumentsSection />;
      case "recetas": return <RecipeSettingsSection />;
      case "consultorios": return <OfficesSection />;
      case "horarios": return <ScheduleSection />;
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
        // Otras secciones usan el layout tradicional
        <div className="min-h-screen bg-white dark:bg-gray-950">
          <div className="container mx-auto px-6 py-10 max-w-[1400px]">
            {/* Header Minimalista */}
            <div className="flex items-center gap-4 mb-10">
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-800">
                <Settings className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                  Configuración
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Gestiona tu perfil y sistema
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="w-full">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm min-h-[800px]"
                >
                  {renderTabContent()}
                </motion.div>
              </div>
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
