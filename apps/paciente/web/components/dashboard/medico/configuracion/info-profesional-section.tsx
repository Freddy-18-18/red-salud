/**
 * @file info-profesional-section.tsx
 * @description Sección de configuración para información profesional extendida del médico.
 * Incluye universidad, credenciales, experiencia, certificaciones, idiomas, seguros y servicios.
 * La biografía se maneja en ProfileSection donde tiene integración con IA.
 * @module Configuracion
 * 
 * @example
 * <InfoProfesionalSection />
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import { Textarea } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import {
    Save,
    Loader2,
    GraduationCap,
    Award,
    Languages,
    Pen,
    Globe,
    Facebook,
    Linkedin,
    Twitter,
    Instagram,
    Stethoscope,
    X,
    Briefcase
} from "lucide-react";

import { SearchableSelect } from "@red-salud/design-system";
import { VENEZUELAN_UNIVERSITIES } from "./constants/universities";
import { SOCIAL_PLATFORMS } from "./constants/profile-data";
import { MEDICAL_CONDITIONS_OPTIONS } from "./constants/medical-conditions";

import { supabase } from "@/lib/supabase/client";
import "./info-profesional-animations.css";

/**
 * Datos del perfil profesional extendido
 */
interface ProfesionalData {
    /** Universidad de egreso */
    universidad: string;
    /** Número de colegio de médicos */
    numero_colegio: string;
    /** Número de matrícula (MPPS) - Read Only */
    matricula: string;
    /** Año de graduación */
    anio_graduacion: number | null;
    /** Años de experiencia (Manual) */
    anios_experiencia: number;
    /** Certificaciones y diplomados */
    certificaciones: string;
    /** Subespecialidades */
    subespecialidades: string;
    /** Idiomas que habla */
    idiomas: string[];
    /** Enfermedades y condiciones tratadas */
    condiciones_tratadas: string[];
    /** Redes sociales */
    redes_sociales: Record<string, string>;
}

/** Lista de idiomas disponibles */
const IDIOMAS_DISPONIBLES = [
    'Español', 'Inglés', 'Francés', 'Portugués',
    'Italiano', 'Alemán', 'Mandarín', 'Árabe', 'Ruso'
];

/**
 * Componente de sección de información profesional para la página de configuración.
 * Permite al médico editar su biografía, certificaciones, idiomas y tarifas.
 */
