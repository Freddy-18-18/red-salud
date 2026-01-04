/**
 * @file specialty-multi-select.tsx
 * @description Componente de selección múltiple de especialidades con autocompletado y Ghost Text.
 * Conectado a la API pública para evitar restricciones RLS.
 * Muestra las selecciones como tags dentro del input.
 * @module UI/SpecialtyMultiSelect
 */

"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, Check, Loader2, Stethoscope, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Specialty {
    id: string;
    name: string;
    doctorCount?: number;
}

interface SpecialtyMultiSelectProps {
    /** Array de nombres de especialidades seleccionadas */
    selected: string[];
    /** Callback al cambiar la selección */
    onChange: (values: string[]) => void;
    /** Especialidades a excluir (ej: la principal) */
    exclude?: string[];
    /** Placeholder del input */
    placeholder?: string;
    /** Clase CSS adicional */
    className?: string;
    /** Si está deshabilitado */
    disabled?: boolean;
}

export function SpecialtyMultiSelect({
    selected,
    onChange,
    exclude = [],
    placeholder = "Buscar especialidades...",
    className,
    disabled = false,
}: SpecialtyMultiSelectProps) {
    const [query, setQuery] = useState("");
    const [items, setItems] = useState<Specialty[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [ghostText, setGhostText] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Cargar especialidades desde API al montar
    useEffect(() => {
        async function fetchSpecialties() {
            try {
                const res = await fetch("/api/public/doctor-specialties");
                const json = await res.json();

                if (json.success && Array.isArray(json.data)) {
                    setItems(json.data);
                } else {
                    setItems([]);
                }
            } catch (err) {
                console.error("Error fetching specialties:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchSpecialties();
    }, []);

    // Filtrar items y Calcular Ghost Text
    const filteredItems = useMemo(() => {
        if (!query) return [];

        const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedQuery = normalize(query);

        return items
            .filter((item) => {
                // Excluir ya seleccionados y excluidos explícitamente
                if (selected.includes(item.name)) return false;
                if (exclude.includes(item.name)) return false;

                // Match por inicio de palabra o contenido
                const normalizedName = normalize(item.name);
                return normalizedName.includes(normalizedQuery);
            })
            .sort((a, b) => {
                // Priorizar coincidencias que empiezan con el query (para el Ghost Text)
                const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const normalizedQuery = normalize(query);
                const aName = normalize(a.name);
                const bName = normalize(b.name);

                const aStarts = aName.startsWith(normalizedQuery);
                const bStarts = bName.startsWith(normalizedQuery);

                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;
                return a.name.localeCompare(b.name);
            });
    }, [items, query, selected, exclude]);

    // Actualizar Ghost Text basado en el primer resultado
    useEffect(() => {
        if (filteredItems.length > 0 && query) {
            const topMatch = filteredItems[0].name;
            const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (normalize(topMatch).startsWith(normalize(query))) {
                const matchSuffix = topMatch.slice(query.length);
                setGhostText(query + matchSuffix);
            } else {
                setGhostText("");
            }
        } else {
            setGhostText("");
        }
        // Reset index on query change
        setHighlightedIndex(0);
    }, [filteredItems, query]);

    // Manejar clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Scroll al item destacado
    useEffect(() => {
        if (isOpen && listRef.current) {
            const activeItem = listRef.current.children[highlightedIndex] as HTMLElement;
            if (activeItem) {
                activeItem.scrollIntoView({ block: "nearest" });
            }
        }
    }, [highlightedIndex, isOpen]);

    const handleSelect = (specialtyName: string) => {
        onChange([...selected, specialtyName]);
        setQuery("");
        setGhostText("");
        setIsOpen(true); // Mantener abierto
        inputRef.current?.focus();
    };

    const handleRemove = (specialtyName: string) => {
        onChange(selected.filter((s) => s !== specialtyName));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Autocompletar con Tab o Flecha Derecha si hay Ghost Text
        if ((e.key === "Tab" || e.key === "ArrowRight") && ghostText && ghostText.length > query.length) {
            e.preventDefault();
            setQuery(ghostText);
            return;
        }

        if (e.key === "Backspace" && !query && selected.length > 0) {
            handleRemove(selected[selected.length - 1]);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!isOpen && query) setIsOpen(true);
            else if (filteredItems.length > 0) setHighlightedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (isOpen && filteredItems[highlightedIndex]) {
                handleSelect(filteredItems[highlightedIndex].name);
            } else if (query && filteredItems.length > 0) {
                // Si no está abierto pero hay un top match (por ghost text), seleccionar el primero
                handleSelect(filteredItems[0].name);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div ref={containerRef} className={cn("relative group", className)}>
            <div
                className={cn(
                    "flex flex-wrap items-center gap-2 p-2 min-h-[44px] rounded-xl border border-input bg-background/50 backdrop-blur-sm ring-offset-background transition-all duration-300",
                    "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary",
                    disabled && "opacity-50 cursor-not-allowed bg-muted"
                )}
                onClick={() => !disabled && inputRef.current?.focus()}
            >
                <Search className="h-4 w-4 text-muted-foreground ml-1" />

                {/* Chips de seleccionados */}
                <AnimatePresence mode="popLayout">
                    {selected.map((item) => (
                        <motion.div
                            key={item}
                            layout
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Badge
                                variant="secondary"
                                className="pl-2 pr-1 py-1 h-7 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 flex items-center gap-1 cursor-default"
                            >
                                {item}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(item);
                                    }}
                                    className="rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Input con Ghost Text Overlay */}
                <div className="flex-1 min-w-[200px] relative h-7">
                    {/* Ghost Text */}
                    {ghostText && query && ghostText.toLowerCase().startsWith(query.toLowerCase()) && (
                        <div className="absolute inset-0 flex items-center pointer-events-none select-none text-sm font-normal">
                            <span className="opacity-0 whitespace-pre">{query}</span>
                            <span className="text-muted-foreground/40 whitespace-pre">{ghostText.slice(query.length)}</span>
                        </div>
                    )}

                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => query && setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        placeholder={selected.length === 0 ? placeholder : ""}
                        className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground h-full relative z-10"
                        autoComplete="off"
                        autoCapitalize="off"
                        spellCheck={false}
                    />
                </div>

                {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />}
            </div>

            {/* Dropdown de resultados */}
            <AnimatePresence>
                {isOpen && query && filteredItems.length > 0 && !disabled && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 mt-2 w-full max-h-[280px] overflow-hidden rounded-xl border border-border/50 bg-popover text-popover-foreground shadow-xl backdrop-blur-xl"
                    >
                        {/* Header pequeño para contexto */}
                        <div className="px-3 py-1.5 bg-muted/30 border-b border-border/30 text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex justify-between">
                            <span>Sugerencias</span>
                            <span className="opacity-70">Tab ↹ autocompletar</span>
                        </div>

                        <ul ref={listRef} className="overflow-y-auto max-h-[250px] custom-scrollbar p-1">
                            {filteredItems.map((item, index) => (
                                <li
                                    key={item.id}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none transition-colors",
                                        index === highlightedIndex ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
                                    )}
                                    onClick={() => handleSelect(item.name)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                >
                                    <div className={cn(
                                        "mr-3 h-8 w-8 rounded-md flex items-center justify-center transition-colors",
                                        index === highlightedIndex ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                    )}>
                                        <Stethoscope className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium leading-none">{item.name}</span>
                                        {item.doctorCount !== undefined && (
                                            <span className="text-[10px] text-muted-foreground mt-0.5">
                                                {item.doctorCount > 0 ? `${item.doctorCount} colegas` : "Nueva especialidad"}
                                            </span>
                                        )}
                                    </div>
                                    {index === highlightedIndex && (
                                        <Check className="ml-auto h-4 w-4 opacity-50" />
                                    )}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
