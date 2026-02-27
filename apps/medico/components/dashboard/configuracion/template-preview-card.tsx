"use client";

import { Card, CardContent, Badge, Button } from "@red-salud/design-system";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@red-salud/design-system";
import { Layout, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { PrescriptionFrame, PrescriptionWatermark } from "@/lib/supabase/types/settings";

interface TemplatePreviewCardProps {
    frames: PrescriptionFrame[];
    selectedFrameId?: string;
    selectedFrame?: PrescriptionFrame;
    selectedWatermark?: PrescriptionWatermark;
    frameColor: string;
    onFrameChange: (frameId: string) => void;
}

export function TemplatePreviewCard({
    frames,
    selectedFrameId,
    selectedFrame,
    selectedWatermark,
    frameColor,
    onFrameChange,
}: TemplatePreviewCardProps) {
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

    const hueRotation = selectedFrame?.has_customizable_color
        ? getHueRotation(frameColor)
        : 0;

    return (
        <Card>
            <CardContent className="p-6 space-y-6">
                <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Layout className="h-5 w-5" />
                        Plantilla de Receta
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Selecciona y personaliza el diseño de tus recetas médicas
                    </p>
                </div>

                {/* Preview */}
                <div className="flex justify-center">
                    <div className="w-40 h-52 border-2 border-primary/20 rounded-lg overflow-hidden bg-white shadow-lg relative">
                        {selectedFrame && (
                            <Image
                                src={selectedFrame.image_url}
                                alt={selectedFrame.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 300px"
                                style={{
                                    filter: selectedFrame.has_customizable_color
                                        ? `hue-rotate(${hueRotation}deg)`
                                        : undefined,
                                }}
                            />
                        )}
                        {selectedWatermark && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Image
                                    src={selectedWatermark.image_url}
                                    alt={selectedWatermark.name}
                                    fill
                                    className="object-contain opacity-10"
                                    sizes="150px"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Name and badges */}
                <div className="text-center space-y-2">
                    <p className="font-medium text-primary">
                        {selectedFrame?.name || "Sin plantilla"}
                    </p>
                    <div className="flex justify-center gap-2">
                        {selectedFrame && (
                            <Badge variant="secondary" className="text-xs">
                                Con Marco
                            </Badge>
                        )}
                        {selectedWatermark && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                Marca de Agua
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Cambiar Plantilla</label>
                    <Select value={selectedFrameId} onValueChange={onFrameChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar plantilla" />
                        </SelectTrigger>
                        <SelectContent>
                            {frames.map((frame) => (
                                <SelectItem key={frame.id} value={frame.id}>
                                    {frame.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Editor link */}
                <Link href="/consultorio/configuracion/plantillas" className="block">
                    <Button className="w-full gap-2">
                        <Layout className="h-4 w-4" />
                        Editor de Plantillas de Receta
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
