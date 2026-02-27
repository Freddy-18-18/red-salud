import { SupabaseClient } from '@supabase/supabase-js';
import {
    LabOrder,
    CreateLabOrderData,
    LabOrderFilters
} from '@red-salud/contracts';

export function createLaboratorySdk(supabase: SupabaseClient) {
    return {
        /**
         * Get laboratory orders for a patient
         */
        async getPatientOrders(patientId: string, filters?: LabOrderFilters) {
            let query = supabase
                .from('lab_orders') // Assuming table name based on common patterns
                .select(`
          *,
          medico:profiles!lab_orders_medico_id_fkey(
            id,
            nombre_completo,
            especialidad
          ),
          laboratorio:profiles!lab_orders_laboratorio_id_fkey(
            id,
            nombre_completo
          )
        `)
                .eq('paciente_id', patientId)
                .order('created_at', { ascending: false });

            if (filters?.status) query = query.eq('status', filters.status);
            if (filters?.prioridad) query = query.eq('prioridad', filters.prioridad);

            const { data, error } = await query;
            if (error) throw error;
            return data as LabOrder[];
        },

        /**
         * Create a new laboratory order
         */
        async createOrder(orderData: CreateLabOrderData) {
            const { test_type_ids, ...mainData } = orderData;

            const { data: order, error: oError } = await supabase
                .from('lab_orders')
                .insert(mainData)
                .select()
                .single();

            if (oError) throw oError;

            if (test_type_ids && test_type_ids.length > 0) {
                const testsToInsert = test_type_ids.map((id: string) => ({
                    order_id: order.id,
                    test_type_id: id,
                    status: 'pendiente'
                }));

                const { error: tError } = await supabase
                    .from('lab_order_tests')
                    .insert(testsToInsert);

                if (tError) throw tError;
            }

            return order as LabOrder;
        },

        /**
         * Get detailed order with results
         */
        async getOrderDetail(orderId: string) {
            const { data, error } = await supabase
                .from('lab_orders')
                .select(`
          *,
          tests:lab_order_tests(*, test_type:lab_test_types(*)),
          results:lab_results(*, values:lab_result_values(*))
        `)
                .eq('id', orderId)
                .single();

            if (error) throw error;
            return data as LabOrder;
        }
    };
}
