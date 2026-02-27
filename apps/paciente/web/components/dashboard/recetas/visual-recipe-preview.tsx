import { forwardRef } from "react";
import { cn } from "@red-salud/core/utils";
import {
    TemplateModern, TemplateGeometric, TemplateElegant,
    TemplateClinical, TemplateWaves, TemplateTech,
    WatermarkCaduceus, WatermarkHeartbeat, WatermarkCross
} from "./recipe-graphics";
export interface VisualRecipeData {
    patientName?: string;
    patientAge?: string;
    patientWeight?: string;
    patientSex?: string;
    patientId?: string; // Folio/Cedula
    diagnosis?: string;
    medications?: Array<{
        name: string;
        genericName?: string; // (dcsdc)
        presentation?: string;
        frequency?: string;
        duration?: string;
        route?: string;
        specialInstructions?: string;
    }>;
    date?: string;
    doctorName?: string;
    doctorSpecialty?: string;
    doctorTitle?: string;
    doctorProfessionalId?: string; // Cedula
    clinicName?: string;
    clinicAddress?: string;
    clinicPhone?: string;
    clinicEmail?: string;
}

export interface VisualRecipeSettings {
    templateId: string;
    frameColor: string;
    watermarkUrl?: string | null;
    logoUrl?: string | null;
    signatureUrl?: string | null;
    showLogo: boolean;
    showSignature: boolean;
}

export interface VisualRecipePreviewProps {
    data: VisualRecipeData;
    settings: VisualRecipeSettings;
    className?: string;
}

