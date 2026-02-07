"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Input,
    Label,
} from "@red-salud/ui";
import { Layout, ArrowLeft, Save, Upload } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import {
    getDoctorSettings,
    getAvailableFrames,
    getAvailableWatermarks,
    upsertDoctorSettings,
    uploadWatermark,
} from "@/lib/supabase/services/settings";
import type {
    DoctorSettings,
    PrescriptionFrame,
    PrescriptionWatermark,
} from "@/lib/supabase/types/settings";
import {
    FrameSelector,
    WatermarkSelector,
    ColorPicker,
} from "@/components/dashboard/configuracion";

export default function PlantillasPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [watermarkName, setWatermarkName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [settings, setSettings] = useState<DoctorSettings | null>(null);
    const [frames, setFrames] = useState<PrescriptionFrame[]>([]);
    const [watermarks, setWatermarks] = useState<PrescriptionWatermark[]>([]);

    // Local state for selections
    const [selectedFrameId, setSelectedFrameId] = useState<string>();
    const [selectedWatermarkId, setSelectedWatermarkId] = useState<string>();
    const [frameColor, setFrameColor] = useState("#0da9f7");

    // Load data on mount
    useEffect(() => {
        async function loadData() {
            if (!user?.id) return;

            setLoading(true);
            try {
                const [settingsRes, framesRes, watermarksRes] = await Promise.all([
                    getDoctorSettings(user.id),
                    getAvailableFrames(user.id),
                    getAvailableWatermarks(user.id),
                ]);

                if (framesRes.success) setFrames(framesRes.data);
                if (watermarksRes.success) setWatermarks(watermarksRes.data);

                if (settingsRes.success && settingsRes.data) {
                    setSettings(settingsRes.data);
                    setSelectedFrameId(settingsRes.data.active_frame_id || undefined);
                    setSelectedWatermarkId(settingsRes.data.active_watermark_id || undefined);
                    setFrameColor(settingsRes.data.frame_color || "#0da9f7");
                }
            } catch (error) {
                console.error("Error loading data:", error);
                toast.error("Error al cargar las plantillas");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [user?.id]);

    const handleSave = async () => {
        if (!user?.id) return;

        setSaving(true);
        try {
            const result = await upsertDoctorSettings(user.id, {
                active_frame_id: selectedFrameId,
                active_watermark_id: selectedWatermarkId,
                frame_color: frameColor,
            });

            if (result.success) {
                setSettings(result.data);
                toast.success("Plantilla guardada correctamente");
            } else {
                throw new Error("Error saving template settings");
            }
        } catch (error) {
            console.error("Error saving template:", error);
            toast.error("Error al guardar la plantilla");
        } finally {
            setSaving(false);
        }
    };

    const handleUploadWatermark = async () => {
        if (!user?.id || !fileInputRef.current?.files?.[0]) return;

        const file = fileInputRef.current.files[0];
        setUploading(true);

        try {
            const result = await uploadWatermark(user.id, file, watermarkName || file.name);
            if (result.success && result.data) {
                setWatermarks((prev) => [...prev, result.data!]);
                setSelectedWatermarkId(result.data.id);
                setUploadDialogOpen(false);
                setWatermarkName("");
                toast.success("Marca de agua subida correctamente");
            }
        } catch (error) {
            console.error("Error uploading watermark:", error);
            toast.error("Error al subir la marca de agua");
        } finally {
            setUploading(false);
        }
    };

    // Find selected frame for color preview
    const selectedFrame = frames.find((f) => f.id === selectedFrameId);

    // Calculate hue rotation for preview
    const getHueRotation = (hexColor: string) => {
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
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Layout className="h-6 w-6" />
                        Editor de Plantillas de Receta
                    </h1>
                    <p className="text-muted-foreground">
                        Personaliza el marco, marca de agua y colores de tus recetas
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (2 columns) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Frames */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Plantillas de Receta</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FrameSelector
                                frames={frames}
                                selectedId={selectedFrameId}
                                frameColor={frameColor}
                                onSelect={setSelectedFrameId}
                            />
                        </CardContent>
                    </Card>

                    {/* Watermarks */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Marcas de Agua</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <WatermarkSelector
                                watermarks={watermarks}
                                selectedId={selectedWatermarkId}
                                onSelect={setSelectedWatermarkId}
                                onUploadClick={() => setUploadDialogOpen(true)}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar (1 column) - Config & Preview */}
                <div className="lg:sticky lg:top-6 lg:h-fit space-y-6">
                    {/* Color Picker */}
                    {selectedFrame?.has_customizable_color && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Marco</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ColorPicker
                                    selectedColor={frameColor}
                                    onSelect={setFrameColor}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Vista Previa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center">
                                <div className="w-48 h-64 border rounded-lg overflow-hidden bg-white shadow-inner relative">
                                    {selectedFrame && (
                                        <Image
                                            src={selectedFrame.image_url}
                                            alt={selectedFrame.name}
                                            className="object-cover"
                                            fill
                                            unoptimized
                                            style={{
                                                filter: selectedFrame.has_customizable_color
                                                    ? `hue-rotate(${getHueRotation(frameColor)}deg)`
                                                    : undefined,
                                            }}
                                        />
                                    )}
                                    {selectedWatermarkId && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <Image
                                                src={watermarks.find((w) => w.id === selectedWatermarkId)?.image_url || ''}
                                                alt="Watermark"
                                                className="object-contain opacity-10"
                                                fill
                                                unoptimized
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Fixed Save Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button onClick={handleSave} disabled={saving} size="lg" className="shadow-lg gap-2">
                    <Save className="h-5 w-5" />
                    {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </div>

            {/* Upload Watermark Dialog */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Subir Marca de Agua</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="watermark-name">Nombre</Label>
                            <Input
                                id="watermark-name"
                                value={watermarkName}
                                onChange={(e) => setWatermarkName(e.target.value)}
                                placeholder="Mi marca de agua"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="watermark-file">Archivo</Label>
                            <Input
                                id="watermark-file"
                                ref={fileInputRef}
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                            />
                            <p className="text-xs text-muted-foreground">
                                Recomendamos usar PNG con fondo transparente para mejores resultados.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setUploadDialogOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleUploadWatermark} disabled={uploading}>
                                <Upload className="h-4 w-4 mr-2" />
                                {uploading ? "Subiendo..." : "Subir"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
