"use client";

import { useRef } from "react";
import { Switch, Button, Label } from "@red-salud/design-system";
import { ImageIcon, Upload } from "lucide-react";
import { cn } from "@red-salud/core/utils";
import Image from "next/image";

interface LogoUploadProps {
    enabled: boolean;
    onEnabledChange: (enabled: boolean) => void;
    logoUrl?: string;
    fileName?: string;
    onUpload: (file: File) => Promise<void>;
    uploading?: boolean;
}

export function LogoUpload({
    enabled,
    onEnabledChange,
    logoUrl,
    fileName,
    onUpload,
    uploading = false,
}: LogoUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await onUpload(file);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Label className="text-base font-medium">Logotipo</Label>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Mostrar en recetas</span>
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
                    <ImageIcon
                        className={cn("h-4 w-4", enabled ? "text-primary" : "text-muted-foreground")}
                    />
                    <span className={cn("text-sm font-medium", enabled ? "text-primary" : "text-muted-foreground")}>
                        {enabled ? "Logo Visible" : "Logo Oculto"}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground">
                    Sube un logo para que aparezca automáticamente en las recetas.
                </p>
            </div>

            {logoUrl && (
                <div className="flex justify-center p-4 bg-slate-50 rounded-lg border">
                    <Image
                        src={logoUrl}
                        alt="Logo del consultorio"
                        className="max-h-20 object-contain"
                        width={80}
                        height={80}
                    />
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="gap-1"
                >
                    <Upload className="h-4 w-4" />
                    {uploading ? "Subiendo..." : "Seleccionar Archivo"}
                </Button>
                <span className="text-sm text-muted-foreground">
                    {fileName || "Ningún archivo seleccionado"}
                </span>
            </div>

            <p className="text-xs text-muted-foreground">
                Selecciona una imagen y ajústala para obtener el mejor resultado.
                Se recomienda usar PNG con transparencias.
            </p>
        </div>
    );
}