export const VisualRecipePreview = forwardRef<HTMLDivElement, VisualRecipePreviewProps>(
    ({ data, settings, className }, ref) => {
        const {
            templateId,
            frameColor = "#0da9f7",
            watermarkUrl,
            logoUrl,
            signatureUrl,
            showLogo,
            showSignature
        } = settings;

        // Layout Configuration based on Template
        const layout = (() => {
            const baseLayout = {
                // Header
                headerTop: "40px",
                logoTop: "40px",
                logoLeft: "60px",
                doctorInfoRight: "60px",

                // Patient Info (The banner/grid)
                patientInfoTop: "170px",
                patientInfoLeft: "52.5px",
                patientInfoRight: "52.5px",

                // Body
                rxSymbolTop: "245px",
                rxSymbolLeft: "60px",
                medicationsTop: "275px",
                medicationsLeft: "60px",
                medicationsRight: "60px",
            };

            switch (templateId) {
                case 'plantilla-1': // Clásica (Minimalista)
                    // Minimalist usually allows content higher up
                    return { ...baseLayout, headerTop: "40px", patientInfoTop: "160px", rxSymbolTop: "240px", medicationsTop: "270px" };
                case 'plantilla-2': // Corporativa (Con Marco)
                    // Frame might have thicker header/sidebar
                    return {
                        ...baseLayout,
                        headerTop: "60px",
                        logoTop: "60px",
                        patientInfoTop: "190px", // Push down further
                        rxSymbolTop: "270px",
                        medicationsTop: "300px"
                    };
                case 'plantilla-3': // Moderna (Estándar) - Likely has graphical header
                    return {
                        ...baseLayout,
                        headerTop: "110px", // Much lower to clear graphical header
                        logoTop: "120px",  // Logo might even need to be hidden or moved if header is busy
                        patientInfoTop: "240px",
                        rxSymbolTop: "300px",
                        medicationsTop: "330px"
                    };
                // New Templates Layouts
                case 'modern-minimal':
                    return {
                        ...baseLayout,
                        headerTop: "60px",
                        patientInfoTop: "190px",
                        rxSymbolTop: "260px",
                        medicationsTop: "290px"
                    };
                case 'geometric-border':
                    return {
                        ...baseLayout,
                        headerTop: "100px",
                        logoTop: "100px",
                        patientInfoTop: "220px",
                        rxSymbolTop: "280px",
                        medicationsTop: "310px"
                    };
                case 'abstract-waves':
                    return {
                        ...baseLayout,
                        headerTop: "90px",
                        logoTop: "90px",
                        patientInfoTop: "200px",
                        rxSymbolTop: "270px",
                        medicationsTop: "300px"
                    };
                case 'classic-elegant':
                    return {
                        ...baseLayout,
                        headerTop: "70px",
                        logoTop: "70px",
                        patientInfoTop: "190px",
                        rxSymbolTop: "260px",
                        medicationsTop: "290px"
                    };
                default:
                    return baseLayout;
            }
        })();

        return (
            <div
                ref={ref}
                className={cn(
                    "relative bg-white text-black overflow-hidden shadow-lg mx-auto transition-transform duration-100",
                    className
                )}
                style={{
                    width: "816px", // approx A4 width at 96dpi
                    height: "1056px",
                    fontFamily: "Manrope, sans-serif",
                }}
            >
                {/* Dynamic Template Rendering */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    {(() => {
                        switch (templateId) {
                            case 'modern-minimal':
                                return <TemplateModern color={frameColor} className="absolute inset-0" />;
                            case 'geometric-border':
                                return <TemplateGeometric color={frameColor} className="absolute inset-0" />;
                            case 'classic-elegant':
                                return <TemplateElegant color={frameColor} className="absolute inset-0" />;
                            case 'medical-clean':
                                return <TemplateClinical color={frameColor} className="absolute inset-0" />;
                            case 'abstract-waves':
                                return <TemplateWaves color={frameColor} className="absolute inset-0" />;
                            case 'tech-line':
                                return <TemplateTech color={frameColor} className="absolute inset-0" />;
                            default:
                                // Fallback for legacy image-based templates
                                const templateImage = (() => {
                                    switch (templateId) {
                                        case 'plantilla-1': return `url('https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets//generic_frames/1754768140717_pc_1_juajau.png')`;
                                        case 'plantilla-2': return `url('https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets//generic_frames/1754766102442_copipoadjsoidh.png')`;
                                        case 'plantilla-3': return `url('https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets/generic_frames/pc%203%20copia%202.png')`;
                                        case 'media-pagina-1': return `url('https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets/generic_frames/osea%20si%20pero%20arriba%20copia.png')`;
                                        case 'simple': return 'none'; // No background for simple
                                        default: return 'none';
                                    }
                                })();
                                return (
                                    <div
                                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                        style={{
                                            backgroundImage: templateImage,
                                            border: templateId === 'template-1' || templateId === 'simple' ? `4px solid ${frameColor}` : 'none',
                                            opacity: 1,
                                            mixBlendMode: 'multiply',
                                        }}
                                    />
                                );
                        }
                    })()}
                </div>

                {/* Dynamic Watermark Rendering */}
                {watermarkUrl && (
                    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
                        {(() => {
                            // Check if it's one of our new internal SVG watermarks
                            // We used IDs like 'wm-caduceus' in page.tsx. 
                            // However, settings.watermarkUrl usually passes the URL string.
                            // We need to check if the 'watermarkUrl' matches our internal keys OR if it's a real URL.
                            // To make this robust, we should probably pass the ID as well, but 'settings' might only have the URL.
                            // Let's assume for the new ones we save a special string or we rely on the implementation in page.tsx correctly passing the "image" field which might be used as ID if we change it.

                            // actually, let's look at page.tsx again. 
                            // The user selects an item, and 'selectedWatermark' (URL) is saved. 
                            // I should update page.tsx to save the ID or a special "component:ID" string if I want to use components.
                            // OR, since I set the "image" in TEMPLATES to "/assets/...", I can check that string.

                            if (watermarkUrl.includes('caduceus')) return <WatermarkCaduceus className="w-[400px] h-[400px] text-gray-400" style={{ opacity: 0.1 }} />;
                            if (watermarkUrl.includes('heartbeat')) return <WatermarkHeartbeat className="w-[500px] h-[250px] text-gray-400" style={{ opacity: 0.1 }} />;
                            if (watermarkUrl.includes('cross')) return <WatermarkCross className="w-[400px] h-[400px] text-gray-400" style={{ opacity: 0.1 }} />;

                            // Legacy Image Watermarks
                            return (
                                <div
                                    className="w-full h-full bg-no-repeat bg-center"
                                    style={{
                                        backgroundImage: `url('${watermarkUrl}')`,
                                        backgroundSize: "40%",
                                        opacity: 0.06,
                                    }}
                                />
                            );
                        })()}
                    </div>
                )}

                {/* Content Container */}
                <div className="relative h-full pb-[150px] z-10">

                    {/* Logo (Top Left) */}
                    {showLogo && logoUrl && (
                        <div style={{ top: layout.logoTop, left: layout.logoLeft, width: "165px", height: "93px", position: "absolute" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={logoUrl}
                                alt="logo"
                                style={{ height: "100%", width: "100%", objectFit: "contain" }}
                            />
                        </div>
                    )}

                    {/* Doctor Info (Top Right) */}
                    <div style={{ top: layout.headerTop, right: layout.doctorInfoRight, fontSize: "22px", position: "absolute", textAlign: "right" }}>
                        <strong style={{ color: frameColor }}>{data.doctorTitle || "Dr."} {data.doctorName}</strong>
                    </div>
                    <div style={{ top: `calc(${layout.headerTop} + 27px)`, color: "#555", right: layout.doctorInfoRight, fontSize: "14px", position: "absolute", textAlign: "right" }}>
                        {data.doctorSpecialty}
                    </div>
                    <div style={{ top: `calc(${layout.headerTop} + 45px)`, color: "#555", right: layout.doctorInfoRight, fontSize: "14px", position: "absolute", textAlign: "right", lineHeight: "1.4" }}>
                        {data.clinicAddress ? `${data.clinicAddress} • ` : ""}
                        <b className="ml-1">Cédula </b>{data.doctorProfessionalId}
                    </div>

                    {/* Patient Info Bar */}
                    <div style={{
                        gap: "5px 20px",
                        top: layout.patientInfoTop,
                        left: layout.patientInfoLeft,
                        right: layout.patientInfoRight,
                        display: "grid",
                        fontSize: "14px",
                        position: "absolute",
                        alignItems: "flex-start",
                        lineHeight: "1.6",
                        gridTemplateColumns: "1.5fr 1fr"
                    }}>
                        <div style={{ gridColumn: "1 / 3" }}>
                            <strong style={{ color: frameColor }}>Paciente:</strong> {data.patientName || "Sin paciente"}
                        </div>
                        <div style={{ textAlign: "left" }}>
                            {data.patientAge && data.patientAge !== "--" && (
                                <span style={{ marginRight: "10px" }}>
                                    <strong style={{ color: frameColor }}>Edad:</strong> {data.patientAge}
                                </span>
                            )}
                            {data.patientWeight && data.patientWeight !== "--" && data.patientWeight !== "-- kg" && (
                                <span style={{ marginRight: "10px" }}>
                                    <strong style={{ color: frameColor }}>Peso:</strong> {data.patientWeight}
                                </span>
                            )}
                            {data.patientSex && data.patientSex !== "--" && (
                                <span>
                                    <strong style={{ color: frameColor }}>Sexo:</strong> {data.patientSex}
                                </span>
                            )}
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <strong style={{ color: frameColor }}>Folio:</strong> {data.patientId || "RX-1"} &nbsp;
                            <strong style={{ color: frameColor }}>Fecha:</strong> {data.date || new Date().toLocaleDateString()}
                        </div>
                    </div>

                    {/* Rx Symbol */}
                    <div style={{ top: layout.rxSymbolTop, left: layout.rxSymbolLeft, fontSize: "16px", position: "absolute" }}>
                        <strong style={{ color: frameColor }}>Rx.</strong>
                    </div>

                    {/* Medications List */}
                    <div style={{ gap: "15px", top: layout.medicationsTop, left: layout.medicationsLeft, right: layout.medicationsRight, display: "flex", position: "absolute", flexDirection: "column" }}>
                        {data.medications && data.medications.length > 0 ? (
                            data.medications.map((med, idx) => (
                                <div key={idx} style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                                    <div style={{ fontSize: "14px", marginBottom: "8px" }}>
                                        <strong style={{ color: frameColor }}>{idx + 1}. {med.name}</strong>
                                        {med.genericName && ` (${med.genericName})`}
                                        {med.specialInstructions && ` - ${med.specialInstructions}`}
                                    </div>
                                    <div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", fontSize: "13px", color: "#555", paddingLeft: "20px" }}>
                                            {med.presentation && <span>Presentación: {med.presentation}</span>}
                                            {med.frequency && <span>Frecuencia: {med.frequency}</span>}
                                            {med.duration && <span>Duración: {med.duration}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-400 italic text-sm p-4 text-center">
                                Sin medicamentos prescritos
                            </div>
                        )}

                        {/* Diagnosis if distinct */}
                        {data.diagnosis && (
                            <div className="mt-4 pt-4 border-t">
                                <strong style={{ color: frameColor, fontSize: "14px" }}>Diagnóstico:</strong>
                                <span className="text-sm ml-2 text-gray-700">{data.diagnosis}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer / Signature Area */}
                    <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", height: "150px" }}>
                        {/* Signature Image */}
                        {showSignature && signatureUrl && (
                            <div style={{ left: "50%", width: "180px", bottom: "122px", height: "70px", position: "absolute", transform: "translateX(-50%)" }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={signatureUrl}
                                    alt="signature"
                                    style={{ height: "100%", width: "100%", objectFit: "contain" }}
                                />
                            </div>
                        )}

                        {/* Signature Line */}
                        <div style={{ left: "calc(50% - 125px)", width: "250px", bottom: "117px", height: "1px", position: "absolute", backgroundColor: "#383838" }}></div>

                        {/* Doctor Name Footer */}
                        <div style={{ left: "50%", bottom: "97px", fontSize: "14px", position: "absolute", textAlign: "center", transform: "translateX(-50%)" }}>
                            <strong style={{ color: frameColor }}>{data.doctorTitle || "Dr."} {data.doctorName}</strong>
                        </div>

                        {/* Doctor Details Footer (University/Title) */}
                        <div style={{ left: "60px", color: "#555", right: "60px", bottom: "47px", fontSize: "13px", position: "absolute", textAlign: "center" }}>
                            <strong style={{ color: frameColor }}>{data.clinicName}</strong> • {data.clinicEmail}
                        </div>

                        {/* Contact Icons / Address */}
                        <div style={{ left: "60px", right: "60px", bottom: "17px", fontSize: "13px", position: "absolute", textAlign: "center" }}>
                            <div style={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center", gap: "20px" }}>
                                {data.clinicPhone && (
                                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                        📞 {data.clinicPhone}
                                    </span>
                                )}
                                {data.clinicAddress && (
                                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                        📍 {data.clinicAddress}
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

VisualRecipePreview.displayName = "VisualRecipePreview";
