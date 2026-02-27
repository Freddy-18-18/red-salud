"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Switch } from "@red-salud/design-system";
import { FileText, Layout, ChevronRight, Pen, ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import {
    getDoctorSettings,
    getAvailableFrames,
    upsertDoctorSettings,
    uploadSignature,
    uploadLogo,
} from "@/lib/supabase/services/settings";
import type { DoctorSettings, PrescriptionFrame } from "@/lib/supabase/types/settings";
import { SignatureCanvas, LogoUpload } from "@/components/dashboard/configuracion";

export function RecipeSettingsSection() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [signatureSaving, setSignatureSaving] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [logoFileName, setLogoFileName] = useState<string>();

    const [settings, setSettings] = useState<DoctorSettings | null>(null);
    const [frames, setFrames] = useState<PrescriptionFrame[]>([]);
    const [firmaEnabled, setFirmaEnabled] = useState(false);
    const [logoEnabled, setLogoEnabled] = useState(false);

    // Load data on mount
    useEffect(() => {
        async function loadData() {
            if (!user?.id) return;

            setLoading(true);
            try {
                const [settingsRes, framesRes] = await Promise.all([
                    getDoctorSettings(user.id),
                    getAvailableFrames(user.id),
                ]);

                if (framesRes.success) setFrames(framesRes.data);

                if (settingsRes.success && settingsRes.data) {
                    setSettings(settingsRes.data);
                    setFirmaEnabled(settingsRes.data.firma_digital_enabled);
                    setLogoEnabled(settingsRes.data.logo_enabled);
                }
            } catch (error) {
                console.error("Error loading settings:", error);
                toast.error("Error al cargar la configuración");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [user?.id]);

    const handleSaveSignature = async (base64: string) => {
        if (!user?.id) return;

        setSignatureSaving(true);
        try {
            const result = await uploadSignature(user.id, base64);
            if (result.success && result.url) {
                const updateRes = await upsertDoctorSettings(user.id, { firma_digital_url: result.url });
                if (updateRes.success) setSettings(updateRes.data);
                toast.success("Firma guardada correctamente");
            }
        } catch (error) {
            console.error("Error saving signature:", error);
            toast.error("Error al guardar la firma");
        } finally {
            setSignatureSaving(false);
        }
    };

    const handleUploadLogo = async (file: File) => {
        if (!user?.id) return;

        setLogoUploading(true);
        setLogoFileName(file.name);
        try {
            const result = await uploadLogo(user.id, file);
            if (result.success && result.url) {
                const updateRes = await upsertDoctorSettings(user.id, { logo_url: result.url });
                if (updateRes.success) setSettings(updateRes.data);
                toast.success("Logo subido correctamente");
            }
        } catch (error) {
            console.error("Error uploading logo:", error);
            toast.error("Error al subir el logo");
        } finally {
            setLogoUploading(false);
        }
    };

    const handleToggleFirma = async (enabled: boolean) => {
        if (!user?.id) return;
        setFirmaEnabled(enabled);
        try {
            const result = await upsertDoctorSettings(user.id, { firma_digital_enabled: enabled });
            if (result.success) setSettings(result.data);
        } catch (error) {
            console.error("Error updating firma setting:", error);
        }
    };

    const handleToggleLogo = async (enabled: boolean) => {
        if (!user?.id) return;
        setLogoEnabled(enabled);
        try {
            const result = await upsertDoctorSettings(user.id, { logo_enabled: enabled });
            if (result.success) setSettings(result.data);
        } catch (error) {
            console.error("Error updating logo setting:", error);
        }
    };

    // Get selected frame for preview
    const selectedFrame = frames.find((f) => f.id === settings?.active_frame_id);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Configuración de Recetas
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Personaliza la apariencia y elementos de tus recetas médicas
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Template Preview Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Layout className="h-4 w-4" />
                            Plantilla Activa
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            {selectedFrame ? (
                                <div className="w-24 h-32 border rounded-lg overflow-hidden bg-white shadow-sm">
                                    <Image
                                        src={selectedFrame.image_url}
                                        alt={selectedFrame.name}
                                        width={96}
                                        height={128}
                                        className="w-full h-full object-cover"
                                        style={{
                                            filter: selectedFrame.has_customizable_color && settings?.frame_color
                                                ? `hue-rotate(${getHueRotation(settings.frame_color)}deg)`
                                                : undefined,
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="w-24 h-32 border rounded-lg bg-muted flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground">Sin plantilla</span>
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="font-medium">{selectedFrame?.name || "Sin plantilla"}</p>
                                <div className="flex gap-2 mt-2">
                                    {selectedFrame && (
                                        <Badge variant="secondary" className="text-xs">Con Marco</Badge>
                                    )}
                                    {settings?.active_watermark && (
                                        <Badge variant="outline" className="text-xs">Marca de Agua</Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Link href="/dashboard/medico/configuracion/plantillas">
                            <Button className="w-full gap-2">
                                <Layout className="h-4 w-4" />
                                Editor de Plantillas
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Quick Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Configuración Rápida</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                            <div className="flex items-center gap-3">
                                <Pen className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Firma Digital</p>
                                    <p className="text-xs text-muted-foreground">
                                        {settings?.firma_digital_url ? "Configurada" : "No configurada"}
                                    </p>
                                </div>
                            </div>
                            <Switch checked={firmaEnabled} onCheckedChange={handleToggleFirma} />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                            <div className="flex items-center gap-3">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Logo del Consultorio</p>
                                    <p className="text-xs text-muted-foreground">
                                        {settings?.logo_url ? "Configurado" : "No configurado"}
                                    </p>
                                </div>
                            </div>
                            <Switch checked={logoEnabled} onCheckedChange={handleToggleLogo} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Signature Canvas */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Firma Digital</CardTitle>
                </CardHeader>
                <CardContent>
                    <SignatureCanvas
                        enabled={firmaEnabled}
                        onEnabledChange={handleToggleFirma}
                        signatureUrl={settings?.firma_digital_url}
                        onSave={handleSaveSignature}
                        saving={signatureSaving}
                    />
                </CardContent>
            </Card>

            {/* Logo Upload */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Logo del Consultorio</CardTitle>
                </CardHeader>
                <CardContent>
                    <LogoUpload
                        enabled={logoEnabled}
                        onEnabledChange={handleToggleLogo}
                        logoUrl={settings?.logo_url}
                        fileName={logoFileName}
                        onUpload={handleUploadLogo}
                        uploading={logoUploading}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

// Helper function for hue rotation
function getHueRotation(hexColor: string) {
    const defaultHue = 200;
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    if (max !== min) {
        const d = max - min;
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
            case g: h = ((b - r) / d + 2) * 60; break;
            case b: h = ((r - g) / d + 4) * 60; break;
        }
    }
    return h - defaultHue;
}
