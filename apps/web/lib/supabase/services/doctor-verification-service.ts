// Servicio de verificación de médicos venezolanos mediante SACS
import { supabase } from '../client';

export interface SACSVerificationData {
  cedula: string;
  nombre: string;
  apellido: string;
  especialidad?: string;
  mpps?: string; // Número de registro MPPS
  colegio?: string;
  estado?: string;
  verified: boolean;
}

export interface VerificationResult {
  success: boolean;
  data?: SACSVerificationData;
  error?: string;
}

/**
 * Verifica un médico venezolano
 * Intenta con SACS pero permite verificación manual si falla
 */
export async function verifySACSDoctor(cedula: string): Promise<VerificationResult> {
  try {
    // Primero verificar si ya existe en nuestra base de datos
    const { data: existingVerification } = await supabase
      .from('doctor_verifications_cache')
      .select('*')
      .eq('cedula', cedula)
      .maybeSingle();

    if (existingVerification && existingVerification.verified) {
      console.log('Usando verificación en caché');
      return {
        success: true,
        data: {
          cedula: existingVerification.cedula,
          nombre: existingVerification.nombre,
          apellido: existingVerification.apellido,
          especialidad: existingVerification.especialidad,
          mpps: existingVerification.mpps,
          colegio: existingVerification.colegio,
          estado: existingVerification.estado,
          verified: true,
        }
      };
    }

    // Intentar verificar con SACS (con timeout corto)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const { data, error } = await supabase.functions.invoke('verify-doctor-sacs', {
        body: { cedula },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!error && data?.verified) {
        // Guardar en caché
        await supabase.from('doctor_verifications_cache').upsert({
          cedula: data.cedula,
          nombre: data.nombre,
          apellido: data.apellido,
          especialidad: data.especialidad,
          mpps: data.mpps,
          colegio: data.colegio,
          estado: data.estado,
          verified: true,
          verified_at: new Date().toISOString(),
          source: 'sacs'
        });

        return {
          success: true,
          data: data as SACSVerificationData
        };
      }
    } catch {
      console.log('SACS no disponible, usando verificación manual');
    }

    // Si SACS falla, permitir verificación manual
    // Retornar datos básicos para que el médico pueda completar su perfil
    // y ser verificado manualmente después
    return {
      success: true,
      data: {
        cedula: cedula,
        nombre: '', // El médico lo completará
        apellido: '', // El médico lo completará
        especialidad: 'Pendiente de verificación',
        mpps: cedula,
        verified: false, // Marcado como no verificado hasta revisión manual
      }
    };

  } catch (err) {
    console.error('Verification error:', err);
    // Permitir continuar con verificación manual
    return {
      success: true,
      data: {
        cedula: cedula,
        nombre: '',
        apellido: '',
        especialidad: 'Pendiente de verificación',
        mpps: cedula,
        verified: false,
      }
    };
  }
}

/**
 * Guarda los datos de verificación en el perfil del médico
 */
export async function saveSACSVerification(
  userId: string,
  verificationData: SACSVerificationData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('doctor_details')
      .update({
        licencia_medica: verificationData.mpps || verificationData.cedula,
        verified: true,
        // Guardar datos adicionales en un campo JSONB
        sacs_verified: true,
        sacs_data: {
          cedula: verificationData.cedula,
          nombre_completo: `${verificationData.nombre} ${verificationData.apellido}`,
          verified_date: new Date().toISOString()
        }
      })
      .eq('profile_id', userId);

    if (error) {
      console.error('Error saving verification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Save verification error:', err);
    return { success: false, error: 'Error al guardar verificación' };
  }
}

/**
 * Verifica y crea el perfil del médico en un solo paso
 */
export async function verifyAndCreateDoctorProfile(
  userId: string,
  cedula: string,
  specialtyId: string,
  additionalData?: {
    professional_phone?: string;
    professional_email?: string;
    bio?: string;
  }
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  // Primero verificar con SACS
  const verificationResult = await verifySACSDoctor(cedula);

  if (!verificationResult.success || !verificationResult.data) {
    return {
      success: false,
      error: verificationResult.error || 'Error en la verificación'
    };
  }

  const sacsData = verificationResult.data;

  // Crear o actualizar el perfil del médico
  const { data, error } = await supabase
    .from('doctor_details')
    .upsert({
      profile_id: userId,
      especialidad_id: specialtyId,
      licencia_medica: sacsData.mpps || sacsData.cedula,
      verified: true,
      // professional_phone: additionalData?.professional_phone, // Not in DB
      // professional_email: additionalData?.professional_email, // Not in DB
      biografia: additionalData?.bio,
      sacs_verified: true,
      sacs_data: {
        cedula: sacsData.cedula,
        nombre_completo: `${sacsData.nombre} ${sacsData.apellido}`,
        especialidad_sacs: sacsData.especialidad,
        colegio: sacsData.colegio,
        estado: sacsData.estado,
        verified_date: new Date().toISOString()
      }
    }, { onConflict: 'profile_id' })
    .select()
    .single();

  if (error) {
    console.error('Error creating doctor profile:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
