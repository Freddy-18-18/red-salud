"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
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

    try {
      console.log('Loading profile for userId:', userId);

      // Primero obtener el perfil base
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        setError(profileError.message || 'Error al cargar perfil');
        setLoading(false);
        return;
      }

      if (!profileData) {
        console.log('No profile found for user:', userId);
        setProfile(null);
        setLoading(false);
        return;
      }

      // Luego obtener doctor_details (solo columnas que existen)
      const { data: doctorDetailsData, error: doctorDetailsError } = await supabase
        .from('doctor_details')
        .select(`
          id,
          licencia_medica,
          especialidad_id,
          anos_experiencia,
          certificaciones,
          idiomas,
          horario_atencion,
          tarifa_consulta,
          acepta_seguros,
          verified,
          biografia,
          sacs_verified,
          sacs_data,
          created_at,
          updated_at
        `)
        .eq('profile_id', userId)
        .maybeSingle();

      if (doctorDetailsError) {
        console.error('Error loading doctor_details:', doctorDetailsError);
        setError(doctorDetailsError.message || 'Error al cargar detalles del médico');
        setLoading(false);
        return;
      }

      if (!doctorDetailsData) {
        // No tiene perfil de médico aún
        console.log('No doctor_details found for user:', userId);
        setProfile(null);
        setLoading(false);
        return;
      }

      // Obtener especialidad si existe
      let specialtyData = null;
      if (doctorDetailsData.especialidad_id) {
        const { data: specialty, error: specialtyError } = await supabase
          .from('specialties')
          .select('*')
          .eq('id', doctorDetailsData.especialidad_id)
          .single();

        if (!specialtyError && specialty) {
          specialtyData = specialty;
        }
      }

      console.log('Doctor details loaded:', {
        userId,
        hasDetails: !!doctorDetailsData,
        verified: doctorDetailsData?.verified,
        sacsVerified: doctorDetailsData?.sacs_verified,
        hasSpecialty: !!specialtyData,
      });

      // Transformar datos al formato esperado
      const transformedProfile: DoctorProfile = {
        id: profileData.id,
        nombre_completo: profileData.nombre_completo,
        email: profileData.email,
        telefono: profileData.telefono,
        cedula: profileData.cedula,
        cedula_verificada: profileData.cedula_verificada,
        sacs_verificado: profileData.sacs_verificado,
        sacs_nombre: profileData.sacs_nombre,
        sacs_matricula: profileData.sacs_matricula,
        sacs_especialidad: profileData.sacs_especialidad,
        // Usar nombres de campos actuales de la BD
        license_number: doctorDetailsData.licencia_medica,
        specialty: specialtyData,
        years_experience: doctorDetailsData.anos_experiencia || 0,
        professional_phone: null, // No existe en BD actual
        professional_email: null, // No existe en BD actual
        bio: doctorDetailsData.biografia,
        languages: doctorDetailsData.idiomas || ['es'],
        is_verified: doctorDetailsData.verified,
        sacs_verified: doctorDetailsData.sacs_verified,
        sacs_data: doctorDetailsData.sacs_data,
        universidad: '',
        average_rating: 0, // No existe en BD actual
        total_reviews: 0, // No existe en BD actual
      } as any;

      console.log('Profile transformed successfully:', {
        id: transformedProfile.id,
        nombre: transformedProfile.nombre_completo,
        verified: transformedProfile.is_verified,
        sacsVerified: transformedProfile.sacs_verified,
      });

      setProfile(transformedProfile);
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Error al cargar perfil');
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
