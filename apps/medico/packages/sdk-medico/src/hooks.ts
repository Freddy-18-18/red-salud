"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { SupabaseClient, User, Session } from '@supabase/supabase-js';
import { createMedicoSdk } from './medico-sdk';
import type {
    Appointment,
    AppointmentFilters,
    DoctorProfile,
    TimeSlot,
    Prescription,
    LaboratoryResult,
    MedicalRecord,
    MedicalRecordFilters,
    DoctorStats,
    DoctorProfileFormData
} from './appointments';
import type { MedicalSpecialty } from '@red-salud/types';

// --- Reusable Hook Logic ---

export function usePatientAppointments(supabase: SupabaseClient, patientId: string | undefined) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sdk = useMemo(() => createMedicoSdk({ supabase }), [supabase]);

    const refreshAppointments = useCallback(async () => {
        if (!patientId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await sdk.appointments.getPatientAppointments(patientId);
            setAppointments(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading appointments');
        } finally {
            setLoading(false);
        }
    }, [patientId, sdk]);

    useEffect(() => {
        refreshAppointments();
    }, [refreshAppointments]);

    return { appointments, loading, error, refreshAppointments };
}

export function useDoctorAppointments(supabase: SupabaseClient, doctorId: string | undefined) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sdk = useMemo(() => createMedicoSdk({ supabase }), [supabase]);

    const refreshAppointments = useCallback(async () => {
        if (!doctorId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await sdk.appointments.getDoctorAppointments(doctorId);
            setAppointments(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading appointments');
        } finally {
            setLoading(false);
        }
    }, [doctorId, sdk]);

    useEffect(() => {
        refreshAppointments();
    }, [refreshAppointments]);

    return { appointments, loading, error, refreshAppointments };
}

export function useMedicalSpecialties(supabase: SupabaseClient, onlyWithDoctors: boolean = false) {
    const [specialties, setSpecialties] = useState<MedicalSpecialty[]>([]);
    const [loading, setLoading] = useState(true);
    const sdk = useMemo(() => createMedicoSdk({ supabase }), [supabase]);

    useEffect(() => {
        const loadSpecialties = async () => {
            try {
                const data = await sdk.appointments.getMedicalSpecialties(onlyWithDoctors);
                setSpecialties(data);
            } catch (error) {
                console.error('Error loading specialties:', error);
            } finally {
                setLoading(false);
            }
        };
        loadSpecialties();
    }, [onlyWithDoctors, sdk]);

    return { specialties, loading };
}

// --- Auth & Profile Hooks ---

import type { User, Session } from '@supabase/supabase-js';

export function useMedicoAuth(supabase: SupabaseClient) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const sdk = useMemo(() => createMedicoSdk({ supabase }), [supabase]);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const session = await sdk.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
            } catch (error) {
                console.error("SDK Auth Init Error:", error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        const subscription = sdk.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [sdk]);

    return { user, session, loading, signOut: () => sdk.auth.signOut() };
}

export function useDoctorProfile(supabase: SupabaseClient, doctorId: string | undefined) {
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [stats, setStats] = useState<DoctorStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sdk = useMemo(() => createMedicoSdk({ supabase }), [supabase]);

    const loadData = useCallback(async () => {
        if (!doctorId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [profileData, statsData] = await Promise.all([
                sdk.appointments.getDoctorProfile(doctorId),
                sdk.appointments.getDoctorStats(doctorId)
            ]);
            setProfile(profileData);
            setStats(statsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading doctor profile');
        } finally {
            setLoading(false);
        }
    }, [doctorId, sdk]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const updateProfile = async (updates: Partial<DoctorProfileFormData>) => {
        if (!doctorId) return { success: false, error: 'No doctor ID' };
        try {
            const updatedProfile = await sdk.appointments.updateDoctorProfile(doctorId, updates);
            setProfile(updatedProfile);
            return { success: true, data: updatedProfile };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Error updating profile' };
        }
    };

    const refreshProfile = () => {
        loadData();
    };

    return {
        profile,
        stats,
        loading,
        error,
        updateProfile,
        refreshProfile,
        // Legacy support
        doctor: profile,
    };
}


export function useMedicalRecords(supabase: SupabaseClient, patientId: string | undefined, filters?: MedicalRecordFilters) {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const sdk = useMemo(() => createMedicoSdk({ supabase }), [supabase]);

    useEffect(() => {
        if (!patientId) return;
        const loadRecords = async () => {
            setLoading(true);
            try {
                const data = await sdk.records.getMedicalRecords(patientId, filters);
                setRecords(data);
            } finally {
                setLoading(false);
            }
        };
        loadRecords();
    }, [patientId, JSON.stringify(filters), sdk]);

    return { records, loading };
}

export function useAppointments(supabase: SupabaseClient, filters?: AppointmentFilters) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const sdk = useMemo(() => createMedicoSdk({ supabase }), [supabase]);

    useEffect(() => {
        const loadAppointments = async () => {
            setLoading(true);
            try {
                const data = await sdk.appointments.getAppointments(filters);
                setAppointments(data);
            } finally {
                setLoading(false);
            }
        };
        loadAppointments();
    }, [JSON.stringify(filters), sdk]);

    return { appointments, loading };
}


export function useLaboratory(supabase: SupabaseClient, patientId: string | undefined) {
    const [results, setResults] = useState<LaboratoryResult[]>([]);
    const [loading, setLoading] = useState(true);
    const sdk = useMemo(() => createMedicoSdk({ supabase }), [supabase]);

    useEffect(() => {
        if (!patientId) return;
        const loadResults = async () => {
            setLoading(true);
            try {
                const data = await sdk.laboratory.getResultsByPatientId(patientId);
                setResults(data);
            } finally {
                setLoading(false);
            }
        };
        loadResults();
    }, [patientId, sdk]);

    return { results, loading };
}


export function usePrescriptions(supabase: SupabaseClient, patientId: string | undefined) {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const sdk = useMemo(() => createMedicoSdk({ supabase }), [supabase]);

    useEffect(() => {
        if (!patientId) return;
        const loadPrescriptions = async () => {
            setLoading(true);
            try {
                const data = await sdk.prescriptions.getPrescriptionsByPatientId(patientId);
                setPrescriptions(data);
            } finally {
                setLoading(false);
            }
        };
        loadPrescriptions();
    }, [patientId, sdk]);

    return { prescriptions, loading };
}

export function usePatientLaboratory(supabase: SupabaseClient, patientId: string | undefined, filters?: LabOrderFilters) {
    const [orders, setOrders] = useState<LabOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sdk = useMemo(() => createMedicoSdk({ supabase }), [supabase]);

    const refreshOrders = useCallback(async () => {
        if (!patientId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await sdk.laboratory.getPatientOrders(patientId, filters);
            setOrders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading laboratory orders');
        } finally {
            setLoading(false);
        }
    }, [patientId, sdk, filters]);

    useEffect(() => {
        refreshOrders();
    }, [refreshOrders]);

    return { orders, loading, error, refreshOrders };
}
