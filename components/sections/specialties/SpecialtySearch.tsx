/**
 * @file SpecialtySearch.tsx
 * @description Componente de búsqueda de especialidades médicas inline.
 * Características:
 * - Autocompletado Ghost Text
 * - Límite visual de 4 sugerencias
 * - Navegación por teclado con auto-scroll
 */

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, ArrowRight, Activity, ChevronRight, Stethoscope } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { slugify } from "@/lib/utils";

interface Specialty {
    id: string;
    name: string;
    doctorCount: number;
}

interface SpecialtySearchProps {
    items: Specialty[];
    onSelect: (id: string, rowIndex: 1 | 2) => void;
    onClear: () => void;
    row1Items: Specialty[];
    row2Items: Specialty[];
}

export function SpecialtySearch({
    items,
    onSelect,
    onClear,
    row1Items,
    row2Items,
}: SpecialtySearchProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Specialty[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [ghostText, setGhostText] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                handleCollapse();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filtrar resultados y generar Ghost Text
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setSelectedIndex(0);
            setGhostText("");
            return;
        }

        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Algoritmo de búsqueda
        // Algoritmo de búsqueda mejorado: Inicio de palabra
        const filtered = items
            .filter((item) => {
                const normalizedName = item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                // Dividir en palabras y ver si alguna empieza con el query
                const words = normalizedName.split(" ");
                // O checkear si el string completo empieza con el query (para mayor precisión)
                return words.some(word => word.startsWith(normalizedQuery));
            })
            .sort((a, b) => {
                const aName = a.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const bName = b.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                const aStarts = aName.startsWith(normalizedQuery);
                const bStarts = bName.startsWith(normalizedQuery);

                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;
                return a.name.localeCompare(b.name);
            });

        setResults(filtered);
        setSelectedIndex(0);

        // Calcular Ghost Text
        if (filtered.length > 0) {
            const topMatch = filtered[0].name;
            const normalizedTop = topMatch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (normalizedTop.startsWith(normalizedQuery)) {
                const matchSuffix = topMatch.slice(query.length);
                setGhostText(query + matchSuffix);
            } else {
                setGhostText("");
            }
        } else {
            setGhostText("");
        }
    }, [query, items]);

    // Scroll automático al item seleccionado
    useEffect(() => {
        if (results.length > 0 && listRef.current) {
            // Encontrar el elemento activo por su atributo data-index
            const activeItem = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
            if (activeItem) {
                activeItem.scrollIntoView({
                    block: "nearest",
                    behavior: "smooth"
                });
            }
        }
    }, [selectedIndex, results]);

    // Focus input al expandir
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isExpanded]);

    const handleCollapse = () => {
        setIsExpanded(false);
        setQuery("");
        setResults([]);
        setGhostText("");
        onClear();
    };

    const getRowIndex = useCallback(
        (id: string): 1 | 2 => {
            return row1Items.some((item) => item.id === id) ? 1 : 2;
        },
        [row1Items]
    );

    const handleSelectItem = (item: Specialty) => {
        const rowIndex = getRowIndex(item.id);
        onSelect(item.id, rowIndex);
        setIsExpanded(false);
        setQuery("");
        setGhostText("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") handleCollapse();

        // Autocompletar con Tab o Flecha Derecha
        if ((e.key === "Tab" || e.key === "ArrowRight") && ghostText) {
            if (inputRef.current && inputRef.current.selectionStart === query.length) {
                e.preventDefault();
                setQuery(ghostText);
                return;
            }
        }

        if (!results.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            handleSelectItem(results[selectedIndex]);
        }
    };

    return (
        <div ref={containerRef} className="relative z-50 flex justify-center w-full h-[60px] px-4 md:px-0">
            <motion.div
                layout
                initial={false}
                animate={{
                    width: isExpanded ? "100%" : "auto",
                    maxWidth: isExpanded ? "600px" : "280px",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn(
                    "relative flex items-center overflow-visible shadow-xl",
                    isExpanded
                        ? "bg-white dark:bg-slate-900 ring-2 ring-primary/20 rounded-2xl"
                        : "cursor-pointer bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:scale-[1.02] rounded-2xl border border-white/20 dark:border-white/10"
                )}
                onClick={() => !isExpanded && setIsExpanded(true)}
            >
                <AnimatePresence mode="wait">
                    {!isExpanded ? (
                        /* BOTÓN COLAPSADO */
                        <motion.div
                            key="button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 px-6 py-3.5 w-full"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/25 flex-shrink-0">
                                <Search className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-left min-w-[160px] hidden xs:block">
                                <span className="block text-sm font-bold text-foreground">
                                    Buscar Especialidad
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                    Encuentra tu especialista
                                </span>
                            </div>
                            <span className="block xs:hidden text-sm font-bold text-foreground">Buscar</span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
                        </motion.div>
                    ) : (
                        /* INPUT EXPANDIDO */
                        <motion.div
                            key="input"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="px-4 w-full flex items-center h-[60px] relative"
                        >
                            <Search className="w-5 h-5 text-primary mr-3 flex-shrink-0 z-10" />

                            <div className="flex-1 relative h-full flex items-center">
                                {/* GHOST TEXT OVERLAY */}
                                {ghostText && query && ghostText.toLowerCase().startsWith(query.toLowerCase()) && (
                                    <div className="absolute inset-0 flex items-center pointer-events-none select-none text-lg font-sans overflow-hidden whitespace-pre">
                                        <span className="opacity-0">{query}</span>
                                        <span className="text-muted-foreground/40">{ghostText.slice(query.length)}</span>
                                    </div>
                                )}

                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Escribe una especialidad..."
                                    className="w-full bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground/50 h-full relative z-10 font-sans"
                                    autoComplete="off"
                                    spellCheck={false}
                                    autoCapitalize="off"
                                />
                            </div>

                            {query ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setQuery("");
                                        setGhostText("");
                                        inputRef.current?.focus();
                                    }}
                                    className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors mr-2 z-10"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            ) : null}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCollapse();
                                }}
                                className="p-2 rounded-xl hover:bg-muted text-sm font-medium text-muted-foreground transition-colors z-10"
                            >
                                Cancelar
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* DROPDOWN DE RESULTADOS */}
                <AnimatePresence>
                    {isExpanded && (query || results.length > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            // Altura limitada para mostrar ~4 items (60px * 4 = 240px)
                            className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-border/50 overflow-hidden z-50 flex flex-col max-h-[260px]"
                        >
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {results.length > 0 ? (
                                    <ul ref={listRef} className="py-2">
                                        <li className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/30 flex justify-between sticky top-0 backdrop-blur-sm z-10">
                                            <span>Sugerencias</span>
                                            {ghostText && (
                                                <span className="hidden sm:inline-block opacity-70">
                                                    Tab ↹ autocompletar
                                                </span>
                                            )}
                                        </li>
                                        {results.map((item, index) => (
                                            <li key={item.id} data-index={index}>
                                                <button
                                                    onClick={() => handleSelectItem(item)}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                    className={cn(
                                                        "w-full text-left px-4 py-3 flex items-center justify-between transition-colors border-b border-border/30 last:border-0",
                                                        selectedIndex === index ? "bg-primary/5 text-primary" : "hover:bg-muted/50 text-foreground"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3 truncate">
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                                            selectedIndex === index ? "bg-primary/10" : "bg-muted"
                                                        )}>
                                                            <Stethoscope className={cn("w-4 h-4", selectedIndex === index ? "text-primary" : "text-muted-foreground")} />
                                                        </div>
                                                        <div className="truncate">
                                                            <span className="font-medium block leading-tight truncate">{item.name}</span>
                                                            <span className="text-xs text-muted-foreground/80">
                                                                {item.doctorCount > 0 ? `${item.doctorCount} doctores` : "Consultar"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {selectedIndex === index && (
                                                        <ChevronRight className="w-4 h-4 opacity-50 flex-shrink-0 ml-2" />
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : query ? (
                                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-48">
                                        <Search className="w-8 h-8 mb-3 opacity-20" />
                                        <p>No hay resultados de "{query}"</p>
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Populares</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["Cardiología", "Pediatría", "Dermatología", "Ginecología"].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setQuery(s)}
                                                    className="px-3 py-2 rounded-lg bg-muted/40 hover:bg-primary/10 hover:text-primary text-sm font-medium transition-colors text-left flex items-center gap-2"
                                                >
                                                    <Activity className="w-3 h-3 opacity-50" />
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
