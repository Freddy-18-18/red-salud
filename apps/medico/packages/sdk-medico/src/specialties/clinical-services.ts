import { SupabaseClient } from '@supabase/supabase-js';
import { createSpecialtyCrudService, type SpecialtyRecord, type ServiceResult } from './core/crud-factory';

// --- Cardiology ---

export interface ECGRecord extends SpecialtyRecord {
    heart_rate: number;
    rhythm: string;
    is_abnormal: boolean;
    findings: string | null;
    image_url: string | null;
    appointment_id: string | null;
}

export interface CardiologyProcedure extends SpecialtyRecord {
    procedure_type: string;
    findings: string | null;
    complications: string | null;
    notes: string | null;
    appointment_id: string | null;
}

function createCardiologyService(supabase: SupabaseClient) {
    const ecgService = createSpecialtyCrudService<ECGRecord>(supabase, 'cardiology_ecg');
    const procedureService = createSpecialtyCrudService<CardiologyProcedure>(supabase, 'cardiology_procedures');

    return {
        ecg: ecgService,
        procedures: procedureService,

        async getRecentEcg(doctorId: string, limit = 5): Promise<ServiceResult<ECGRecord[]>> {
            return ecgService.list(doctorId, { limit, orderBy: 'created_at', orderDirection: 'desc' });
        },

        async getAbnormalEcg(doctorId: string): Promise<ServiceResult<ECGRecord[]>> {
            try {
                const { data, error } = await supabase
                    .from('cardiology_ecg')
                    .select('*')
                    .eq('doctor_id', doctorId)
                    .eq('is_abnormal', true)
                    .order('created_at', { ascending: false });
                if (error) return { success: false, error: error.message };
                return { success: true, data: (data || []) as ECGRecord[] };
            } catch (err) {
                return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
            }
        },

        async getProceduresByType(doctorId: string, type: string): Promise<ServiceResult<CardiologyProcedure[]>> {
            try {
                const { data, error } = await supabase
                    .from('cardiology_procedures')
                    .select('*')
                    .eq('doctor_id', doctorId)
                    .eq('procedure_type', type)
                    .order('created_at', { ascending: false });
                if (error) return { success: false, error: error.message };
                return { success: true, data: (data || []) as CardiologyProcedure[] };
            } catch (err) {
                return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
            }
        }
    };
}

// --- Gynecology ---

export interface GynecologyControl extends SpecialtyRecord {
    control_type: string;
    control_date: string;
    menstrual_date: string | null;
    cycle_length: number | null;
    cycle_regularity: string | null;
    contraceptive_method: string | null;
    findings: string | null;
    cervical_exam: string | null;
    breast_exam: string | null;
    pap_result: string | null;
    hpv_test: string | null;
    diagnosis: string | null;
    treatment: string | null;
    next_control_date: string | null;
    notes: string | null;
    attachment_urls: string[] | null;
    appointment_id: string | null;
}

export interface GynecologyObstetric extends SpecialtyRecord {
    pregnancy_id: string;
    control_type: string;
    control_date: string;
    gestational_weeks: number | null;
    weight: number | null;
    blood_pressure_systolic: number | null;
    blood_pressure_diastolic: number | null;
    uterine_height: number | null;
    fetal_heart_rate: number | null;
    fetal_presentation: string | null;
    fetal_movements: string | null;
    edema: string | null;
    lab_results: Record<string, unknown> | null;
    ultrasound_findings: string | null;
    risk_level: string | null;
    diagnosis: string | null;
    indications: string | null;
    next_control_date: string | null;
    delivery_type: string | null;
    delivery_date: string | null;
    baby_weight: number | null;
    baby_height: number | null;
    apgar_1min: number | null;
    apgar_5min: number | null;
    notes: string | null;
    attachment_urls: string[] | null;
    appointment_id: string | null;
}

