import { SupabaseClient } from '@supabase/supabase-js';
import type { PerioExam, PerioToothData } from '../types/dental';

export function createOdontologyPerioSdk(supabase: SupabaseClient) {
    return {
        async createPerioExam(
            examData: Omit<PerioExam, 'id' | 'created_at' | 'updated_at'>
        ) {
            const { data, error } = await supabase
                .from('dental_perio_exams')
                .insert({
                    ...examData,
                    teeth: examData.teeth as any,
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating perio exam:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data: data as PerioExam };
        },

        async updatePerioExam(
            examId: string,
            updates: Partial<Omit<PerioExam, 'id' | 'patient_id' | 'doctor_id' | 'created_at'>>
        ) {
            const { data, error } = await supabase
                .from('dental_perio_exams')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', examId)
                .select()
                .single();

            if (error) {
                console.error('Error updating perio exam:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data: data as PerioExam };
        },

        async getPerioExamById(examId: string) {
            const { data, error } = await supabase
                .from('dental_perio_exams')
                .select('*')
                .eq('id', examId)
                .single();

            if (error) {
                console.error('Error fetching perio exam:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data: data as PerioExam };
        },

        async getPerioExamsByPatient(patientId: string, limit: number = 10) {
            const { data, error } = await supabase
                .from('dental_perio_exams')
                .select('*')
                .eq('patient_id', patientId)
                .order('exam_date', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching patient perio exams:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data: data as PerioExam[] };
        },

        async getLatestPerioExamByPatient(patientId: string) {
            const { data, error } = await supabase
                .from('dental_perio_exams')
                .select('*')
                .eq('patient_id', patientId)
                .order('exam_date', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('Error fetching latest perio exam:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data: data as PerioExam | null };
        },

        async getPerioExamsByDoctor(
            doctorId: string,
            filters?: {
                startDate?: string;
                endDate?: string;
                patientId?: string;
            },
            limit: number = 50
        ) {
            let query = supabase
                .from('dental_perio_exams')
                .select('*')
                .eq('doctor_id', doctorId)
                .order('exam_date', { ascending: false })
                .limit(limit);

            if (filters?.startDate) {
                query = query.gte('exam_date', filters.startDate);
            }
            if (filters?.endDate) {
                query = query.lte('exam_date', filters.endDate);
            }
            if (filters?.patientId) {
                query = query.eq('patient_id', filters.patientId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching doctor perio exams:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data: data as PerioExam[] };
        },

        async deletePerioExam(examId: string) {
            const { error } = await supabase
                .from('dental_perio_exams')
                .delete()
                .eq('id', examId);

            if (error) {
                console.error('Error deleting perio exam:', error);
                return { success: false, error: error.message };
            }

            return { success: true };
        },

        calculateStats(teeth: Record<number, PerioToothData>) {
            let totalDepth = 0;
            let totalSites = 0;
            let bleedingSites = 0;
            let pocketsOver4 = 0;
            let pocketsOver5 = 0;
            let pocketsOver6 = 0;
            let missingTeeth = 0;
            let maxDepth = 0;

            Object.values(teeth).forEach(t => {
                if (t.missing) {
                    missingTeeth++;
                    return;
                }

                Object.values(t.measurements).forEach(m => {
                    totalDepth += m.probingDepth;
                    totalSites++;

                    if (m.bleeding) bleedingSites++;
                    if (m.probingDepth >= 4) pocketsOver4++;
                    if (m.probingDepth >= 5) pocketsOver5++;
                    if (m.probingDepth >= 6) pocketsOver6++;
                    if (m.probingDepth > maxDepth) maxDepth = m.probingDepth;
                });
            });

            return {
                avgDepth: totalSites > 0 ? totalDepth / totalSites : 0,
                avgProbingDepth: totalSites > 0 ? totalDepth / totalSites : 0,
                maxProbingDepth: maxDepth,
                bopPercentage: totalSites > 0 ? (bleedingSites / totalSites) * 100 : 0,
                pocketsOver4,
                deepPockets: pocketsOver5,
                pocketsOver5,
                pocketsOver6,
                missingTeeth,
                totalSites,
                bleedingSites,
            };
        },

        generateExamId(): string {
            return `perio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
    };
}
