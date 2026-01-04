/**
 * @file WidgetCustomizationPanel.tsx
 * @description Panel drawer para personalización de widgets del dashboard.
 * Permite activar/desactivar, reordenar y configurar widgets.
 * 
 * @module Dashboard/Customization
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Eye,
    Settings2,
    LayoutGrid,
    Check,
    RotateCcw,
    BarChart3,
    Calendar,
    MessageSquare,
    Zap,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    WIDGET_CONFIGS,
    type WidgetId,
    type DashboardMode,
    type WidgetConfig,
} from "@/lib/types/dashboard-types";

// ============================================================================
// TIPOS
// ============================================================================

interface WidgetCustomizationPanelProps {
    /** Si el panel está abierto */
    isOpen: boolean;
    /** Callback para cerrar el panel */
    onClose: () => void;
    /** Modo actual del dashboard */
    currentMode: DashboardMode;
    /** Widgets actualmente ocultos */
    hiddenWidgets: WidgetId[];
    /** Callback cuando se cambia la visibilidad de un widget */
    onToggleWidget: (widgetId: WidgetId) => void;
    /** Callback para resetear al layout por defecto */
    onResetLayout: () => void;
    /** Callback para guardar cambios */
    onSave?: () => void;
}

// Mapeo de categorías a etiquetas en español e iconos
const CATEGORY_MAP: Record<string, { label: string; icon: any }> = {
    stats: { label: "Métricas", icon: BarChart3 },
    calendar: { label: "Gestión de Citas", icon: Calendar },
    communication: { label: "Comunicación", icon: MessageSquare },
    actions: { label: "Utilidades", icon: Zap },
    analytics: { label: "Rendimiento", icon: LayoutGrid },
};

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

/**
 * Obtiene un ícono de Lucide por nombre.
 */
function getIcon(iconName: string): React.ComponentType<{ className?: string }> {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.Box;
}

/**
 * Tarjeta de widget simplificada y minimalista.
 */
function WidgetCard({
    config,
    isVisible,
    isAvailable,
    onToggle,
    matchSearch,
}: {
    config: WidgetConfig;
    isVisible: boolean;
    isAvailable: boolean;
    onToggle: () => void;
    matchSearch: boolean;
}) {
    const Icon = getIcon(config.icon);

    if (!matchSearch) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isAvailable ? 1 : 0.6, scale: 1 }}
            className={cn(
                "group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 hover:bg-muted/50",
                isVisible && isAvailable
                    ? "bg-card border-border shadow-sm hover:shadow-md hover:border-primary/20"
                    : "bg-muted/10 border-transparent hover:border-border/50",
                !isAvailable && "opacity-50 grayscale"
            )}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className={cn(
                        "flex shrink-0 items-center justify-center w-10 h-10 rounded-full transition-colors",
                        isVisible && isAvailable ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}
                >
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className={cn(
                        "text-sm font-medium truncate",
                        isVisible ? "text-foreground" : "text-muted-foreground"
                    )}>
                        {config.title}
                    </span>
                    <span className="text-xs text-muted-foreground truncate hidden sm:block">
                        {config.description}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/*  Etiqueta de tiempo real si aplica */}
                {config.realtime && (
                    <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            En vivo
                        </span>
                    </div>
                )}
                <Switch
                    checked={isVisible && isAvailable}
                    onCheckedChange={onToggle}
                    disabled={!isAvailable}
                    className="data-[state=checked]:bg-primary"
                />
            </div>
        </motion.div>
    );
}

// ============================================================================
// COMPONENTE PRINCIPALRefactorizado
// ============================================================================