export function InfoProfesionalSection() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [data, setData] = useState<ProfesionalData>({
        universidad: "",
        numero_colegio: "",
        matricula: "",
        anio_graduacion: null,
        anios_experiencia: 0,
        certificaciones: "",
        subespecialidades: "",
        idiomas: ["Español"],
        condiciones_tratadas: [],
        redes_sociales: {},
    });

    /** Carga los datos del perfil profesional desde la base de datos */
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Intentar cargar perfil de doctor
            const { data: profile, error } = await supabase
                .from("doctor_profiles")
                .select(`*, profiles!id(sacs_matricula, licencia_medica, sacs_verificado)`)
                .eq("id", user.id)
                .maybeSingle(); // Usar maybeSingle para no lanzar error si no existe

            // 2. Si no existe perfil de doctor, cargar datos básicos de profiles
            if (!profile) {
                const { data: userProfile } = await supabase
                    .from("profiles")
                    .select("sacs_matricula, licencia_medica, sacs_verificado")
                    .eq("id", user.id)
                    .single();

                if (userProfile) {
                    const matricula = (userProfile as { sacs_matricula?: string; licencia_medica?: string }).sacs_matricula || (userProfile as { licencia_medica?: string }).licencia_medica || "";
                    setData(prev => ({ ...prev, matricula }));
                }
                return;
            }

            if (error && error.code !== "PGRST116") {
                console.error("Error loading profile:", error);
                return;
            }

            if (profile) {
                const matriculaSacs = (profile.profiles as { sacs_matricula?: string; licencia_medica?: string } | undefined)?.sacs_matricula || (profile.profiles as { licencia_medica?: string } | undefined)?.licencia_medica || (profile as { license_number?: string }).license_number || "";

                setData({
                    universidad: profile.university || "",
                    numero_colegio: profile.college_number || "",
                    matricula: matriculaSacs,
                    anio_graduacion: profile.graduation_year || null,
                    anios_experiencia: profile.years_experience || 0,
                    certificaciones: profile.certifications_info || "",
                    subespecialidades: profile.subspecialties || "",
                    idiomas: Array.isArray(profile.languages) ? profile.languages : ["Español"],
                    condiciones_tratadas: Array.isArray(profile.conditions_treated) ? profile.conditions_treated : [],
                    redes_sociales: (profile.social_media as Record<string, string>) || {},
                });
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    /** Guarda los cambios en la base de datos */
    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            // Usar upsert para crear o actualizar
            const { error } = await supabase
                .from("doctor_profiles")
                .upsert({
                    id: user.id, // ID explícito para upsert
                    university: data.universidad,
                    college_number: data.numero_colegio,
                    years_experience: data.anios_experiencia,
                    graduation_year: data.anio_graduacion,
                    certifications_info: data.certificaciones,
                    subspecialties: data.subespecialidades,
                    languages: data.idiomas,
                    conditions_treated: data.condiciones_tratadas,
                    social_media: data.redes_sociales,
                    updated_at: new Date().toISOString(),
                    // Campos requeridos mínimos si es nuevo registro (aunque idealmente deberían estar)
                    license_number: data.matricula || "PENDING", // Fallback si es nuevo
                })
                .select();

            if (error) throw error;

            setIsEditing(false);
            
            // Success feedback (puedes reemplazar con un toast si tienes uno configurado)
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-5';
            successMessage.textContent = '✓ Cambios guardados exitosamente';
            document.body.appendChild(successMessage);
            setTimeout(() => successMessage.remove(), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
            
            // Error feedback
            const errorMessage = document.createElement('div');
            errorMessage.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-5';
            errorMessage.textContent = '✕ Error al guardar los cambios';
            document.body.appendChild(errorMessage);
            setTimeout(() => errorMessage.remove(), 3000);
        } finally {
            setSaving(false);
        }
    };

    /** Alterna la selección de un idioma */
    const toggleIdioma = (idioma: string) => {
        setData(prev => ({
            ...prev,
            idiomas: prev.idiomas.includes(idioma)
                ? prev.idiomas.filter(i => i !== idioma)
                : [...prev.idiomas, idioma]
        }));
    };



    /** Añadir condición tratada */
    const addCondicion = (condicion: string) => {
        if (!condicion.trim()) return;
        if (!data.condiciones_tratadas.includes(condicion.trim())) {
            setData(prev => ({
                ...prev,
                condiciones_tratadas: [...prev.condiciones_tratadas, condicion.trim()]
            }));
        }

    };

    const removeCondicion = (condicion: string) => {
        setData(prev => ({
            ...prev,
            condiciones_tratadas: prev.condiciones_tratadas.filter(c => c !== condicion)
        }));
    };


    /** Manejo de redes sociales */
    const handleSocialChange = (platformId: string, value: string) => {
        setData(prev => ({
            ...prev,
            redes_sociales: {
                ...prev.redes_sociales,
                [platformId]: value
            }
        }));
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="h-12 w-12 bg-gradient-to-br from-emerald-200 to-teal-300 rounded-xl animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-7 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                            <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div 
                            key={i}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg"
                        >
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-11 w-11 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl animate-pulse" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-11 w-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                                <div className="h-11 w-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                                <div className="h-20 w-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header Premium con botón de editar */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl blur opacity-25" />
                        <div className="relative p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                            <Briefcase className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Información Profesional
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 font-medium">
                            Detalles sobre tu práctica médica, formación y servicios
                        </p>
                    </div>
                </div>
                {!isEditing ? (
                    <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => setIsEditing(true)}
                        className="shadow-md hover:shadow-lg transition-all duration-300 border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500"
                    >
                        <Pen className="h-4 w-4 mr-2" />
                        Editar Información
                    </Button>
                ) : (
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            size="lg"
                            onClick={() => setIsEditing(false)} 
                            disabled={saving}
                            className="shadow-md hover:shadow-lg transition-all"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            size="lg"
                            onClick={handleSave} 
                            disabled={saving}
                            className="shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar Cambios
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>

            {/* Grid Layout Profesional - 2 columnas en pantallas grandes */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Columna Izquierda: Formación y Certificaciones */}
                <div className="space-y-6">
                    {/* Universidad y Credenciales */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="group relative bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-700"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                                    <GraduationCap className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <Label className="text-lg font-bold text-gray-900 dark:text-white">
                                        Formación y Credenciales
                                    </Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Información académica oficial
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                {/* Universidad */}
                                <div>
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                        Universidad de Egreso
                                    </Label>
                                    {isEditing ? (
                                        <SearchableSelect
                                            options={VENEZUELAN_UNIVERSITIES}
                                            value={data.universidad}
                                            onValueChange={(val) => setData({ ...data, universidad: val })}
                                            placeholder="Seleccionar universidad..."
                                            searchPlaceholder="Buscar universidad..."
                                            emptyMessage="No se encontró la universidad"
                                            className="w-full"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                {data.universidad || "No especificado"}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Año Graduación */}
                                    <div>
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                            Año de Graduación
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                placeholder="Ej: 2010"
                                                value={data.anio_graduacion || ""}
                                                onChange={(e) => setData({ ...data, anio_graduacion: parseInt(e.target.value) || null })}
                                                className="dark:bg-gray-800 h-11"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                    {data.anio_graduacion || "No especificado"}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Años de Experiencia */}
                                    <div>
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                            Experiencia
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="Ej: 5"
                                                value={data.anios_experiencia || ""}
                                                onChange={(e) => setData({ ...data, anios_experiencia: parseInt(e.target.value) || 0 })}
                                                className="dark:bg-gray-800 h-11"
                                            />
                                        ) : (
                                            <Badge 
                                                variant="outline" 
                                                className="px-4 py-2 text-sm font-bold text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                                            >
                                                {data.anios_experiencia} años
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* N° Matrícula (SACS) */}
                                    <div>
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                            Nº MPPS (Matrícula)
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                value={data.matricula || "Sin matrícula"}
                                                disabled={true}
                                                className="dark:bg-gray-800 bg-gray-50 text-gray-600 dark:text-gray-400 font-medium h-11 pr-32"
                                                readOnly
                                            />
                                            {data.matricula && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <Badge 
                                                        variant="secondary" 
                                                        className="h-6 px-2 text-[10px] font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                                                    >
                                                        ✓ VALIDADO
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
                                            <span className="inline-block w-1 h-1 rounded-full bg-gray-400" />
                                            Validado por SACS. No editable.
                                        </p>
                                    </div>

                                    {/* N° Colegio */}
                                    <div>
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                            Nº Colegio Médicos
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                placeholder="Ej: 12345"
                                                value={data.numero_colegio}
                                                onChange={(e) => setData({ ...data, numero_colegio: e.target.value })}
                                                className="dark:bg-gray-800 h-11"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                    {data.numero_colegio || "No especificado"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Certificaciones y Subespecialidades */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="group relative bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-700"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                                    <Award className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <Label className="text-lg font-bold text-gray-900 dark:text-white">
                                        Especialización y Logros
                                    </Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Certificaciones profesionales
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                        Certificaciones y Diplomados
                                    </Label>
                                    {isEditing ? (
                                        <Textarea
                                            rows={4}
                                            value={data.certificaciones}
                                            onChange={(e) => setData({ ...data, certificaciones: e.target.value })}
                                            placeholder="Ej: Diplomado en Enfermedades Tropicales (2015)&#10;Certificación en Medicina de Emergencia (2018)"
                                            className="dark:bg-gray-800 resize-none"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[100px]">
                                            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                                {data.certificaciones || "No especificado"}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                        Subespecialidades / Áreas de Enfoque
                                    </Label>
                                    {isEditing ? (
                                        <Textarea
                                            rows={3}
                                            value={data.subespecialidades}
                                            onChange={(e) => setData({ ...data, subespecialidades: e.target.value })}
                                            placeholder="Ej: Cardiología Intervencionista, Electrofisiología"
                                            className="dark:bg-gray-800 resize-none"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {data.subespecialidades || "No especificado"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Idiomas */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="group relative bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                                    <Languages className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <Label className="text-lg font-bold text-gray-900 dark:text-white">
                                        Idiomas
                                    </Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Lenguajes de comunicación
                                    </p>
                                </div>
                            </div>
                            {isEditing ? (
                                <div className="flex flex-wrap gap-2">
                                    {IDIOMAS_DISPONIBLES.map((idioma) => (
                                        <button
                                            key={idioma}
                                            type="button"
                                            onClick={() => toggleIdioma(idioma)}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${data.idiomas.includes(idioma)
                                                ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg scale-105"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
                                            }`}
                                        >
                                            {idioma}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {data.idiomas.length > 0 ? (
                                        data.idiomas.map((idioma) => (
                                            <Badge 
                                                key={idioma} 
                                                variant="secondary"
                                                className="px-4 py-2 text-sm font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                                            >
                                                {idioma}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500">No especificado</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Columna Derecha: Enfermedades y Redes Sociales */}
                <div className="space-y-6">
                    {/* Enfermedades y Condiciones */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="group relative bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-rose-300 dark:hover:border-rose-700"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg">
                                    <Stethoscope className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <Label className="text-lg font-bold text-gray-900 dark:text-white">
                                        Enfermedades y Condiciones
                                    </Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Mejora tu visibilidad en búsquedas
                                    </p>
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="space-y-4">
                                    <SearchableSelect
                                        options={MEDICAL_CONDITIONS_OPTIONS}
                                        value=""
                                        onValueChange={(val) => {
                                            if (val && !data.condiciones_tratadas.includes(val)) {
                                                addCondicion(val);
                                            }
                                        }}
                                        placeholder="Buscar enfermedad o condición..."
                                        searchPlaceholder="Escribe para buscar..."
                                        emptyMessage="No encontrado. Presiona Enter para agregar."
                                        className="w-full"
                                    />
                                    <div className="flex flex-wrap gap-2 min-h-[80px] p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                        {data.condiciones_tratadas.length > 0 ? (
                                            data.condiciones_tratadas.map((condicion, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="pl-3 pr-2 py-1.5 gap-1.5 hover:bg-rose-200 dark:hover:bg-rose-900/40 bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-semibold"
                                                >
                                                    {condicion}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCondicion(condicion)}
                                                        className="h-4 w-4 rounded-full hover:bg-rose-300 dark:hover:bg-rose-800 flex items-center justify-center transition-colors ml-1"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">
                                                Selecciona condiciones del menú
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <span className="inline-block w-1 h-1 rounded-full bg-gray-400" />
                                        Selecciona de la lista para agregar
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2 min-h-[80px] p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                    {data.condiciones_tratadas.length > 0 ? (
                                        data.condiciones_tratadas.map((condicion, index) => (
                                            <Badge 
                                                key={index} 
                                                variant="outline" 
                                                className="border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20 font-semibold px-3 py-1.5"
                                            >
                                                {condicion}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500 italic">No especificado</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Redes Sociales */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        className="group relative bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-pink-300 dark:hover:border-pink-700"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg">
                                    <Globe className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <Label className="text-lg font-bold text-gray-900 dark:text-white">
                                        Presencia Digital
                                    </Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Conecta con tus pacientes
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {SOCIAL_PLATFORMS.map((platform) => {
                                    const Icon = platform.id === 'instagram' ? Instagram :
                                        platform.id === 'facebook' ? Facebook :
                                            platform.id === 'linkedin' ? Linkedin :
                                                platform.id === 'twitter' ? Twitter : Globe;
                                    const socialUrl = data.redes_sociales[platform.id];

                                    return (
                                        <div key={platform.id} className="flex items-center gap-3 group/social">
                                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover/social:bg-pink-100 dark:group-hover/social:bg-pink-900/20 transition-colors">
                                                <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover/social:text-pink-600 dark:group-hover/social:text-pink-400 transition-colors" />
                                            </div>
                                            {isEditing ? (
                                                <Input
                                                    placeholder={platform.placeholder}
                                                    value={socialUrl || ""}
                                                    onChange={(e) => handleSocialChange(platform.id, e.target.value)}
                                                    className="h-10 text-sm dark:bg-gray-800 flex-1"
                                                />
                                            ) : (
                                                socialUrl ? (
                                                    <a
                                                        href={socialUrl.startsWith('http') ? socialUrl : `https://${platform.prefix}${socialUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate font-medium flex-1"
                                                    >
                                                        {socialUrl}
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic flex-1">No agregado</span>
                                                )
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
