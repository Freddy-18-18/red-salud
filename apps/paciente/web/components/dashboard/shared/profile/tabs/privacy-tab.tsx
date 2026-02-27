import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, FileText, Users, MapPin, Activity, Globe, Download } from "lucide-react";
import { Button } from "@red-salud/design-system";
import { updatePrivacySettings } from "@/lib/supabase/services/settings-service";

interface PrivacyTabProps {
  userId?: string;
}

export function PrivacyTab({ userId }: PrivacyTabProps) {
  const [settings, setSettings] = useState({
    profilePublic: true,
    shareMedicalHistory: true,
    showProfilePhoto: true,
    shareLocation: false,
    anonymousDataResearch: false,
    analyticsCookies: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    if (userId) {
      setIsSaving(true);
      await updatePrivacySettings(userId, {
        profile_public: newSettings.profilePublic,
        share_medical_history: newSettings.shareMedicalHistory,
        show_profile_photo: newSettings.showProfilePhoto,
        share_location: newSettings.shareLocation,
        anonymous_data_research: newSettings.anonymousDataResearch,
        analytics_cookies: newSettings.analyticsCookies,
      });
      setIsSaving(false);
    }
  };

  const privacyOptions = [
    {
      key: "profilePublic" as const,
      icon: Eye,
      label: "Perfil Público",
      description: "Visible para médicos verificados",
      checked: settings.profilePublic,
    },
    {
      key: "shareMedicalHistory" as const,
      icon: FileText,
      label: "Compartir Historial Médico",
      description: "Con médicos autorizados",
      checked: settings.shareMedicalHistory,
    },
    {
      key: "showProfilePhoto" as const,
      icon: Users,
      label: "Mostrar Foto de Perfil",
      description: "En consultas y mensajes",
      checked: settings.showProfilePhoto,
    },
    {
      key: "shareLocation" as const,
      icon: MapPin,
      label: "Compartir Ubicación",
      description: "Para servicios de emergencia",
      checked: settings.shareLocation,
    },
    {
      key: "anonymousDataResearch" as const,
      icon: Activity,
      label: "Datos Anónimos para Investigación",
      description: "Ayuda a mejorar la medicina",
      checked: settings.anonymousDataResearch,
    },
    {
      key: "analyticsCookies" as const,
      icon: Globe,
      label: "Cookies de Análisis",
      description: "Mejora la experiencia del usuario",
      checked: settings.analyticsCookies,
    },
  ];

  return (
    <motion.article
      key="privacy"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Privacidad y Datos
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Controla quién puede ver tu información y cómo se usa
        </p>
      </header>

      <div className="grid grid-cols-2 gap-6">
        <section className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Visibilidad del Perfil
          </h3>

          {privacyOptions.slice(0, 3).map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.key}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={option.checked}
                    onChange={() => handleToggle(option.key)}
                    disabled={isSaving}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            );
          })}
        </section>

        <section className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Uso de Datos
          </h3>

          {privacyOptions.slice(3).map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.key}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={option.checked}
                    onChange={() => handleToggle(option.key)}
                    disabled={isSaving}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            );
          })}

          <button className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Descargar Mis Datos
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Obtén una copia de tu información
              </p>
            </div>
            <Download className="h-4 w-4 text-gray-400" />
          </button>

          <aside className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">
              Zona de Peligro
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              Estas acciones son permanentes y no se pueden deshacer
            </p>
            <Button
              variant="outline"
              className="w-full text-red-600 hover:bg-red-100 border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
            >
              Eliminar Cuenta Permanentemente
            </Button>
          </aside>
        </section>
      </div>
    </motion.article>
  );
}
