/* eslint-disable @next/next/no-img-element */
import React, { forwardRef } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Mail, MapPin, Phone } from "lucide-react";

import { cn } from "@red-salud/core";
import type { DoctorSettings } from "@/lib/supabase/types/settings";
// We need types for the Recipe and Patient. Since these might be defined in other files
// but we want to be robust, I'll define interface subsets here or import if available.
// For now, I'll define interfaces based on usage to ensure loose coupling.

interface PatientInfo {
    nombre_completo: string;
    edad?: string | number;
    peso?: string | number;
    sexo?: string;
    id?: string;
}

interface Medication {
    nombre_comercial: string;
    nombre_generico?: string;
    dosis?: string;
    presentacion?: string;
    frecuencia?: string;
    duracion?: string;
    indicaciones?: string;
}

interface RecipeData {
    id?: string;
    created_at: string;
    medicamentos: Medication[];
    folio?: string;
    diagnostico?: string;
}

interface PrescriptionPDFProps {
    settings: DoctorSettings;
    patient: PatientInfo;
    recipe: RecipeData;
    previewMode?: boolean;
}

export const PrescriptionPDF = forwardRef<HTMLDivElement, PrescriptionPDFProps>(
    ({ settings, patient, recipe, previewMode = false }, ref) => {
        // Determine frame and watermark URLs
        // If we have active_frame relation, use its image_url. Otherwise fallback or empty.
        const frameUrl = settings.active_frame?.image_url || "";
        const watermarkUrl = settings.active_watermark?.image_url || "";

        // Determine logo and signature
        const logoUrl = settings.logo_enabled ? settings.logo_url : null;
        const signatureUrl = settings.firma_digital_enabled ? settings.firma_digital_url : null;

        // Frame color helper: hue-rotate is complex to map from generic hex.
        // Ideally we'd map the hex to a hue-rotate degree or SVG filter.
        // For MVP, if the backend doesn't give us degrees, we might just pass 0 or try a simple style.
        // The analysis showed `filter: hue-rotate(0deg)` for generic.
        // If settings has a specific hue value, we'd use it. 
        // Since `frame_color` is HEX, we might need a utility to convert or just rely on 'active_frame.has_customizable_color'.
        // Here we'll assume 0 if not handled, or allow passing a style for now.
        const frameStyle: React.CSSProperties = {
            filter: settings.active_frame?.has_customizable_color ? `hue-rotate(0deg)` : undefined
            // Note: Converting HEX to hue-rotate is non-trivial without a base color reference.
            // We will implement a proper color mapping later if needed.
        };

        return (
            <div
                ref={ref}
                id="prescription-pdf-container"
                className={cn(
                    "bg-white text-black relative mx-auto overflow-hidden",
                    previewMode ? "shadow-lg scale-75 origin-top" : ""
                )}
                style={{
                    width: "816px",
                    height: "1056px",
                    fontFamily: "Manrope, sans-serif",
                }}
            >
                {/* Layer 1: Frame Background */}
                {frameUrl && (
                    <div
                        className="absolute inset-0 bg-no-repeat bg-center bg-cover z-0"
                        style={{
                            backgroundImage: `url("${frameUrl}")`,
                            ...frameStyle
                        }}
                    />
                )}

                {/* Layer 2: Watermark */}
                {watermarkUrl && (
                    <div
                        className="absolute inset-0 bg-no-repeat bg-center bg-cover z-0 opacity-10"
                        style={{
                            backgroundImage: `url("${watermarkUrl}")`,
                            backgroundSize: "50%",
                        }}
                    />
                )}

                {/* Layer 3: Content */}
                <div className="relative z-10 h-full pb-[150px]">
                    {/* Header section */}
                    <div className="absolute top-[50px] left-[50px] w-[164px] h-[78px]">
                        {logoUrl && (
                            <img
                                src={logoUrl}
                                alt="Clinic Logo"
                                className="w-full h-full object-contain"
                            />
                        )}
                    </div>

                    <div className="absolute top-[50px] left-1/2 -translate-x-1/2 text-center max-w-[300px]">
                        <strong className="text-[18px]" style={{ color: settings.frame_color || "#0da9f7" }}>
                            {settings.nombre_completo || "Dr. Nombre Apellido"}
                        </strong>
                    </div>

                    <div className="absolute top-[82px] left-1/2 -translate-x-1/2 text-center text-[#555] text-[15px] leading-tight">
                        <div>{settings.especialidad || "Especialidad Médica"}</div>
                        {settings.cedula_profesional && (
                            <div>Céd. Prof. {settings.cedula_profesional}</div>
                        )}
                    </div>

                    {/* Clinic Info (Right) */}
                    <div className="absolute top-[54px] right-[60px] text-right max-w-[200px] leading-tight">
                        <strong className="text-[18px]" style={{ color: settings.frame_color || "#0da9f7" }}>
                            {settings.clinica_nombre || "Nombre Clínica"}
                        </strong>
                    </div>
                    <div className="absolute top-[100px] right-[60px] text-right max-w-[230px] text-[#555] text-[15px] leading-tight">
                        {settings.consultorio_direccion}
                    </div>

                    {/* Patient Info Grid */}
                    <div
                        className="absolute top-[160px] left-[55px] right-[55px] grid gap-x-5 gap-y-1 text-[14px] items-start leading-relaxed"
                        style={{ gridTemplateColumns: "1.5fr 1fr" }}
                    >
                        <div className="col-span-1">
                            <strong style={{ color: settings.frame_color || "#0da9f7" }}>Paciente: </strong>
                            {patient.nombre_completo}
                        </div>
                        <div className="col-span-1 text-right">
                            <strong style={{ color: settings.frame_color || "#0da9f7" }}>Fecha: </strong>
                            {format(new Date(recipe.created_at || new Date()), "dd/MM/yy", { locale: es })}
                        </div>

                        <div className="col-span-1">
                            <strong style={{ color: settings.frame_color || "#0da9f7" }}>Edad: </strong>
                            {patient.edad ?? "--"} &nbsp;
                            <strong style={{ color: settings.frame_color || "#0da9f7" }}>Peso: </strong>
                            {patient.peso ? `${patient.peso} kg` : "--"} &nbsp;
                            <strong style={{ color: settings.frame_color || "#0da9f7" }}>Sexo: </strong>
                            {patient.sexo ?? "--"}
                        </div>
                        <div className="col-span-1 text-right">
                            <strong style={{ color: settings.frame_color || "#0da9f7" }}>Folio: </strong>
                            {recipe.folio || "RX-000"}
                        </div>
                    </div>

                    {/* Body: Rx */}
                    <div className="absolute top-[240px] left-[60px] text-[16px]">
                        <strong style={{ color: settings.frame_color || "#0da9f7" }}>Rx.</strong>
                    </div>

                    {/* Medication List */}
                    <div className="absolute top-[270px] left-[60px] right-[60px] flex flex-col gap-4">
                        {recipe.medicamentos.map((med, index) => (
                            <div key={index} className="border-b border-gray-100 pb-2">
                                <div className="text-[14px] mb-2">
                                    <strong style={{ color: settings.frame_color || "#0da9f7" }}>{index + 1}. {med.nombre_comercial}</strong>
                                    {med.nombre_generico && <span className="text-gray-600"> ({med.nombre_generico})</span>}
                                    {med.dosis && <span> - <strong style={{ color: settings.frame_color || "#0da9f7" }}>{med.dosis}</strong></span>}
                                </div>
                                <div className="grid grid-cols-3 text-[13px] text-[#555] pl-5">
                                    {med.presentacion && <span>Presentación: {med.presentacion}</span>}
                                    {med.frecuencia && <span>Frecuencia: {med.frecuencia}</span>}
                                    {med.duracion && <span>Duración: {med.duracion}</span>}
                                </div>
                                {med.indicaciones && (
                                    <div className="text-[13px] text-[#555] pl-5 mt-1">
                                        Nota: {med.indicaciones}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer: Signature & Contact */}
                    <div className="absolute bottom-[20px] left-0 right-0 z-[100]">
                        {/* Signature Area */}
                        <div className="relative mb-6">
                            {signatureUrl && (
                                <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 w-[200px] h-[80px]">
                                    <img
                                        src={signatureUrl}
                                        alt="Signature"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                            {/* Signature Line */}
                            <div className="absolute bottom-[25px] left-1/2 -translate-x-1/2 w-[250px] h-[1px] bg-[#383838]" />

                            {/* Signed Name */}
                            <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 text-[14px] text-center w-full">
                                <strong style={{ color: settings.frame_color || "#0da9f7" }}>
                                    {settings.trato ? `${settings.trato} ` : ""}{settings.nombre_completo}
                                </strong>
                            </div>
                        </div>

                        {/* Contact Bar */}
                        <div className="px-[60px] text-[13px] text-center mt-[100px]">
                            <div className="font-bold flex justify-center items-center gap-5 text-white">
                                {settings.telefono && (
                                    <span className="flex items-center gap-1">
                                        <Phone size={14} fill="currentColor" strokeWidth={0} />
                                        {settings.telefono}
                                    </span>
                                )}
                                {settings.email && (
                                    <span className="flex items-center gap-1">
                                        <Mail size={14} fill="currentColor" strokeWidth={0} />
                                        {settings.email}
                                    </span>
                                )}
                                {settings.consultorio_direccion && (
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} fill="currentColor" strokeWidth={0} />
                                        Ubicación
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

PrescriptionPDF.displayName = "PrescriptionPDF";
