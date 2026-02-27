import { SupabaseClient } from '@supabase/supabase-js';
import {
    MedicalRecord,
    CreateMedicalRecordData,
    MedicalRecordFilters,
    MedicalHistorySummary
} from '@red-salud/contracts';

export function createRecordsSdk(supabase: SupabaseClient) {
    return {
        /**
         * Get medical history of a patient with optional filters
         */
        async getPatientRecords(patientId: string, filters?: MedicalRecordFilters) {
            let query = supabase
                .from('medical_records')
                .select(`
          *,
          medico:profiles!medical_records_medico_id_fkey(
            id,
            nombre_completo,
            avatar_url,
            especialidad
          ),
          appointment:appointments!medical_records_appointment_id_fkey(
            id,
            fecha_hora,
            motivo
          )
        `)
                .eq('paciente_id', patientId)
                .order('created_at', { ascending: false });

            if (filters?.startDate) query = query.gte('created_at', filters.startDate);
            if (filters?.endDate) query = query.lte('created_at', filters.endDate);
            if (filters?.medicoId) query = query.eq('medico_id', filters.medicoId);
            if (filters?.searchTerm) {
                query = query.or(
                    `diagnostico.ilike.%${filters.searchTerm}%,sintomas.ilike.%${filters.searchTerm}%,tratamiento.ilike.%${filters.searchTerm}%`
                );
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as MedicalRecord[];
        },

        /**
         * Get a specific medical record
         */
        async getRecord(recordId: string) {
            const { data, error } = await supabase
                .from('medical_records')
                .select(`
          *,
          medico:profiles!medical_records_medico_id_fkey(
            id,
            nombre_completo,
            avatar_url,
            especialidad
          ),
          appointment:appointments!medical_records_appointment_id_fkey(
            id,
            fecha_hora,
            motivo
          ),
          paciente:profiles!medical_records_paciente_id_fkey(
            id,
            nombre_completo,
            fecha_nacimiento,
            avatar_url
          )
        `)
                .eq('id', recordId)
                .single();

            if (error) throw error;
            return data as MedicalRecord;
        },

        /**
         * Create a new medical record
         */
        async createRecord(recordData: CreateMedicalRecordData) {
            const { data, error } = await supabase
                .from('medical_records')
                .insert(recordData)
                .select()
                .single();

            if (error) throw error;

            // Log activity (Internal side effect)
            await supabase.from('user_activity_log').insert({
                user_id: recordData.medico_id,
                activity_type: 'medical_record_created',
                description: `Registro médico creado para paciente ${recordData.paciente_id}`,
                status: 'success',
            }).maybeSingle();

            return data as MedicalRecord;
        },

        /**
         * Update an existing medical record
         */
        async updateRecord(recordId: string, updates: Partial<CreateMedicalRecordData>) {
            const { data, error } = await supabase
                .from('medical_records')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', recordId)
                .select()
                .single();

            if (error) throw error;
            return data as MedicalRecord;
        },

        /**
         * Get a summary of the patient's medical history
         */
        async getHistorySummary(patientId: string): Promise<MedicalHistorySummary> {
            const records = await this.getPatientRecords(patientId);

            if (!records || records.length === 0) {
                return {
                    total_consultas: 0,
                    diagnosticos_frecuentes: [],
                    medicamentos_actuales: [],
                    examenes_pendientes: [],
                    doctores_consultados: [],
                };
            }

            const diagnosticosMap = new Map<string, number>();
            const medicamentosSet = new Set<string>();
            const examenesSet = new Set<string>();
            const doctoresMap = new Map<string, any>();

            records.forEach((record) => {
                if (record.diagnostico) {
                    diagnosticosMap.set(record.diagnostico, (diagnosticosMap.get(record.diagnostico) || 0) + 1);
                }

                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                if (record.medicamentos && new Date(record.created_at) > threeMonthsAgo) {
                    record.medicamentos.split(',').forEach((med: string) => {
                        const trimmed = med.trim();
                        if (trimmed) medicamentosSet.add(trimmed);
                    });
                }

                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                if (record.examenes_solicitados && new Date(record.created_at) > sixMonthsAgo) {
                    record.examenes_solicitados.split(',').forEach((exam: string) => {
                        const trimmed = exam.trim();
                        if (trimmed) examenesSet.add(trimmed);
                    });
                }

                if (record.medico) {
                    const doctorId = record.medico.id;
                    const doctorData = doctoresMap.get(doctorId);
                    if (doctorData) {
                        doctorData.consultas++;
                    } else {
                        doctoresMap.set(doctorId, {
                            id: doctorId,
                            nombre: record.medico.nombre_completo,
                            especialidad: record.medico.especialidad || 'General',
                            consultas: 1,
                        });
                    }
                }
            });

            const diagnosticos_frecuentes = Array.from(diagnosticosMap.entries())
                .map(([diagnostico, count]) => ({ diagnostico, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            const doctores_consultados = Array.from(doctoresMap.values()).sort((a, b) => b.consultas - a.consultas);

            return {
                total_consultas: records.length,
                ultima_consulta: records[0]?.created_at,
                diagnosticos_frecuentes,
                medicamentos_actuales: Array.from(medicamentosSet),
                examenes_pendientes: Array.from(examenesSet),
                doctores_consultados,
            };
        }
    };
}
