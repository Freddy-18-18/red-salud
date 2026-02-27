"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getPatientLabOrders,
  getLabOrderDetails,
  getLabTestTypes,
  getLabTestCategories,
  getPatientLabStats,
  getLabOrderStatusHistory,
} from "@/lib/supabase/services/laboratory-service";
import type {
  LabOrder,
  LabResult,
  LabTestType,
  LabOrderFilters,
  LabResultStats,
  LabOrderStatusHistory,
} from "@/lib/supabase/types/laboratory";

export function useLaboratory(patientId: string, filters?: LabOrderFilters) {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [stats, setStats] = useState<LabResultStats>({
    total_ordenes: 0,
    pendientes: 0,
    completadas: 0,
    con_valores_anormales: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!patientId) return;

    setLoading(true);
    setError(null);

    const result = await getPatientLabOrders(patientId, filters);

    if (result.success) {
      setOrders(result.data);
    } else {
      setError("Error al cargar órdenes de laboratorio");
      console.error(result.error);
    }

    setLoading(false);
  }, [patientId, filters]);

  const loadStats = useCallback(async () => {
    if (!patientId) return;

    const result = await getPatientLabStats(patientId);

    if (result.success) {
      setStats(result.data);
    }
  }, [patientId]);

  // Cargar datos cuando cambien las dependencias
  useEffect(() => {
    if (!patientId) return;
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      const result = await getPatientLabOrders(patientId, filters);
      if (result.success) {
        setOrders(result.data);
      } else {
        setError("Error al cargar órdenes de laboratorio");
        console.error(result.error);
      }
      
      const statsResult = await getPatientLabStats(patientId);
      if (statsResult.success) {
        setStats(statsResult.data);
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [patientId, filters]);

  return {
    orders,
    stats,
    loading,
    error,
    refreshOrders: loadOrders,
    refreshStats: loadStats,
  };
}

export function useLabOrder(orderId: string) {
  const [order, setOrder] = useState<LabOrder | null>(null);
  const [results, setResults] = useState<LabResult[]>([]);
  const [statusHistory, setStatusHistory] = useState<LabOrderStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    const result = await getLabOrderDetails(orderId);

    if (result.success) {
      setOrder(result.data);
      setResults(result.data?.results || []);
    } else {
      setError("Error al cargar orden de laboratorio");
      console.error(result.error);
    }

    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      const result = await getLabOrderDetails(orderId);
      if (result.success) {
        setOrder(result.data);
        setResults(result.data?.results || []);
      } else {
        setError("Error al cargar orden de laboratorio");
        console.error(result.error);
      }
      
      const historyResult = await getLabOrderStatusHistory(orderId);
      if (historyResult.success) {
        setStatusHistory(historyResult.data);
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [orderId]);

  return {
    order,
    results,
    statusHistory,
    loading,
    error,
    refreshOrder: loadOrder,
  };
}

export function useLabTestTypes(categoria?: string) {
  const [testTypes, setTestTypes] = useState<LabTestType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      const [typesResult, categoriesResult] = await Promise.all([
        getLabTestTypes(categoria),
        getLabTestCategories(),
      ]);

      if (typesResult.success) {
        setTestTypes(typesResult.data);
      } else {
        setError("Error al cargar tipos de exámenes");
      }

      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
      }

      setLoading(false);
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
