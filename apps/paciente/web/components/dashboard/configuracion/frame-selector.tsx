"use client";

import { Check } from "lucide-react";
import { cn } from "@red-salud/core/utils";
import Image from "next/image";
import type { PrescriptionFrame } from "@/lib/supabase/types/settings";

interface FrameSelectorProps {
    frames: PrescriptionFrame[];
    selectedId?: string;
    frameColor?: string;
    onSelect: (frameId: string) => void;
}

export function FrameSelector({
    frames,
    selectedId,
    frameColor = "#0da9f7",
    onSelect,
}: FrameSelectorProps) {
    // Calculate hue rotation for frame color
    const getHueRotation = (hexColor: string) => {
        // Convert hex to HSL and calculate rotation from default blue
        const defaultHue = 200; // Approximate hue of #0da9f7

        // Parse hex
        const r = parseInt(hexColor.slice(1, 3), 16) / 255;
        const g = parseInt(hexColor.slice(3, 5), 16) / 255;
        const b = parseInt(hexColor.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;

        if (max !== min) {
            const d = max - min;
            switch (max) {
                case r:
                    h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
                    break;
                case g:
                    h = ((b - r) / d + 2) * 60;
                    break;
                case b:
                    h = ((r - g) / d + 4) * 60;
                    break;
            }
        }

        return h - defaultHue;
    };

    return (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {frames.map((frame) => {
                const isSelected = frame.id === selectedId;
                const hueRotation = frame.has_customizable_color ? getHueRotation(frameColor) : 0;

                return (
                    <div key={frame.id} className="space-y-2">
                        <div
                            onClick={() => onSelect(frame.id)}
                            className={cn(
                                "relative rounded-lg cursor-pointer transition-all duration-200 group overflow-hidden border-2 aspect-[1/1.29]",
                                isSelected
                                    ? "border-primary shadow-md"
                                    : "border-transparent hover:border-primary/50"
                            )}
                        >
                            <Image
                                alt={frame.name}
                                width={200}
                                height={258}
                                className="object-cover w-full h-full"
                                src={frame.image_url}
                                style={{
                                    filter: frame.has_customizable_color
                                        ? `hue-rotate(${hueRotation}deg)`
                                        : undefined,
                                }}
                            />
                            {isSelected && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                    <Check className="h-10 w-10 text-white drop-shadow-lg" />
                                </div>
                            )}
                        </div>
                        <p className="text-sm font-medium text-center truncate px-1">
                            {frame.name}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
