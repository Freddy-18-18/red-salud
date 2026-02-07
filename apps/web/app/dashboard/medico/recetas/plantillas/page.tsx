"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Check, Upload, CircleCheckBig, Palette, Users, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
    getDoctorRecipeSettings,
    updateDoctorRecipeSettings,
    uploadRecipeAsset,
    DoctorRecipeSettings
} from "@/lib/supabase/services/recipe-settings";
import { Button, Label, Card, Separator, Tabs, TabsContent, TabsList, TabsTrigger } from "@red-salud/ui";
import { cn } from "@red-salud/core/utils";
import { VisualRecipePreview } from "@/components/dashboard/recetas/visual-recipe-preview";
import { getProfile } from "@/lib/supabase/services/profile"; // ensure this exists or use query
import {
    TemplateModern, TemplateGeometric, TemplateElegant,
    TemplateClinical, TemplateWaves, TemplateTech,
    WatermarkCaduceus, WatermarkHeartbeat, WatermarkCross
} from "@/components/dashboard/recetas/recipe-graphics";



const TEMPLATES = [
    { id: "plantilla-3", name: "Original 3", image: "https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets/generic_frames/pc%203%20copia%202.png" },
    { id: "media-pagina-1", name: "Media Carta", image: "https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets/generic_frames/osea%20si%20pero%20arriba%20copia.png" },
    { id: "plantilla-1", name: "Original 1", image: "https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets//generic_frames/1754768140717_pc_1_juajau.png" },
    { id: "plantilla-2", name: "Original 2", image: "https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets//generic_frames/1754766102442_copipoadjsoidh.png" },
    // New Templates
    { id: "modern-minimal", name: "Minimalista", image: "/assets/templates/modern-minimal.png" },
    { id: "classic-elegant", name: "Elegante", image: "/assets/templates/classic-elegant.png" },
    { id: "medical-clean", name: "Clínico", image: "/assets/templates/medical-clean.png" },
    { id: "geometric-border", name: "Geométrico", image: "/assets/templates/geometric-border.png" },
    { id: "abstract-waves", name: "Olas", image: "/assets/templates/abstract-waves.png" },
    { id: "tech-line", name: "Tech", image: "/assets/templates/tech-line.png" },
];

const WATERMARKS = [
    { id: "wm-caduceus", name: "Caduceo", image: "/assets/watermarks/caduceus-shield.png" },
    { id: "wm-heartbeat", name: "Latidos", image: "/assets/watermarks/heartbeat-line.png" },
    { id: "wm-cross", name: "Cruz", image: "/assets/watermarks/medical-cross.png" },
    { id: "wm-5", name: "Genérico 5", image: "https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets/generic_watermarks/1754451399054_5.png" },
    { id: "wm-4", name: "Genérico 4", image: "https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets/generic_watermarks/1754451407146_4.png" },
    { id: "wm-3", name: "Genérico 3", image: "https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets/generic_watermarks/1754451413018_3.png" },
    { id: "wm-2", name: "Genérico 2", image: "https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets/generic_watermarks/1754451418909_2.png" },
    { id: "wm-1", name: "Genérico 1", image: "https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets/generic_watermarks/1754451425045_1.png" },
    { id: "wm-marcamuela", name: "Diente", image: "https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets/generic_watermarks/MARCAMUELA.png" },
    { id: "wm-muela2", name: "Muela", image: "https://lgbyvkowppcdyyymnfjk.supabase.co/storage/v1/object/public/generic_assets/generic_watermarks/muela2.png" },
];

const COLORS = [
    "#0da9f7", "#1abc9c", "#2ecc71", "#9b59b6", "#e74c3c",
    "#f39c12", "#e91e63", "#7f8c8d", "#3f51b5", "#f1c40f"
];

