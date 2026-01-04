/**
 * @file preferences-section.tsx
 * @description Sección de preferencias del sistema para la página de configuración.
 * Incluye tema, idioma, zona horaria y preferencias de comunicación.
 * @module Configuracion
 * 
 * @example
 * <PreferencesSection />
 */

"use client";

import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { usePreferences } from "@/lib/contexts/preferences-context";
import { useI18n } from "@/lib/hooks/use-i18n";
import {
    Moon,
    Sun,
    Globe,
    Bell,
    Mail,
    MessageSquare,
    Palette,
    Clock
} from "lucide-react";

/**
 * Componente de sección de preferencias del sistema.
 * Permite configurar tema, idioma, zona horaria y notificaciones.
 */
export function PreferencesSection() {
    const { preferences, updatePreference } = usePreferences();
    const { t } = useI18n();

    // Determina el tema actual, resolviendo "system" al tema real
    const theme = preferences.theme === "system"
        ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : preferences.theme;

    /** Alterna entre tema claro y oscuro */
    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        updatePreference("theme", newTheme);
    };

    /** Cambia el idioma de la aplicación */
    const setLanguage = (lang: "es" | "en" | "pt" | "fr" | "it") => {
        updatePreference("language", lang);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Preferencias del Sistema
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Personaliza la apariencia y comportamiento de la aplicación
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna izquierda: Apariencia y Regional */}
                <div className="space-y-6">
                    {/* Apariencia */}
                    <div className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                Apariencia
                            </h3>
                        </div>

                        {/* Toggle de tema */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                                {theme === "dark" ? (
                                    <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                ) : (
                                    <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Tema de la Interfaz
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {theme === "dark" ? "Modo Oscuro activado" : "Modo Claro activado"}
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
                    </div>

                    {/* Configuración Regional */}
                    <div className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                Configuración Regional
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {/* Idioma */}
                            <div>
                                <Label htmlFor="idioma" className="mb-2 block dark:text-gray-100">
                                    Idioma de la Aplicación
                                </Label>
                                <select
                                    id="idioma"
                                    value={preferences.language}
                                    onChange={(e) => setLanguage(e.target.value as "es" | "en" | "pt" | "fr" | "it")}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                    aria-label="Seleccionar idioma"
                                >
                                    <option value="es">Español</option>
                                    <option value="en">English</option>
                                    <option value="pt">Português</option>
                                    <option value="fr">Français</option>
                                    <option value="it">Italiano</option>
                                </select>
                            </div>

                            {/* Zona horaria */}
                            <div>
                                <Label htmlFor="zona" className="mb-2 block dark:text-gray-100">
                                    Zona Horaria
                                </Label>
                                <select
                                    id="zona"
                                    value={preferences.timezone}
                                    onChange={(e) => updatePreference("timezone", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
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
                        </div>
                    </div>
                </div>

                {/* Columna derecha: Notificaciones y Comunicación */}
                <div className="space-y-6">
                    {/* Notificaciones del Sistema */}
                    <div className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <Bell className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                Notificaciones del Sistema
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {/* Notificaciones de escritorio */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Notificaciones de Escritorio
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Recibe alertas en tu navegador
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={preferences.desktopNotifications}
                                        onChange={(e) => updatePreference("desktopNotifications", e.target.checked)}
                                        aria-label="Activar notificaciones de escritorio"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {/* Sonidos */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Sonidos de Notificación
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Reproduce sonidos para alertas
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={preferences.soundNotifications}
                                        onChange={(e) => updatePreference("soundNotifications", e.target.checked)}
                                        aria-label="Activar sonidos de notificación"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Preferencias de Comunicación */}
                    <div className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                Preferencias de Comunicación
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {/* Método de contacto preferido */}
                            <div>
                                <Label htmlFor="metodoContacto" className="mb-2 block dark:text-gray-100">
                                    Método de Contacto Preferido
                                </Label>
                                <select
                                    id="metodoContacto"
                                    value={preferences.preferredContactMethod}
                                    onChange={(e) => updatePreference("preferredContactMethod", e.target.value as "email" | "sms" | "whatsapp" | "phone")}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                    aria-label="Seleccionar método de contacto"
                                >
                                    <option value="email">Correo Electrónico</option>
                                    <option value="sms">SMS</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="phone">Llamada Telefónica</option>
                                </select>
                            </div>

                            {/* Boletín informativo */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Boletín Informativo
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Novedades y actualizaciones de la plataforma
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={preferences.newsletterSubscribed}
                                        onChange={(e) => updatePreference("newsletterSubscribed", e.target.checked)}
                                        aria-label="Suscribirse al boletín"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {/* Promociones */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Ofertas y Promociones
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Descuentos y ofertas especiales
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={preferences.promotionsSubscribed}
                                        onChange={(e) => updatePreference("promotionsSubscribed", e.target.checked)}
                                        aria-label="Recibir promociones"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Tip informativo */}
                    <aside className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            <strong>Tip:</strong> Puedes configurar recordatorios específicos para citas en la sección de Notificaciones.
                        </p>
                    </aside>
                </div>
            </div>
        </div>
    );
}
