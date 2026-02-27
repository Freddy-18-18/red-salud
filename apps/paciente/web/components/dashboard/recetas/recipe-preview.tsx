"use client";

import { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogTitle, Button } from "@red-salud/design-system";
import { Eye, Printer, Download, LayoutTemplate } from "lucide-react";
import { format } from "date-fns";
import { MedicationItemData } from "./medication-input";
import { supabase } from "@/lib/supabase/client";
import { getDoctorRecipeSettings, DoctorRecipeSettings } from "@/lib/supabase/services/recipe-settings";
import { VisualRecipePreview } from "./visual-recipe-preview";
import { printContent } from "@/lib/print-utils";
import { downloadRecipePdf } from "@/lib/recipe-utils";
import ReactDOMServer from "react-dom/server";
import { toast } from "sonner";

interface PatientData {
    nombre: string;
    cedula?: string;
    edad?: number;
    unidadEdad?: string;
    peso?: number;
    sexo?: string;
}

export interface DoctorInfo {
    nombre: string;
    titulo?: string;
    especialidad?: string;
    cedulaProfesional: string;
    clinica?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
}

interface RecipePreviewProps {
    patient: PatientData | null;
    medications: MedicationItemData[];
    diagnosis?: string;
    notes?: string;
    doctorInfo?: DoctorInfo;
    fecha?: Date;
    officeId?: string | null;
}

