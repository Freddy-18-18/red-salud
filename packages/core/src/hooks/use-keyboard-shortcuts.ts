"use client";

import { useEffect, useCallback } from 'react';

// Atajos predefinidos (Defaults)
export const DEFAULT_SHORTCUTS = {
    NEW_APPOINTMENT: { key: 'n', description: 'Nueva cita' },
    TODAY: { key: 't', description: 'Ir a hoy' },
    NEXT_WEEK: { key: 'ArrowRight', description: 'Semana siguiente' },
    PREV_WEEK: { key: 'ArrowLeft', description: 'Semana anterior' },
    DAY_VIEW: { key: 'd', description: 'Vista día' },
    WEEK_VIEW: { key: 'w', description: 'Vista semana' },
    MONTH_VIEW: { key: 'm', description: 'Vista mes' },
    LIST_VIEW: { key: 'l', description: 'Vista lista' },
    SEARCH: { key: 'f', ctrl: true, description: 'Buscar' },
    REFRESH: { key: 'r', ctrl: true, description: 'Actualizar' },
    HELP: { key: '?', shift: true, description: 'Mostrar ayuda' },
};

const STORAGE_KEY = 'red-salud-shortcuts';

export function getStoredShortcuts() {
    if (typeof window === 'undefined') return DEFAULT_SHORTCUTS;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? { ...DEFAULT_SHORTCUTS, ...JSON.parse(stored) } : DEFAULT_SHORTCUTS;
    } catch (e) {
        return DEFAULT_SHORTCUTS;
    }
}

export function saveShortcut(action: string, key: string) {
    if (typeof window === 'undefined') return;
    const current = getStoredShortcuts();
    current[action as keyof typeof current] = { ...current[action as keyof typeof current], key };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    // Disparar evento para actualizar otros componentes
    window.dispatchEvent(new Event('shortcuts-updated'));
}

export function useKeyboardShortcuts(handlers: { key?: string; handler: () => void; description?: string }[]) {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // No disparar si estamos en un input
        if (['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) return;

        const pressedKey = event.key.toLowerCase();
        const isCtrl = event.ctrlKey || event.metaKey;
        const isShift = event.shiftKey;
        const isAlt = event.altKey;

        // Obtener shortcuts actualizados
        const storedShortcuts = Object.values(getStoredShortcuts()) as Array<{ key: string; description: string; ctrl?: boolean; shift?: boolean }>;

        for (const handler of handlers) {
            let effectiveKey = handler.key;

            // Attempt to find dynamic override by description
            if (handler.description) {
                const match = storedShortcuts.find(s => s.description === handler.description);
                if (match) {
                    effectiveKey = match.key;
                }
            }

            // Check match
            const keyMatch = effectiveKey?.toLowerCase() === pressedKey;

            // Simplified match for the single-key customization requested:
            if (keyMatch && !isCtrl && !isShift && !isAlt) {
                event.preventDefault();
                handler.handler();
                return;
            }
        }
    }, [handlers]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