function createGynecologyService(supabase: SupabaseClient) {
    const controlService = createSpecialtyCrudService<GynecologyControl>(supabase, 'gynecology_controls', { dateColumn: 'control_date' });
    const obstetricService = createSpecialtyCrudService<GynecologyObstetric>(supabase, 'gynecology_obstetric', { dateColumn: 'control_date' });

    return {
        controls: controlService,
        obstetric: obstetricService,

        async getPregnancyControls(doctorId: string, pregnancyId: string): Promise<ServiceResult<GynecologyObstetric[]>> {
            try {
                const { data, error } = await supabase
                    .from('gynecology_obstetric')
                    .select('*')
                    .eq('doctor_id', doctorId)
                    .eq('pregnancy_id', pregnancyId)
                    .order('control_date', { ascending: true });
                if (error) return { success: false, error: error.message };
                return { success: true, data: (data || []) as GynecologyObstetric[] };
            } catch (err) {
                return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
            }
        },

        async getUpcomingControls(doctorId: string): Promise<ServiceResult<GynecologyControl[]>> {
            try {
                const today = new Date().toISOString().split('T')[0];
                const { data, error } = await supabase
                    .from('gynecology_controls')
                    .select('*')
                    .eq('doctor_id', doctorId)
                    .gte('next_control_date', today)
                    .order('next_control_date', { ascending: true });
                if (error) return { success: false, error: error.message };
                return { success: true, data: (data || []) as GynecologyControl[] };
            } catch (err) {
                return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
            }
        }
    };
}

// --- Neurology ---

export interface NeurologyStudy extends SpecialtyRecord {
    study_type: string;
    study_date: string;
    indication: string | null;
    findings: string | null;
    interpretation: string | null;
    is_abnormal: boolean;
    abnormality_type: string | null;
    lateralization: string | null;
    region: string | null;
    results_summary: string | null;
    recommendations: string | null;
    urgency: string;
    attachment_urls: string[] | null;
    appointment_id: string | null;
}

export interface NeurologyAssessment extends SpecialtyRecord {
    assessment_type: string;
    assessment_date: string;
    total_score: number | null;
    subscores: Record<string, unknown> | null;
    severity: string | null;
    interpretation: string | null;
    previous_score: number | null;
    trend: string | null;
    notes: string | null;
    appointment_id: string | null;
}

function createNeurologyService(supabase: SupabaseClient) {
    const studyService = createSpecialtyCrudService<NeurologyStudy>(supabase, 'neurology_studies', { dateColumn: 'study_date' });
    const assessmentService = createSpecialtyCrudService<NeurologyAssessment>(supabase, 'neurology_assessments', { dateColumn: 'assessment_date' });

    return {
        studies: studyService,
        assessments: assessmentService,

        async getRecentStudies(doctorId: string, limit = 5): Promise<ServiceResult<NeurologyStudy[]>> {
            return studyService.list(doctorId, { limit, orderBy: 'study_date', orderDirection: 'desc' });
        },

        async getAssessmentTrend(doctorId: string, patientId: string, assessmentType: string): Promise<ServiceResult<NeurologyAssessment[]>> {
            try {
                const { data, error } = await supabase
                    .from('neurology_assessments')
                    .select('*')
                    .eq('doctor_id', doctorId)
                    .eq('patient_id', patientId)
                    .eq('assessment_type', assessmentType)
                    .order('assessment_date', { ascending: true })
                    .limit(10);
                if (error) return { success: false, error: error.message };
                return { success: true, data: (data || []) as NeurologyAssessment[] };
            } catch (err) {
                return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
            }
        }
    };
}

// --- Odontology ---

export interface DentalTreatment extends SpecialtyRecord {
    treatment_type: string;
    tooth_number: number | null;
    tooth_surface: string | null;
    material: string | null;
    treatment_date: string;
    status: string;
    cost: number | null;
    insurance_covered: boolean;
    warranty_months: number | null;
    notes: string | null;
    attachment_urls: string[] | null;
    appointment_id: string | null;
}

export interface DentalImaging extends SpecialtyRecord {
    imaging_type: string;
    imaging_date: string;
    region: string | null;
    tooth_numbers: number[] | null;
    findings: string | null;
    diagnosis: string | null;
    image_urls: string[] | null;
    notes: string | null;
    appointment_id: string | null;
}

