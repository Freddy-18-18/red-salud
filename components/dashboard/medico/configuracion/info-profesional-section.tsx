
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Save,
    Loader2,
    GraduationCap,
    Award,
    Languages,
    DollarSign,
    Clock,
    CheckCircle2,
    Pen,
    FileText,
    Briefcase,
    Shield,
    Users,
    Globe,
    Facebook,
    Linkedin,
    Twitter,
    Instagram,
    Plus,
    Youtube,
    Stethoscope,
    X
} from "lucide-react";

import { SearchableSelect } from "@/components/ui/searchable-select";
import { VENEZUELAN_UNIVERSITIES } from "./constants/universities";
import { INSURANCE_COMPANIES, AGE_GROUPS, SOCIAL_PLATFORMS } from "./constants/profile-data";
import { MEDICAL_CONDITIONS_OPTIONS } from "./constants/medical-conditions";

import { supabase } from "@/lib/supabase/client";

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
    /** Tarifa de consulta presencial */
    tarifa_consulta: number | null;
    /** Duración promedio de consulta en minutos */
    duracion_consulta: number;
    /** Si acepta seguros médicos */
    acepta_seguros: boolean;
    /** Aseguradoras aceptadas */
    aseguradoras: string[];
    /** Métodos de pago aceptados */
    metodos_pago: string[];
    /** Enfermedades y condiciones tratadas */
    condiciones_tratadas: string[];
    /** Grupos de edad atendidos */
    propositos_edad: string[];
    /** Redes sociales */
    redes_sociales: Record<string, string>;
}

/** Lista de idiomas disponibles */
const IDIOMAS_DISPONIBLES = [
    'Español', 'Inglés', 'Francés', 'Portugués',
    'Italiano', 'Alemán', 'Mandarín', 'Árabe', 'Ruso'
];

/** Lista de métodos de pago disponibles */
const METODOS_PAGO_DISPONIBLES = [
    'Efectivo', 'Transferencia', 'Pago Móvil', 'Tarjeta de Crédito', 'Zelle', 'PayPal'
];

/**
 * Componente de sección de información profesional para la página de configuración.
 * Permite al médico editar su biografía, certificaciones, idiomas y tarifas.
 */