export function WidgetCustomizationPanel({
    isOpen,
    onClose,
    currentMode,
    hiddenWidgets,
    onToggleWidget,
    onResetLayout,
    onSave,
}: WidgetCustomizationPanelProps) {
    const [activeTab, setActiveTab] = useState<"widgets" | "layout">("widgets");
    const [searchQuery, setSearchQuery] = useState("");
    const [hasChanges, setHasChanges] = useState(false);

    // Obtener widgets disponibles para el modo actual ordenados por categoría
    const widgetsByCategory = useMemo(() => {
        const available = Object.values(WIDGET_CONFIGS).filter((config) =>
            config.modes.includes(currentMode)
        );

        // Agrupar por categoría
        const grouped: Record<string, WidgetConfig[]> = {};

        // Inicializar categorías en orden deseado para UI
        const orderedCategories = ['stats', 'calendar', 'communication', 'actions', 'analytics'];
        orderedCategories.forEach(cat => grouped[cat] = []);

        available.forEach(widget => {
            const cat = widget.category;
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(widget);
        });

        // Filtrar categorías vacías
        const result: { id: string; label: string; icon: any; widgets: WidgetConfig[] }[] = [];
        orderedCategories.forEach(cat => {
            if (grouped[cat] && grouped[cat].length > 0) {
                const catInfo = CATEGORY_MAP[cat] || { label: cat, icon: LayoutGrid };
                result.push({
                    id: cat,
                    label: catInfo.label,
                    icon: catInfo.icon,
                    widgets: grouped[cat]
                });
            }
        });

        return result;
    }, [currentMode]);


    const handleToggle = useCallback(
        (widgetId: WidgetId) => {
            onToggleWidget(widgetId);
            setHasChanges(true);
        },
        [onToggleWidget]
    );

    const handleReset = useCallback(() => {
        onResetLayout();
        setHasChanges(false);
    }, [onResetLayout]);

    const handleSave = useCallback(() => {
        onSave?.();
        setHasChanges(false);
        onClose();
    }, [onSave, onClose]);

    // Función para filtrar widgets según búsqueda
    const doesMatchSearch = (widget: WidgetConfig) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return widget.title.toLowerCase().includes(query) ||
            widget.description.toLowerCase().includes(query);
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l-border/60">
                {/* Header Mejorado */}
                <SheetHeader className="px-6 py-5 border-b sticky top-0 bg-background/50 z-10 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                <LayoutGrid className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <SheetTitle className="text-xl font-bold tracking-tight">
                                    Personalizar
                                </SheetTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Modo actual:</span>
                                    <Badge variant="outline" className={cn(
                                        "capitalize font-medium shadow-none",
                                        currentMode === 'pro' ? "bg-indigo-500/10 text-indigo-600 border-indigo-200" : "bg-slate-100 text-slate-600"
                                    )}>
                                        {currentMode === "simple" ? "Básico" : "Profesional"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                {/* Tabs más limpias */}
                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as any)}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    <div className="px-6 pt-6 pb-2">
                        <TabsList className="w-full grid grid-cols-2 h-11 p-1 bg-muted/80 backdrop-blur-sm rounded-lg">
                            <TabsTrigger
                                value="widgets"
                                className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Widgets
                            </TabsTrigger>
                            <TabsTrigger
                                value="layout"
                                className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                            >
                                <Settings2 className="h-4 w-4 mr-2" />
                                Configuración
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Contenido Widgets */}
                    <TabsContent
                        value="widgets"
                        className="flex-1 overflow-hidden m-0 p-0 relative"
                    >
                        <ScrollArea className="flex-1 h-full">
                            <div className="p-6 space-y-8">
                                {widgetsByCategory.map((category) => {
                                    // Verificar si hay widgets que coincidan con la búsqueda en esta categoría
                                    const matchingWidgets = category.widgets.filter(w => doesMatchSearch(w));
                                    if (matchingWidgets.length === 0) return null;

                                    return (
                                        <div key={category.id} className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                                                <category.icon className="h-4 w-4 text-primary" />
                                                {category.label}
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {category.widgets.map((config) => (
                                                    <WidgetCard
                                                        key={config.id}
                                                        config={config}
                                                        isVisible={!hiddenWidgets.includes(config.id)}
                                                        isAvailable={true}
                                                        onToggle={() => handleToggle(config.id)}
                                                        matchSearch={doesMatchSearch(config)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="h-10" /> {/* Espaciador final */}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    {/* Contenido Configuración */}
                    <TabsContent
                        value="layout"
                        className="flex-1 overflow-hidden m-0 p-0 bg-muted/5"
                    >
                        <ScrollArea className="flex-1 h-full">
                            <div className="p-6 max-w-xl mx-auto space-y-6">
                                {/* Resumen rápido */}
                                <div className="rounded-xl border bg-muted/30 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl font-bold text-primary">
                                            {Object.values(WIDGET_CONFIGS).filter(w => w.modes.includes(currentMode)).length - hiddenWidgets.length}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            widgets activos de {Object.values(WIDGET_CONFIGS).filter(w => w.modes.includes(currentMode)).length} disponibles
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Gestión del Diseño */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold tracking-tight">Gestión del Diseño</h3>

                                    {/* Restablecer */}
                                    <div className="group rounded-xl border bg-card p-5 hover:border-primary/50 transition-colors shadow-sm">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 rounded-lg bg-red-500/10 text-red-600">
                                                        <RotateCcw className="h-4 w-4" />
                                                    </div>
                                                    <h4 className="font-medium text-foreground">Restablecer por defecto</h4>
                                                </div>
                                                <p className="text-sm text-muted-foreground pl-10 max-w-[300px]">
                                                    Vuelve a la disposición original de widgets recomendada para el modo
                                                    <span className="font-medium text-foreground ml-1">{currentMode === "simple" ? "Básico" : "Profesional"}</span>.
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleReset}
                                                className="shrink-0 hover:border-red-500/50 hover:bg-red-500/5 hover:text-red-600 transition-colors"
                                            >
                                                Restablecer
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Info de sincronización */}
                                <div className="text-xs text-muted-foreground text-center p-4 bg-muted/20 rounded-lg">
                                    <span className="inline-flex items-center gap-1">
                                        <Check className="h-3 w-3 text-green-500" />
                                        Tus preferencias se sincronizan automáticamente en todos tus dispositivos
                                    </span>
                                </div>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>

                {/* Footer Mejorado */}
                <SheetFooter className="p-6 pt-4 border-t bg-background/50 backdrop-blur-md">
                    <div className="flex items-center gap-3 w-full">
                        <Button
                            variant="outline"
                            className="flex-1 h-11 border-dashed hover:border-solid hover:bg-muted/50"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1 gap-2 h-11 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold"
                            onClick={handleSave}
                        >
                            <Check className="h-4 w-4" />
                            Aplicar Cambios
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
