import { SupabaseClient } from '@supabase/supabase-js';
import {
    PrescriptionDomain as Prescription,
    CreatePrescriptionData,
    PrescriptionTemplate,
    DoctorSignature,
    PrescriptionScan,
    PrescriptionMedication
} from '@red-salud/contracts';

export function createPrescriptionsSdk(supabase: SupabaseClient) {
    return {
        /**
         * Get prescriptions for a patient
         */
        async getPatientPrescriptions(patientId: string) {
            const { data, error } = await supabase
                .from('prescriptions')
                .select(`
          *,
          medico:profiles!prescriptions_medico_id_fkey(
            id,
            nombre_completo,
            especialidad,
            avatar_url
          )
        `)
                .eq('paciente_id', patientId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Prescription[];
        },

        /**
         * Create a new prescription
         */
        async createPrescription(prescriptionData: CreatePrescriptionData) {
            // Logic for multi-step insertion (prescription + medications)
            const { medications, ...mainData } = prescriptionData;

            const { data: prescription, error: pError } = await supabase
                .from('prescriptions')
                .insert(mainData)
                .select()
                .single();

            if (pError) throw pError;

            if (medications && medications.length > 0) {
                const medsToInsert = medications.map(m => ({
                    ...m,
                    prescription_id: prescription.id
                }));

                const { error: mError } = await supabase
                    .from('prescription_medications')
                    .insert(medsToInsert);

                if (mError) throw mError;
            }

            return prescription as Prescription;
        },

        /**
         * ADVANCED: Manage Prescription Templates
         */
        templates: {
            async list(medicoId: string) {
                const { data, error } = await supabase
                    .from('prescription_templates')
                    .select('*')
                    .eq('medico_id', medicoId)
                    .eq('activo', true);

                if (error) throw error;
                return data as PrescriptionTemplate[];
            },

            async getById(id: string) {
                const { data, error } = await supabase
                    .from('prescription_templates')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return data as PrescriptionTemplate;
            }
        },

        /**
         * ADVANCED: Manage Doctor Signatures
         */
        signatures: {
            async getByMedicoId(medicoId: string) {
                const { data, error } = await supabase
                    .from('doctor_signatures')
                    .select('*')
                    .eq('medico_id', medicoId)
                    .eq('activa', true);

                if (error) throw error;
                return data as DoctorSignature[];
            }
        }
    };
}
