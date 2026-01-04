"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { normalizeStateName, VENEZUELA_STATES_GEO } from "./venezuela-states.data";
import { MapControls } from "./MapControls";
import { StateView } from "./StateView";

export interface VenezuelaMapSVGProps {
    doctorDistribution: Record<string, number>;
    specialtyName?: string;
    onStateSelect?: (stateName: string) => void;
    height?: string;
    className?: string;
}

export function VenezuelaMapSVG({
    doctorDistribution,
    specialtyName,
    onStateSelect,
    height = "500px",
    className,
}: VenezuelaMapSVGProps) {
    const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
    const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Normalizar mapa de distribución para coincidir con IDs
    const normalizedDistribution = useMemo(() => {
        const dist: Record<string, number> = {};
        Object.entries(doctorDistribution).forEach(([key, val]) => {
            const normalizedKey = normalizeStateName(key);
            dist[normalizedKey] = (dist[normalizedKey] || 0) + val;
        });
        return dist;
    }, [doctorDistribution]);

    // Calcular máximo para escala de colores
    const maxDoctors = useMemo(() => {
        const values = Object.values(normalizedDistribution);
        return values.length > 0 ? Math.max(...values) : 1;
    }, [normalizedDistribution]);

    const getColor = (stateId: string, isHovered: boolean, isSelected: boolean) => {
        const count = normalizedDistribution[stateId] || 0;
        const ratio = count / maxDoctors;

        // Si está seleccionado, color especial
        if (isSelected) return "#3b82f6"; // primary blue

        // Colores base según distribución
        let baseColor = "#64748b"; // slate-500 (sin datos)

        if (count > 0) {
            if (ratio < 0.2) baseColor = "#3b82f6"; // blue-500
            else if (ratio < 0.5) baseColor = "#10b981"; // emerald-500
            else if (ratio < 0.8) baseColor = "#f59e0b"; // amber-500
            else baseColor = "#ef4444"; // red-500
        }

        // Hover effect (aclarar)
        if (isHovered) return baseColor; // El hover real lo manejamos con filters o opacity

        return baseColor;
    };

    const selectedStateData = useMemo(() =>
        selectedStateId ? VENEZUELA_STATES_GEO.find(s => s.id === selectedStateId) : null
        , [selectedStateId]);

    const handleStateClick = (stateId: string) => {
        setSelectedStateId(stateId);
        if (onStateSelect) {
            const stateData = VENEZUELA_STATES_GEO.find(s => s.id === stateId);
            if (stateData) onStateSelect(stateData.name);
        }
    };

    return (
        <div
            className={cn(
                "relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl",
                className
            )}
            style={{ height }}
        >
            {/* Controles y UI contextual */}
            <MapControls
                onReset={() => setSelectedStateId(null)}
                showZoom={false} // Simplificado por ahora
            />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-slate-900/80 z-50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            )}

            {/* Contenido Principal con Transiciones */}
            <AnimatePresence mode="wait">
                {selectedStateId && selectedStateData ? (
                    <motion.div
                        key="state-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-sm"
                    >
                        <StateView
                            state={selectedStateData}
                            doctorCount={normalizedDistribution[selectedStateId] || 0}
                            onBack={() => setSelectedStateId(null)}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="map-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full flex items-center justify-center p-4 md:p-8"
                    >
                        <svg
                            viewBox="0 0 850 850"
                            className="w-full h-full max-h-[600px] drop-shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                            style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}
                            preserveAspectRatio="xMidYMid meet"
                        >
                            <defs>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            <g className="transition-transform duration-500 ease-out">
                                {VENEZUELA_STATES_GEO.map((state) => {
                                    const isHovered = hoveredStateId === state.id;
                                    const count = normalizedDistribution[state.id] || 0;
                                    const color = getColor(state.id, isHovered, false);

                                    return (
                                        <g
                                            key={state.id}
                                            onClick={() => handleStateClick(state.id)}
                                            onMouseEnter={() => setHoveredStateId(state.id)}
                                            onMouseLeave={() => setHoveredStateId(null)}
                                            className="cursor-pointer transition-all duration-300"
                                            style={{
                                                opacity: hoveredStateId && hoveredStateId !== state.id ? 0.4 : 1,
                                                transform: isHovered ? "scale(1.005)" : "scale(1)", // Efecto pop sutil
                                                transformOrigin: "center"
                                            }}
                                        >
                                            <path
                                                d={state.path}
                                                fill={color}
                                                stroke="rgba(255,255,255,0.15)"
                                                strokeWidth={isHovered ? 2 : 1}
                                                className="transition-all duration-300 ease-out"
                                                style={{
                                                    filter: isHovered ? "brightness(1.2)" : "none"
                                                }}
                                            />

                                            {/* Labels solo para estados con médicos o en hover */}
                                            {(count > 0 || isHovered) && (
                                                <g
                                                    style={{ pointerEvents: "none" }}
                                                    className={cn(
                                                        "transition-opacity duration-300",
                                                        isHovered ? "opacity-100" : "opacity-0 md:opacity-70"
                                                    )}
                                                >
                                                    <circle cx={state.center[0]} cy={state.center[1]} r={2} fill="white" />
                                                    <text
                                                        x={state.center[0]}
                                                        y={state.center[1] - 5}
                                                        textAnchor="middle"
                                                        fill="white"
                                                        fontSize="10"
                                                        fontWeight="bold"
                                                        className="drop-shadow-md select-none"
                                                    >
                                                        {state.name}
                                                    </text>
                                                    {isHovered && (
                                                        <text
                                                            x={state.center[0]}
                                                            y={state.center[1] + 10}
                                                            textAnchor="middle"
                                                            fill="rgba(255,255,255,0.8)"
                                                            fontSize="8"
                                                            className="drop-shadow-md select-none"
                                                        >
                                                            {count} Médicos
                                                        </text>
                                                    )}
                                                </g>
                                            )}
                                        </g>
                                    );
                                })}
                            </g>
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay informativa básica en mobile si no se ha interactuado */}
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none md:hidden">
                <div className="bg-slate-900/80 backdrop-blur-md rounded-lg p-3 text-xs text-center text-white/60 border border-white/10">
                    Toca un estado para ver detalles
                </div>
            </div>
        </div>
    );
}
