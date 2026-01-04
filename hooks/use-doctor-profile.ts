"use client";

import { useState, useEffect } from 'react';
import {
  getDoctorProfile,
  updateDoctorProfile,
  getSpecialties,
  getDoctorStats,
} from '@/lib/supabase/services/doctors-service';
import type { DoctorProfile, MedicalSpecialty } from '@/lib/supabase/types/doctors';

export function useDoctorProfile(userId?: string) {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [specialties, setSpecialties] = useState<MedicalSpecialty[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadSpecialties();
      loadStats();
    }
  }, [userId]);

  const loadProfile = async () => {
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
  };

  const loadSpecialties = async () => {
    try {
      const result = await getSpecialties();
      if (result.success && result.data) {
        setSpecialties(result.data);
      }
    } catch (err) {
      console.error('Error loading specialties:', err);
    }
  };

  const loadStats = async () => {
    if (!userId) return;

    try {
      const result = await getDoctorStats(userId);
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const updateProfile = async (updates: Partial<DoctorProfile>) => {
    if (!userId) return { success: false, error: 'No user ID' };

    // Filtrar solo los campos permitidos para actualización
    const allowedUpdates: any = {};
    const allowedFields = [
      'specialty_id', 'license_number', 'license_country', 'years_experience',
      'professional_phone', 'professional_email', 'clinic_address',
      'consultation_duration', 'consultation_price', 'accepts_insurance', 'bio', 'languages'
    ];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        allowedUpdates[key] = (updates as any)[key];
      }
    });

    const result = await updateDoctorProfile(userId, allowedUpdates);

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
