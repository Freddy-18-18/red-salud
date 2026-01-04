"use client";

/**
 * @file SortableWidgetItem.tsx
 * @description Wrapper para widgets que permite arrastrar y soltar usando dnd-kit.
 * Incluye animaciones suaves con framer-motion para transiciones premium.
 * 
 * @module Dashboard
 */

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetPosition } from "@/lib/types/dashboard-types";

interface SortableWidgetItemProps {
    /** ID único del widget */
    id: string;
    /** Posición del widget en el grid */
    position: WidgetPosition;
    /** Contenido del widget */
    children: React.ReactNode;
}

/**
 * Componente wrapper que hace a los widgets arrastrables.
 * Incluye animaciones de entrada, salida y durante el arrastre.
 * 
 * @example
 * <SortableWidgetItem id="stats-overview" position={position}>
 *   <StatsOverviewWidget />
 * </SortableWidgetItem>
 */
export function SortableWidgetItem({
    id,
    position,
    children,
}: SortableWidgetItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
        isOver,
    } = useSortable({ id });

    // Transición CSS optimizada combinada con transform de dnd-kit
    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || "transform 250ms cubic-bezier(0.25, 0.1, 0.25, 1)",
        gridColumn: `span ${position.w}`,
        gridRow: `span ${position.h}`,
        zIndex: isDragging ? 50 : isOver ? 10 : undefined,
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            data-widget={id}
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{
                opacity: isDragging ? 0.7 : 1,
                scale: isDragging ? 1.03 : isOver ? 0.98 : 1,
                y: 0,
                rotate: isDragging ? 1 : 0,
            }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.8
            }}
            className={cn(
                "relative h-full",
                "will-change-transform",
                isDragging && "z-50 drop-shadow-2xl",
                isOver && "ring-2 ring-primary/20 ring-offset-2 ring-offset-background rounded-2xl"
            )}
        >
            {/* Drag Handle con micro-animaciones */}
            <motion.button
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                type="button"
                whileHover={{ scale: 1.1, backgroundColor: "hsl(var(--muted))" }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "absolute top-3 left-3 z-20",
                    "flex items-center justify-center p-1.5 rounded-lg",
                    "bg-background/90 backdrop-blur-md",
                    "border border-border/40",
                    "text-muted-foreground/50 hover:text-foreground",
                    "shadow-sm hover:shadow-md",
                    "transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    "select-none",
                    isDragging && "text-primary bg-primary/15 border-primary/40 cursor-grabbing shadow-lg",
                    !isDragging && "cursor-grab"
                )}
                style={{ touchAction: "none" }}
                title="Arrastrar para mover"
                aria-label="Arrastrar widget"
            >
                <motion.div
                    animate={{
                        rotate: isDragging ? [0, -5, 5, -5, 0] : 0
                    }}
                    transition={{
                        duration: 0.5,
                        repeat: isDragging ? Infinity : 0,
                        repeatDelay: 0.2
                    }}
                >
                    <GripVertical className="h-4 w-4" />
                </motion.div>
            </motion.button>

            {/* Indicador visual cuando otro widget está sobre este */}
            <AnimatePresence>
                {isOver && !isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 rounded-2xl bg-primary/5 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* Widget content con animación de escala durante arrastre */}
            <motion.div
                animate={{
                    filter: isDragging ? "brightness(1.05)" : "brightness(1)",
                }}
                transition={{ duration: 0.2 }}
                className="h-full"
            >
                {React.cloneElement(children as React.ReactElement<any>, {
                    isDragging,
                })}
            </motion.div>
        </motion.div>
    );
}
