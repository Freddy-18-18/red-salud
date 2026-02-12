"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorStats,
} from '@/lib/supabase/services/doctors-service';
import type { DoctorProfile, DoctorProfileFormData } from '@/lib/supabase/types/doctors';

export function useDoctorProfile(userId?: string) {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
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

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const profileResult = await getDoctorProfile(userId);
        if (profileResult.success && profileResult.data) {
          setProfile(profileResult.data);
        } else {
          setProfile(null);
          setError(profileResult.error || 'No se pudo cargar el perfil');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Error loading profile');
      }

      try {
        const statsResult = await getDoctorStats(userId);
        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
        setError('Error loading stats');
      }

      setLoading(false);
    };

    loadData();
  }, [userId]);

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
  };

  return {
    profile,
    stats,
    loading,
    error,
    updateProfile,
    refreshProfile,
  };
}
