/**
 * @file time-picker.tsx
 * @description Selector profesional de tiempo con incrementos de 15 minutos.
 * @module Components/UI
 */

"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface TimePickerProps {
    /** Valor actual en formato HH:mm */
    value: string;
    /** Callback cuando cambia el valor */
    onChange: (value: string) => void;
    /** Clase CSS adicional */
    className?: string;
}

/**
 * Genera array de opciones de tiempo en incrementos de 15 minutos
 */
const generateTimeOptions = (): string[] => {
    const options: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const h = hour.toString().padStart(2, '0');
            const m = minute.toString().padStart(2, '0');
            options.push(`${h}:${m}`);
        }
    }
    return options;
};

const TIME_OPTIONS = generateTimeOptions();

/**
 * Componente selector de tiempo profesional
 */
export function TimePicker({ value, onChange, className = "" }: TimePickerProps) {
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

    // Scroll automático al valor seleccionado al abrir
    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const selectedOption = dropdownRef.current.querySelector(`[data-value="${value}"]`);
            if (selectedOption) {
                selectedOption.scrollIntoView({ block: 'center' });
            }
        }
    }, [isOpen, value]);

    const handleSelect = (time: string) => {
        onChange(time);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-blue-300 dark:hover:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none flex items-center justify-between transition-all"
            >
                <span className="font-medium">{value}</span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {TIME_OPTIONS.map((time) => (
                        <button
                            key={time}
                            type="button"
                            data-value={time}
                            onClick={() => handleSelect(time)}
                            className={`
                w-full px-3 py-2 text-sm text-left transition-colors
                ${time === value
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }
              `}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
