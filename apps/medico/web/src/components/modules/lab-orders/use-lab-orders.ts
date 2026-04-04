'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type LabOrderStatus = 'ordered' | 'collected' | 'processing' | 'completed' | 'cancelled';
export type TestResultStatus = 'pending' | 'normal' | 'abnormal' | 'critical';

export interface LabTest {
  id: string;
  order_id: string;
  test_name: string;
  result: string | null;
  unit: string | null;
  reference_min: number | null;
  reference_max: number | null;
  reference_range: string | null;
  status: TestResultStatus;
  notes: string | null;
  created_at: string;
}

export interface LabOrder {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  status: LabOrderStatus;
  priority: 'routine' | 'urgent' | 'stat';
  clinical_indication: string | null;
  special_instructions: string | null;
  panel_name: string | null;
  patient_name?: string;
  tests: LabTest[];
  created_at: string;
  updated_at: string;
}

export interface CreateLabOrder {
  patient_id?: string | null;
  priority?: 'routine' | 'urgent' | 'stat';
  clinical_indication?: string | null;
  special_instructions?: string | null;
  panel_name?: string | null;
  tests: string[];
}

interface UseLabOrdersOptions {
  patientId?: string;
  status?: string;
  limit?: number;
}

interface UseLabOrdersReturn {
  orders: LabOrder[];
  loading: boolean;
  error: string | null;
  createOrder: (data: CreateLabOrder) => Promise<LabOrder | null>;
  updateResult: (testId: string, result: string, status: TestResultStatus) => Promise<boolean>;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useLabOrders(
  doctorId: string,
  options?: UseLabOrdersOptions,
): UseLabOrdersReturn {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Fetch orders
  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchOrders() {
      let query = supabase
        .from('lab_orders')
        .select(`
          *,
          profiles!lab_orders_patient_id_fkey(full_name),
          lab_order_tests(*)
        `)
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });

      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (cancelled) return;

      if (fetchError) {
        // Table may not exist yet — treat as empty
        if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
          setOrders([]);
          setLoading(false);
          return;
        }
        setError(fetchError.message);
        setOrders([]);
      } else {
        const mapped: LabOrder[] = (data ?? []).map((row: any) => ({
          id: row.id,
          doctor_id: row.doctor_id,
          patient_id: row.patient_id,
          status: row.status ?? 'ordered',
          priority: row.priority ?? 'routine',
          clinical_indication: row.clinical_indication,
          special_instructions: row.special_instructions,
          panel_name: row.panel_name,
          patient_name: row.profiles?.full_name ?? undefined,
          tests: (row.lab_order_tests ?? []).map((t: any) => ({
            id: t.id,
            order_id: t.order_id,
            test_name: t.test_name,
            result: t.result,
            unit: t.unit,
            reference_min: t.reference_min,
            reference_max: t.reference_max,
            reference_range: t.reference_range,
            status: t.status ?? 'pending',
            notes: t.notes,
            created_at: t.created_at,
          })),
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setOrders(mapped);
      }
      setLoading(false);
    }

    fetchOrders();
    return () => { cancelled = true; };
  }, [doctorId, options?.patientId, options?.status, options?.limit, refreshKey]);

  // Create order with tests
  const createOrder = useCallback(
    async (data: CreateLabOrder): Promise<LabOrder | null> => {
      // Insert order
      const { data: orderRow, error: orderError } = await supabase
        .from('lab_orders')
        .insert({
          doctor_id: doctorId,
          patient_id: data.patient_id ?? null,
          status: 'ordered',
          priority: data.priority ?? 'routine',
          clinical_indication: data.clinical_indication,
          special_instructions: data.special_instructions,
          panel_name: data.panel_name,
        })
        .select()
        .single();

      if (orderError) {
        setError(orderError.message);
        return null;
      }

      // Insert tests
      if (data.tests.length > 0) {
        const testRows = data.tests.map((testName) => ({
          order_id: orderRow.id,
          test_name: testName,
          status: 'pending',
        }));

        const { error: testsError } = await supabase
          .from('lab_order_tests')
          .insert(testRows);

        if (testsError) {
          console.error('[LabOrders] Failed to insert tests:', testsError);
        }
      }

      refresh();
      return orderRow as LabOrder;
    },
    [doctorId, refresh],
  );

  // Update a single test result
  const updateResult = useCallback(
    async (
      testId: string,
      result: string,
      status: TestResultStatus,
    ): Promise<boolean> => {
      const { error: updateError } = await supabase
        .from('lab_order_tests')
        .update({ result, status })
        .eq('id', testId);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      refresh();
      return true;
    },
    [refresh],
  );

  return { orders, loading, error, createOrder, updateResult, refresh };
}
