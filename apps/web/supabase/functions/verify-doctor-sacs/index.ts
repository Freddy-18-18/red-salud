/**
 * 🏥 EDGE FUNCTION: Verificación de Médicos en SACS
 * 
 * Esta función valida las credenciales de médicos venezolanos
 * consultando el sistema oficial SACS (Servicio Autónomo de Contraloría Sanitaria)
 * 
 * IMPORTANTE: Esta Edge Function actúa como proxy hacia un servicio backend
 * que ejecuta Puppeteer para hacer scraping del SACS.
 * 
 * Flujo:
 * 1. Edge Function recibe la cédula del médico
 * 2. Llama al servicio backend (Railway/Render) con Puppeteer
 * 3. El backend hace scraping del SACS
 * 4. Retorna los datos validados
 * 5. Edge Function guarda en Supabase y retorna al cliente
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuración
const BACKEND_SERVICE_URL = Deno.env.get('SACS_BACKEND_URL') || 'http://localhost:3001';

interface VerificationRequest {
  cedula: string;
  tipo_documento?: 'V' | 'E';
  user_id?: string; // ID del usuario en Supabase (opcional)
}

interface Profesion {
  profesion: string;
  matricula: string;
  fecha_registro: string;
  tomo: string;
  folio: string;
}

interface Postgrado {
  postgrado: string;
  fecha_registro: string;
  tomo: string;
  folio: string;
}

interface VerificationResponse {
  success: boolean;
  verified: boolean;
  data?: {
    cedula: string;
    tipo_documento: string;
    nombre_completo: string;
    profesiones: Profesion[];
    postgrados: Postgrado[];
    profesion_principal: string;
    matricula_principal: string;
    especialidad_display: string;
    es_medico_humano: boolean;
    es_veterinario: boolean;
    tiene_postgrados: boolean;
    apto_red_salud: boolean;
  };
  message: string;
  razon_rechazo?: 'NO_REGISTRADO_SACS' | 'MEDICO_VETERINARIO' | 'PROFESION_NO_HABILITADA' | null;
  error?: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const body: VerificationRequest = await req.json();
    const { cedula, tipo_documento = 'V', user_id } = body;

    console.log('[EDGE] Verificación solicitada:', { cedula, tipo_documento, user_id });

    // Validaciones básicas
    if (!cedula) {
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          error: 'Cédula requerida',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!/^\d{6,10}$/.test(cedula)) {
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          error: 'Formato de cédula inválido (solo números, 6-10 dígitos)',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!['V', 'E'].includes(tipo_documento)) {
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          error: 'Tipo de documento debe ser V (venezolano) o E (extranjero)',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Llamar al servicio backend con Puppeteer
    console.log('[EDGE] Llamando al servicio backend...');

    const backendResponse = await fetch(`${BACKEND_SERVICE_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cedula,
        tipo_documento,
      }),
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend service error: ${backendResponse.status}`);
    }

    const resultado: VerificationResponse = await backendResponse.json();

    console.log('[EDGE] Resultado del backend:', {
      encontrado: resultado.verified,
      apto: resultado.data?.apto_red_salud,
    });

    // Si tenemos user_id, guardar en Supabase
    if (user_id && resultado.success && resultado.data) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('[EDGE] Guardando verificación en Supabase...');

        // Guardar en tabla de verificaciones SACS
        const { error: insertError } = await supabase
          .from('verificaciones_sacs')
          .insert({
            user_id: user_id,
            cedula: resultado.data.cedula,
            tipo_documento: resultado.data.tipo_documento,
            nombre_completo: resultado.data.nombre_completo,
            profesion_principal: resultado.data.profesion_principal,
            matricula_principal: resultado.data.matricula_principal,
            especialidad: resultado.data.especialidad_display,
            profesiones: resultado.data.profesiones,
            postgrados: resultado.data.postgrados,
            es_medico_humano: resultado.data.es_medico_humano,
            es_veterinario: resultado.data.es_veterinario,
            apto_red_salud: resultado.data.apto_red_salud,
            verificado: resultado.verified,
            razon_rechazo: resultado.razon_rechazo,
            fecha_verificacion: new Date().toISOString(),
          });

        if (insertError) {
          console.error('[EDGE] Error guardando en Supabase:', insertError);
        } else {
          console.log('[EDGE] Verificación guardada exitosamente');
        }

        // Si es apto, actualizar el perfil del médico
        if (resultado.data.apto_red_salud) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              cedula: resultado.data.cedula,
              cedula_verificada: true,
              sacs_verificado: true,
              sacs_nombre: resultado.data.nombre_completo,
              sacs_matricula: resultado.data.matricula_principal,
              sacs_especialidad: resultado.data.especialidad_display,
              sacs_fecha_verificacion: new Date().toISOString(),
            })
            .eq('id', user_id);

          if (updateError) {
            console.error('[EDGE] Error actualizando perfil:', updateError);
          } else {
            console.log('[EDGE] Perfil de médico actualizado');
          }
        }
      } catch (dbError) {
        console.error('[EDGE] Error en operaciones de base de datos:', dbError);
        // No fallar la request por errores de BD
      }
    }

    // Retornar resultado
    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    console.error('[EDGE] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    return new Response(
      JSON.stringify({
        success: false,
        verified: false,
        error: `Error del servicio de verificación: ${errorMessage}`,
        message:
          'El servicio de verificación no está disponible. Por favor intenta más tarde.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
