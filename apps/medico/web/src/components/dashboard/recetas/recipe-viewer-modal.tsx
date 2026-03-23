"use client";

import { Dialog, DialogContent, DialogTitle, Button } from "@red-salud/design-system";
import { X, Minus, Plus, Maximize2 } from "lucide-react";
import { VisualRecipePreview, VisualRecipePreviewProps } from "./visual-recipe-preview";
import { useState } from "react";

interface RecipeViewerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: VisualRecipePreviewProps["data"] | null;
    settings: VisualRecipePreviewProps["settings"] | null;
}

export function RecipeViewerModal({ open, onOpenChange, data, settings }: RecipeViewerModalProps) {
    const [zoomLevel, setZoomLevel] = useState(1);

    if (!data || !settings) return null;

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
    const handleZoomReset = () => setZoomLevel(1);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col p-0 bg-gray-100/95 dark:bg-gray-900/95 backdrop-blur-sm border-none overflow-hidden">
                <DialogTitle className="sr-only">Vista de Receta</DialogTitle>

                {/* Header Toolbar */}
                <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-950 border-b z-50 shadow-sm">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        Vista Previa de Receta
                    </h2>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoomLevel <= 0.5} className="h-8 w-8">
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-mono w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                        <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoomLevel >= 2} className="h-8 w-8">
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleZoomReset} title="Restablecer tamaño" className="h-8 w-8">
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 h-8 w-8 rounded-full"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Content - Scrollable Area */}
                <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-8 flex justify-center items-start">
                    <div
                        className="shadow-2xl bg-white min-w-[216mm] min-h-[279mm] transition-transform origin-top duration-200"
                        style={{ transform: `scale(${zoomLevel})` }}
                    >
                        <VisualRecipePreview
                            data={data}
                            settings={settings}
                            className="h-full w-full"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
