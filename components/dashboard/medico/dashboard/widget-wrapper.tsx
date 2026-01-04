"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { Minimize2, Maximize2, X, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface WidgetWrapperProps {
    /** ID único del widget */
    id: string;
    /** Título del widget */
    title: string;
    /** Ícono opcional del widget */
    icon?: React.ReactNode;
    /** Contenido del widget */
    children: React.ReactNode;
    /** Clases adicionales para el contenedor */
    className?: string;
    /** Clases adicionales para el header */
    headerClassName?: string;
    /** Si el widget está siendo arrastrado */
    isDragging?: boolean;
    /** Si el widget está minimizado */
    isMinimized?: boolean;
    /** Si mostrar los controles */
    showControls?: boolean;
    /** Callback al minimizar */
    onMinimize?: () => void;
    /** Callback al maximizar */
    onMaximize?: () => void;
    /** Callback al configurar */
    onSettings?: () => void;
    /** Callback al eliminar */
    onRemove?: () => void;
}

export const WidgetWrapper = forwardRef<HTMLDivElement, WidgetWrapperProps>(
    (
        {
            id,
            title,
            icon,
            children,
            className,
            headerClassName,
            isDragging = false,
            isMinimized = false,
            showControls = true,
            onMinimize,
            onMaximize,
            onSettings,
            onRemove,
        },
        ref
    ) => {
        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: isDragging ? 1.02 : 1,
                    rotate: isDragging ? 1 : 0,
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                }}
                className={cn(
                    // Base styles
                    "relative overflow-hidden rounded-2xl",
                    // Glassmorphism effect con variables personalizadas
                    "bg-card/80 backdrop-blur-xl",
                    "border border-border/50",
                    // Dark mode: usar variables de widget
                    "dark:bg-[hsl(var(--widget-bg))]/95",
                    "dark:border-[hsl(var(--widget-border))]/60",
                    // Shadow
                    "shadow-lg hover:shadow-xl",
                    "dark:shadow-black/60", // Sombra más fuerte en dark
                    // Hover glow effect
                    "before:absolute before:inset-0 before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-300",
                    "before:bg-gradient-to-br before:from-primary/5 before:to-secondary/5",
                    "dark:before:from-primary/10 dark:before:to-secondary/10",
                    "before:pointer-events-none", // Permite que los clicks pasen a través del overlay
                    "hover:before:opacity-100",
                    // Dragging state
                    isDragging && "z-50 shadow-2xl ring-2 ring-primary/30 cursor-grabbing",
                    className
                )}
            >
                {/* Header */}
                <div
                    className={cn(
                        "flex items-center justify-between px-4 py-3",
                        "border-b border-border/30 dark:border-border/30",
                        "bg-gradient-to-r from-muted/30 to-muted/10",
                        "dark:from-muted/40 dark:to-muted/20",
                        headerClassName
                    )}
                >


                    <div className="flex items-center gap-3">
                        {/* Icon */}
                        {icon && (
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10">
                                {icon}
                            </div>
                        )}

                        {/* Title */}
                        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                    </div>

                    {/* Controls */}
                    {showControls && (
                        <div className="flex items-center gap-1">
                            {onSettings && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={onSettings}
                                >
                                    <Settings className="h-3.5 w-3.5" />
                                </Button>
                            )}
                            {(onMinimize || onMaximize) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={isMinimized ? onMaximize : onMinimize}
                                >
                                    {isMinimized ? (
                                        <Maximize2 className="h-3.5 w-3.5" />
                                    ) : (
                                        <Minimize2 className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            )}
                            {onRemove && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={onRemove}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                <motion.div
                    animate={{
                        height: isMinimized ? 0 : "auto",
                        opacity: isMinimized ? 0 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                >
                    <div className="p-4">{children}</div>
                </motion.div>
            </motion.div>
        );
    }
);

WidgetWrapper.displayName = "WidgetWrapper";
