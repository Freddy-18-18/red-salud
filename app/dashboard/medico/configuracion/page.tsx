"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import {
  User,
  Settings,
  Shield,
  Eye,
  Activity,
  CreditCard,
  Loader2,
} from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/verification-guard";
import { PreferencesTab } from "@/components/dashboard/profile/tabs/preferences-tab";
import { SecurityTabNew as SecurityTab } from "@/components/dashboard/profile/tabs/security-tab-new";
import { PrivacyTab } from "@/components/dashboard/profile/tabs/privacy-tab";
import { ActivityTab } from "@/components/dashboard/profile/tabs/activity-tab";
import { BillingTab } from "@/components/dashboard/profile/tabs/billing-tab";

type TabType = "perfil" | "preferencias" | "seguridad" | "privacidad" | "actividad" | "facturacion";

interface TabConfig {
  id: TabType;
  label: string;
  icon: any;
}

const TABS: TabConfig[] = [
  { id: "perfil", label: "Mi Perfil", icon: User },
  { id: "preferencias", label: "Preferencias", icon: Settings },
  { id: "seguridad", label: "Seguridad", icon: Shield },
  { id: "privacidad", label: "Privacidad", icon: Eye },
  { id: "actividad", label: "Actividad", icon: Activity },
  { id: "facturacion", label: "Facturación", icon: CreditCard },
];

export default function ConfiguracionMedicoPage() {
  const [activeTab, setActiveTab] = useState<TabType>("perfil");
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga inicial
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <VerificationGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Configuración
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Administra tu perfil profesional y preferencias
          </p>
        </div>

      {/* Tab Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <AnimatePresence mode="wait">
          {activeTab === "perfil" && (
            <motion.div
              key="perfil"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center py-12">
                <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Perfil Profesional
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Esta sección está en desarrollo
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Pronto podrás editar tu información profesional, especialidades y credenciales
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === "preferencias" && <PreferencesTab />}
          
          {activeTab === "seguridad" && user && (
            <SecurityTab 
              userEmail={user.email || ""} 
              userId={user.id} 
            />
          )}
          
          {activeTab === "privacidad" && user && (
            <PrivacyTab userId={user.id} />
          )}
          
          {activeTab === "actividad" && user && (
            <ActivityTab userId={user.id} />
          )}
          
          {activeTab === "facturacion" && user && (
            <BillingTab userId={user.id} />
          )}
        </AnimatePresence>
      </div>
    </div>
    </VerificationGuard>
  );
}
