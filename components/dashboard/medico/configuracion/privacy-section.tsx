/**
 * @file privacy-section.tsx
 * @description Sección de privacidad y datos para la página de configuración.
 * Permite al usuario controlar la visibilidad de su información y uso de datos.
 * @module Configuracion
 * 
 * @example
 * <PrivacySection />
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Eye,
    FileText,
    Users,
    MapPin,
    Activity,
    Globe,
    Download,
    Trash2,
    Loader2,
    Shield
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

/**
 * Configuración de privacidad del usuario
 */
interface PrivacySettings {
    /** Si el perfil es visible para otros médicos */
    profilePublic: boolean;
    /** Si comparte historial médico con médicos autorizados */
    shareMedicalHistory: boolean;
    /** Si muestra foto de perfil */
    showProfilePhoto: boolean;
    /** Si comparte ubicación para emergencias */
    shareLocation: boolean;
    /** Si permite uso anónimo de datos para investigación */
    anonymousDataResearch: boolean;
    /** Si acepta cookies de análisis */
    analyticsCookies: boolean;
}

/**
 * Componente de sección de privacidad para la página de configuración.
 * Permite gestionar visibilidad del perfil, uso de datos y exportación de información.
 */
export function PrivacySection() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const [settings, setSettings] = useState<PrivacySettings>({
        profilePublic: true,
        shareMedicalHistory: true,
        showProfilePhoto: true,
        shareLocation: false,
        anonymousDataResearch: false,
        analyticsCookies: true,
    });

    /** Carga la configuración de privacidad actual */
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUserId(user.id);

            const { data: privacyData, error } = await supabase
                .from("user_settings")
                .select("privacy_settings")
                .eq("user_id", user.id)
                .single();

            if (error && error.code !== "PGRST116") {
                console.error("Error loading privacy settings:", error);
                return;
            }

            if (privacyData?.privacy_settings) {
                const ps = privacyData.privacy_settings;
                setSettings({
                    profilePublic: ps.profile_public ?? true,
                    shareMedicalHistory: ps.share_medical_history ?? true,
                    showProfilePhoto: ps.show_profile_photo ?? true,
                    shareLocation: ps.share_location ?? false,
                    anonymousDataResearch: ps.anonymous_data_research ?? false,
                    analyticsCookies: ps.analytics_cookies ?? true,
                });
            }
        } catch (error) {
            console.error("Error loading privacy settings:", error);
        } finally {
            setLoading(false);
        }
    };

    /** Alterna una configuración de privacidad y la guarda */
    const handleToggle = async (key: keyof PrivacySettings) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);

        if (userId) {
            setSaving(true);
            try {
                const { error } = await supabase
                    .from("user_settings")
                    .upsert({
                        user_id: userId,
                        privacy_settings: {
                            profile_public: newSettings.profilePublic,
                            share_medical_history: newSettings.shareMedicalHistory,
                            show_profile_photo: newSettings.showProfilePhoto,
                            share_location: newSettings.shareLocation,
                            anonymous_data_research: newSettings.anonymousDataResearch,
                            analytics_cookies: newSettings.analyticsCookies,
                        },
                        updated_at: new Date().toISOString(),
                    });

                if (error) throw error;
            } catch (error) {
                console.error("Error saving privacy settings:", error);
                // Revertir cambio en caso de error
                setSettings(settings);
            } finally {
                setSaving(false);
            }
        }
    };

    /** Opciones de visibilidad del perfil */
    const visibilityOptions = [
        {
            key: "profilePublic" as const,
            icon: Eye,
            label: "Perfil Público",
            description: "Tu perfil es visible para médicos verificados",
        },
        {
            key: "shareMedicalHistory" as const,
            icon: FileText,
            label: "Compartir Historial Médico",
            description: "Con médicos autorizados que te atiendan",
        },
        {
            key: "showProfilePhoto" as const,
            icon: Users,
            label: "Mostrar Foto de Perfil",
            description: "En consultas, mensajes y perfil público",
        },
    ];

    /** Opciones de uso de datos */
    const dataOptions = [
        {
            key: "shareLocation" as const,
            icon: MapPin,
            label: "Compartir Ubicación",
            description: "Solo para servicios de emergencia",
        },
        {
            key: "anonymousDataResearch" as const,
            icon: Activity,
            label: "Datos Anónimos para Investigación",
            description: "Ayuda a mejorar la medicina (datos sin identificar)",
        },
        {
            key: "analyticsCookies" as const,
            icon: Globe,
            label: "Cookies de Análisis",
            description: "Mejora tu experiencia en la plataforma",
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Privacidad y Datos
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Controla quién puede ver tu información y cómo se utiliza
                    </p>
                </div>
                {saving && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Guardando...
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visibilidad del Perfil */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Visibilidad del Perfil
                        </h3>
                    </div>

                    {visibilityOptions.map((option) => {
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
                                        checked={settings[option.key]}
                                        onChange={() => handleToggle(option.key)}
                                        disabled={saving}
                                        aria-label={option.label}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        );
                    })}
                </div>

                {/* Uso de Datos */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Uso de Datos
                        </h3>
                    </div>

                    {dataOptions.map((option) => {
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
                                        checked={settings[option.key]}
                                        onChange={() => handleToggle(option.key)}
                                        disabled={saving}
                                        aria-label={option.label}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        );
                    })}

                    {/* Descargar datos */}
                    <button className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Descargar Mis Datos
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Obtén una copia completa de tu información
                            </p>
                        </div>
                        <Download className="h-4 w-4 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Zona de Peligro */}
            <aside className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2 flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Zona de Peligro
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    Estas acciones son permanentes y no se pueden deshacer
                </p>
                <Button
                    variant="outline"
                    className="w-full text-red-600 hover:bg-red-100 border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Cuenta Permanentemente
                </Button>
            </aside>
        </div>
    );
}