function createOdontologyService(supabase: SupabaseClient) {
    const treatmentService = createSpecialtyCrudService<DentalTreatment>(supabase, 'dental_treatments', { dateColumn: 'treatment_date' });
    const imagingService = createSpecialtyCrudService<DentalImaging>(supabase, 'dental_imaging', { dateColumn: 'imaging_date' });

    return {
        treatments: treatmentService,
        imaging: imagingService,

        async getTreatmentPlan(doctorId: string, patientId: string): Promise<ServiceResult<DentalTreatment[]>> {
            try {
                const { data, error } = await supabase
                    .from('dental_treatments')
                    .select('*')
                    .eq('doctor_id', doctorId)
                    .eq('patient_id', patientId)
                    .eq('status', 'planificado')
                    .order('treatment_date', { ascending: true });
                if (error) return { success: false, error: error.message };
                return { success: true, data: (data || []) as DentalTreatment[] };
            } catch (err) {
                return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
            }
        },

        async getPatientDentalHistory(doctorId: string, patientId: string): Promise<ServiceResult<DentalTreatment[]>> {
            try {
                const { data, error } = await supabase
                    .from('dental_treatments')
                    .select('*')
                    .eq('doctor_id', doctorId)
                    .eq('patient_id', patientId)
                    .order('treatment_date', { ascending: false });
                if (error) return { success: false, error: error.message };
                return { success: true, data: (data || []) as DentalTreatment[] };
            } catch (err) {
                return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
            }
        }
    };
}

// --- Ophthalmology ---

export interface OphthalmologyExam extends SpecialtyRecord {
    exam_type: string;
    exam_date: string;
    va_od_sc: string | null;
    va_od_cc: string | null;
    va_oi_sc: string | null;
    va_oi_cc: string | null;
    sphere_od: number | null;
    cylinder_od: number | null;
    axis_od: number | null;
    sphere_oi: number | null;
    cylinder_oi: number | null;
    axis_oi: number | null;
    add_power: number | null;
    iop_od: number | null;
    iop_oi: number | null;
    iop_method: string | null;
    findings: string | null;
    diagnosis: string | null;
    recommendations: string | null;
    notes: string | null;
    attachment_urls: string[] | null;
    appointment_id: string | null;
}

export interface OphthalmologyProcedure extends SpecialtyRecord {
    procedure_type: string;
    eye: string;
    procedure_date: string;
    indication: string | null;
    technique: string | null;
    anesthesia: string | null;
    intraop_findings: string | null;
    complications: string | null;
    postop_instructions: string | null;
    follow_up_schedule: string | null;
    status: string;
    notes: string | null;
    attachment_urls: string[] | null;
    appointment_id: string | null;
}

function createOphthalmologyService(supabase: SupabaseClient) {
    const examService = createSpecialtyCrudService<OphthalmologyExam>(supabase, 'ophthalmology_exams', { dateColumn: 'exam_date' });
    const procedureService = createSpecialtyCrudService<OphthalmologyProcedure>(supabase, 'ophthalmology_procedures', { dateColumn: 'procedure_date' });

    return {
        exams: examService,
        procedures: procedureService,

        async getPatientVisualHistory(doctorId: string, patientId: string): Promise<ServiceResult<OphthalmologyExam[]>> {
            try {
                const { data, error } = await supabase
                    .from('ophthalmology_exams')
                    .select('*')
                    .eq('doctor_id', doctorId)
                    .eq('patient_id', patientId)
                    .order('exam_date', { ascending: true });
                if (error) return { success: false, error: error.message };
                return { success: true, data: (data || []) as OphthalmologyExam[] };
            } catch (err) {
                return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
            }
        }
    };
}

// --- Pediatrics ---

export interface PediatricsGrowth extends SpecialtyRecord {
    measurement_date: string;
    age_months: number;
    weight_kg: number | null;
    height_cm: number | null;
    head_circumference_cm: number | null;
    bmi: number | null;
    weight_percentile: number | null;
    height_percentile: number | null;
    bmi_percentile: number | null;
    head_percentile: number | null;
    growth_chart_standard: string | null;
    nutritional_status: string | null;
    developmental_milestones: Record<string, unknown> | null;
    feeding_type: string | null;
    notes: string | null;
    appointment_id: string | null;
}

export interface PediatricsVaccine extends SpecialtyRecord {
    vaccine_name: string;
    vaccine_type: string;
    dose_number: number;
    total_doses: number | null;
    administration_date: string;
    batch_number: string | null;
    manufacturer: string | null;
    administration_site: string | null;
    administration_route: string | null;
    adverse_reactions: string | null;
    next_dose_date: string | null;
    is_catch_up: boolean;
    notes: string | null;
    appointment_id: string | null;
}

