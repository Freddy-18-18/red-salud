/**
 * @file specialty-combobox.tsx
 * @description Combobox con autocompletado para especialidades médicas.
 * Filtra especialidades en tiempo real basado en las permitidas por SACS.
 * @module UI/SpecialtyCombobox
 * 
 * @example
 * <SpecialtyCombobox 
 *   value="Cardiología" 
 *   onChange={(value) => console.log(value)}
 *   allowedSpecialties={["Cardiología", "Pediatría", "Ginecología"]}
 * />
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/**
 * Props del componente SpecialtyCombobox
 */
interface SpecialtyComboboxProps {
    /** Valor seleccionado actual */
    value?: string;
    /** Callback cuando cambia el valor */
    onChange?: (value: string) => void;
    /** Lista de especialidades permitidas (desde SACS) */
    allowedSpecialties: string[];
    /** Especialidades ya seleccionadas (para evitar duplicados) */
    excludeSpecialties?: string[];
    /** Placeholder del input */
    placeholder?: string;
    /** Si el input está deshabilitado */
    disabled?: boolean;
    /** Si el campo es de solo lectura (para especialidades verificadas) */
    readOnly?: boolean;
    /** Clase CSS adicional */
    className?: string;
    /** ID del input */
    id?: string;
}

/**
 * Componente de combobox con autocompletado para especialidades médicas
 */
export function SpecialtyCombobox({
    value = "",
    onChange,
    allowedSpecialties,
    excludeSpecialties = [],
    placeholder = "Buscar especialidad...",
    disabled = false,
    readOnly = false,
    className,
    id,
}: SpecialtyComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState(value);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Filtrar especialidades basado en búsqueda y exclusiones
    const filteredSpecialties = allowedSpecialties.filter((specialty) => {
        // No mostrar las ya seleccionadas
        if (excludeSpecialties.includes(specialty)) return false;
        // Filtrar por texto de búsqueda
        if (!searchValue) return true;
        return specialty.toLowerCase().includes(searchValue.toLowerCase());
    });

    // Sincronizar valor externo
    useEffect(() => {
        setSearchValue(value);
    }, [value]);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Restaurar el valor si no hay selección válida
                if (!allowedSpecialties.includes(searchValue)) {
                    setSearchValue(value);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchValue, value, allowedSpecialties]);

    // Scroll al elemento highlighted
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const item = listRef.current.children[highlightedIndex] as HTMLElement;
            if (item) {
                item.scrollIntoView({ block: "nearest" });
            }
        }
    }, [highlightedIndex]);

    /**
     * Selecciona una especialidad
     */
    const handleSelect = (specialty: string) => {
        setSearchValue(specialty);
        onChange?.(specialty);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    /**
     * Maneja cambios en el input de búsqueda
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchValue(newValue);
        setIsOpen(true);
        setHighlightedIndex(-1);
    };

    /**
     * Maneja navegación por teclado
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                } else {
                    setHighlightedIndex((prev) =>
                        prev < filteredSpecialties.length - 1 ? prev + 1 : prev
                    );
                }
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredSpecialties[highlightedIndex]) {
                    handleSelect(filteredSpecialties[highlightedIndex]);
                } else if (filteredSpecialties.length === 1) {
                    handleSelect(filteredSpecialties[0]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
            case "Tab":
                setIsOpen(false);
                break;
        }
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* Input con icono de búsqueda */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                    ref={inputRef}
                    id={id}
                    type="text"
                    value={searchValue}
                    onChange={handleInputChange}
                    onFocus={() => !readOnly && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={readOnly}
                    className={cn(
                        "pl-9 pr-9",
                        readOnly && "bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                    )}
                    aria-expanded={isOpen}
                    aria-autocomplete="list"
                    aria-controls="specialty-listbox"
                    role="combobox"
                />
                <button
                    type="button"
                    onClick={() => !disabled && !readOnly && setIsOpen(!isOpen)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    tabIndex={-1}
                    disabled={disabled || readOnly}
                    aria-label="Mostrar opciones"
                >
                    <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                </button>
            </div>

            {/* Dropdown de opciones */}
            {isOpen && filteredSpecialties.length > 0 && (
                <ul
                    ref={listRef}
                    id="specialty-listbox"
                    role="listbox"
                    className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-lg py-1"
                >
                    {filteredSpecialties.map((specialty, index) => (
                        <li
                            key={specialty}
                            role="option"
                            aria-selected={specialty === value}
                            className={cn(
                                "relative flex items-center justify-between px-3 py-2 cursor-pointer text-sm",
                                index === highlightedIndex && "bg-blue-50 dark:bg-blue-900/30",
                                specialty === value && "font-medium text-blue-600 dark:text-blue-400",
                                specialty !== value && "text-gray-900 dark:text-gray-100",
                                "hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                            onClick={() => handleSelect(specialty)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            <span>{specialty}</span>
                            {specialty === value && (
                                <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {/* Mensaje cuando no hay resultados */}
            {isOpen && filteredSpecialties.length === 0 && searchValue && (
                <div className="absolute z-50 mt-1 w-full rounded-md bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-lg p-3 text-sm text-gray-500 dark:text-gray-400">
                    No se encontraron especialidades para "{searchValue}"
                </div>
            )}
        </div>
    );
}
