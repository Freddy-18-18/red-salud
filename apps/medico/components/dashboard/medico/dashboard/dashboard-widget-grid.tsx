"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@red-salud/core/utils";
import type {
  WidgetId,
  DashboardMode,
  WidgetPosition,
} from "@red-salud/types";
import { WIDGET_CONFIGS } from "@red-salud/types";

// Extracted components
import { SortableWidgetItem } from "./SortableWidgetItem";
import { renderWidget } from "./widget-renderer";
import { DashboardControls } from "./DashboardControls";

interface DashboardWidgetGridProps {
  mode: DashboardMode;
  positions: WidgetPosition[];
  hiddenWidgets: WidgetId[];
  onPositionsChange: (positions: WidgetPosition[]) => void;
  onModeChange: (mode: DashboardMode) => void;
  onResetLayout: () => void;
  onToggleWidget?: (widgetId: WidgetId) => void;
  doctorId?: string;
}

export function DashboardWidgetGrid({
  mode,
  positions,
  hiddenWidgets,
  onPositionsChange,
  onModeChange,
  onResetLayout,
  onToggleWidget,
  doctorId,
}: DashboardWidgetGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Animación de transición entre modos
  useEffect(() => {
    // Async update to avoid set-state-in-effect warning
    const t = setTimeout(() => setIsTransitioning(true), 0);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => {
      clearTimeout(t);
      clearTimeout(timer);
    };
  }, [mode]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Filter visible widgets for current mode - memoized for performance
  const visibleWidgets = useMemo(() => {
    return positions.filter(
      (pos) =>
        !hiddenWidgets.includes(pos.id) &&
        WIDGET_CONFIGS[pos.id]?.modes.includes(mode),
    );
  }, [positions, hiddenWidgets, mode]);

  // Optimize drag handlers with useCallback
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setIsDragging(false);

      if (over && active.id !== over.id) {
        const oldIndex = visibleWidgets.findIndex((w) => w.id === active.id);
        const newIndex = visibleWidgets.findIndex((w) => w.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newPositions = arrayMove(visibleWidgets, oldIndex, newIndex);
          onPositionsChange(newPositions);
        }
      }
    },
    [visibleWidgets, onPositionsChange],
  );

  const activeWidget = activeId
    ? visibleWidgets.find((w) => w.id === activeId)
    : null;

  // Contar widgets por modo para mostrar información
  const simpleWidgetCount = useMemo(
    () =>
      positions.filter(
        (pos) =>
          !hiddenWidgets.includes(pos.id) &&
          WIDGET_CONFIGS[pos.id]?.modes.includes("simple"),
      ).length,
    [positions, hiddenWidgets],
  );

  const proWidgetCount = useMemo(
    () =>
      positions.filter(
        (pos) =>
          !hiddenWidgets.includes(pos.id) &&
          WIDGET_CONFIGS[pos.id]?.modes.includes("pro"),
      ).length,
    [positions, hiddenWidgets],
  );

  return (
    <div className="space-y-6">
      {/* Mode Switcher & Controls */}
      <DashboardControls
        mode={mode}
        onModeChange={onModeChange}
        onResetLayout={onResetLayout}
        hiddenWidgets={hiddenWidgets}
        onToggleWidget={onToggleWidget || (() => { })}
        simpleWidgetCount={simpleWidgetCount}
        proWidgetCount={proWidgetCount}
      />

      {/* Drag & Drop Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleWidgets.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          <div
            className={cn(
              "grid gap-3 transition-all duration-300",
              "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
              "auto-rows-[minmax(170px,auto)]",
              isTransitioning && "opacity-50 scale-[0.99]",
            )}
            data-tour="dashboard-grid"
          >
            <AnimatePresence mode="popLayout">
              {visibleWidgets.map((widget, index) => (
                <motion.div
                  key={widget.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    y: -10,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    delay: index * 0.03, // Stagger animation
                  }}
                >
                  <SortableWidgetItem
                    id={widget.id}
                    position={widget}
                    isDraggingFromParent={isDragging && activeId === widget.id}
                  >
                    {renderWidget(widget.id, {
                      doctorId: doctorId || "",
                    })}
                  </SortableWidgetItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>

        {/* Drag Overlay - Optimizado */}
        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: "cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          {activeWidget ? (
            <div
              className={cn(
                "pointer-events-none",
                "drop-shadow-xl",
                "ring-2 ring-primary/50 ring-offset-2 ring-offset-background rounded-2xl",
                "scale-105 opacity-90",
              )}
              style={{
                width: activeWidget.w
                  ? `calc(${activeWidget.w * 25}% - 9px)`
                  : undefined,
              }}
            >
              {renderWidget(activeWidget.id, {
                doctorId: doctorId || "",
              })}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
