"use client";

import { useRef, useEffect, useState } from "react";
import { Switch, Button, Label } from "@red-salud/ui";
import { FileSignature, Eraser, Save } from "lucide-react";
import { cn } from "@red-salud/core/utils";

interface SignatureCanvasProps {
    enabled: boolean;
    onEnabledChange: (enabled: boolean) => void;
    signatureUrl?: string;
    onSave: (base64: string) => Promise<void>;
    saving?: boolean;
}

export function SignatureCanvas({
    enabled,
    onEnabledChange,
    signatureUrl,
    onSave,
    saving = false,
}: SignatureCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        canvas.width = 365;
        canvas.height = 205;

        // Clear and set background
        ctx.fillStyle = "#f1f5f9";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Load existing signature if available
        if (signatureUrl) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                setHasSignature(true);
            };
            img.src = signatureUrl;
        }
    }, [signatureUrl]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;

        if ("touches" in e) {
            if (e.touches.length > 0) {
                clientX = e.touches[0]!.clientX;
                clientY = e.touches[0]!.clientY;
            } else {
                return;
            }
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(x * (canvas.width / rect.width), y * (canvas.height / rect.height));
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#1e293b";
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;

        if ("touches" in e) {
            if (e.touches.length > 0) {
                clientX = e.touches[0]!.clientX;
                clientY = e.touches[0]!.clientY;
            } else {
                return;
            }
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x * (canvas.width / rect.width), y * (canvas.height / rect.height));
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "#f1f5f9";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    const saveSignature = async () => {
        const canvas = canvasRef.current;
        if (!canvas || !hasSignature) return;

        const dataUrl = canvas.toDataURL("image/png");
        await onSave(dataUrl);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Label className="text-base font-medium">Firma Digital</Label>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Usar en recetas</span>
                    <Switch checked={enabled} onCheckedChange={onEnabledChange} />
                </div>
            </div>

            <div
                className={cn(
                    "p-3 rounded-lg border-2 transition-colors",
                    enabled
                        ? "border-primary/20 bg-primary/5"
                        : "border-muted bg-muted/10"
                )}
            >
                <div className="flex items-center gap-2 mb-3">
                    <FileSignature
                        className={cn("h-4 w-4", enabled ? "text-primary" : "text-muted-foreground")}
                    />
                    <span className={cn("text-sm font-medium", enabled ? "text-primary" : "text-muted-foreground")}>
                        {enabled ? "Firma Digital Activa" : "Firma Digital Inactiva"}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground">
                    Crea una firma digital para que aparezca automáticamente en las recetas.
                </p>
            </div>

            <canvas
                ref={canvasRef}
                className="w-full aspect-video rounded-lg bg-slate-100 cursor-crosshair touch-none border"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />

            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearCanvas}
                    className="gap-1"
                >
                    <Eraser className="h-4 w-4" />
                    Limpiar
                </Button>
                <Button
                    type="button"
                    size="sm"
                    onClick={saveSignature}
                    disabled={!hasSignature || saving}
                    className="gap-1"
                >
                    <Save className="h-4 w-4" />
                    {saving ? "Guardando..." : "Guardar Firma"}
                </Button>
            </div>

            <p className="text-xs text-muted-foreground">
                Dibuje en el recuadro y presione &quot;Guardar Firma&quot; para actualizar.
            </p>
        </div>
    );
}
