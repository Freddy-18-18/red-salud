/**
 * @file offices-section.tsx
 * @description Sección para gestionar los consultorios del médico (CRUD completo).
 * Permite agregar, editar, eliminar y marcar consultorios como principales.
 * Ahora incluye capacidades Premium: Amenities, Precios, Instrucciones.
 * @module Dashboard/Medico/Configuracion
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { StateCitySelector } from "@red-salud/design-system";
import { LocationPicker, LocationData } from "@red-salud/design-system";
import { VENEZUELA_ESTADOS } from "@/lib/data/venezuela-data";
import {
    Plus,
    MapPin,
    Building2,
    Pencil,
    Trash2,
    Save,
    Loader2,
    CheckCircle2,
    DollarSign,
    Users,
    FileText,
    Map,
    Star
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Toast } from "@red-salud/design-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@red-salud/design-system";

import { OfficeAmenities } from "./office-amenities";
import { OfficePricing } from "./office-pricing";
import { OfficeInstructions } from "./office-instructions";
import { OfficePhotos } from "./office-photos";
import { OfficeAgeGroups } from "./office-age-groups";

/** Interfaz para un consultorio completa */
interface Office {
    id?: string;
    nombre: string;
    direccion: string;
    ciudad: string;
    estado: string;
    codigo_postal: string;
    telefono: string;
    notas: string;
    es_principal: boolean;
    activo: boolean;
    latitude?: number;
    longitude?: number;
    // Premium fields
    amenities?: Record<string, boolean>;
    price_info?: {
        consultation_fee?: number;
        price_currency: string;
        payment_methods: string[];
        accepts_insurance: boolean;
        insurance_companies: string[];
    };
    arrival_instructions?: string;
    reception_info?: {
        receptionist_name?: string;
        whatsapp?: string;
    };
    patient_age_groups?: string[];
}

/** Consultorio vacío para formulario */
const EMPTY_OFFICE: Office = {
    nombre: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigo_postal: "",
    telefono: "",
    notas: "",
    es_principal: false,
    activo: true,
    amenities: {},
    price_info: { price_currency: "USD", payment_methods: [], accepts_insurance: false, insurance_companies: [] },
    arrival_instructions: "",
    reception_info: {},
    patient_age_groups: []
};

// Constantes de ejemplo para los tabs
const TABS = [
    { id: "general", label: "General", icon: Building2 },
    { id: "amenities", label: "Servicios", icon: CheckCircle2 },
    { id: "pricing", label: "Precios", icon: DollarSign },
    { id: "patients", label: "Pacientes", icon: Users },
    { id: "instructions", label: "Llegada", icon: FileText },
];

/**
 * Componente de gestión de consultorios
 */
