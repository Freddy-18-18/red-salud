/**
 * @file office-quick-selector-modal.tsx
 * @description Selector de consultorio con modal/panel expandible (Opción B).
 * @module Components/Dashboard
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Check, Building2 } from "lucide-react";
import { Button } from "@red-salud/design-system";

interface Office {
    id: string;
    nombre: string;
    direccion?: string;
    ciudad?: string;
    estado?: string;
    telefono?: string;
}

interface OfficeQuickSelectorModalProps {
    /** Consultorio actual */
    currentOffice: Office;
    /** Lista de todos los consultorios */
    offices: Office[];
    /** Callback cuando cambia el consultorio */
    onChange: (officeId: string) => void;
}

/**
 * Selector de consultorio tipo modal/panel
 * Opción B - Más información visible, mejor para móviles
 */
export function OfficeQuickSelectorModal({
    currentOffice,
    offices,
    onChange
}: OfficeQuickSelectorModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (officeId: string) => {
        onChange(officeId);
        setIsOpen(false);
    };

    // Si solo hay un consultorio, no mostrar botón
    if (offices.length <= 1) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {currentOffice.nombre}
                </span>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
                <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {currentOffice.nombre}
                </span>
                <span className="text-xs text-blue-500 dark:text-blue-400">
                    ({offices.length})
                </span>
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-2xl z-50 max-h-[80vh] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                        Seleccionar Consultorio
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Offices List */}
                            <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
                                {offices.map((office) => {
                                    const isSelected = office.id === currentOffice.id;
                                    return (
                                        <button
                                            key={office.id}
                                            onClick={() => handleSelect(office.id)}
                                            className={`
                        w-full p-4 rounded-lg border-2 transition-all text-left
                        ${isSelected
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                                                }
                      `}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {isSelected ? (
                                                        <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                                                            <Check className="h-3 w-3 text-white" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className={`font-semibold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                                                        {office.nombre}
                                                    </div>
                                                    {office.direccion && (
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            📍 {office.direccion}
                                                            {office.ciudad && `, ${office.ciudad}`}
                                                            {office.estado && `, ${office.estado}`}
                                                        </div>
                                                    )}
                                                    {office.telefono && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            ☎️ {office.telefono}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                                <Button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full"
                                    variant="outline"
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
