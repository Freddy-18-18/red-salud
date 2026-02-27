/**
 * @file office-quick-selector-dropdown.tsx
 * @description Selector compacto de consultorio (Opción A: Dropdown).
 * @module Components/Dashboard
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";

interface Office {
    id: string;
    nombre: string;
    direccion?: string;
    ciudad?: string;
}

interface OfficeQuickSelectorDropdownProps {
    /** Consultorio actual */
    currentOffice: Office;
    /** Lista de todos los consultorios */
    offices: Office[];
    /** Callback cuando cambia el consultorio */
    onChange: (officeId: string) => void;
}

/**
 * Selector de consultorio tipo dropdown compacto
 * Opción A - Ideal para header/navbar
 */
export function OfficeQuickSelectorDropdown({
    currentOffice,
    offices,
    onChange
}: OfficeQuickSelectorDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (officeId: string) => {
        onChange(officeId);
        setIsOpen(false);
    };

    // Si solo hay un consultorio, no mostrar selector
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
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
                <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {currentOffice.nombre}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-blue-600 dark:text-blue-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-1 right-0 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-1">
                        {offices.map((office) => (
                            <button
                                key={office.id}
                                onClick={() => handleSelect(office.id)}
                                className={`
                  w-full flex items-start gap-2 px-3 py-2 rounded text-left transition-colors
                  ${office.id === currentOffice.id
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }
                `}
                            >
                                <div className="flex-shrink-0 mt-0.5">
                                    {office.id === currentOffice.id ? (
                                        <Check className="h-4 w-4 text-blue-600" />
                                    ) : (
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                        {office.nombre}
                                    </div>
                                    {office.direccion && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                            {office.direccion}
                                            {office.ciudad && `, ${office.ciudad}`}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