export function OfficesSection() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [offices, setOffices] = useState<Office[]>([]);
    const [editing, setEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState<Office>(EMPTY_OFFICE);
    const [isCreating, setIsCreating] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [selectedEstadoCode, setSelectedEstadoCode] = useState("");
    const [activeTab, setActiveTab] = useState("general");

    // Estado para Toast
    const [toast, setToast] = useState({ visible: false, message: "", type: "info" as "success" | "error" | "info" });

    /**
     * Carga los consultorios del médico
     */
    const loadOffices = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("doctor_offices")
                .select("*")
                .eq("doctor_id", user.id)
                .order("es_principal", { ascending: false })
                .order("created_at", { ascending: true });

            if (error) throw error;

            setOffices(data || []);
        } catch (error) {
            console.error("[OfficesSection] Error loading offices:", error);
            showToast("Error al cargar consultorios", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOffices();
    }, [loadOffices]);

    /**
     * Guarda un consultorio (crear o actualizar)
     */
    const handleSave = async () => {
        if (!formData.nombre?.trim()) {
            showToast("El nombre del consultorio es obligatorio", "error");
            setActiveTab("general");
            return;
        }

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const officeData = {
                nombre: formData.nombre,
                direccion: formData.direccion,
                ciudad: formData.ciudad,
                estado: formData.estado,
                codigo_postal: formData.codigo_postal,
                telefono: formData.telefono,
                notas: formData.notas,
                es_principal: formData.es_principal,
                activo: formData.activo,
                latitude: formData.latitude,
                longitude: formData.longitude,
                amenities: formData.amenities,
                price_info: formData.price_info,
                arrival_instructions: formData.arrival_instructions,
                reception_info: formData.reception_info,
                patient_age_groups: formData.patient_age_groups
            };

            if (editing) {
                // Actualizar consultorio existente
                const { error } = await supabase
                    .from("doctor_offices")
                    .update(officeData)
                    .eq("id", editing);

                if (error) throw error;
                showToast("Consultorio actualizado con éxito", "success");
            } else {
                // Crear nuevo consultorio
                // Necesitamos devolver el ID para poder subir fotos inmediatamente si el usuario quiere
                const { error } = await supabase
                    .from("doctor_offices")
                    .insert({
                        doctor_id: user.id,
                        ...officeData
                    })
                    .select()
                    .single();

                if (error) throw error;
                showToast("Consultorio creado con éxito", "success");

                // Si estamos creando, podríamos cambiar a modo edición para permitir subir fotos sin cerrar
                // Pero por simplicidad, recargamos y cerramos, o podríamos preguntar.
                // Logica actual: cierra el form.
            }

            await loadOffices();
            handleCancel();
        } catch (error) {
            console.error("[OfficesSection] Error saving office:", error);
            showToast("Error al guardar consultorio", "error");
        } finally {
            setSaving(false);
        }
    };

    /**
     * Elimina un consultorio
     */
    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este consultorio? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            const { error } = await supabase
                .from("doctor_offices")
                .delete()
                .eq("id", id);

            if (error) throw error;

            showToast("Consultorio eliminado", "success");
            await loadOffices();
        } catch (error) {
            console.error("[OfficesSection] Error deleting office:", error);
            showToast("Error al eliminar consultorio", "error");
        }
    };

    /**
     * Inicia la edición de un consultorio
     */
    const startEdit = (office: Office) => {
        // Sanitizar objeto para evitar nulls en inputs
        const sanitizedOffice = {
            ...office,
            nombre: office.nombre || "",
            direccion: office.direccion || "",
            ciudad: office.ciudad || "",
            estado: office.estado || "",
            codigo_postal: office.codigo_postal || "",
            telefono: office.telefono || "",
            notas: office.notas || "",
            latitude: office.latitude,
            longitude: office.longitude,
            amenities: office.amenities || {},
            price_info: office.price_info || { price_currency: "USD", payment_methods: [], accepts_insurance: false, insurance_companies: [] },
            arrival_instructions: office.arrival_instructions || "",
            reception_info: office.reception_info || {},
            patient_age_groups: office.patient_age_groups || []
        };

        setFormData(sanitizedOffice);

        // Intentar recuperar el código del estado basado en el nombre para el selector
        const estadoObj = VENEZUELA_ESTADOS.find(e =>
            e.name.toLowerCase() === (office.estado || "").toLowerCase() ||
            e.code === office.estado
        );
        setSelectedEstadoCode(estadoObj ? estadoObj.code : "");

        setEditing(office.id!);
        setIsCreating(false);
        setActiveTab("general");
    };

    /**
     * Inicia la creación de un nuevo consultorio
     */
    const startCreate = () => {
        setFormData(EMPTY_OFFICE);
        setEditing(null);
        setIsCreating(true);
        setActiveTab("general");
        setSelectedEstadoCode("");
    };

    /**
     * Cancela la edición/creación
     */
    const handleCancel = () => {
        setFormData(EMPTY_OFFICE);
        setEditing(null);
        setIsCreating(false);
        setShowMap(false);
        setSelectedEstadoCode("");
        setActiveTab("general");
    };

    /**
     * Maneja la selección de ubicación desde el mapa
     */
    const handleLocationSelect = (location: LocationData) => {
        // Intentar mapear el estado de Google al código interno
        let estadoCode = "";
        const ciudadName = location.city || formData.ciudad;
        let estadoName = location.state || formData.estado;

        if (location.state) {
            // Busqueda aproximada del estado
            const estadoObj = VENEZUELA_ESTADOS.find(e =>
                location.state!.toLowerCase().includes(e.name.toLowerCase()) ||
                e.name.toLowerCase().includes(location.state!.toLowerCase())
            );

            if (estadoObj) {
                estadoCode = estadoObj.code;
                estadoName = estadoObj.name; // Usar el nombre estandarizado
            }
        }

        setSelectedEstadoCode(estadoCode);

        setFormData({
            ...formData,
            direccion: location.address || formData.direccion || "",
            ciudad: ciudadName || "",
            estado: estadoName || "",
            codigo_postal: location.postalCode || formData.codigo_postal || "",
            latitude: location.lat,
            longitude: location.lng,
        });
    };

    /**
     * Muestra un toast
     */
    const showToast = (message: string, type: "success" | "error" | "info") => {
        setToast({ visible: true, message, type });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toast */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onClose={() => setToast({ ...toast, visible: false })}
            />

            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        Mis Consultorios
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Gestiona las ubicaciones y la información detallada de tus sedes.
                    </p>
                </div>
                <Button
                    onClick={startCreate}
                    size="sm"
                    className="gap-2"
                    disabled={isCreating || editing !== null}
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Consultorio
                </Button>
            </div>

            {/* Form (Create/Edit) */}
            <AnimatePresence>
                {(isCreating || editing) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-white dark:bg-gray-900 shadow-sm mb-6">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {editing ? "Editar Consultorio" : "Nuevo Consultorio"}
                                </h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancel}
                                    className="h-8 w-8 p-0"
                                >
                                    <span className="sr-only">Cerrar</span>
                                    ✕
                                </Button>
                            </div>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-6 mb-4">
                                    {TABS.map((tab) => (
                                        <TabsTrigger
                                            key={tab.id}
                                            value={tab.id}
                                            className="flex items-center gap-1"
                                        >
                                            <tab.icon className="h-4 w-4" />
                                            <span className="hidden sm:inline">{tab.label}</span>
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {/* TAB: GENERAL (Existing Form) */}
                                <TabsContent value="general" className="mt-0 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Nombre */}
                                        <div className="col-span-2">
                                            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                                Nombre del Consultorio *
                                            </Label>
                                            <input
                                                type="text"
                                                value={formData.nombre}
                                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                placeholder="Ej: Consultorio Central"
                                            />
                                        </div>

                                        {/* Google Maps LocationPicker */}
                                        <div className="col-span-2">
                                            <div className="mb-2 flex items-center justify-between">
                                                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    Ubicación (Opcional)
                                                </Label>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowMap(!showMap)}
                                                    className="text-xs gap-1"
                                                >
                                                    <Map className="h-3 w-3" />
                                                    {showMap ? 'Ocultar Mapa' : 'Mostrar Mapa'}
                                                </Button>
                                            </div>
                                            {showMap && (
                                                <LocationPicker
                                                    initialLocation={
                                                        formData.latitude && formData.longitude
                                                            ? { lat: formData.latitude, lng: formData.longitude }
                                                            : undefined
                                                    }
                                                    onLocationSelect={handleLocationSelect}
                                                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
                                                    height="350px"
                                                />
                                            )}
                                        </div>

                                        {/* Dirección */}
                                        <div className="col-span-2">
                                            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                                Dirección
                                            </Label>
                                            <input
                                                type="text"
                                                value={formData.direccion}
                                                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                placeholder="Av. Principal 123"
                                            />
                                        </div>

                                        {/* StateCitySelector - Venezuela */}
                                        <div className="col-span-2">
                                            <StateCitySelector
                                                selectedEstadoCode={selectedEstadoCode}
                                                selectedCiudad={formData.ciudad}
                                                onEstadoChange={(code) => {
                                                    setSelectedEstadoCode(code);
                                                    setFormData({ ...formData, estado: code });
                                                }}
                                                onCiudadChange={(ciudad) => setFormData({ ...formData, ciudad })}
                                            />
                                        </div>

                                        {/* Código Postal y Teléfono */}
                                        <div>
                                            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                                Código Postal
                                            </Label>
                                            <input
                                                type="text"
                                                value={formData.codigo_postal}
                                                onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                placeholder="1060"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                                Teléfono
                                            </Label>
                                            <input
                                                type="tel"
                                                value={formData.telefono}
                                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                placeholder="+58 412 1234567"
                                            />
                                        </div>

                                        {/* Notas */}
                                        <div className="col-span-2">
                                            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                                Notas Internas
                                            </Label>
                                            <textarea
                                                value={formData.notas}
                                                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                                rows={2}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                                placeholder="Información adicional sobre este consultorio..."
                                            />
                                        </div>

                                        {/* Checkboxes */}
                                        <div className="col-span-2 flex gap-4 mt-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.es_principal}
                                                    onChange={(e) => setFormData({ ...formData, es_principal: e.target.checked })}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Consultorio Principal</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.activo}
                                                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Activo</span>
                                            </label>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* TAB: AMENITIES */}
                                <TabsContent value="amenities" className="mt-0">
                                    <OfficeAmenities
                                        value={formData.amenities}
                                        onChange={(val) => setFormData({ ...formData, amenities: val })}
                                    />
                                </TabsContent>

                                {/* TAB: PRICING */}
                                <TabsContent value="pricing" className="mt-0 space-y-6">
                                    <OfficePricing
                                        value={formData.price_info}
                                        onChange={(val) => setFormData({ ...formData, price_info: val })}
                                    />
                                </TabsContent>

                                {/* TAB: PATIENTS */}
                                <TabsContent value="patients" className="mt-0 space-y-6">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6 shadow-sm">
                                        <OfficeAgeGroups
                                            officeId={formData.id}
                                            // Si estamos creando, guardamos en el estado local temporalmente
                                            value={formData.patient_age_groups}
                                            onChange={(groups) => setFormData({ ...formData, patient_age_groups: groups })}
                                        />
                                    </div>
                                </TabsContent>

                                {/* TAB: INSTRUCTIONS */}
                                <TabsContent value="instructions" className="mt-0 space-y-6">
                                    <OfficeInstructions
                                        instructions={formData.arrival_instructions}
                                        receptionInfo={formData.reception_info}
                                        onChange={(instr, rec) => setFormData({
                                            ...formData,
                                            arrival_instructions: instr,
                                            reception_info: rec
                                        })}
                                    />
                                </TabsContent>

                                {/* TAB: PHOTOS */}
                                <TabsContent value="photos" className="mt-0">
                                    {editing ? (
                                        <OfficePhotos
                                            officeId={editing}
                                        />
                                    ) : (
                                        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                                            <p className="text-sm text-gray-500">
                                                Guarda el consultorio primero para habilitar la subida de fotos.
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-1" />
                                            Guardar Consultorio
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Offices List */}
            <div className="space-y-3">
                {offices.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <Building2 className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No tienes consultorios registrados
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Crea tu primer consultorio para comenzar
                        </p>
                    </div>
                ) : (
                    offices.map((office) => (
                        <motion.div
                            key={office.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`
                border rounded-lg p-4 transition-all
                ${office.es_principal
                                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'
                                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                                }
                ${!office.activo && 'opacity-60'}
              `}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                            {office.nombre}
                                        </h4>
                                        {office.es_principal && (
                                            <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] px-1.5 py-0">
                                                <Star className="h-2.5 w-2.5 mr-0.5" />
                                                Principal
                                            </Badge>
                                        )}
                                        {!office.activo && (
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                Inactivo
                                            </Badge>
                                        )}
                                        {/* Status de datos Premium */}
                                        {office.amenities && Object.values(office.amenities).some(v => v) && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-200 text-green-700 bg-green-50">
                                                +Servicios
                                            </Badge>
                                        )}
                                    </div>
                                    {office.direccion && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {office.direccion}
                                            {office.ciudad && `, ${office.ciudad}`}
                                            {office.estado && `, ${office.estado}`}
                                        </p>
                                    )}
                                    <div className="flex gap-4 mt-2">
                                        {office.telefono && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                ☎️ {office.telefono}
                                            </p>
                                        )}
                                        {office.price_info?.consultation_fee && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                💰 {office.price_info.price_currency} {office.price_info.consultation_fee}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => startEdit(office)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(office.id!)}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
