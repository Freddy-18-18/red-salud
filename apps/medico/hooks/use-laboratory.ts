"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  usePatientLaboratory as useSdkPatientLaboratory,
  createMedicoSdk
} from "@red-salud/sdk-medico";
import { supabase } from "@/lib/supabase/client";
import type {
  LabOrder,
  LabOrderFilters,
  LabResultStats
} from "@red-salud/contracts";

export function useLaboratory(patientId: string | undefined, filters?: LabOrderFilters) {
  const { orders, loading, error, refreshOrders } = useSdkPatientLaboratory(supabase, patientId, filters);
  const [stats, setStats] = useState<LabResultStats>({
    total_ordenes: 0,
    pendientes: 0,
    completadas: 0,
    con_valores_anormales: 0,
  });

  const sdk = useMemo(() => createMedicoSdk(supabase), []);

  const loadStats = useCallback(async () => {
    if (!patientId) return;
    try {
      // Logic for stats (can be moved to SDK later if needed)
      const { data, error: sError } = await supabase
        .from('lab_orders')
        .select('status')
        .eq('paciente_id', patientId);

      if (sError) throw sError;

      const statsObj: LabResultStats = {
        total_ordenes: data.length,
        pendientes: data.filter(o => o.status === 'pendiente').length,
        completadas: data.filter(o => o.status === 'completada').length,
        con_valores_anormales: 0, // Needs more complex query for results
      };
      setStats(statsObj);
    } catch (err) {
      console.error('Error loading lab stats:', err);
    }
  }, [patientId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    orders,
    stats,
    loading,
    error,
    refreshOrders,
    refreshStats: loadStats,
  };
}

export function useLabOrder(orderId: string | undefined) {
  const [order, setOrder] = useState<LabOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sdk = useMemo(() => createMedicoSdk(supabase), []);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const data = await sdk.laboratory.getOrderDetail(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar orden de laboratorio');
    } finally {
      setLoading(false);
    }
  }, [orderId, sdk]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  return {
    order,
    results: (order as any)?.results || [],
    loading,
    error,
    refreshOrder: loadOrder,
  };
}

export function useLabTestTypes(categoria?: string) {
  const [testTypes, setTestTypes] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: types, error: tError } = await supabase
          .from('lab_test_types')
          .select('*')
          .eq('activo', true);

        if (tError) throw tError;

        let filteredTypes = types;
        if (categoria) {
          filteredTypes = types.filter(t => t.categoria === categoria);
        }

        setTestTypes(filteredTypes);
        setCategories(Array.from(new Set(types.map(t => t.categoria).filter(Boolean))));
      } catch (err) {
        setError("Error al cargar tipos de exámenes");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoria]);

  return {
    testTypes,
    categories,
    loading,
    error,
  };
}