export function InfoProfesionalSection() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [condicionInput, setCondicionInput] = useState("");

    const [data, setData] = useState<ProfesionalData>({
        universidad: "",
        numero_colegio: "",
        matricula: "",
        anio_graduacion: null,
        anios_experiencia: 0,
        certificaciones: "",
        subespecialidades: "",
        idiomas: ["Español"],
        tarifa_consulta: null,
        duracion_consulta: 30,
        acepta_seguros: false,
        aseguradoras: [],
        metodos_pago: ["Efectivo"],
        condiciones_tratadas: [],
        propositos_edad: [],
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
                    // @ts-ignore
                    const matricula = userProfile.sacs_matricula || userProfile.licencia_medica || "";
                    setData(prev => ({ ...prev, matricula }));
                }
                return;
            }

            if (error && error.code !== "PGRST116") {
                console.error("Error loading profile:", error);
                return;
            }

            if (profile) {
                // @ts-ignore
                const matriculaSacs = profile.profiles?.sacs_matricula || profile.profiles?.licencia_medica || profile.license_number || "";

                setData({
                    universidad: profile.university || "",
                    numero_colegio: profile.college_number || "",
                    matricula: matriculaSacs,
                    anio_graduacion: profile.graduation_year || null,
                    anios_experiencia: profile.years_experience || 0,
                    certificaciones: profile.certifications_info || "",
                    subespecialidades: profile.subspecialties || "",
                    idiomas: Array.isArray(profile.languages) ? profile.languages : ["Español"],
                    tarifa_consulta: profile.consultation_price || null,
                    duracion_consulta: profile.consultation_duration || 30,
                    acepta_seguros: profile.accepts_insurance || false,
                    aseguradoras: Array.isArray(profile.insurance_companies) ? profile.insurance_companies : [],
                    metodos_pago: Array.isArray(profile.payment_methods) ? profile.payment_methods : [],
                    condiciones_tratadas: Array.isArray(profile.conditions_treated) ? profile.conditions_treated : [],
                    propositos_edad: Array.isArray(profile.patient_age_groups) ? profile.patient_age_groups : [],
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
                    consultation_price: data.tarifa_consulta,
                    consultation_duration: data.duracion_consulta,
                    accepts_insurance: data.acepta_seguros,
                    insurance_companies: data.aseguradoras,
                    payment_methods: data.metodos_pago,
                    conditions_treated: data.condiciones_tratadas,
                    patient_age_groups: data.propositos_edad,
                    social_media: data.redes_sociales,
                    updated_at: new Date().toISOString(),
                    // Campos requeridos mínimos si es nuevo registro (aunque idealmente deberían estar)
                    license_number: data.matricula || "PENDING", // Fallback si es nuevo
                })
                .select();

            if (error) throw error;

            setIsEditing(false);
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Error al guardar los cambios");
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

    /** Alterna la selección de un método de pago */
    const toggleMetodoPago = (metodo: string) => {
        setData(prev => ({
            ...prev,
            metodos_pago: prev.metodos_pago.includes(metodo)
                ? prev.metodos_pago.filter(m => m !== metodo)
                : [...prev.metodos_pago, metodo]
        }));
    };

    /** Manejo de aseguradoras */
    const toggleAseguradora = (aseguradora: string) => {
        setData(prev => ({
            ...prev,
            aseguradoras: prev.aseguradoras.includes(aseguradora)
                ? prev.aseguradoras.filter(a => a !== aseguradora)
                : [...prev.aseguradoras, aseguradora]
        }));
    };

    /** Manejo de grupos de edad */
    const toggleGrupoEdad = (grupo: string) => {
        setData(prev => ({
            ...prev,
            propositos_edad: prev.propositos_edad.includes(grupo)
                ? prev.propositos_edad.filter(g => g !== grupo)
                : [...prev.propositos_edad, grupo]
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
        setCondicionInput(""); // Clear input if it was used
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
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con botón de editar */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Información Profesional
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Detalles sobre tu práctica médica, formación y servicios
                    </p>
                </div>
                {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Pen className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna izquierda: Formación, Bio, Credenciales */}
                <div className="space-y-6">
                    {/* Universidad y Credenciales */}
                    <div className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <Label className="font-semibold text-gray-900 dark:text-gray-100">
                                Formación y Credenciales
                            </Label>
                        </div>

                        <div className="space-y-4">
                            {/* Universidad */}
                            <div>
                                <Label className="text-xs text-gray-500 mb-1.5 block">Universidad de Egreso</Label>
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
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                        {data.universidad || "No especificado"}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Año Graduación */}
                                <div>
                                    <Label className="text-xs text-gray-500 mb-1.5 block">Año de Graduación</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            placeholder="Ej: 2010"
                                            value={data.anio_graduacion || ""}
                                            onChange={(e) => setData({ ...data, anio_graduacion: parseInt(e.target.value) || null })}
                                            className="dark:bg-gray-800"
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                            {data.anio_graduacion || "No especificado"}
                                        </p>
                                    )}
                                </div>

                                {/* Años de Experiencia */}
                                <div>
                                    <Label className="text-xs text-gray-500 mb-1.5 block">Años de Experiencia</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="Ej: 5"
                                            value={data.anios_experiencia || ""}
                                            onChange={(e) => setData({ ...data, anios_experiencia: parseInt(e.target.value) || 0 })}
                                            className="dark:bg-gray-800"
                                        />
                                    ) : (
                                        <Badge variant="outline" className="text-xs text-purple-600 border-purple-200 bg-purple-50">
                                            {data.anios_experiencia} años de exp.
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* N° Matrícula (SACS) */}
                                <div>
                                    <Label className="text-xs text-gray-500 mb-1.5 block">Nº MPPS (Matrícula)</Label>
                                    <div className="relative">
                                        <Input
                                            value={data.matricula || "Sin matrícula"}
                                            disabled={true}
                                            className="dark:bg-gray-800 bg-gray-50 text-gray-500"
                                            readOnly
                                        />
                                        {data.matricula && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-green-100 text-green-700 hover:bg-green-100 border-0">
                                                    SACS VALIDADO
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        Validado por SACS. No editable.
                                    </p>
                                </div>

                                {/* N° Colegio */}
                                <div>
                                    <Label className="text-xs text-gray-500 mb-1.5 block">Nº Colegio de Médicos</Label>
                                    {isEditing ? (
                                        <Input
                                            placeholder="Ej: 12345"
                                            value={data.numero_colegio}
                                            onChange={(e) => setData({ ...data, numero_colegio: e.target.value })}
                                            className="dark:bg-gray-800"
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                            {data.numero_colegio || "No especificado"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Certificaciones y Subespecialidades */}
                    <div className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <Label className="font-semibold text-gray-900 dark:text-gray-100">
                                Especialización y Logros
                            </Label>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label className="text-xs text-gray-500 mb-1.5 block">Certificaciones y Diplomados</Label>
                                {isEditing ? (
                                    <Textarea
                                        rows={3}
                                        value={data.certificaciones}
                                        onChange={(e) => setData({ ...data, certificaciones: e.target.value })}
                                        placeholder="Ej: Diplomado en Enfermedades Tropicales (2015)&#10;Certificación en Medicina de Emergencia (2018)"
                                        className="dark:bg-gray-800"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {data.certificaciones || "No especificado"}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label className="text-xs text-gray-500 mb-1.5 block">Subespecialidades / Áreas de Enfoque</Label>
                                {isEditing ? (
                                    <Textarea
                                        rows={2}
                                        value={data.subespecialidades}
                                        onChange={(e) => setData({ ...data, subespecialidades: e.target.value })}
                                        placeholder="Ej: Cardiología Intervencionista, Electrofisiología"
                                        className="dark:bg-gray-800"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {data.subespecialidades || "No especificado"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Enfermedades y Condiciones */}
                    <div className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                                <Stethoscope className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <Label className="font-semibold text-gray-900 dark:text-gray-100">
                                    Enfermedades y Condiciones
                                </Label>
                                <p className="text-[10px] text-gray-500 font-normal">
                                    Ayuda a los pacientes a encontrarte cuando busquen sus síntomas.
                                </p>
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="space-y-3">
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
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {data.condiciones_tratadas.map((condicion, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="pl-2 pr-1 py-0.5 gap-1 hover:bg-rose-100 bg-rose-50 text-rose-700 border-rose-200"
                                        >
                                            {condicion}
                                            <button
                                                type="button"
                                                onClick={() => removeCondicion(condicion)}
                                                className="h-3 w-3 rounded-full hover:bg-rose-200 flex items-center justify-center transition-colors"
                                            >
                                                <X className="h-2.5 w-2.5" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400">
                                    Selecciona de la lista
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {data.condiciones_tratadas.length > 0 ? (
                                    data.condiciones_tratadas.map((condicion, index) => (
                                        <Badge key={index} variant="outline" className="border-rose-200 text-rose-700 bg-rose-50">
                                            {condicion}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-500">No especificado</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Redes Sociales */}
                    <div className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                                <Globe className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                            </div>
                            <Label className="font-semibold text-gray-900 dark:text-gray-100">
                                Presencia Digital
                            </Label>
                        </div>

                        <div className="space-y-3">
                            {SOCIAL_PLATFORMS.map((platform) => {
                                const Icon = platform.id === 'instagram' ? Instagram :
                                    platform.id === 'facebook' ? Facebook :
                                        platform.id === 'linkedin' ? Linkedin :
                                            platform.id === 'twitter' ? Twitter : Globe;

                                return (
                                    <div key={platform.id} className="flex items-center gap-3">
                                        <Icon className="h-4 w-4 text-gray-400 shrink-0" />
                                        {isEditing ? (
                                            <Input
                                                placeholder={platform.placeholder}
                                                value={data.redes_sociales[platform.id] || ""}
                                                onChange={(e) => handleSocialChange(platform.id, e.target.value)}
                                                className="h-8 text-sm dark:bg-gray-800"
                                            />
                                        ) : (
                                            data.redes_sociales[platform.id] ? (
                                                <a
                                                    href={data.redes_sociales[platform.id].startsWith('http') ? data.redes_sociales[platform.id] : `https://${platform.prefix}${data.redes_sociales[platform.id]}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:underline truncate"
                                                >
                                                    {data.redes_sociales[platform.id]}
                                                </a>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">No agregado</span>
                                            )
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Columna derecha: Servicios, Tarifas, Seguros */}
                <div className="space-y-6">
                    {/* Tarifa y Duración */}
                    <div className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <Label className="font-semibold text-gray-900 dark:text-gray-100">
                                Consulta y Honorarios
                            </Label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs text-gray-500 mb-1.5 block">Costo Consulta ($)</Label>
                                {isEditing ? (
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.tarifa_consulta || ""}
                                            onChange={(e) => setData({ ...data, tarifa_consulta: parseFloat(e.target.value) || null })}
                                            className="pl-7 dark:bg-gray-800"
                                            placeholder="0.00"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {data.tarifa_consulta ? `$${data.tarifa_consulta.toFixed(2)}` : "No esp."}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label className="text-xs text-gray-500 mb-1.5 block">Duración (min)</Label>
                                {isEditing ? (
                                    <select
                                        value={data.duracion_consulta}
                                        onChange={(e) => setData({ ...data, duracion_consulta: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                    >
                                        <option value={15}>15 min</option>
                                        <option value={30}>30 min</option>
                                        <option value={45}>45 min</option>
                                        <option value={60}>60 min</option>
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-gray-400" />
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {data.duracion_consulta} min
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t dark:border-gray-700">
                            <Label className="text-xs text-gray-500 mb-2 block">Métodos de Pago</Label>
                            {isEditing ? (
                                <div className="flex flex-wrap gap-2">
                                    {METODOS_PAGO_DISPONIBLES.map((metodo) => (
                                        <button
                                            key={metodo}
                                            type="button"
                                            onClick={() => toggleMetodoPago(metodo)}
                                            className={`px-3 py-1 text-xs rounded-full transition-colors border ${data.metodos_pago.includes(metodo)
                                                ? "bg-green-600 text-white border-green-600"
                                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-green-400"
                                                }`}
                                        >
                                            {metodo}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {data.metodos_pago.length > 0 ? (
                                        data.metodos_pago.map((metodo) => (
                                            <span key={metodo} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                                                {metodo}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-500">No especificado</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Seguros Médicos */}
                    <div className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                <Label className="font-semibold text-gray-900 dark:text-gray-100">
                                    Seguros Médicos
                                </Label>
                            </div>
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">{data.acepta_seguros ? "Acepta" : "No acepta"}</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={data.acepta_seguros}
                                            onChange={(e) => setData({ ...data, acepta_seguros: e.target.checked })}
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                                    </label>
                                </div>
                            ) : (
                                <Badge variant={data.acepta_seguros ? "default" : "outline"} className={!data.acepta_seguros ? "text-gray-500" : ""}>
                                    {data.acepta_seguros ? "Acepta Seguros" : "No Acepta Seguros"}
                                </Badge>
                            )}
                        </div>

                        {data.acepta_seguros && (
                            <div className="mt-3">
                                <Label className="text-xs text-gray-500 mb-2 block">Aseguradoras Aceptadas</Label>
                                {isEditing ? (
                                    <div className="h-48 overflow-y-auto border rounded-md p-2 space-y-1 dark:border-gray-700 dark:bg-gray-800">
                                        {INSURANCE_COMPANIES.map((seguro) => (
                                            <div key={seguro.value} className="flex items-center space-x-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                                                <Checkbox
                                                    id={`seguro-${seguro.value}`}
                                                    checked={data.aseguradoras.includes(seguro.value)}
                                                    onCheckedChange={() => toggleAseguradora(seguro.value)}
                                                />
                                                <label
                                                    htmlFor={`seguro-${seguro.value}`}
                                                    className="text-sm cursor-pointer w-full text-gray-700 dark:text-gray-300"
                                                >
                                                    {seguro.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                        {data.aseguradoras.length > 0 ? (
                                            data.aseguradoras.map((seguro) => (
                                                <Badge key={seguro} variant="secondary" className="text-xs font-normal">
                                                    {seguro}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500 italic">No hsa seleccionado aseguradoras específicas</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Público Objetivo */}
                    <div className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                                <Users className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <Label className="font-semibold text-gray-900 dark:text-gray-100">
                                Pacientes
                            </Label>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            Grupos de edad que atiendes
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {AGE_GROUPS.map((grupo) => {
                                const isSelected = data.propositos_edad.includes(grupo.value);
                                return isEditing ? (
                                    <button
                                        key={grupo.value}
                                        type="button"
                                        onClick={() => toggleGrupoEdad(grupo.value)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${isSelected
                                            ? "bg-cyan-50 border-cyan-200 text-cyan-700 dark:bg-cyan-900/40 dark:border-cyan-800 dark:text-cyan-300"
                                            : "bg-transparent border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400 hover:border-cyan-300"
                                            }`}
                                    >
                                        {grupo.label}
                                    </button>
                                ) : (
                                    isSelected && (
                                        <Badge key={grupo.value} variant="outline" className="border-cyan-200 text-cyan-700 bg-cyan-50">
                                            {grupo.label}
                                        </Badge>
                                    )
                                );
                            })}
                            {!isEditing && data.propositos_edad.length === 0 && (
                                <span className="text-sm text-gray-500">No especificado</span>
                            )}
                        </div>
                    </div>

                    {/* Idiomas */}
                    <div className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <Languages className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <Label className="font-semibold text-gray-900 dark:text-gray-100">
                                Idiomas
                            </Label>
                        </div>
                        {isEditing ? (
                            <div className="flex flex-wrap gap-2">
                                {IDIOMAS_DISPONIBLES.map((idioma) => (
                                    <button
                                        key={idioma}
                                        type="button"
                                        onClick={() => toggleIdioma(idioma)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${data.idiomas.includes(idioma)
                                            ? "bg-indigo-600 text-white"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                                        <Badge key={idioma} variant="secondary">
                                            {idioma}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-500">No especificado</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
