/**
 * @file page.tsx
 * @description Página principal de configuración del médico.
 * Centro de control unificado para todas las preferencias y configuraciones con diseño minimalista.
 * @module Dashboard/Medico/Configuracion
 */

"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { ProfileSection } from "@/components/dashboard/medico/configuracion/profile-section";
import { InfoProfesionalSection } from "@/components/dashboard/medico/configuracion/info-profesional-section";
import { DocumentsSection } from "@/components/dashboard/medico/configuracion/documents-section";
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

const CATEGORY_LABELS: Record<TabConfig["category"], string> = {
  perfil: "Mi Perfil",
  consultorio: "Consultorio",
  sistema: "Sistema",
  cuenta: "Cuenta",
};

export default function ConfiguracionMedicoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>((searchParams.get("tab") as TabType) || "perfil");

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabType;
    if (tabFromUrl && TABS.some(t => t.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    const newUrl = tabId === "perfil"
      ? "/dashboard/medico/configuracion"
      : `/dashboard/medico/configuracion?tab=${tabId}`;
    router.push(newUrl, { scroll: false });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "perfil": return <ProfileSection />;
      case "info-profesional": return <InfoProfesionalSection />;
      case "documentos": return <DocumentsSection />;
      case "horarios": return <ScheduleSection />;
      case "secretarias": return <SecretariesSection />;
      case "notificaciones": return <NotificationsSection />;
      case "preferencias": return <PreferencesSection />;
      case "shortcuts": return <ShortcutsSection />;
      case "seguridad": return <SecuritySection />;
      case "privacidad": return <PrivacySection />;
      case "actividad": return <ActivitySection />;
      case "facturacion": return <BillingSection />;
      default: return <ProfileSection />;
    }
  };

  const tabsByCategory = TABS.reduce((acc, tab) => {
    if (!acc[tab.category]) acc[tab.category] = [];
    acc[tab.category].push(tab);
    return acc;
  }, {} as Record<TabConfig["category"], TabConfig[]>);

  return (
    <VerificationGuard>
      <div className="min-h-screen bg-white dark:bg-gray-950 relative lg:pr-16 transition-all duration-300">
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

        {/* Sidebar Minimalista Fixed Right */}
        <aside className="fixed right-0 top-0 h-screen z-[100] group hidden lg:block">
          <div className="
              absolute inset-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-l border-gray-100 dark:border-gray-800 
              w-16 group-hover:w-64 transition-all duration-300 ease-in-out shadow-[-10px_0_30px_rgba(0,0,0,0.02)]
            " />

          <div className="relative h-full flex flex-col w-16 group-hover:w-64 transition-all duration-300 overflow-hidden">
            <div className="h-20 flex items-center px-6">
              <div className="shrink-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-500 rounded-sm rotate-45" />
              </div>
              <span className="ml-8 font-semibold text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Ajustes
              </span>
            </div>

            <nav className="flex-1 px-3 space-y-6 overflow-y-auto scrollbar-hide">
              {(Object.keys(tabsByCategory) as TabConfig["category"][]).map((category) => (
                <div key={category} className="space-y-1">
                  <div className="h-4 flex items-center px-3 mb-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      {CATEGORY_LABELS[category]}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    {tabsByCategory[category].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id)}
                          className={`
                            w-full flex items-center h-10 rounded-lg transition-all relative group/btn
                            ${isActive
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                            }
                          `}
                        >
                          <div className="w-10 flex justify-center items-center shrink-0">
                            <Icon className={`h-4.5 w-4.5 ${isActive ? "scale-110" : "group-hover/btn:scale-110"}`} />
                          </div>

                          <span className="ml-3 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {tab.label}
                          </span>

                          {isActive && (
                            <div className="absolute right-0 w-1 h-3 bg-blue-600 rounded-l-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="h-10" />
          </div>
        </aside>
      </div>
    </VerificationGuard>
  );
}
