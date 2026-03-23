/**
 * @file useClinicResources.ts
 * @description Hook personalizado para gestión de recursos clínicos con react-query
 * @module hooks
 * 
 * Proporciona operaciones CRUD sobre recursos, áreas, asignaciones y filtros
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
    ResourceWithPosition,
    AreaWithResources,
    ResourceAssignment,
    CreateResourceInput,
    CreateAreaInput,
    AssignResourceInput,
} from '@red-salud/types';

const supabase = createClient();

/**
 * Hook para obtener recursos de una sede con datos espaciales
 * 
 * @param locationId - ID de la sede
 * @param floor - Piso opcional para filtrar
 * @returns Query con recursos y datos espaciales
 */
export function useClinicResources(locationId: string, floor?: number) {
    return useQuery({
        queryKey: ['clinic-resources', locationId, floor],
        queryFn: async (): Promise<ResourceWithPosition[]> => {
            let query = supabase
                .from('clinic_resources')
                .select(`
                  *,
                  area:area_id (*)
                `)
                .eq('location_id', locationId);

            if (floor !== undefined) {
                query = query.eq('floor', floor);
            }

            const { data, error } = await query.order('name');

            if (error) throw error;
            return (data || []) as ResourceWithPosition[];
        },
        enabled: !!locationId,
    });
}

/**
 * Hook para obtener áreas con sus recursos
 * 
 * @param locationId - ID de la sede
 * @param floor - Piso opcional para filtrar
 * @returns Query con áreas y sus recursos
 */
export function useClinicAreas(locationId: string, floor?: number) {
    return useQuery({
        queryKey: ['clinic-areas', locationId, floor],
        queryFn: async (): Promise<AreaWithResources[]> => {
            let query = supabase
                .from('clinic_areas')
                .select(`
          *,
          resources:clinic_resources(*)
        `)
                .eq('location_id', locationId);

            if (floor !== undefined) {
                query = query.eq('floor', floor);
            }

            const { data, error } = await query.order('floor').order('name');

            if (error) throw error;

            // Calcular contadores
            return (data || []).map((area: { resources?: Array<{ status?: string }> }) => ({
                ...area,
                resource_count: area.resources?.length || 0,
                occupied_count: area.resources?.filter((r) => r.status === 'occupied').length || 0,
            })) as AreaWithResources[];
        },
        enabled: !!locationId,
    });
}

/**
 * Hook para obtener asignaciones activas de recursos
 */
export function useResourceAssignments(resourceIds?: string[]) {
    return useQuery({
        queryKey: ['resource-assignments', resourceIds],
        queryFn: async (): Promise<ResourceAssignment[]> => {
            let query = supabase
                .from('resource_assignments')
                .select('*')
                .eq('status', 'active');

            if (resourceIds && resourceIds.length > 0) {
                query = query.in('resource_id', resourceIds);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        },
        enabled: !resourceIds || resourceIds.length > 0,
    });
}

/**
 * Mutation para crear un nuevo recurso
 */
export function useCreateResource() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateResourceInput) => {
            const { data, error } = await supabase
                .from('clinic_resources')
                .insert(input)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({ queryKey: ['clinic-resources', data.location_id] });
            if (data.area_id) {
                queryClient.invalidateQueries({ queryKey: ['clinic-areas', data.location_id] });
            }
        },
    });
}

/**
 * Mutation para actualizar posición de recurso (drag & drop)
 */
export function useUpdateResourcePosition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            resourceId,
            position_x,
            position_y,
            area_id,
        }: {
            resourceId: string;
            position_x: number;
            position_y: number;
            area_id?: string;
        }) => {
            const { data, error } = await supabase
                .from('clinic_resources')
                .update({ position_x, position_y, area_id })
                .eq('id', resourceId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['clinic-resources', data.location_id] });
            queryClient.invalidateQueries({ queryKey: ['clinic-areas', data.location_id] });
        },
    });
}

/**
 * Mutation para cambiar estado de recurso
 */
export function useUpdateResourceStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            resourceId,
            status,
            notes,
        }: {
            resourceId: string;
            status: string;
            notes?: string;
        }) => {
            const { data, error } = await supabase
                .from('clinic_resources')
                .update({ status, notes })
                .eq('id', resourceId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinic-resources'] });
        },
    });
}

/**
 * Mutation para asignar paciente a recurso
 */
export function useAssignResource() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: AssignResourceInput) => {
            const { data, error } = await supabase
                .from('resource_assignments')
                .insert(input)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinic-resources'] });
            queryClient.invalidateQueries({ queryKey: ['resource-assignments'] });
        },
    });
}

/**
 * Mutation para dar de alta paciente (discharge)
 */
export function useDischargeResource() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            assignmentId,
            discharge_notes,
        }: {
            assignmentId: string;
            discharge_notes?: string;
        }) => {
            const { data, error } = await supabase
                .from('resource_assignments')
                .update({
                    status: 'discharged',
                    discharge_date: new Date().toISOString(),
                    discharge_notes,
                })
                .eq('id', assignmentId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinic-resources'] });
            queryClient.invalidateQueries({ queryKey: ['resource-assignments'] });
        },
    });
}

/**
 * Mutation para crear área
 */
export function useCreateArea() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateAreaInput) => {
            const { data, error } = await supabase
                .from('clinic_areas')
                .insert(input)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['clinic-areas', data.location_id] });
        },
    });
}