export default function TemplateEditorPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // State
    // State
    const [selectedTemplate, setSelectedTemplate] = useState<string>("plantilla-3");
    const [selectedWatermark, setSelectedWatermark] = useState<string | null>(null);
    const [frameColor, setFrameColor] = useState<string>("#0da9f7");
    const [userAssets, setUserAssets] = useState<{ logo?: string | null; signature?: string | null }>({});

    // Preview Data State
    const [previewData, setPreviewData] = useState<{
        doctorName: string;
        specialty: string;
        cedula: string;
    }>({
        doctorName: "Dr. Ejemplo",
        specialty: "Especialidad",
        cedula: "0000000"
    });

    // Load Data
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push("/login/medico");
                    return;
                }
                setUserId(user.id);

                // Fetch Profile Data for Preview
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("first_name, last_name, specialty, professional_license")
                    .eq("id", user.id)
                    .single();

                if (profile) {
                    setPreviewData({
                        doctorName: `${profile.first_name} ${profile.last_name}`,
                        specialty: profile.specialty || "Medicina General",
                        cedula: profile.professional_license || "Sin Cédula"
                    });
                }

                const { success, data } = await getDoctorRecipeSettings(user.id);
                if (success && data) {
                    setSelectedTemplate(data.template_id || "plantilla-3");
                    setFrameColor(data.frame_color || "#0da9f7");
                    setUserAssets({
                        logo: data.logo_url,
                        signature: data.digital_signature_url
                    });
                    if (data.selected_watermark_url) {
                        const found = WATERMARKS.find(w => w.image === data.selected_watermark_url);
                        if (found) setSelectedWatermark(found.image);
                        else setSelectedWatermark(data.selected_watermark_url);
                    }
                }
            } catch (error) {
                console.error("Error loading settings:", error);
                toast.error("Error cargando configuración");
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [router]);

    const handleSave = async () => {
        if (!userId) return;
        setIsSaving(true);
        try {
            const { success, error } = await updateDoctorRecipeSettings(userId, {
                template_id: selectedTemplate,
                frame_color: frameColor,
                selected_watermark_url: selectedWatermark
            });

            if (!success) throw error;
            toast.success("Plantilla guardada correctamente");
        } catch (error: any) {
            console.error("Error saving template details:", error?.message || error, error);
            toast.error(`Error al guardar cambios: ${error?.message || "Error desconocido"}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleWatermarkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        // Basic validation
        if (file.size > 2 * 1024 * 1024) {
            toast.error("El archivo no debe superar los 2MB");
            return;
        }

        const toastId = toast.loading("Subiendo marca de agua...");
        try {
            const { success, url, error } = await uploadRecipeAsset(userId, file, "watermark");
            if (success && url) {
                setSelectedWatermark(url);
                toast.success("Marca de agua subida correctamente");

                // Add to transient list if we wanted to show it in the grid, 
                // but for now setting it as selected is enough.
            } else {
                throw error;
            }
        } catch (error) {
            console.error("Error uploading watermark:", error);
            toast.error("Error al subir la imagen");
        } finally {
            toast.dismiss(toastId);
            // Reset input
            e.target.value = "";
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 pb-20">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="mr-3 gap-2"
                                onClick={() => router.push('/dashboard/medico/recetas/configuracion')}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Volver</span>
                            </Button>
                            <h1 className="text-2xl font-bold">Editor de Plantillas</h1>
                        </div>
                        <p className="text-muted-foreground">Personaliza las plantillas y colores de tus recetas médicas.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" data-tour="layout-editor">

                    {/* Left Column: Live Preview (Sticky) */}
                    <div className="lg:col-span-7 xl:col-span-8 sticky top-6">
                        <div className="bg-gray-100/50 rounded-xl p-6 border shadow-inner flex justify-center items-start min-h-[600px] max-h-[calc(100vh-100px)] overflow-y-auto">
                            <div className="transform origin-top scale-[0.65] lg:scale-[0.7] xl:scale-[0.8] transition-transform duration-300">
                                <VisualRecipePreview
                                    data={{
                                        doctorName: previewData.doctorName,
                                        doctorTitle: "Dr.", // Could fetch gender title too
                                        doctorSpecialty: previewData.specialty,
                                        doctorProfessionalId: previewData.cedula,
                                        clinicName: "Clínica Ejemplo",
                                        clinicAddress: "Dirección de la clínica",
                                        clinicPhone: "555-0000",
                                        clinicEmail: "contacto@clinica.com",
                                        patientName: "Paciente de Prueba",
                                        patientAge: "35 años",
                                        patientWeight: "75 kg",
                                        patientSex: "M",
                                        date: new Date().toLocaleDateString(),
                                        medications: [
                                            { name: "Medicamento Ejemplo 500mg", frequency: "Cada 8 horas", duration: "7 días" },
                                            { name: "Vitamina C", frequency: "Cada 24 horas", duration: "30 días" }
                                        ],
                                        diagnosis: "Diagnóstico de prueba para visualización"
                                    }}
                                    settings={{
                                        templateId: selectedTemplate,
                                        frameColor: frameColor,
                                        watermarkUrl: selectedWatermark,
                                        showLogo: true,
                                        showSignature: true,
                                        logoUrl: userAssets.logo,
                                        signatureUrl: userAssets.signature
                                    }}
                                />
                            </div>
                        </div>
                        <div className="text-center mt-4 text-muted-foreground text-sm">
                            Vista previa en tiempo real
                        </div>
                    </div>

                    {/* Right Column: Controls */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-6">

                        <Card className="border-none shadow-none bg-transparent">
                            <Tabs defaultValue="templates" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-4">
                                    <TabsTrigger value="templates">Plantillas</TabsTrigger>
                                    <TabsTrigger value="colors">Colores</TabsTrigger>
                                    <TabsTrigger value="watermarks">Marcas</TabsTrigger>
                                </TabsList>

                                <TabsContent value="templates" className="space-y-4">
                                    <div className="grid gap-4 grid-cols-2">
                                        {TEMPLATES.map((template) => (
                                            <div key={template.id} className="space-y-2">
                                                <div
                                                    onClick={() => setSelectedTemplate(template.id)}
                                                    className={cn(
                                                        "relative rounded-lg cursor-pointer transition-all duration-200 group overflow-hidden border-2 aspect-[1/1.29]",
                                                        selectedTemplate === template.id
                                                            ? "border-primary shadow-md ring-2 ring-primary/20"
                                                            : "border-transparent hover:border-primary/50"
                                                    )}
                                                >
                                                    {/* Dynamic Preview Rendering */}
                                                    {(() => {
                                                        const PreviewProps = { color: frameColor, className: "w-full h-full object-contain" };
                                                        switch (template.id) {
                                                            case 'modern-minimal': return <div className="p-2 w-full h-full"><TemplateModern {...PreviewProps} /></div>;
                                                            case 'geometric-border': return <div className="p-2 w-full h-full"><TemplateGeometric {...PreviewProps} /></div>;
                                                            case 'classic-elegant': return <div className="p-2 w-full h-full"><TemplateElegant {...PreviewProps} /></div>;
                                                            case 'medical-clean': return <div className="p-2 w-full h-full"><TemplateClinical {...PreviewProps} /></div>;
                                                            case 'abstract-waves': return <div className="p-2 w-full h-full"><TemplateWaves {...PreviewProps} /></div>;
                                                            case 'tech-line': return <div className="p-2 w-full h-full"><TemplateTech {...PreviewProps} /></div>;
                                                            default:
                                                                return (
                                                                    <Image
                                                                        alt={template.name}
                                                                        className="object-cover"
                                                                        src={template.image}
                                                                        fill
                                                                        sizes="(max-width: 768px) 50vw, 33vw"
                                                                        unoptimized
                                                                    />
                                                                );
                                                        }
                                                    })()}

                                                    {selectedTemplate === template.id && (
                                                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                                            <div className="bg-white/80 rounded-full p-1 shadow-sm">
                                                                <CircleCheckBig className="h-6 w-6 text-primary" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs font-medium text-center truncate px-1">{template.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="colors" className="space-y-4">
                                    <div className="space-y-4 bg-card p-4 rounded-lg border">
                                        <Label className="flex items-center gap-2 text-sm font-medium">
                                            <Palette className="h-4 w-4 text-muted-foreground" />
                                            Color Principal
                                        </Label>
                                        <div className="grid grid-cols-5 gap-3">
                                            {COLORS.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    aria-label={`Color ${color}`}
                                                    onClick={() => setFrameColor(color)}
                                                    className={cn(
                                                        "w-full aspect-square rounded-full border-2 transition-all flex items-center justify-center shadow-sm hover:scale-110",
                                                        frameColor === color
                                                            ? "border-primary ring-2 ring-primary/50 scale-110"
                                                            : "border-transparent"
                                                    )}
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {frameColor === color && (
                                                        <Check className="h-4 w-4 text-white mix-blend-difference" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="watermarks" className="space-y-4">
                                    <div className="bg-card p-4 rounded-lg border space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <Label>Galería</Label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="watermark-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleWatermarkUpload}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-xs"
                                                    onClick={() => document.getElementById('watermark-upload')?.click()}
                                                >
                                                    <Upload className="h-3 w-3 mr-1" /> Subir Propia
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid gap-3 grid-cols-2">
                                            {WATERMARKS.map((wm) => (
                                                <div key={wm.id} className="space-y-1">
                                                    <div
                                                        onClick={() => setSelectedWatermark(wm.image)}
                                                        className={cn(
                                                            "relative border-2 rounded-lg cursor-pointer transition-all duration-200 bg-white aspect-video flex items-center justify-center p-4 overflow-hidden",
                                                            selectedWatermark === wm.image
                                                                ? "border-primary bg-primary/5"
                                                                : "border-gray-100 hover:border-primary/30"
                                                        )}
                                                    >
                                                        {(() => {
                                                            // Determine if custom SVG or image
                                                            if (wm.id === 'wm-caduceus') return <WatermarkCaduceus className="w-full h-full text-gray-400" />;
                                                            if (wm.id === 'wm-heartbeat') return <WatermarkHeartbeat className="w-full h-full text-gray-400" />;
                                                            if (wm.id === 'wm-cross') return <WatermarkCross className="w-full h-full text-gray-400" />;

                                                            return (
                                                                <Image
                                                                    alt={wm.name}
                                                                    className="object-contain p-2"
                                                                    src={wm.image}
                                                                    fill
                                                                    sizes="150px"
                                                                    unoptimized
                                                                />
                                                            );
                                                        })()}

                                                        {selectedWatermark === wm.image && (
                                                            <div className="absolute top-1 right-1">
                                                                <div className="bg-primary/10 rounded-full p-0.5">
                                                                    <CircleCheckBig className="h-4 w-4 text-primary" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-center text-muted-foreground truncate">{wm.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Sticky Footer Save Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="lg"
                    className="shadow-lg gap-2"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CircleCheckBig className="h-4 w-4" />}
                    Guardar Cambios
                </Button>
            </div>
        </main>
    );
}
