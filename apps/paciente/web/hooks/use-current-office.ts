/**
 * @file use-current-office.ts
 * @description Hook para gestionar el consultorio actual del médico.
 * @module Hooks
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

/** Interfaz para consultorio */
interface Office {
    id: string;
    nombre: string;
    direccion?: string;
    ciudad?: string;
    estado?: string;
    es_principal: boolean;
}

/**
 * Hook para obtener y actualizar el consultorio actual del médico
 */
export function useCurrentOffice() {
    const [currentOffice, setCurrentOffice] = useState<Office | null>(null);
    const [allOffices, setAllOffices] = useState<Office[]>([]);
    const [loading, setLoading] = useState(true);

    /**
     * Actualiza el consultorio actual
     */
    const updateCurrentOffice = useCallback(async (officeId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Actualizar en base de datos
            const { error: upsertError } = await supabase
                .from("doctor_preferences")
                .upsert({
                    doctor_id: user.id,
                    current_office_id: officeId,
                }, {
                    onConflict: 'doctor_id'
                });

            if (upsertError) throw upsertError;

            // Actualizar estado local
            const office = allOffices.find(o => o.id === officeId);
            if (office) {
                setCurrentOffice(office);
            }
        } catch {
            console.error("[useCurrentOffice] Error updating:");
        }
    }, [allOffices]);

    /**
     * Carga el consultorio actual del médico
     */
    const loadCurrentOffice = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Cargar todos los consultorios activos
            const { data: offices, error: officesError } = await supabase
                .from("doctor_offices")
                .select("id, nombre, direccion, ciudad, estado, es_principal")
                .eq("doctor_id", user.id)
                .eq("activo", true)
                .order("es_principal", { ascending: false });

            if (officesError) {
                console.error("Error fetching offices:", officesError);
                throw officesError;
            }

            setAllOffices(offices || []);

            if (!offices || offices.length === 0) {
                setLoading(false);
                return;
            }

            // Intentar cargar preferencia guardada
            const { data: preference, error: prefError } = await supabase
                .from("doctor_preferences")
                .select("current_office_id")
                .eq("doctor_id", user.id)
                .maybeSingle();

            if (prefError) {
                console.warn("Error fetching preference:", prefError);
            }

            // Si hay preferencia, buscar ese consultorio
            if (preference?.current_office_id) {
                const office = offices.find(o => o.id === preference.current_office_id);
                if (office) {
                    setCurrentOffice(office);
                    setLoading(false);
                    return;
                }
            }

            // Si no hay preferencia o el consultorio no existe, usar el principal o el primero
            const defaultOffice = offices.find(o => o.es_principal) || offices[0];
            if (defaultOffice) {
                setCurrentOffice(defaultOffice);
                // Guardar preferencia si no existe
                await updateCurrentOffice(defaultOffice.id);
            }

        } catch (error) {
            console.error("[useCurrentOffice] Error:", error);
            if (typeof error === 'object' && error !== null) {
                try {
                    console.error("Error details:", JSON.stringify(error, null, 2));
                } catch {
                    // Ignore circular reference errors
                }
            }
        } finally {
            setLoading(false);
        }
    }, [updateCurrentOffice]);

    useEffect(() => {
        loadCurrentOffice();
    }, [loadCurrentOffice]);

    return {
        currentOffice,
        allOffices,
        loading,
        updateCurrentOffice,
        refresh: loadCurrentOffice,
    };
}
