/**
 * @file state-city-selector.tsx
 * @description Selectores de Estado y Ciudad de Venezuela con filtro inteligente.
 * @module Components/UI
 */

"use client";

import { useState, useMemo } from "react";
import { Label } from "./label";
import { VENEZUELA_ESTADOS, getCiudadesByEstado } from "./lib/data/venezuela-data";
import { ChevronDown, Search } from "lucide-react";

interface StateCitySelectorProps {
    /** Estado seleccionado (código) */
    selectedEstadoCode: string;
    /** Ciudad seleccionada */
    selectedCiudad: string;
    /** Callback cuando cambia el estado */
    onEstadoChange: (estadoCode: string) => void;
    /** Callback cuando cambia la ciudad */
    onCiudadChange: (ciudad: string) => void;
    /** Deshabilitar selectores */
    disabled?: boolean;
}

/**
 * Componente de selector de Estado y Ciudad de Venezuela
 * El usuario primero debe seleccionar estado, luego ciudad
 */
export function StateCitySelector({
    selectedEstadoCode,
    selectedCiudad,
    onEstadoChange,
    onCiudadChange,
    disabled = false,
}: StateCitySelectorProps) {
    const [estadoFilter, setEstadoFilter] = useState("");
    const [ciudadFilter, setCiudadFilter] = useState("");
    const [showEstadoDropdown, setShowEstadoDropdown] = useState(false);
    const [showCiudadDropdown, setShowCiudadDropdown] = useState(false);

    // Filtrar estados según búsqueda
    const filteredEstados = useMemo(() => {
        return VENEZUELA_ESTADOS.filter((estado: { name: string }) =>
            estado.name.toLowerCase().includes(estadoFilter.toLowerCase())
        );
    }, [estadoFilter]);

    // Obtener ciudades del estado seleccionado
    const ciudadesDisponibles = useMemo(() => {
        if (!selectedEstadoCode) return [];
        return getCiudadesByEstado(selectedEstadoCode);
    }, [selectedEstadoCode]);

    // Filtrar ciudades según búsqueda
    const filteredCiudades = useMemo(() => {
        return ciudadesDisponibles.filter((ciudad: string) =>
            ciudad.toLowerCase().includes(ciudadFilter.toLowerCase())
        );
    }, [ciudadesDisponibles, ciudadFilter]);

    // Nombre del estado seleccionado
    const selectedEstadoName = VENEZUELA_ESTADOS.find(e => e.code === selectedEstadoCode)?.name || "";

    const handleEstadoSelect = (estadoCode: string) => {
        onEstadoChange(estadoCode);
        onCiudadChange(""); // Reset ciudad cuando cambia estado
        setShowEstadoDropdown(false);
        setEstadoFilter("");
    };

    const handleCiudadSelect = (ciudad: string) => {
        onCiudadChange(ciudad);
        setShowCiudadDropdown(false);
        setCiudadFilter("");
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Selector de Estado */}
            <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Estado *
                </Label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => !disabled && setShowEstadoDropdown(!showEstadoDropdown)}
                        disabled={disabled}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-blue-300 dark:hover:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none flex items-center justify-between transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className={selectedEstadoName ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}>
                            {selectedEstadoName || "Selecciona un estado"}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showEstadoDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showEstadoDropdown && (
                        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                            {/* Search Input */}
                            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar estado..."
                                        value={estadoFilter}
                                        onChange={(e) => setEstadoFilter(e.target.value)}
                                        className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            {/* Estados List */}
                            <div className="max-h-60 overflow-y-auto">
                                {filteredEstados.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-gray-400 text-center">
                                        No se encontraron estados
                                    </div>
                                ) : (
                                    filteredEstados.map((estado) => (
                                        <button
                                            key={estado.code}
                                            type="button"
                                            onClick={() => handleEstadoSelect(estado.code)}
                                            className={`
                        w-full px-3 py-2 text-sm text-left transition-colors
                        ${estado.code === selectedEstadoCode
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }
                      `}
                                        >
                                            {estado.name}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Selector de Ciudad */}
            <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Ciudad *
                </Label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => selectedEstadoCode && !disabled && setShowCiudadDropdown(!showCiudadDropdown)}
                        disabled={!selectedEstadoCode || disabled}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-blue-300 dark:hover:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none flex items-center justify-between transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className={selectedCiudad ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}>
                            {selectedCiudad || (selectedEstadoCode ? "Selecciona una ciudad" : "Primero selecciona un estado")}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showCiudadDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showCiudadDropdown && selectedEstadoCode && (
                        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                            {/* Search Input */}
                            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar ciudad..."
                                        value={ciudadFilter}
                                        onChange={(e) => setCiudadFilter(e.target.value)}
                                        className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            {/* Ciudades List */}
                            <div className="max-h-60 overflow-y-auto">
                                {filteredCiudades.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-gray-400 text-center">
                                        No se encontraron ciudades
                                    </div>
                                ) : (
                                    filteredCiudades.map((ciudad: string) => (
                                        <button
                                            key={ciudad}
                                            type="button"
                                            onClick={() => handleCiudadSelect(ciudad)}
                                            className={`
                        w-full px-3 py-2 text-sm text-left transition-colors
                        ${ciudad === selectedCiudad
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }
                      `}
                                        >
                                            {ciudad}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