function createPediatricsService(supabase: SupabaseClient) {
    const growthService = createSpecialtyCrudService<PediatricsGrowth>(supabase, 'pediatrics_growth', { dateColumn: 'measurement_date' });
    const vaccineService = createSpecialtyCrudService<PediatricsVaccine>(supabase, 'pediatrics_vaccines', { dateColumn: 'administration_date' });

    return {
        growth: growthService,
        vaccines: vaccineService,

        async getGrowthCurve(doctorId: string, patientId: string): Promise<ServiceResult<PediatricsGrowth[]>> {
            try {
                const { data, error } = await supabase
                    .from('pediatrics_growth')
                    .select('*')
                    .eq('doctor_id', doctorId)
                    .eq('patient_id', patientId)
                    .order('age_months', { ascending: true });
                if (error) return { success: false, error: error.message };
                return { success: true, data: (data || []) as PediatricsGrowth[] };
            } catch (err) {
                return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
            }
        },

        async getPendingVaccines(doctorId: string, patientId: string): Promise<ServiceResult<PediatricsVaccine[]>> {
            try {
                const today = new Date().toISOString().split('T')[0];
                const { data, error } = await supabase
                    .from('pediatrics_vaccines')
                    .select('*')
                    .eq('doctor_id', doctorId)
                    .eq('patient_id', patientId)
                    .lte('next_dose_date', today)
                    .not('next_dose_date', 'is', null)
                    .order('next_dose_date', { ascending: true });
                if (error) return { success: false, error: error.message };
                return { success: true, data: (data || []) as PediatricsVaccine[] };
            } catch (err) {
                return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
            }
        }
    };
}

// --- Traumatology ---

export interface TraumatologyInjury extends SpecialtyRecord {
    injury_type: string;
    anatomical_zone: string;
    laterality: string | null;
    mechanism: string | null;
    severity: string | null;
    diagnosis: string | null;
    imaging_findings: string | null;
    treatment_plan: string | null;
    surgery_required: boolean;
    surgery_date: string | null;
    immobilization_type: string | null;
    immobilization_duration_days: number | null;
    weight_bearing_status: string | null;
    return_to_activity_date: string | null;
    notes: string | null;
    attachment_urls: string[] | null;
    appointment_id: string | null;
}

export interface TraumatologyRehab extends SpecialtyRecord {
    injury_id: string;
    rehab_type: string;
    session_date: string;
    session_number: number;
    total_sessions: number | null;
    exercises: Record<string, unknown> | null;
    pain_level_pre: number | null;
    pain_level_post: number | null;
    range_of_motion: Record<string, unknown> | null;
    strength_assessment: string | null;
    functional_progress: string | null;
    next_goals: string | null;
    notes: string | null;
    appointment_id: string | null;
}

function createTraumatologyService(supabase: SupabaseClient) {
    const injuryService = createSpecialtyCrudService<TraumatologyInjury>(supabase, 'traumatology_injuries');
    const rehabService = createSpecialtyCrudService<TraumatologyRehab>(supabase, 'traumatology_rehab', { dateColumn: 'session_date' });

    return {
        injuries: injuryService,
        rehab: rehabService,

        async getActiveInjuries(doctorId: string): Promise<ServiceResult<TraumatologyInjury[]>> {
            try {
                const { data, error } = await supabase
                    .from('traumatology_injuries')
                    .select('*')
                    .eq('doctor_id', doctorId)
                    .eq('surgery_required', true)
                    .is('return_to_activity_date', null)
                    .order('created_at', { ascending: false });
                if (error) return { success: false, error: error.message };
                return { success: true, data: (data || []) as TraumatologyInjury[] };
            } catch (err) {
                return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
            }
        },

        async getRehabSessions(doctorId: string, injuryId: string): Promise<ServiceResult<TraumatologyRehab[]>> {
            try {
                const { data, error } = await supabase
                    .from('traumatology_rehab')
                    .select('*')
                    .eq('doctor_id', injuryId) // Wait, original code had: .eq('doctor_id', doctorId).eq('injury_id', injuryId)
                    .eq('injury_id', injuryId)
                    .order('session_date', { ascending: true });
                if (error) return { success: false, error: error.message };
                return { success: true, data: (data || []) as TraumatologyRehab[] };
            } catch (err) {
                return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
            }
        }
    };
}

// --- Main Clinical Services Factory ---

export function createClinicalServices(supabase: SupabaseClient) {
    return {
        cardiology: createCardiologyService(supabase),
        gynecology: createGynecologyService(supabase),
        neurology: createNeurologyService(supabase),
        odontology: createOdontologyService(supabase),
        ophthalmology: createOphthalmologyService(supabase),
        pediatrics: createPediatricsService(supabase),
        traumatology: createTraumatologyService(supabase),
    };
}
