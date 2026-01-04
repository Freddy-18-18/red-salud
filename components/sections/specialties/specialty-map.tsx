"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { Tooltip } from "react-tooltip";
import { Loader2, MapPin, Users, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// TopoJSON for Venezuela (States/Departments)
const GEO_URL = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/venezuela/venezuela-estados.json";

interface SpecialtyMapProps {
    specialtyName: string;
    doctorCount: number;
    distribution?: Record<string, number>;
}

// Mock data generation (unchanged logic)
const generateMockData = (total: number) => {
    const states = [
        "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar",
        "Carabobo", "Cojedes", "Delta Amacuro", "Falcón", "Guárico", "Lara",
        "Mérida", "Miranda", "Monagas", "Nueva Esparta", "Portuguesa", "Sucre",
        "Táchira", "Trujillo", "Yaracuy", "Zulia", "La Guaira", "Distrito Capital"
    ];

    const data: Record<string, number> = {};
    let remaining = total;
    const main = ["Distrito Capital", "Miranda", "Zulia", "Carabobo", "Lara"];

    states.forEach(state => {
        if (main.includes(state)) {
            const count = Math.ceil(remaining * 0.15);
            data[state] = count;
            remaining -= count;
        } else {
            data[state] = 0;
        }
    });

    states.forEach(state => {
        if (remaining > 0 && !data[state]) {
            const count = Math.floor(Math.random() * (remaining / 10));
            data[state] = count;
        }
        if (!data[state]) data[state] = 0;
    });

    return data;
};

export function SpecialtyMap({ specialtyName, doctorCount, distribution }: SpecialtyMapProps) {
    const [data, setData] = useState<Record<string, number>>({});
    const [mounted, setMounted] = useState(false);
    const [hoveredState, setHoveredState] = useState<{ name: string; count: number } | null>(null);

    useEffect(() => {
        setMounted(true);
        if (distribution && Object.keys(distribution).length > 0) {
            setData(distribution);
        } else {
            // Generate distribution safely if count > 0, else 0
            if (doctorCount > 0) {
                setData(generateMockData(doctorCount));
            } else {
                setData({});
            }
        }
    }, [doctorCount, distribution]);

    const colorScale = useMemo(() => {
        const values = Object.values(data).filter(v => v > 0);
        return scaleQuantile<string>()
            .domain(values.length > 0 ? values : [0])
            .range([
                "#eff6ff", // blue-50
                "#dbeafe", // blue-100
                "#bfdbfe", // blue-200
                "#93c5fd", // blue-300
                "#60a5fa", // blue-400
                "#3b82f6", // blue-500
                "#2563eb", // blue-600
                "#1d4ed8", // blue-700
            ]);
    }, [data]);

    if (!mounted) return (
        <div className="h-full w-full flex items-center justify-center bg-muted/20">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 relative overflow-hidden"
        >
            {/* Header / Legend Overlay */}
            <div className="absolute top-6 left-6 z-20 pointer-events-none">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h4 className="text-xl font-black text-foreground tracking-tight drop-shadow-sm">Distribución Nacional</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        {doctorCount} especialistas activos
                    </p>
                </motion.div>
            </div>

            {/* Interactive Map */}
            <div className="w-full h-full pt-12 pb-4 px-4">
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                        scale: 3200,
                        center: [-66, 7] // Center on Venezuela
                    }}
                    className="w-full h-full drop-shadow-xl"
                >
                    <ZoomableGroup zoom={1} maxZoom={3}>
                        <Geographies geography={GEO_URL}>
                            {({ geographies }: { geographies: any[] }) =>
                                geographies.map((geo: any) => {
                                    const stateName = geo.properties.NAME_1 || geo.properties.name;
                                    const count = data[stateName] || 0;
                                    const isHovered = hoveredState?.name === stateName;

                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill={count > 0 ? colorScale(count) : "#f8fafc"}
                                            stroke={isHovered ? "#3b82f6" : "#cbd5e1"}
                                            strokeWidth={isHovered ? 2 : 0.5}
                                            className={cn(
                                                "outline-none transition-all duration-300 cursor-pointer",
                                                isHovered ? "opacity-100 z-10" : "opacity-90 hover:opacity-100"
                                            )}
                                            onMouseEnter={() => setHoveredState({ name: stateName, count })}
                                            onMouseLeave={() => setHoveredState(null)}
                                            style={{
                                                default: { outline: "none" },
                                                hover: { fill: count > 0 ? colorScale(count) : "#e2e8f0", outline: "none" },
                                                pressed: { outline: "none" },
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ZoomableGroup>
                </ComposableMap>
            </div>

            {/* Dynamic Data Card Overlay */}
            <AnimatePresence>
                {hoveredState && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: 10, x: 10 }}
                        className="absolute bottom-6 right-6 z-30 min-w-[220px]"
                    >
                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-white/10 p-5 rounded-2xl shadow-2xl ring-1 ring-black/5">
                            <h5 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary fill-primary/20" />
                                {hoveredState.name}
                            </h5>
                            <div className="h-px w-full bg-border/50 my-3" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Especialistas</span>
                                <span className={cn(
                                    "text-2xl font-black",
                                    hoveredState.count > 0 ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {hoveredState.count}
                                </span>
                            </div>
                            {hoveredState.count === 0 && (
                                <p className="text-xs text-muted-foreground mt-2 italic">
                                    No hay registros en esta zona
                                </p>
                            )}
                            {hoveredState.count > 0 && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md w-fit">
                                    <Users className="w-3 h-3" />
                                    Disponible ahora
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Simple Legend for cleaner look */}
            {!hoveredState && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-6 right-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground"
                >
                    Pasa el cursor por el mapa
                </motion.div>
            )}
        </motion.div>
    );
}
