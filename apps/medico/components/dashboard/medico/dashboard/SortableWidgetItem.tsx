"use client";

/**
 * @file SortableWidgetItem.tsx
 * @description Wrapper optimizado para widgets arrastrables con dnd-kit.
 * Optimizado para v1 con React.memo y animaciones mejoradas.
 *
 * @module Dashboard
 */

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import { cn } from "@red-salud/core/utils";
import type { WidgetPosition } from "@red-salud/types";

interface SortableWidgetItemProps {
  /** ID único del widget */
  id: string;
  /** Posición del widget en el grid */
  position: WidgetPosition;
  /** Contenido del widget */
  children: React.ReactNode;
  /** Si este widget específico está siendo arrastrado (optimización) */
  isDraggingFromParent?: boolean;
}

/**
 * Componente wrapper que hace a los widgets arrastrables.
 * Optimizado con React.memo para evitar renders innecesarios.
 *
 * @example
 * <SortableWidgetItem id="stats-overview" position={position}>
 *   <StatsOverviewWidget />
 * </SortableWidgetItem>
 */
function SortableWidgetItemComponent({
  id,
  position,
  children,
  isDraggingFromParent,
}: SortableWidgetItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging: isDraggingFromDnd,
    isOver,
  } = useSortable({ id });

  // Usar el estado de dragging más preciso
  const isDragging = isDraggingFromParent ?? isDraggingFromDnd;

  // Transición CSS optimizada - más rápida para mejor responsiveness
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms cubic-bezier(0.2, 0, 0, 1)",
    gridColumn: `span ${position.w}`,
    gridRow: `span ${position.h}`,
    zIndex: isDragging ? 50 : isOver ? 10 : undefined,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      data-widget={id}
      layout="position" // Solo animar posición, no layout completo (más rápido)
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{
        opacity: isDragging ? 0.8 : 1,
        scale: isDragging ? 1.02 : 1,
        y: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 500, // Más rápido
        damping: 40,
        mass: 0.4, // Más ligero
      }}
      className={cn(
        "relative h-full",
        "will-change-transform", // Hint para el navegador
        isDragging && "z-50 drop-shadow-xl",
        isOver &&
        "ring-2 ring-primary/30 ring-offset-2 ring-offset-background rounded-2xl",
      )}
    >
      {/* Drag Handle - simplificado para mejor rendimiento */}
      <motion.button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "absolute top-3 left-3 z-20",
          "flex items-center justify-center p-1.5 rounded-lg",
          "bg-background/90 backdrop-blur-sm",
          "border border-border/40",
          "text-muted-foreground/50 hover:text-foreground",
          "shadow-sm hover:shadow-md",
          "transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "select-none touch-none",
          isDragging
            ? "text-primary bg-primary/15 border-primary/40 cursor-grabbing shadow-lg"
            : "cursor-grab opacity-0 hover:opacity-100", // Oculto por defecto, visible al hover
        )}
        title="Arrastrar para mover"
        aria-label="Arrastrar widget"
      >
        <GripVertical className="h-4 w-4" />
      </motion.button>

      {/* Indicador visual cuando otro widget está sobre este - sin AnimatePresence */}
      {isOver && !isDragging && (
        <div className="absolute inset-0 rounded-2xl bg-primary/5 pointer-events-none" />
      )}

      {/* Widget content */}
      <div className="h-full">
        {React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          isDragging,
        })}
      </div>
    </motion.div>
  );
}

// Memoizar para evitar re-renders cuando otros widgets cambian
export const SortableWidgetItem = React.memo(
  SortableWidgetItemComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.position === nextProps.position &&
      prevProps.isDraggingFromParent === nextProps.isDraggingFromParent
    );
  },
);

SortableWidgetItem.displayName = "SortableWidgetItem";