export function RecipePreview({
    patient,
    medications,
    diagnosis,
    doctorInfo: initialDoctorInfo,
    fecha = new Date(),
    officeId,
}: RecipePreviewProps) {
    const [settings, setSettings] = useState<DoctorRecipeSettings | null>(null);
    const [doctorProfile, setDoctorProfile] = useState<DoctorInfo | null>(initialDoctorInfo || null);
    const [loading, setLoading] = useState(true);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    // Fetch settings and profile on mount
    useEffect(() => {
        async function fetchData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Fetch Settings (with office context if provided)
                const settingsResult = await getDoctorRecipeSettings(user.id, officeId || null);
                if (settingsResult.success && settingsResult.data) {
                    setSettings(settingsResult.data as DoctorRecipeSettings);
                }

                // Fetch Profile if not provided
                if (!initialDoctorInfo) {
                    // First, get basic profile
                    const { data: profile, error: profileError } = await supabase
                        .from("profiles")
                        .select("id, nombre_completo, email, sacs_matricula, cedula, especialidad, sacs_especialidad") // Added especialidad fields
                        .eq("id", user.id)
                        .single();

                    if (profileError) {
                        console.error("Error fetching profile:", profileError);
                    }

                    // Then, get doctor_details separately
                    const { data: doctorData, error: doctorError } = await supabase
                        .from("doctor_details")
                        .select("licencia_medica, especialidad_id")
                        .eq("profile_id", user.id)
                        .maybeSingle();

                    if (doctorError) {
                        console.error("Error fetching doctor_details:", doctorError);
                    }

                    // If we have especialidad_id, fetch specialty name from specialties table
                    let specialtyName = "";
                    if (doctorData?.especialidad_id) {
                        const { data: specialty } = await supabase
                            .from("specialties")
                            .select("name")
                            .eq("id", doctorData.especialidad_id)
                            .maybeSingle();
                        specialtyName = specialty?.name || "";
                    }

                    // Fetch Office Details if officeId is present
                    let officeData = null;
                    if (officeId) {
                        const { data: office } = await supabase
                            .from("doctor_offices")
                            .select("nombre, direccion, telefono")
                            .eq("id", officeId)
                            .single();
                        officeData = office;
                    }

                    // Build doctor profile from collected data
                    if (profile) {
                        // Logic aligned with configuration page
                        let clinicName = settingsResult.data?.clinic_name || "";
                        let clinicAddress = settingsResult.data?.clinic_address || "";
                        let clinicPhone = settingsResult.data?.clinic_phone || "";
                        const clinicEmail = settingsResult.data?.clinic_email || profile.email || "";

                        // Fallback to office details if settings are empty
                        if (officeData) {
                            if (!clinicName) clinicName = officeData.nombre;
                            if (!clinicAddress) clinicAddress = officeData.direccion || "";
                            if (!clinicPhone) clinicPhone = officeData.telefono || "";
                        }

                        // Priority for Specialty: sacs_especialidad -> profile.especialidad -> relational specialty
                        const displayedSpecialty = (profile as unknown as { sacs_especialidad?: string }).sacs_especialidad || profile.especialidad || specialtyName;

                        // Priority: User requested 'cedula' (CI) explicitly. 
                        // Fallbacks: doctor_details.licencia_medica -> profiles.sacs_matricula
                        const displayedId = profile.cedula || doctorData?.licencia_medica || profile.sacs_matricula || "";

                        setDoctorProfile({
                            nombre: profile.nombre_completo || "Nombre no disponible",
                            titulo: "Dr.",
                            especialidad: displayedSpecialty,
                            cedulaProfesional: displayedId,
                            clinica: clinicName,
                            direccion: clinicAddress,
                            telefono: clinicPhone,
                            email: clinicEmail
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching preview data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [initialDoctorInfo, officeId]);

    // Construct Preview Data
    const previewData = useMemo(() => {
        return {
            doctorName: doctorProfile?.nombre || "...",
            doctorTitle: doctorProfile?.titulo || "Dr.",
            doctorSpecialty: doctorProfile?.especialidad || "",
            doctorProfessionalId: doctorProfile?.cedulaProfesional || "",
            clinicName: settings?.clinic_name || doctorProfile?.clinica || "",
            clinicAddress: settings?.clinic_address || doctorProfile?.direccion || "",
            clinicPhone: settings?.clinic_phone || doctorProfile?.telefono || "",
            clinicEmail: settings?.clinic_email || doctorProfile?.email || "",
            patientName: patient?.nombre || "Nombre del Paciente",
            patientAge: patient?.edad ? `${patient.edad} ${patient.unidadEdad || "años"} ` : "--",
            patientWeight: patient?.peso ? `${patient.peso} kg` : "--",
            patientSex: patient?.sexo || "--",
            date: format(fecha, "dd/MM/yyyy"),
            medications: medications
                .filter(m => m.medicamento)
                .map(m => ({
                    name: m.medicamento + (m.presentacion ? ` (${m.presentacion})` : ""),
                    presentation: m.presentacion,
                    frequency: m.frecuencia,
                    duration: m.duracion ? `${m.duracion} días` : "",
                    specialInstructions: m.instrucciones
                })),
            diagnosis: diagnosis || "Diagnóstico..."
        };
    }, [doctorProfile, settings, patient, medications, diagnosis, fecha]);

    // Preview settings
    const previewSettings = useMemo(() => ({
        templateId: settings?.template_id || "plantilla-3",
        frameColor: settings?.frame_color || "#0da9f7",
        watermarkUrl: settings?.selected_watermark_url || null,
        showLogo: settings?.use_logo ?? true,
        showSignature: settings?.use_digital_signature ?? true,
        logoUrl: settings?.logo_url || null,
        signatureUrl: settings?.digital_signature_url || null
    }), [settings]);

    // Check if we have enough content to "print" (enable buttons)
    const hasContent = useMemo(() => {
        return (
            patient?.nombre ||
            medications.some((m) => m.medicamento) ||
            diagnosis
        );
    }, [patient, medications, diagnosis]);

    const handlePrint = () => {
        // Generate the HTML for the recipe
        const printElement = (
            <div style={{ width: "216mm", height: "auto", minHeight: "279mm", margin: "0 auto" }}>
                <VisualRecipePreview
                    data={previewData}
                    settings={previewSettings}
                />
            </div>
        );

        const htmlContent = ReactDOMServer.renderToStaticMarkup(printElement);
        printContent(htmlContent);
    };

    const handleDownloadPdf = async () => {
        setLoading(true);
        try {
            await downloadRecipePdf(previewData, previewSettings, `receta-${patient?.nombre || "sin-nombre"}.pdf`);
            toast.success("PDF generado exitosamente");
        } catch (error) {
            console.error("Error generating PDF", error);
            toast.error("Error al generar PDF");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card className="sticky top-6 shadow-lg border-primary/20 overflow-hidden">
                <CardHeader className="pb-3 border-b bg-muted/40">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Eye className="h-5 w-5 text-primary" />
                        Vista Previa
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-0 bg-gray-100 flex flex-col items-center gap-4 relative">
                    {/* Clickable Visual Preview Scaled Down */}
                    <div
                        className="mx-auto rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm border relative w-full flex justify-center pt-8 pb-4 cursor-pointer group hover:ring-2 hover:ring-primary/50 transition-all"
                        title="Clic para ampliar vista previa"
                        onClick={() => setIsPreviewModalOpen(true)}
                    >
                        <div className="transform scale-[0.4] origin-top h-[450px] pointer-events-none">
                            <VisualRecipePreview
                                data={previewData}
                                settings={previewSettings}
                            />
                        </div>
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white/90 dark:bg-black/80 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm flex items-center gap-2 text-foreground">
                                <LayoutTemplate className="h-3.5 w-3.5" /> Ampliar Vista
                            </div>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="w-full p-4 bg-white border-t space-y-3 z-10">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handlePrint}
                                disabled={!hasContent}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 shadow-sm"
                            >
                                <Printer className="h-4 w-4" />
                                Imprimir
                            </button>
                            <button
                                type="button"
                                onClick={handleDownloadPdf}
                                disabled={!hasContent || loading}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 shadow-sm"
                            >
                                <Download className="h-4 w-4" />
                                PDF
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Expanded Preview Modal */}
            <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
                <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0 bg-gray-100/95 dark:bg-gray-900/95 backdrop-blur-sm border-none">
                    <DialogTitle className="sr-only">Vista Previa Ampliada</DialogTitle>
                    <div className="absolute right-4 top-4 z-50">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-md"
                            onClick={() => setIsPreviewModalOpen(false)}
                        >
                            <span className="sr-only">Cerrar</span>
                            <span className="text-lg">×</span>
                        </Button>
                    </div>
                    <div className="flex-1 overflow-auto grid place-items-center p-8">
                        <div className="shadow-2xl my-auto">
                            <VisualRecipePreview
                                data={previewData}
                                settings={previewSettings}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
