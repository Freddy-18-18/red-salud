"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    CardDescription,
    Button,
    Input,
    Label,
    Switch,
    Separator,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Slider,
} from "@red-salud/design-system";
import {
    Loader2,
    Save,
    FilePenLine,
    Upload,
    LayoutTemplate,

    CircleCheckBig,
    Crop,
    Square,
    RectangleHorizontal,
    RectangleVertical,
    ArrowLeft,
    Smartphone,
    Building2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import {
    getDoctorRecipeSettings,
    updateDoctorRecipeSettings,
    uploadRecipeAsset,
    DoctorRecipeSettings,
} from "@/lib/supabase/services/recipe-settings";
import { SignatureCanvas, SignatureCanvasRef } from "@/components/consultorio/recetas/signature-canvas";
import { VisualRecipePreview } from "@/components/dashboard/recetas/visual-recipe-preview";
import QRCode from "qrcode";

interface Office {
    id: string;
    nombre: string;
    direccion?: string;
    telefono?: string;
}

export default function RecipeSettingsPage() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const sigCanvasRef = useRef<SignatureCanvasRef>(null);

    // User Profile Data
    const [userId, setUserId] = useState<string | null>(null);
    const [profileData, setProfileData] = useState({
        nombre_completo: "",
        titulo: "",
        cedula: "",
        matricula: "",
        especialidad: "",
        email: "",
    });
    const [genderTitle, setGenderTitle] = useState("Dr.");

    // Offices Data
    const [offices, setOffices] = useState<Office[]>([]);
    const [selectedOfficeId, setSelectedOfficeId] = useState<string>("global");

    // Recipe Settings Data
    const [settings, setSettings] = useState<DoctorRecipeSettings | null>(null);

    // Local state for forms
    const [formData, setFormData] = useState({
        clinic_name: "",
        clinic_address: "",
        clinic_phone: "",
        clinic_email: "",
        use_digital_signature: false,
        use_logo: false,
        template_id: "plantilla-3",
    });

    // Logo Adjustment Modal State
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
    const [tempLogoUrl, setTempLogoUrl] = useState<string | null>(null);
    const [tempLogoFile, setTempLogoFile] = useState<File | null>(null);
    const [logoCropShape, setLogoCropShape] = useState<'square' | 'rect-h' | 'rect-c' | 'rect-v'>('square');
    const [logoZoom, setLogoZoom] = useState([1]);

    // Mobile Sign Modal State
    const [isMobileSignModalOpen, setIsMobileSignModalOpen] = useState(false);
    const [mobileSignQrUrl, setMobileSignQrUrl] = useState<string | null>(null);

    // Expandable Preview State
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    const fetchSettingsForContext = useCallback(async (uid: string, officeId: string | null, fallbackEmail?: string, officesData?: Office[], profileEmail?: string) => {
        setIsLoading(true);
        try {
            const { success, data } = await getDoctorRecipeSettings(uid, officeId);

            if (success && data) {
                setSettings(data as DoctorRecipeSettings);

                // Determine form default values
                let cAddress = data.clinic_address || "";
                let cPhone = data.clinic_phone || "";
                let cName = data.clinic_name || "";

                // If specific office settings are empty, try to pre-fill from office details
                if (officeId && officesData) {
                    const office = officesData.find(o => o.id === officeId);
                    if (office) {
                        // Only overwrite if the setting is empty
                        if (!cName) cName = office.nombre;
                        if (!cAddress) cAddress = office.direccion || "";
                        // Force phone from office settings as per requirements
                        cPhone = office.telefono || "";
                    }
                }

                setFormData({
                    clinic_name: cName,
                    clinic_address: cAddress,
                    clinic_phone: cPhone,
                    clinic_email: data.clinic_email || fallbackEmail || profileEmail || "",
                    use_digital_signature: data.use_digital_signature || false,
                    use_logo: data.use_logo || false,
                    template_id: data.template_id || "plantilla-3",
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login/medico");
                return;
            }
            setUserId(user.id);

            // Fetch Profile
            const { data: profile } = await supabase
                .from("profiles")
                .select("nombre_completo, especialidad, sacs_especialidad, cedula, email, sacs_matricula")
                .eq("id", user.id)
                .single();

            let userEmail = "";
            if (profile) {
                userEmail = (profile as { email?: string }).email || "";
                setProfileData({
                    nombre_completo: profile.nombre_completo || "",
                    cedula: profile.cedula || "",
                    matricula: (profile as { sacs_matricula?: string }).sacs_matricula || "",
                    especialidad: (profile as { sacs_especialidad?: string; especialidad?: string }).sacs_especialidad || profile.especialidad || "",
                    titulo: (profile as { titulo?: string }).titulo || "Médico",
                    email: userEmail,
                });
            }

            // Fetch Offices
            const { data: officesData } = await supabase
                .from("doctor_offices")
                .select("id, nombre, direccion, telefono")
                .eq("doctor_id", user.id)
                .eq("activo", true);

            if (officesData) {
                setOffices(officesData as unknown as Office[]);
            }

            // Initial fetch for global settings or default
            await fetchSettingsForContext(user.id, null, userEmail, officesData || undefined, userEmail);

        } catch (error) {
            console.error("Error loading settings:", error);
            toast.error("Error cargando la configuración");
        } finally {
            setIsLoading(false);
        }
    }, [router, fetchSettingsForContext]);

    // Load initial data
    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleOfficeChange = useCallback(async (value: string) => {
        setSelectedOfficeId(value);
        if (userId) {
            const email = profileData.email;
            const oid = value === "global" ? null : value;
            await fetchSettingsForContext(userId, oid, email, offices, email);
        }
    }, [userId, profileData.email, offices]);

    const handleSettingsChange = useCallback((field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleSaveSignature = useCallback(async () => {
        if (!userId || !sigCanvasRef.current) return;

        if (sigCanvasRef.current.isEmpty()) {
            toast.error("Por favor dibuje una firma antes de guardar");
            return;
        }

        try {
            const dataUrl = sigCanvasRef.current.toDataURL();
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], "signature.png", { type: "image/png" });

            const { success, url, error } = await uploadRecipeAsset(userId, file, "signature");

            if (success && url) {
                // Determine context
                const oid = selectedOfficeId === "global" ? null : selectedOfficeId;
                await updateDoctorRecipeSettings(userId, { digital_signature_url: url }, oid);

                setSettings((prev) => prev ? ({ ...prev, digital_signature_url: url }) : null);
                toast.success("Firma guardada exitosamente");
                sigCanvasRef.current.clear();
            } else {
                throw error;
            }
        } catch (error) {
            console.error("Error saving signature:", error);
            toast.error("Error al guardar la firma");
        }
    }, [userId, selectedOfficeId]);

    const handleLogoFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setTempLogoUrl(objectUrl);
            setTempLogoFile(file);
            setIsLogoModalOpen(true);
        }
        e.target.value = "";
    }, []);

    const handleSaveLogoFromModal = useCallback(async () => {
        if (!userId || !tempLogoFile) return;

        try {
            const { success, url, error } = await uploadRecipeAsset(userId, tempLogoFile, "logo");

            if (success && url) {
                const oid = selectedOfficeId === "global" ? null : selectedOfficeId;
                await updateDoctorRecipeSettings(userId, { logo_url: url }, oid);
                setSettings((prev) => prev ? ({ ...prev, logo_url: url }) : null);
                toast.success("Logo guardado exitosamente");
                setIsLogoModalOpen(false);
                setTempLogoUrl(null);
                setTempLogoFile(null);
            } else {
                throw error;
            }
        } catch (error) {
            console.error("Error uploading logo:", error);
            toast.error("Error al guardar el logo");
        }
    }, [userId, tempLogoFile, selectedOfficeId]);

    const handleSaveAll = useCallback(async () => {
        if (!userId) return;
        setIsSaving(true);
        try {
            // Note: Profile data is read-only here, so we don't update profiles table.

            const oid = selectedOfficeId === "global" ? null : selectedOfficeId;

            // Update Settings
            const { success, error } = await updateDoctorRecipeSettings(userId, {
                clinic_name: formData.clinic_name,
                clinic_address: formData.clinic_address,
                clinic_phone: formData.clinic_phone,
                clinic_email: formData.clinic_email,
                use_digital_signature: formData.use_digital_signature,
                use_logo: formData.use_logo,
                template_id: formData.template_id,
            }, oid);

            if (!success) throw error;

            toast.success("Configuración guardada correctamente");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Error al guardar los cambios");
        } finally {
            setIsSaving(false);
        }
    }, [userId, selectedOfficeId, formData]);

    // Generate QR Code when mobile sign modal opens
    useEffect(() => {
        if (isMobileSignModalOpen && userId && typeof window !== 'undefined') {
            const url = `${window.location.origin}/consultorio/recetas/firmar-movil?uid=${userId}`;
            QRCode.toDataURL(url, { width: 300, margin: 2 }, (err, url) => {
                if (!err) {
                    setMobileSignQrUrl(url);
                }
            });
        }
    }, [isMobileSignModalOpen, userId]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:px-6 sm:py-0 space-y-8 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="mr-3 gap-2"
                            onClick={() => router.push('/consultorio/recetas')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Volver</span>
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Recetas</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Gestiona la información y apariencia de tus recetas médicas.
                    </p>
                </div>

                {/* Office Context Selector */}
                <div className="w-[320px]">
                    <Select value={selectedOfficeId} onValueChange={handleOfficeChange}>
                        <SelectTrigger className="h-14 w-full px-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                                <div className="flex flex-col items-start min-w-0 overflow-hidden">
                                    <SelectValue placeholder="Seleccionar contexto" />
                                </div>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="global">
                                <span className="font-medium">Configuración General</span>
                                <p className="text-xs text-muted-foreground">Aplica si no hay específica</p>
                            </SelectItem>
                            {offices.map(office => (
                                <SelectItem key={office.id} value={office.id}>
                                    <span className="font-medium">{office.nombre}</span>
                                    <p className="text-xs text-muted-foreground truncate">{office.direccion}</p>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">

                    {/* Personal Info (Read Only) */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm opacity-90">
                        <div className="flex flex-col space-y-1.5 p-6 bg-muted/20">
                            <div className="text-xl font-semibold leading-none tracking-tight">
                                Información Personal
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Estos datos provienen de tu perfil verificado y no pueden editarse aquí.
                            </div>
                        </div>
                        <div className="p-6 grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Nombre Completo</Label>
                                    <Input value={profileData.nombre_completo} disabled className="bg-muted" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Trato</Label>
                                    <Select value={genderTitle} onValueChange={setGenderTitle}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Dr.">Dr.</SelectItem>
                                            <SelectItem value="Dra.">Dra.</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Título</Label>
                                    <Input value={profileData.titulo} readOnly className="bg-muted" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Cédula Profesional</Label>
                                    <Input value={profileData.cedula} readOnly className="bg-muted" />
                                </div>
                                <div className="grid gap-2 md:col-span-2">
                                    <Label>N° de Matrícula (SACS)</Label>
                                    <Input value={profileData.matricula} readOnly className="bg-muted" placeholder="No registrado" />
                                </div>
                                <div className="grid gap-2 md:col-span-2">
                                    <Label>Especialidad Médica</Label>
                                    <Input value={profileData.especialidad} readOnly className="bg-muted" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Clinic Info */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <div className="text-xl font-semibold leading-none tracking-tight flex items-center gap-2">
                                Información del Consultorio
                                {selectedOfficeId !== "global" && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Específico</span>}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Datos de contacto que aparecerán en el encabezado o pie de página.
                            </div>
                        </div>
                        <div className="p-6 pt-0 grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="clinic_name">Nombre de la Clínica/Hospital</Label>
                                    <Input
                                        id="clinic_name"
                                        value={formData.clinic_name}
                                        onChange={(e) => handleSettingsChange("clinic_name", e.target.value)}
                                        placeholder="Clínica del Sol"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="address">Domicilio</Label>
                                    <Input
                                        id="address"
                                        value={formData.clinic_address}
                                        onChange={(e) => handleSettingsChange("clinic_address", e.target.value)}
                                        placeholder="Av. Siempre Viva 742"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.clinic_phone}
                                        onChange={(e) => handleSettingsChange("clinic_phone", e.target.value)}
                                        readOnly={selectedOfficeId !== "global"}
                                        className={selectedOfficeId !== "global" ? "bg-muted" : ""}
                                    />
                                    {selectedOfficeId !== "global" && (
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            Se utiliza el teléfono configurado en el consultorio.
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.clinic_email}
                                        onChange={(e) => handleSettingsChange("clinic_email", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recipe Customization (Signature & Logo) */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <div className="text-xl font-semibold leading-none tracking-tight">
                                Personalización Visual
                            </div>
                        </div>
                        <div className="p-6 pt-0 grid gap-8">

                            {/* Signature Section */}
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold">Firma Digital</Label>
                                    <div className="flex items-center space-x-2">
                                        <Label htmlFor="use-digital-signature" className="text-sm cursor-pointer">Activar</Label>
                                        <Switch
                                            id="use-digital-signature"
                                            checked={formData.use_digital_signature}
                                            onCheckedChange={(c) => handleSettingsChange("use_digital_signature", c)}
                                        />
                                    </div>
                                </div>

                                <div className="border rounded-md bg-white dark:bg-slate-100 overflow-hidden relative" style={{ height: '240px' }}>
                                    <SignatureCanvas
                                        ref={sigCanvasRef}
                                        className="w-full h-full"
                                    />
                                </div>

                                <div className="flex flex-wrap justify-between items-center gap-4">
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => sigCanvasRef.current?.clear()}>
                                            Limpiar
                                        </Button>
                                        <Button size="sm" onClick={handleSaveSignature} className="gap-2">
                                            <Save className="h-4 w-4" /> Guardar
                                        </Button>
                                    </div>

                                    <Button variant="secondary" size="sm" className="gap-2" onClick={() => setIsMobileSignModalOpen(true)}>
                                        <Smartphone className="h-4 w-4" />
                                        Firmar desde Móvil
                                    </Button>
                                </div>

                                {settings?.digital_signature_url && (
                                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                                        <CircleCheckBig className="h-3 w-3 text-green-500" />
                                        Firma guardada disponible
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Logo Section */}
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold">Logotipo</Label>
                                    <div className="flex items-center space-x-2">
                                        <Label htmlFor="use-logo" className="text-sm cursor-pointer">Activar</Label>
                                        <Switch
                                            id="use-logo"
                                            checked={formData.use_logo}
                                            onCheckedChange={(c) => handleSettingsChange("use_logo", c)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Input
                                                id="logo-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleLogoFileSelect}
                                            />
                                            <Button
                                                variant="outline"
                                                onClick={() => document.getElementById('logo-upload')?.click()}
                                                className="w-full sm:w-auto"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Subir Logo
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Formatos: PNG, JPG. Máximo 2MB. Se recomienda fondo transparente.
                                        </p>
                                    </div>

                                    <div className="h-24 w-24 border rounded-md border-dashed bg-muted/30 flex items-center justify-center overflow-hidden relative">
                                        {settings?.logo_url ? (
                                            <Image
                                                src={settings.logo_url}
                                                alt="Logo"
                                                width={96}
                                                height={96}
                                                className="object-contain p-1"
                                            />
                                        ) : (
                                            <span className="text-xs text-muted-foreground text-center px-1">Sin Logo</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Preview */}
                <div className="space-y-6">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm sticky top-6">
                        <div className="p-4 border-b">
                            <div className="font-semibold flex items-center gap-2">
                                <LayoutTemplate className="h-4 w-4" /> Vista Previa
                            </div>
                        </div>
                        <div className="p-4 space-y-6">
                            <div
                                className="mx-auto rounded-lg overflow-hidden bg-gray-100 dark:bg-black/80 shadow-sm border relative w-full flex justify-center pt-8 pb-4 cursor-pointer group hover:ring-2 hover:ring-primary/50 transition-all"
                                onClick={() => setIsPreviewModalOpen(true)}
                                title="Clic para ampliar vista previa"
                            >
                                <div className="transform scale-[0.4] origin-top h-[450px] pointer-events-none">
                                    <VisualRecipePreview
                                        data={{
                                            doctorName: profileData.nombre_completo || "Nombre del Médico",
                                            doctorTitle: genderTitle,
                                            doctorSpecialty: profileData.especialidad || "Especialidad",
                                            doctorProfessionalId: profileData.cedula || "0000000",
                                            clinicName: formData.clinic_name || "Nombre Clínica/Hospital",
                                            clinicAddress: formData.clinic_address || "Dirección del Consultorio",
                                            clinicPhone: formData.clinic_phone || "Teléfono",
                                            clinicEmail: formData.clinic_email || "email@ejemplo.com",
                                            patientName: "Paciente Ejemplo",
                                            patientAge: "30 años",
                                            patientWeight: "70 kg",
                                            patientSex: "M",
                                            date: new Date().toLocaleDateString(),
                                            medications: [
                                                { name: "Medicamento A", frequency: "Cada 8 horas", duration: "3 días", presentation: "500mg" },
                                            ],
                                            diagnosis: "Diagnóstico de prueba"
                                        }}
                                        settings={{
                                            templateId: formData.template_id,
                                            frameColor: settings?.frame_color || "#0da9f7",
                                            watermarkUrl: settings?.selected_watermark_url,
                                            logoUrl: settings?.logo_url,
                                            signatureUrl: settings?.digital_signature_url,
                                            showLogo: formData.use_logo,
                                            showSignature: formData.use_digital_signature
                                        }}
                                    />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white/90 dark:bg-black/80 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm flex items-center gap-2 text-foreground">
                                        <LayoutTemplate className="h-3.5 w-3.5" /> Ampliar Vista
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Estilo de Plantilla</Label>
                                <Select
                                    value={formData.template_id}
                                    onValueChange={(v) => handleSettingsChange("template_id", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="plantilla-3">Moderna (Estándar)</SelectItem>
                                        <SelectItem value="plantilla-1">Clásica (Minimalista)</SelectItem>
                                        <SelectItem value="plantilla-2">Corporativa (Con Marco)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-2">
                                <Button
                                    variant="outline"
                                    className="w-full text-xs"
                                    onClick={() => router.push('/consultorio/recetas/plantillas')}
                                >
                                    <FilePenLine className="h-3.5 w-3.5 mr-2" />
                                    Editar Plantillas Avanzado
                                </Button>
                                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                                    Personaliza colores, marcas de agua y más en el editor avanzado.
                                </p>
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleSaveAll}
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Guardar Configuración
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* NEW ADJUST LOGO DIALOG IMPLEMENTATION */}
            <Dialog open={isLogoModalOpen} onOpenChange={setIsLogoModalOpen}>
                <DialogContent className="bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg">
                    <DialogHeader className="flex flex-col gap-2 text-center sm:text-left">
                        <DialogTitle className="text-lg leading-none font-semibold flex items-center gap-2">
                            <Crop className="h-5 w-5" /> Ajustar Logo
                        </DialogTitle>
                        <CardDescription className="text-muted-foreground dark:text-muted-foreground/90 text-sm">
                            Ajusta tu logo para que se vea perfecto en todas las recetas. El logo se redimensionará automáticamente.
                        </CardDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-sm leading-none font-medium mb-1.5">Formato del Logo</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setLogoCropShape('square')}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${logoCropShape === 'square' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Square className="h-4 w-4" />
                                        <span className="text-sm font-medium">Cuadrado</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Perfecto para logos simples</p>
                                    <p className="text-xs text-muted-foreground mt-1">Máx: 200×200px</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLogoCropShape('rect-h')}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${logoCropShape === 'rect-h' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <RectangleHorizontal className="h-4 w-4" />
                                        <span className="text-sm font-medium">Horizontal</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Ideal para logos con texto</p>
                                    <p className="text-xs text-muted-foreground mt-1">Máx: 280×158px</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLogoCropShape('rect-c')}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${logoCropShape === 'rect-c' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <RectangleHorizontal className="h-4 w-4" />
                                        <span className="text-sm font-medium">H. Compacto</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Balance entre ancho y alto</p>
                                    <p className="text-xs text-muted-foreground mt-1">Máx: 240×180px</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLogoCropShape('rect-v')}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${logoCropShape === 'rect-v' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <RectangleVertical className="h-4 w-4" />
                                        <span className="text-sm font-medium">Vertical</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Para logos altos/texto vertical</p>
                                    <p className="text-xs text-muted-foreground mt-1">Máx: 158×280px</p>
                                </button>
                            </div>
                        </div>

                        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            {tempLogoUrl && (
                                <Image
                                    className="max-h-full max-w-full object-contain"
                                    alt="Logo preview"
                                    src={tempLogoUrl}
                                    width={200}
                                    height={200}
                                    style={{ transform: `scale(${logoZoom[0]})` }}
                                />
                            )}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div
                                    className={`border-2 border-primary shadow-[0_0_0_100vw_rgba(0,0,0,0.5)] transition-all duration-300 ${logoCropShape === 'square' ? 'w-40 h-40' :
                                        logoCropShape === 'rect-h' ? 'w-56 h-32' :
                                            logoCropShape === 'rect-c' ? 'w-48 h-36' :
                                                'w-32 h-56'
                                        }`}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm leading-none font-medium mb-1.5">Zoom</Label>
                            <Slider
                                value={logoZoom}
                                onValueChange={setLogoZoom}
                                min={1}
                                max={3}
                                step={0.1}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button variant="outline" onClick={() => setIsLogoModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveLogoFromModal}>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Logo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Mobile Sign Dialog */}
            <Dialog open={isMobileSignModalOpen} onOpenChange={setIsMobileSignModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Firmar desde Móvil</DialogTitle>
                        <CardDescription>
                            Escanea este código QR con tu celular para dibujar tu firma en la pantalla.
                        </CardDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 space-y-4">
                        {mobileSignQrUrl ? (
                            <div className="border rounded-lg p-2 bg-white shadow-sm">
                                <Image
                                    src={mobileSignQrUrl}
                                    alt="QR Code"
                                    width={200}
                                    height={200}
                                />
                            </div>
                        ) : (
                            <div className="h-[200px] w-[200px] flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        <p className="text-sm text-center text-muted-foreground">
                            Asegúrate de haber iniciado sesión en tu dispositivo móvil.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
            {/* EXPANDED PREVIEW MODAL */}
            <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
                <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0 bg-gray-100/95 dark:bg-black/95 backdrop-blur-sm border-none">
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
                                data={{
                                    doctorName: profileData.nombre_completo || "Nombre del Médico",
                                    doctorTitle: genderTitle,
                                    doctorSpecialty: profileData.especialidad || "Especialidad",
                                    doctorProfessionalId: profileData.cedula || "0000000",
                                    clinicName: formData.clinic_name || "Nombre Clínica",
                                    clinicAddress: formData.clinic_address || "Dirección",
                                    clinicPhone: formData.clinic_phone || "Teléfono",
                                    clinicEmail: formData.clinic_email || "email@ejemplo.com",
                                    patientName: "Paciente Ejemplo",
                                    patientAge: "30 años",
                                    patientWeight: "70 kg",
                                    patientSex: "M",
                                    date: new Date().toLocaleDateString(),
                                    medications: [
                                        { name: "Medicamento A", frequency: "Cada 8 horas", duration: "3 días", presentation: "500mg" },
                                        { name: "Medicamento B", frequency: "Cada 12 horas", duration: "5 días", presentation: "Tab" },
                                    ],
                                    diagnosis: "Diagnóstico de prueba"
                                }}
                                settings={{
                                    templateId: formData.template_id,
                                    frameColor: settings?.frame_color || "#0da9f7",
                                    watermarkUrl: settings?.selected_watermark_url,
                                    logoUrl: settings?.logo_url,
                                    signatureUrl: settings?.digital_signature_url,
                                    showLogo: formData.use_logo,
                                    showSignature: formData.use_digital_signature
                                }}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
