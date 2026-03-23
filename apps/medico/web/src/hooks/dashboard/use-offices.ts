"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export type Office = {
    id: string;
    nombre: string;
    direccion: string | null;
    ciudad: string | null;
    estado: string | null;
    es_principal: boolean;
};

export function useOffices() {
    const [offices, setOffices] = useState<Office[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadOffices();
    }, []);

    const loadOffices = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("doctor_offices")
                .select("id, nombre, direccion, ciudad, estado, es_principal")
                .eq("doctor_id", user.id)
                .eq("activo", true)
                .order("es_principal", { ascending: false });

            if (error) {
                throw error;
            }

            setOffices(data || []);
        } catch (err) {
            console.error("Error loading offices:", err);
            setError(err instanceof Error ? err.message : "Error al cargar consultorios");
        } finally {
            setLoading(false);
        }
    };

    return { offices, loading, error, refreshOffices: loadOffices };
}
