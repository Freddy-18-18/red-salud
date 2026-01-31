"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  getDoctorProfile,
  updateDoctorProfile,
  getSpecialties,
  getDoctorStats,
} from '@/lib/supabase/services/doctors-service';
import type { DoctorProfile, MedicalSpecialty, DoctorProfileFormData } from '@/lib/supabase/types/doctors';

export function useDoctorProfile(userId?: string) {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [specialties, setSpecialties] = useState<MedicalSpecialty[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const result = await getDoctorProfile(userId);

    if (result.success && result.data) {
      setProfile(result.data);
    } else {
      setProfile(null);
      setError(result.error || 'No se pudo cargar el perfil');
    }

    setLoading(false);
  }, [userId]);

  const loadSpecialties = useCallback(async () => {
    try {
      const result = await getSpecialties();
      if (result.success && result.data) {
        setSpecialties(result.data);
      }
    } catch (err) {
      console.error('Error loading specialties:', err);
    }
  }, []);

  const loadStats = useCallback(async () => {
    if (!userId) return;

    try {
      const result = await getDoctorStats(userId);
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Error loading stats');
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      void loadProfile();
      void loadSpecialties();
      void loadStats();
    }
  }, [userId, loadProfile, loadSpecialties, loadStats]);

  const updateProfile = async (updates: Partial<DoctorProfile>) => {
    if (!userId) return { success: false, error: 'No user ID' };

    // Filtrar solo los campos permitidos para actualización y convertir null a undefined
    const allowedUpdates: Record<string, unknown> = {};
    const allowedFields: Array<keyof DoctorProfile> = [
      'specialty_id', 'license_number', 'license_country', 'years_experience',
      'professional_phone', 'professional_email', 'clinic_address',
      'consultation_duration', 'consultation_price', 'accepts_insurance', 'bio', 'languages'
    ];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key as keyof DoctorProfile)) {
        const value = updates[key as keyof DoctorProfile];
        if (value !== null && value !== undefined) {
          allowedUpdates[key] = value;
        }
      }
    });

    const result = await updateDoctorProfile(userId, allowedUpdates as Partial<DoctorProfileFormData>);

    if (result.success && result.data) {
      setProfile(result.data);
    }

    return result;
  };

  const refreshProfile = () => {
    loadProfile();
    loadStats();
  };

  return {
    profile,
    specialties,
    stats,
    loading,
    error,
    updateProfile,
    refreshProfile,
  };
}
