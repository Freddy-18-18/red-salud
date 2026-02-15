/**
 * @file specialty-crud-factory.ts
 * @description Generic CRUD service factory for specialty-specific clinical tables.
 * Creates type-safe services with list/get/create/update/delete operations.
 * All operations are scoped to the authenticated doctor via RLS.
 */

import { supabase } from '../client';

// ============================================
// Types
// ============================================

export interface SpecialtyRecord {
  id: string;
  doctor_id: string;
  patient_id: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

export interface FilterOptions {
  patientId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SpecialtyStats {
  total: number;
  thisMonth: number;
  thisWeek: number;
  today: number;
}

// ============================================
// Factory
// ============================================

export interface SpecialtyCrudService<T extends SpecialtyRecord> {
  list(doctorId: string, filters?: FilterOptions): Promise<ServiceResult<T[]>>;
  getById(id: string, doctorId: string): Promise<ServiceResult<T>>;
  create(doctorId: string, data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<ServiceResult<T>>;
  update(id: string, doctorId: string, data: Partial<T>): Promise<ServiceResult<T>>;
  remove(id: string, doctorId: string): Promise<ServiceResult<void>>;
  count(doctorId: string, filters?: FilterOptions): Promise<ServiceResult<number>>;
  getStats(doctorId: string): Promise<ServiceResult<SpecialtyStats>>;
}

interface FactoryOptions {
  defaultOrderBy?: string;
  defaultLimit?: number;
  dateColumn?: string;
}

export function createSpecialtyCrudService<T extends SpecialtyRecord>(
  tableName: string,
  options: FactoryOptions = {}
): SpecialtyCrudService<T> {
  const {
    defaultOrderBy = 'created_at',
    defaultLimit = 50,
    dateColumn = 'created_at',
  } = options;

  return {
    async list(doctorId: string, filters?: FilterOptions): Promise<ServiceResult<T[]>> {
      try {
        let query = supabase
          .from(tableName)
          .select('*')
          .eq('doctor_id', doctorId)
          .order(filters?.orderBy || defaultOrderBy, {
            ascending: (filters?.orderDirection || 'desc') === 'asc',
          })
          .limit(filters?.limit || defaultLimit);

        if (filters?.patientId) {
          query = query.eq('patient_id', filters.patientId);
        }
        if (filters?.startDate) {
          query = query.gte(dateColumn, filters.startDate);
        }
        if (filters?.endDate) {
          query = query.lte(dateColumn, filters.endDate);
        }
        if (filters?.status) {
          query = query.eq('status', filters.status);
        }
        if (filters?.type) {
          // Generic type filter — uses the first column that matches *_type
          // Specific services can override this
          query = query.eq('type', filters.type);
        }
        if (filters?.offset) {
          query = query.range(filters.offset, filters.offset + (filters?.limit || defaultLimit) - 1);
        }

        const { data, error } = await query;

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, data: (data || []) as T[] };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    },

    async getById(id: string, doctorId: string): Promise<ServiceResult<T>> {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .eq('doctor_id', doctorId)
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, data: data as T };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    },

    async create(
      doctorId: string,
      data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>
    ): Promise<ServiceResult<T>> {
      try {
        const { data: result, error } = await supabase
          .from(tableName)
          .insert({ ...data, doctor_id: doctorId })
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, data: result as T };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    },

    async update(id: string, doctorId: string, data: Partial<T>): Promise<ServiceResult<T>> {
      try {
        const { data: result, error } = await supabase
          .from(tableName)
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('doctor_id', doctorId)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, data: result as T };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    },

    async remove(id: string, doctorId: string): Promise<ServiceResult<void>> {
      try {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id)
          .eq('doctor_id', doctorId);

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    },

    async count(doctorId: string, filters?: FilterOptions): Promise<ServiceResult<number>> {
      try {
        let query = supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          .eq('doctor_id', doctorId);

        if (filters?.patientId) {
          query = query.eq('patient_id', filters.patientId);
        }
        if (filters?.startDate) {
          query = query.gte(dateColumn, filters.startDate);
        }
        if (filters?.endDate) {
          query = query.lte(dateColumn, filters.endDate);
        }

        const { count, error } = await query;

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, data: count ?? 0 };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    },

    async getStats(doctorId: string): Promise<ServiceResult<SpecialtyStats>> {
      try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const [totalResult, monthResult, weekResult, todayResult] = await Promise.all([
          supabase.from(tableName).select('*', { count: 'exact', head: true }).eq('doctor_id', doctorId),
          supabase.from(tableName).select('*', { count: 'exact', head: true }).eq('doctor_id', doctorId).gte(dateColumn, monthStart),
          supabase.from(tableName).select('*', { count: 'exact', head: true }).eq('doctor_id', doctorId).gte(dateColumn, weekStart),
          supabase.from(tableName).select('*', { count: 'exact', head: true }).eq('doctor_id', doctorId).gte(dateColumn, todayStart),
        ]);

        return {
          success: true,
          data: {
            total: totalResult.count ?? 0,
            thisMonth: monthResult.count ?? 0,
            thisWeek: weekResult.count ?? 0,
            today: todayResult.count ?? 0,
          },
        };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    },
  };
}
