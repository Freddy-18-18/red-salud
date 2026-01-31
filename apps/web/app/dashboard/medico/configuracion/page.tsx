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
import { ProfileSection } from "@/components/dashboard/medico/configuracion/profile-section";
import { ProfileSectionV2 } from "@/components/dashboard/medico/configuracion/profile-section-v2";
import { InfoProfesionalSection } from "@/components/dashboard/medico/configuracion/info-profesional-section";
import { DocumentsSection } from "@/components/dashboard/medico/configuracion/documents-section";
import { OfficesSection } from "@/components/dashboard/medico/configuracion/offices-section";
import { ScheduleSection } from "@/components/dashboard/medico/configuracion/schedule-section";
import { SecretariesSection } from "@/components/dashboard/medico/configuracion/secretaries-section";
import { NotificationsSection } from "@/components/dashboard/medico/configuracion/notifications-section";
import { PreferencesSection } from "@/components/dashboard/medico/configuracion/preferences-section";
import { SecuritySection } from "@/components/dashboard/medico/configuracion/security-section";
import { PrivacySection } from "@/components/dashboard/medico/configuracion/privacy-section";
import { ActivitySection } from "@/components/dashboard/medico/configuracion/activity-section";
import { BillingSection } from "@/components/dashboard/medico/configuracion/billing-section";
import { ShortcutsSection } from "@/components/dashboard/medico/configuracion/shortcuts-section";

/**
 * Tipos de tabs disponibles en la configuración
 */
type TabType =
  | "perfil"
  | "info-profesional"
  | "documentos"
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

import { Suspense } from "react";

function ConfiguracionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Obtener el tab activo directamente de la URL sin estado duplicado
  const tabFromUrl = searchParams.get("tab") as TabType;
  const activeTab = (tabFromUrl && TABS.some(t => t.id === tabFromUrl)) ? tabFromUrl : "perfil";

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
