"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getDoctorPrescriptions } from "@/lib/supabase/services/medications-service";
import { Prescription } from "@/lib/supabase/types/medications";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Badge,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Separator,
} from "@red-salud/ui";
import {
    ChevronLeft,
    Calendar,
    Clock,
    Pill,
    FileText,
    User,
    Download,
    Printer,
    Eye,
    CheckCircle2,
    XCircle,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { constructRecipeData, constructRecipeSettings, generateRecipeHtml, downloadRecipePdf } from "@/lib/recipe-utils";
import { getDoctorRecipeSettings } from "@/lib/supabase/services/recipe-settings";
import { printContent } from "@/lib/print-utils";

export default function PatientHistoryPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [allRecipes, setAllRecipes] = useState<Prescription[]>([]);
    const [patientId, setPatientId] = useState<string>("");
    const [patientInfo, setPatientInfo] = useState<any>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Extract ID from slug
    useEffect(() => {
        if (params.patientId) {
            const slug = params.patientId as string;
            // Slugs are formatted as "identifier-uuid"
            // We need to extract the UUID part which is the last segment after the last hypen
            // But UUIDs have hyphens! So we need to be careful.
            // The identifier part usually doesn't have hyphens if we stripped them, but let's assume standard UUID length (36 chars) at the end.

            const potentialUuid = slug.slice(-36);
            if (potentialUuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                setPatientId(potentialUuid);
            } else {
                // Fallback: split by '-' and try to find the uuid parts? 
                // Or just assume the whole thing might be an ID if no dash?
                // Let's assume the naive split for legacy/safety or just take the last part if we are sure about the format.
                // Given the previous code: `${patient.identifier}-${id}`
                // If identifier has dashes, this is tricky. 
                // Let's rely on the 36-char check.
                setPatientId(potentialUuid);
            }
        }
    }, [params.patientId]);

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        }
        init();
    }, []);

    useEffect(() => {
        if (!userId || !patientId) return;

        async function loadData() {
            setLoading(true);
            try {
                const { success, data } = await getDoctorPrescriptions(userId!);
                if (success && data) {
                    const patientRecipes = data.filter(r =>
                        r.paciente?.id === patientId || r.offline_patient?.id === patientId
                    );

                    setAllRecipes(patientRecipes);

                    if (patientRecipes.length > 0) {
                        // Extract patient info from the most recent recipe
                        const latest = patientRecipes[0];
                        if (latest.paciente) {
                            setPatientInfo({
                                type: 'registered',
                                name: latest.paciente.nombre_completo,
                                identifier: latest.paciente.cedula,
                                avatar: latest.paciente.avatar_url,
                                dob: latest.paciente.fecha_nacimiento,
                                gender: latest.paciente.genero
                            });
                        } else if (latest.offline_patient) {
                            setPatientInfo({
                                type: 'offline',
                                name: latest.offline_patient.nombre_completo,
                                identifier: latest.offline_patient.numero_documento,
                                avatar: null,
                                dob: latest.offline_patient.fecha_nacimiento,
                                email: latest.offline_patient.email,
                                phone: latest.offline_patient.telefono
                            });
                        }
                    }
                }
            } catch (error) {
                console.error(error);
                toast.error("Error al cargar el historial");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [userId, patientId]);

    const handlePrint = async (recipe: Prescription) => {
        try {
            toast.loading("Preparando documento...");
            const { data: settings } = await getDoctorRecipeSettings(userId!);
            const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId!).single();
            const { data: details } = await supabase.from("doctor_details").select("*").eq("profile_id", userId!).maybeSingle();

            // Construct profile object
            let specialtyName = "";
            if (details?.especialidad_id) {
                const { data: spec } = await supabase.from("specialties").select("name").eq("id", details.especialidad_id).maybeSingle();
                specialtyName = spec?.name || "";
            }

            const doctorProfile = {
                nombre: profile.nombre_completo || "Dr.",
                titulo: "Dr.",
                especialidad: profile.sacs_especialidad || profile.especialidad || specialtyName,
                cedulaProfesional: profile.cedula || details?.licencia_medica || "",
                clinica: settings?.clinic_name || "",
                direccion: settings?.clinic_address || "",
                telefono: settings?.clinic_phone || "",
                email: settings?.clinic_email || profile.email || ""
            };

            const recipeData = constructRecipeData(recipe, doctorProfile, settings as any);
            const recipeSettings = constructRecipeSettings(settings as any);

            const html = await generateRecipeHtml(recipeData, recipeSettings);
            toast.dismiss();
            printContent(html);
        } catch (e) {
            toast.error("Error al imprimir");
        }
    };

    const handleDownload = async (recipe: Prescription) => {
        try {
            toast.loading("Generando PDF...");
            const { data: settings } = await getDoctorRecipeSettings(userId!);
            const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId!).single();
            const { data: details } = await supabase.from("doctor_details").select("*").eq("profile_id", userId!).maybeSingle();
            // Construct profile object (simplified for brevity, should match print logic)
            let specialtyName = "";
            if (details?.especialidad_id) {
                const { data: spec } = await supabase.from("specialties").select("name").eq("id", details.especialidad_id).maybeSingle();
                specialtyName = spec?.name || "";
            }

            const doctorProfile = {
                nombre: profile.nombre_completo || "Dr.",
                titulo: "Dr.",
                especialidad: profile.sacs_especialidad || profile.especialidad || specialtyName,
                cedulaProfesional: profile.cedula || details?.licencia_medica || "",
                clinica: settings?.clinic_name || "",
                direccion: settings?.clinic_address || "",
                telefono: settings?.clinic_phone || "",
                email: settings?.clinic_email || profile.email || ""
            };

            const recipeData = constructRecipeData(recipe, doctorProfile, settings as any);
            const recipeSettings = constructRecipeSettings(settings as any);

            const fileName = `Receta-${(recipeData.patientName || 'Paciente').replace(/[^a-z0-9]/gi, '_')}.pdf`;
            await downloadRecipePdf(recipeData, recipeSettings, fileName);
            toast.dismiss();
            toast.success("Descarga iniciada");
        } catch (e) {
            toast.error("Error al descargar");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'activa': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'surtida': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'vencida': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'cancelada': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'activa': return <Clock className="h-3 w-3 mr-1" />;
            case 'surtida': return <CheckCircle2 className="h-3 w-3 mr-1" />;
            case 'vencida': return <AlertCircle className="h-3 w-3 mr-1" />;
            case 'cancelada': return <XCircle className="h-3 w-3 mr-1" />;
            default: return <Clock className="h-3 w-3 mr-1" />;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                <p className="text-muted-foreground animate-pulse">Cargando historial...</p>
            </div>
        );
    }

    if (!patientInfo && !loading) {
        return (
            <div className="container max-w-4xl py-8">
                <Link href="/dashboard/medico/recetas">
                    <Button variant="ghost" className="mb-6 hover:bg-transparent pl-0 text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Volver a recetas
                    </Button>
                </Link>
                <Card className="items-center justify-center p-12 text-center border-dashed">
                    <User className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-semibold mb-2">Paciente no encontrado</h2>
                    <p className="text-muted-foreground">No se pudo cargar la información del paciente solicitado.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-5xl py-8 px-4 sm:px-6 animate-in fade-in duration-500">
            <Link href="/dashboard/medico/recetas">
                <Button variant="ghost" className="mb-6 hover:bg-transparent pl-0 text-muted-foreground hover:text-foreground group transition-colors">
                    <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Volver a recetas
                </Button>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Patient Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-lg bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 overflow-hidden sticky top-6">
                        <div className="h-24 bg-emerald-600/10 w-full absolute top-0 left-0"></div>
                        <CardContent className="pt-12 px-6 pb-6 relative z-10 flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-900 shadow-xl mb-4">
                                <AvatarImage src={patientInfo.avatar} />
                                <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700">
                                    {patientInfo.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>

                            <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize mb-1">
                                {patientInfo.name}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono">
                                    {patientInfo.identifier || 'Sin ID'}
                                </span>
                            </div>

                            <Separator className="my-4" />

                            <div className="w-full space-y-3 text-left">
                                {patientInfo.dob && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Calendar className="h-4 w-4" /> Nacimiento
                                        </span>
                                        <span className="font-medium">
                                            {format(new Date(patientInfo.dob), "d MMM yyyy", { locale: es })}
                                        </span>
                                    </div>
                                )}
                                {patientInfo.phone && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <User className="h-4 w-4" /> Teléfono
                                        </span>
                                        <span className="font-medium">{patientInfo.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <FileText className="h-4 w-4" /> Total Recetas
                                    </span>
                                    <span className="font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-xs">
                                        {allRecipes.length}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Pill className="h-5 w-5 text-emerald-600" />
                            Historial de Prescripciones
                        </h3>
                    </div>

                    <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-8">
                        {allRecipes.map((recipe, index) => (
                            <div key={recipe.id} className="relative">
                                {/* Timeline dot */}
                                <div className="absolute -left-[21px] top-4 h-4 w-4 rounded-full border-2 border-emerald-500 bg-white dark:bg-gray-900"></div>

                                <Card className="border hover:border-emerald-200 dark:hover:border-emerald-900 transition-all hover:shadow-md group">
                                    <CardHeader className="py-4 px-5 bg-gray-50/50 dark:bg-gray-900/50 border-b flex flex-row items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-lg">
                                                    {recipe.fecha_prescripcion ? format(new Date(recipe.fecha_prescripcion), "d 'de' MMMM, yyyy", { locale: es }) : 'Sin fecha'}
                                                </span>
                                                <Badge variant="outline" className={getStatusColor(recipe.estado || 'activa')}>
                                                    {getStatusIcon(recipe.estado || 'activa')}
                                                    {(recipe.estado || 'activa').toUpperCase()}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {recipe.fecha_prescripcion ? format(new Date(recipe.fecha_prescripcion), "h:mm a", { locale: es }) : ''}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handlePrint(recipe)} title="Imprimir">
                                                <Printer className="h-4 w-4 text-gray-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDownload(recipe)} title="Descargar PDF">
                                                <Download className="h-4 w-4 text-gray-500" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Diagnóstico</h4>
                                            <p className="text-gray-900 dark:text-gray-100 font-medium">
                                                {recipe.diagnostico || "Sin diagnóstico registrado"}
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Medicamentos</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {recipe.medications?.map((med, idx) => (
                                                    <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border text-sm flex items-start gap-2">
                                                        <div className="mt-1 bg-emerald-100 dark:bg-emerald-900/50 p-1 rounded">
                                                            <Pill className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                {med.medication?.nombre_comercial || med.nombre_medicamento}
                                                            </p>
                                                            <p className="text-gray-500 text-xs">
                                                                {med.dosis} • {med.frecuencia}
                                                            </p>
                                                            {med.duracion_dias && (
                                                                <p className="text-gray-400 text-xs mt-0.5">
                                                                    Durante {med.duracion_dias} días
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
