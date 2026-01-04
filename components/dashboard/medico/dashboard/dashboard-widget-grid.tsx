"use client";

import React, { useState, useMemo } from "react";
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
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { WidgetId, DashboardMode, WidgetPosition } from "@/lib/types/dashboard-types";
import { WIDGET_CONFIGS } from "@/lib/types/dashboard-types";

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
    stats?: any;
    profile?: any;
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
    stats,
    profile,
}: DashboardWidgetGridProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Filter visible widgets for current mode
    const visibleWidgets = useMemo(() => {
        return positions.filter(
            (pos) =>
                !hiddenWidgets.includes(pos.id) &&
                WIDGET_CONFIGS[pos.id]?.modes.includes(mode)
        );
    }, [positions, hiddenWidgets, mode]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const oldIndex = visibleWidgets.findIndex((w) => w.id === active.id);
            const newIndex = visibleWidgets.findIndex((w) => w.id === over.id);

            const newPositions = arrayMove(visibleWidgets, oldIndex, newIndex);
            onPositionsChange(newPositions);
        }
    };

    const activeWidget = activeId
        ? visibleWidgets.find((w) => w.id === activeId)
        : null;

    return (
        <div className="space-y-6">
            {/* Mode Switcher & Controls */}
            <DashboardControls
                mode={mode}
                onModeChange={onModeChange}
                onResetLayout={onResetLayout}
                hiddenWidgets={hiddenWidgets}
                onToggleWidget={onToggleWidget}
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
                            "grid gap-3",
                            "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
                            "auto-rows-[minmax(170px,auto)]"
                        )}
                        data-tour="dashboard-grid"
                    >
                        <AnimatePresence mode="popLayout">
                            {visibleWidgets.map((widget) => (
                                <SortableWidgetItem
                                    key={widget.id}
                                    id={widget.id}
                                    position={widget}
                                >
                                    {renderWidget(widget.id, { doctorId, stats, profile })}
                                </SortableWidgetItem>
                            ))}
                        </AnimatePresence>
                    </div>
                </SortableContext>

                {/* Drag Overlay - Widget flotante durante el arrastre */}
                <DragOverlay
                    dropAnimation={{
                        duration: 300,
                        easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
                    }}
                >
                    {activeWidget ? (
                        <div
                            style={{
                                gridColumn: `span ${activeWidget.w}`,
                                gridRow: `span ${activeWidget.h}`,
                                transform: "scale(1.02) rotate(1deg)",
                            }}
                            className={cn(
                                "pointer-events-none",
                                "drop-shadow-2xl",
                                "ring-2 ring-primary/30 ring-offset-2 ring-offset-background rounded-2xl"
                            )}
                        >
                            {renderWidget(activeWidget.id, { doctorId, stats, profile })}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
