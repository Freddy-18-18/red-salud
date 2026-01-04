/**
 * @file use-dashboard-widgets.ts
 * @description Hook para gestionar widgets del dashboard con persistencia en Supabase.
 * Sincroniza posiciones, modo y widgets ocultos entre dispositivos.
 * 
 * @module Dashboard/Hooks
 * 
 * @example
 * const { currentMode, setMode, getWidgetPositions, toggleWidgetVisibility } = useDashboardWidgets(doctorId);
 */

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
    DashboardState,
    DashboardMode,
    WidgetId,
    WidgetPosition,
} from '@/lib/types/dashboard-types';
import { DEFAULT_LAYOUTS as DEFAULTS } from '@/lib/types/dashboard-types';
import {
    getDashboardPreferences,
    saveDashboardPreferences,
    preferencesToState,
} from '@/lib/supabase/services/dashboard-preferences-service';

// ============================================================================
// TIPOS
// ============================================================================

interface UseDashboardWidgetsReturn {
    /** Estado completo del dashboard */
    state: DashboardState;
    /** Modo actual (simple/pro) */
    currentMode: DashboardMode;
    /** Si está cargando datos de Supabase */
    isLoading: boolean;
    /** Si hay cambios pendientes de guardar */
    hasUnsavedChanges: boolean;
    /** Cambiar modo del dashboard */
    setMode: (mode: DashboardMode) => void;
    /** Obtener posiciones de widgets para el modo actual */
    getWidgetPositions: () => WidgetPosition[];
    /** Actualizar posición de un widget */
    updateWidgetPosition: (id: WidgetId, position: Partial<WidgetPosition>) => void;
    /** Alternar visibilidad de un widget */
    toggleWidgetVisibility: (id: WidgetId) => void;
    /** Verificar si un widget es visible */
    isWidgetVisible: (id: WidgetId) => boolean;
    /** Resetear layout al valor por defecto */
    resetLayout: () => void;
    /** Guardar layout de posiciones */
    saveLayout: (positions: WidgetPosition[]) => void;
    /** Guardar todos los cambios manualmente */
    saveChanges: () => Promise<void>;
}

// ============================================================================
// ESTADO INICIAL
// ============================================================================

/** Estado por defecto mientras carga */
const DEFAULT_STATE: DashboardState = {
    currentMode: 'simple',
    layouts: DEFAULTS,
    hiddenWidgets: [],
};

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook para gestionar widgets del dashboard con persistencia en Supabase.
 * 
 * @param doctorId - UUID del médico (undefined si no autenticado)
 * @returns Funciones y estado para gestionar widgets
 */
