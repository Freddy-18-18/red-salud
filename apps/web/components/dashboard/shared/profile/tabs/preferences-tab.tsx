import { motion } from "framer-motion";
import { Label } from "@red-salud/ui";
import { usePreferences } from "@/lib/contexts/preferences-context";
import { useI18n } from "@/hooks/use-i18n";
import { Moon, Sun } from "lucide-react";

export function PreferencesTab() {
  const { preferences, updatePreference } = usePreferences();
  const { t } = useI18n();

  const theme = preferences.theme === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : preferences.theme;

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    updatePreference("theme", newTheme);
  };

  const setLanguage = (lang: "es" | "en" | "pt" | "fr" | "it") => {
    updatePreference("language", lang);
  };
  return (
    <motion.article
      key="preferences"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t("preferences.title")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("preferences.subtitle")}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-6">
        <section className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {t("preferences.regional.title")}
          </h3>

          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <Label htmlFor="idioma" className="mb-2 block dark:text-gray-100">
              {t("preferences.regional.language")}
            </Label>
            <select
              id="idioma"
              value={preferences.language}
              onChange={(e) => setLanguage(e.target.value as "es" | "en" | "pt" | "fr" | "it")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              aria-label="Seleccionar idioma"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
              <option value="fr">Français</option>
              <option value="it">Italiano</option>
            </select>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <Label htmlFor="zona" className="mb-2 block dark:text-gray-100">
              {t("preferences.regional.timezone")}
            </Label>
            <select
              id="zona"
              value={preferences.timezone}
              onChange={(e) => updatePreference("timezone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              aria-label="Seleccionar zona horaria"
            >
              <option value="America/Caracas">Venezuela (GMT-4)</option>
              <option value="America/Bogota">Colombia (GMT-5)</option>
              <option value="America/Lima">Perú (GMT-5)</option>
              <option value="America/Mexico_City">México (GMT-6)</option>
              <option value="America/Buenos_Aires">Argentina (GMT-3)</option>
              <option value="America/Santiago">Chile (GMT-3)</option>
              <option value="America/Sao_Paulo">Brasil (GMT-3)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t("preferences.appearance.theme")}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {theme === "dark" ? t("preferences.appearance.themeDark") : t("preferences.appearance.themeLight")}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={theme === "dark"}
                onChange={toggleTheme}
                aria-label="Activar modo oscuro"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("preferences.notifications.desktop")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("preferences.notifications.desktopDesc")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences.desktopNotifications}
                onChange={(e) => updatePreference("desktopNotifications", e.target.checked)}
                aria-label="Activar Notificaciones de Escritorio"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("preferences.notifications.sound")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("preferences.notifications.soundDesc")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences.soundNotifications}
                onChange={(e) => updatePreference("soundNotifications", e.target.checked)}
                aria-label="Activar Sonidos de Notificación"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {t("preferences.communication.title")}
          </h3>

          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <Label htmlFor="metodoContacto" className="mb-2 block dark:text-gray-100">
              {t("preferences.communication.preferredMethod")}
            </Label>
            <select
              id="metodoContacto"
              value={preferences.preferredContactMethod}
              onChange={(e) => updatePreference("preferredContactMethod", e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              aria-label="Seleccionar método de contacto"
            >
              <option value="email">{t("preferences.communication.email")}</option>
              <option value="sms">{t("preferences.communication.sms")}</option>
              <option value="whatsapp">{t("preferences.communication.whatsapp")}</option>
              <option value="phone">{t("preferences.communication.phone")}</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("preferences.subscriptions.newsletter")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("preferences.subscriptions.newsletterDesc")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences.newsletterSubscribed}
                onChange={(e) => updatePreference("newsletterSubscribed", e.target.checked)}
                aria-label="Activar Boletín Informativo"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("preferences.subscriptions.promotions")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("preferences.subscriptions.promotionsDesc")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences.promotionsSubscribed}
                onChange={(e) => updatePreference("promotionsSubscribed", e.target.checked)}
                aria-label="Activar Ofertas y Promociones"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("preferences.subscriptions.surveys")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("preferences.subscriptions.surveysDesc")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences.surveysSubscribed}
                onChange={(e) => updatePreference("surveysSubscribed", e.target.checked)}
                aria-label="Activar Encuestas de Satisfacción"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <aside className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Tip:</strong> {t("preferences.notifications.appointmentRemindersDesc")}
            </p>
          </aside>
        </section>
      </div>
    </motion.article>
  );
}
