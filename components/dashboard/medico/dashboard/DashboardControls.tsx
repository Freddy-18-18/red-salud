/**
 * @file DashboardControls.tsx
 * @description Controles del dashboard médico para cambiar modo, personalizar widgets y opciones.
 * Integrado con el panel de personalización de widgets.
 * 
 * @module Dashboard
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DashboardMode, WidgetId } from "@/lib/types/dashboard-types";
import { WidgetCustomizationPanel } from "./WidgetCustomizationPanel";

// ============================================================================
// TIPOS
// ============================================================================

interface DashboardControlsProps {
    /** Modo actual del dashboard */
    mode: DashboardMode;
    /** Callback para cambiar modo */
    onModeChange: (mode: DashboardMode) => void;
    /** Callback para resetear layout */
    onResetLayout: () => void;
    /** Widgets ocultos */
    hiddenWidgets?: WidgetId[];
    /** Callback para toggle de visibilidad de widget */
    onToggleWidget?: (widgetId: WidgetId) => void;
    /** Callback para abrir editor de temas */
    onOpenThemeEditor?: () => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Controles del dashboard médico.
 * Incluye toggle de modo Simple/Pro, botón de widgets y resetear.
 * 
 * @example
 * <DashboardControls
 *   mode="pro"
 *   onModeChange={setMode}
 *   onResetLayout={resetLayout}
 *   hiddenWidgets={hiddenWidgets}
 *   onToggleWidget={toggleWidget}
 * />
 */
export function DashboardControls({
    mode,
    onModeChange,
    onResetLayout,
    hiddenWidgets = [],
    onToggleWidget,
    onOpenThemeEditor,
}: DashboardControlsProps) {
    // Estado del panel de personalización
    const [isCustomizing, setIsCustomizing] = useState(false);

    // Handler para toggle de widget
    const handleToggleWidget = (widgetId: WidgetId) => {
        onToggleWidget?.(widgetId);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-end flex-wrap gap-4"
            >
                {/* Actions */}
                <div className="flex items-center gap-2" data-tour="dashboard-actions">
                    {/* Theme Button */}
                    {onOpenThemeEditor && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onOpenThemeEditor}
                                        className="gap-2"
                                    >
                                        <Palette className="h-4 w-4" />
                                        <span className="hidden sm:inline">Tema</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Personalizar colores y tema</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    {/* Widgets Button */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => setIsCustomizing(true)}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                    Widgets
                                    {hiddenWidgets.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                                            -{hiddenWidgets.length}
                                        </Badge>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Personalizar widgets visibles</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </motion.div>

            {/* Panel de Personalización */}
            <WidgetCustomizationPanel
                isOpen={isCustomizing}
                onClose={() => setIsCustomizing(false)}
                currentMode={mode}
                hiddenWidgets={hiddenWidgets}
                onToggleWidget={handleToggleWidget}
                onResetLayout={onResetLayout}
            />
        </>
    );
}