export function useDashboardWidgets(doctorId?: string): UseDashboardWidgetsReturn {
    const [state, setState] = useState<DashboardState>(DEFAULT_STATE);
    const [isLoading, setIsLoading] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Ref para debounce de guardado
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ---------------------------------------------------------------------------
    // CARGAR PREFERENCIAS DESDE SUPABASE
    // ---------------------------------------------------------------------------

    useEffect(() => {
        const loadPreferences = async () => {
            if (!doctorId) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const result = await getDashboardPreferences(doctorId);
                if (result.success && result.data) {
                    const loadedState = preferencesToState(result.data);

                    // Merge con DEFAULT_LAYOUTS para incluir widgets nuevos
                    const mergedState: DashboardState = {
                        ...loadedState,
                        layouts: {
                            simple: mergeLayoutWithDefaults(loadedState.layouts.simple, DEFAULTS.simple),
                            pro: mergeLayoutWithDefaults(loadedState.layouts.pro, DEFAULTS.pro),
                        },
                    };

                    setState(mergedState);
                } else {
                    // Si no hay preferencias guardadas, usar defaults
                    setState(DEFAULT_STATE);
                }
            } catch (error) {
                console.error('[useDashboardWidgets] Error loading preferences:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPreferences();
    }, [doctorId]);

    /**
     * Merge layout del usuario con defaults para añadir widgets nuevos.
     * Mantiene las posiciones del usuario pero añade widgets que no tenga.
     */
    function mergeLayoutWithDefaults(
        userLayout: WidgetPosition[],
        defaultLayout: WidgetPosition[]
    ): WidgetPosition[] {
        const userWidgetIds = new Set(userLayout.map(w => w.id));

        // Encontrar widgets en defaults que el usuario no tiene
        const newWidgets = defaultLayout.filter(w => !userWidgetIds.has(w.id));

        // Retornar widgets del usuario + widgets nuevos
        return [...userLayout, ...newWidgets];
    }

    // ---------------------------------------------------------------------------
    // GUARDAR AUTOMÁTICO (debounced)
    // ---------------------------------------------------------------------------

    const debouncedSave = useCallback(async (newState: DashboardState) => {
        if (!doctorId) return;

        // Cancelar guardado pendiente
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Programar nuevo guardado (espera 1 segundo de inactividad)
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await saveDashboardPreferences(doctorId, {
                    current_mode: newState.currentMode,
                    layout_simple: newState.layouts.simple,
                    layout_pro: newState.layouts.pro,
                    hidden_widgets: newState.hiddenWidgets,
                });
                setHasUnsavedChanges(false);
                console.log('[useDashboardWidgets] Preferences saved to Supabase');
            } catch (error) {
                console.error('[useDashboardWidgets] Error saving preferences:', error);
            }
        }, 1000);
    }, [doctorId]);

    // ---------------------------------------------------------------------------
    // ACCIONES
    // ---------------------------------------------------------------------------

    /** Cambiar modo del dashboard */
    const setMode = useCallback((mode: DashboardMode) => {
        setState(prev => {
            const newState = { ...prev, currentMode: mode };
            debouncedSave(newState);
            setHasUnsavedChanges(true);
            return newState;
        });
    }, [debouncedSave]);

    /** Obtener posiciones de widgets para el modo actual */
    const getWidgetPositions = useCallback(() => {
        return state.layouts[state.currentMode];
    }, [state.currentMode, state.layouts]);

    /** Actualizar posición de un widget */
    const updateWidgetPosition = useCallback((id: WidgetId, position: Partial<WidgetPosition>) => {
        setState(prev => {
            const newState = {
                ...prev,
                layouts: {
                    ...prev.layouts,
                    [prev.currentMode]: prev.layouts[prev.currentMode].map(w =>
                        w.id === id ? { ...w, ...position } : w
                    ),
                },
            };
            debouncedSave(newState);
            setHasUnsavedChanges(true);
            return newState;
        });
    }, [debouncedSave]);

    /** Alternar visibilidad de un widget */
    const toggleWidgetVisibility = useCallback((id: WidgetId) => {
        setState(prev => {
            const newHiddenWidgets = prev.hiddenWidgets.includes(id)
                ? prev.hiddenWidgets.filter(w => w !== id)
                : [...prev.hiddenWidgets, id];

            const newState = {
                ...prev,
                hiddenWidgets: newHiddenWidgets,
            };
            debouncedSave(newState);
            setHasUnsavedChanges(true);
            return newState;
        });
    }, [debouncedSave]);

    /** Verificar si un widget es visible */
    const isWidgetVisible = useCallback((id: WidgetId) => {
        return !state.hiddenWidgets.includes(id);
    }, [state.hiddenWidgets]);

    /** Resetear layout al valor por defecto */
    const resetLayout = useCallback(() => {
        setState(prev => {
            const newState = {
                ...prev,
                layouts: DEFAULTS,
                hiddenWidgets: [],
            };
            debouncedSave(newState);
            setHasUnsavedChanges(true);
            return newState;
        });
    }, [debouncedSave]);

    /** Guardar layout de posiciones */
    const saveLayout = useCallback((positions: WidgetPosition[]) => {
        setState(prev => {
            const newState = {
                ...prev,
                layouts: {
                    ...prev.layouts,
                    [prev.currentMode]: positions,
                },
            };
            debouncedSave(newState);
            setHasUnsavedChanges(true);
            return newState;
        });
    }, [debouncedSave]);

    /** Guardar todos los cambios manualmente */
    const saveChanges = useCallback(async () => {
        if (!doctorId) return;

        // Cancelar guardado pendiente
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        try {
            await saveDashboardPreferences(doctorId, {
                current_mode: state.currentMode,
                layout_simple: state.layouts.simple,
                layout_pro: state.layouts.pro,
                hidden_widgets: state.hiddenWidgets,
            });
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('[useDashboardWidgets] Error saving preferences:', error);
        }
    }, [doctorId, state]);

    // Limpiar timeout al desmontar
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return {
        state,
        currentMode: state.currentMode,
        isLoading,
        hasUnsavedChanges,
        setMode,
        getWidgetPositions,
        updateWidgetPosition,
        toggleWidgetVisibility,
        isWidgetVisible,
        resetLayout,
        saveLayout,
        saveChanges,
    };
}
