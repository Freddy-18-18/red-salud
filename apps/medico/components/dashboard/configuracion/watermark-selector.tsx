"use client";

import { Button } from "@red-salud/design-system";
import { Upload, Users } from "lucide-react";
import { cn } from "@red-salud/core/utils";
import Image from "next/image";
import type { PrescriptionWatermark } from "@/lib/supabase/types/settings";

interface WatermarkSelectorProps {
    watermarks: PrescriptionWatermark[];
    selectedId?: string;
    onSelect: (watermarkId: string) => void;
    onUploadClick: () => void;
}

export function WatermarkSelector({
    watermarks,
    selectedId,
    onSelect,
    onUploadClick,
}: WatermarkSelectorProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onUploadClick}
                    className="gap-1"
                >
                    <Upload className="h-4 w-4" />
                    Subir Marca
                </Button>
            </div>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {watermarks.map((watermark) => {
                    const isSelected = watermark.id === selectedId;

                    return (
                        <div key={watermark.id} className="space-y-2">
                            <div
                                title={`${watermark.name} ${watermark.is_generic ? "(Genérico)" : "(Personal)"}`}
                                onClick={() => onSelect(watermark.id)}
                                className={cn(
                                    "relative border-2 rounded-lg cursor-pointer transition-all duration-200 group overflow-hidden bg-slate-50 aspect-video",
                                    isSelected
                                        ? "border-primary shadow-md"
                                        : "border-transparent hover:border-primary/50"
                                )}
                            >
                                <Image
                                    alt={watermark.name}
                                    width={200}
                                    height={112}
                                    className="object-contain w-full h-full p-2 invert-0 dark:invert"
                                    src={watermark.image_url}
                                />
                                {watermark.is_generic && (
                                    <div className="absolute top-2 right-2 p-1 rounded-full bg-blue-500/80">
                                        <Users className="h-3 w-3 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
