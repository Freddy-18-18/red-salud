"use client";

import { Check, Palette } from "lucide-react";
import { Label } from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";

const DEFAULT_COLORS = [
    "#0da9f7", // Blue (default)
    "#1abc9c", // Teal
    "#2ecc71", // Green
    "#9b59b6", // Purple
    "#e74c3c", // Red
    "#f39c12", // Orange
    "#e91e63", // Pink
    "#7f8c8d", // Gray
    "#3f51b5", // Indigo
    "#f1c40f", // Yellow
];

interface ColorPickerProps {
    selectedColor: string;
    onSelect: (color: string) => void;
    colors?: string[];
}

export function ColorPicker({
    selectedColor,
    onSelect,
    colors = DEFAULT_COLORS,
}: ColorPickerProps) {
    return (
        <div className="space-y-4">
            <Label className="flex items-center gap-2 text-sm">
                <Palette className="h-4 w-4 text-muted-foreground" />
                Color del Marco
            </Label>
            <div className="grid grid-cols-5 gap-2">
                {colors.map((color) => {
                    const isSelected = color.toLowerCase() === selectedColor.toLowerCase();

                    return (
                        <button
                            key={color}
                            type="button"
                            aria-label={`Color ${color}`}
                            onClick={() => onSelect(color)}
                            className={cn(
                                "w-full aspect-square rounded-md border-2 transition-all flex items-center justify-center",
                                isSelected
                                    ? "border-primary ring-2 ring-primary/50"
                                    : "border-gray-200 hover:border-gray-400"
                            )}
                            style={{ backgroundColor: color }}
                        >
                            {isSelected && (
                                <Check className="h-4 w-4 text-white mix-blend-difference" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
