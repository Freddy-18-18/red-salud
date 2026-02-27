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
  // Primero verificar si ya existe en nuestra base de datos (caché)
  try {
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
  } catch (cacheSearchErr) {
    console.warn('Error searching verification cache:', cacheSearchErr);
  }

  // Intentar verificar con SACS (con timeout extendido para Railway cold start)
  // NOTA: no pasar signal al invoke - el AbortController no es compatible con supabase.functions.invoke
  // El timeout lo maneja el edge function (v15) con hasta ~70s de reintentos
  try {
    const { data, error } = await supabase.functions.invoke('verify-doctor-sacs', {
      body: { cedula },
    });

    // Si no hay error y el médico fue verificado, guardar en caché y retornar
    if (!error && data?.verified) {
      try {
        // Guardar en caché (ignorar errores de caché para no bloquear el flujo)
        await supabase.from('doctor_verifications_cache').upsert({
          cedula: data.data?.cedula || cedula,
          nombre: data.data?.nombre_completo?.split(' ')[0] || '',
          apellido: data.data?.nombre_completo?.split(' ').slice(1).join(' ') || '',
          especialidad: data.data?.especialidad_display,
          mpps: data.data?.matricula_principal,
          verified: true,
          verified_at: new Date().toISOString(),
          source: 'sacs'
        });
      } catch (cacheErr) {
        console.warn('Error updating verification cache:', cacheErr);
      }

      return {
        success: true,
        data: {
          cedula: data.data?.cedula || cedula,
          nombre: data.data?.nombre_completo?.split(' ')[0] || '',
          apellido: data.data?.nombre_completo?.split(' ').slice(1).join(' ') || '',
          especialidad: data.data?.especialidad_display,
          mpps: data.data?.matricula_principal,
          verified: true,
        }
      };
    }

    if (error) {
      console.error('SACS Edge Function error:', error);
    }
  } catch (err) {
    console.log('SACS not available or timeout, allowing manual fallback');
    console.error(err);
  }

  // Si SACS falla o el médico no es encontrado, permitir verificación manual
  // Retornar datos básicos marcados como no verificados
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
      .upsert({
        profile_id: userId,
        licencia_medica: verificationData.mpps || verificationData.cedula,
        // Si valida por SACS, se aprueba inmediatamente.
        verified: verificationData.verified,
        sacs_verified: verificationData.verified,
        sacs_data: {
          cedula: verificationData.cedula,
          nombre_completo: `${verificationData.nombre} ${verificationData.apellido}`,
          verified_date: new Date().toISOString()
        }
      }, { onConflict: 'profile_id' });

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
      // Si valida por SACS, se aprueba inmediatamente.
      verified: sacsData.verified,
      // professional_phone: additionalData?.professional_phone, // Not in DB
      // professional_email: additionalData?.professional_email, // Not in DB
      biografia: additionalData?.bio,
      sacs_verified: sacsData.verified,
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
