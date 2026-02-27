/**
 * 🏥 EDGE FUNCTION: Verificación de Médicos en SACS
 * Backend: Railway Puppeteer Service
 * Manejo de cold starts: reintentos con backoff exponencial
 *
 * IMPORTANTE: Esta Edge Function actúa como proxy hacia un servicio backend
 * que ejecuta Puppeteer para hacer scraping del SACS.
 *
 * Flujo:
 * 1. Edge Function recibe la cédula del médico
 * 2. Llama al servicio backend (Railway) con Puppeteer con reintentos
 * 3. El backend hace scraping del SACS
 * 4. Retorna los datos validados
 * 5. Edge Function guarda en Supabase y retorna al cliente
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RAILWAY_BACKEND_URL_ACTIVE = 'https://sacs-verification-clean-20260215-production.up.railway.app';
const DEAD_RAILWAY_URLS = ['https://sacs-verification-service-production.up.railway.app'];
const CONNECT_TIMEOUT_MS = 50000; // 50s por intento (Railway cold start 15-30s)

function isProbablyMisconfiguredBackendUrl(url: string) {
  const n = (url || '').trim().toLowerCase();
  return n === '' || n.includes('localhost') || n.includes('127.0.0.1');
}

function resolveBackendUrl(): string {
  const envUrl = (Deno.env.get('SACS_BACKEND_URL') || '').trim();
  if (!envUrl || DEAD_RAILWAY_URLS.includes(envUrl) || isProbablyMisconfiguredBackendUrl(envUrl)) {
    console.log('[EDGE] URL env no configurada o antigua, usando URL activa:', RAILWAY_BACKEND_URL_ACTIVE);
    return RAILWAY_BACKEND_URL_ACTIVE;
  }
  return envUrl;
}

const BACKEND_URL = resolveBackendUrl();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface VerificationRequest {
  cedula: string;
  tipo_documento?: 'V' | 'E';
  user_id?: string;
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

// Fetch con reintento y backoff - para manejar Railway sleeping/cold start
async function fetchWithRetry(url: string, init: RequestInit, retryDelaysMs: number[]): Promise<Response> {
  let lastError: unknown;
  const maxAttempts = retryDelaysMs.length + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), CONNECT_TIMEOUT_MS);
    try {
      console.log(`[EDGE] Intento ${attempt}/${maxAttempts} -> ${url}`);
      const res = await fetch(url, { ...init, signal: ac.signal });
      clearTimeout(timer);
      console.log(`[EDGE] Intento ${attempt} exitoso: HTTP ${res.status}`);
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[EDGE] Intento ${attempt}/${maxAttempts} falló: ${errMsg}`);

      if (attempt < maxAttempts) {
        const delay = retryDelaysMs[attempt - 1];
        console.log(`[EDGE] Esperando ${delay}ms antes de reintentar (Railway cold start)...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const body: VerificationRequest = await req.json();
    const { cedula, tipo_documento = 'V', user_id } = body;

    console.log('[EDGE] Solicitud recibida:', { cedula, tipo_documento, user_id: user_id ? '<presente>' : '<ausente>' });
    console.log('[EDGE] Backend URL:', BACKEND_URL);

    if (!cedula || !/^\d{6,10}$/.test(cedula)) {
      return new Response(
        JSON.stringify({ success: false, verified: false, error: 'Cédula inválida. Debe ser solo números, entre 6 y 10 dígitos.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!['V', 'E'].includes(tipo_documento)) {
      return new Response(
        JSON.stringify({ success: false, verified: false, error: 'tipo_documento debe ser V o E' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Llamar al backend con reintentos (3 intentos: inmediato, +8s, +17s)
    // Delays pensados para el cold start de Railway (~15-25s)
    let backendResponse: Response;
    try {
      backendResponse = await fetchWithRetry(
        `${BACKEND_URL}/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cedula, tipo_documento }),
        },
        [8000, 17000] // delays entre reintentos: 8s luego 17s
      );
    } catch (fetchErr) {
      const msg = fetchErr instanceof Error ? fetchErr.message : 'Error de conexión';
      console.error('[EDGE] Backend inalcanzable tras 3 intentos:', msg);
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          error: 'BACKEND_UNREACHABLE',
          message: 'El servicio de verificación SACS no está disponible en este momento. Por favor intenta nuevamente en 1-2 minutos.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' }, status: 503 }
      );
    }

    if (!backendResponse.ok) {
      const errBody = await backendResponse.text().catch(() => '');
      console.error('[EDGE] Backend respondió HTTP', backendResponse.status, errBody.slice(0, 200));
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          error: `BACKEND_HTTP_${backendResponse.status}`,
          message: 'El servicio de verificación SACS respondió con un error. Intenta nuevamente.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      );
    }

    const resultado: VerificationResponse = await backendResponse.json();
    console.log('[EDGE] Resultado:', { verified: resultado.verified, razon: resultado.razon_rechazo });

    // Guardar en Supabase si hay user_id
    if (user_id && resultado.success && resultado.data) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error: insertError } = await supabase
          .from('verificaciones_sacs')
          .insert({
            user_id,
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
          console.error('[EDGE] Error guardando verificación:', insertError);
        } else {
          console.log('[EDGE] Verificación guardada');
        }

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

          // ── Actualizar doctor_details con la especialidad obtenida del SACS ──
          // La especialidad_display viene como texto (e.g. "CARDIÓLOGO", "MÉDICO GENERAL", "INTERNISTA")
          // Se busca en la tabla specialties por nombre. Si no coincide, se usa Médico General.
          try {
            const especialidadSacs = (resultado.data.especialidad_display || '').trim();
            let specialtyId: string | null = null;

            // 1. Intentar match exacto (case-insensitive)
            if (especialidadSacs) {
              const { data: exact } = await supabase
                .from('specialties')
                .select('id, name')
                .ilike('name', especialidadSacs)
                .maybeSingle();

              if (exact) {
                specialtyId = exact.id;
                console.log('[EDGE] Especialidad encontrada (exact):', exact.name);
              } else {
                // 2. Intentar búsqueda parcial — el SACS a veces usa abreviaturas
                const keyword = especialidadSacs.split(' ')[0]; // Primer token
                const { data: partial } = await supabase
                  .from('specialties')
                  .select('id, name')
                  .ilike('name', `%${keyword}%`)
                  .limit(1)
                  .maybeSingle();

                if (partial) {
                  specialtyId = partial.id;
                  console.log('[EDGE] Especialidad encontrada (partial):', partial.name);
                }
              }
            }

            // 3. Fallback: Médico General si no se encontró ninguna coincidencia
            if (!specialtyId) {
              const { data: generalSpecialty } = await supabase
                .from('specialties')
                .select('id, name')
                .or('name.ilike.%médico general%,name.ilike.%medicina general%,name.ilike.%general%')
                .limit(1)
                .maybeSingle();

              if (generalSpecialty) {
                specialtyId = generalSpecialty.id;
                console.log('[EDGE] Usando Médico General como fallback:', generalSpecialty.name);
              } else {
                console.warn('[EDGE] No se encontró Médico General en la tabla specialties');
              }
            }

            // 4. Actualizar doctor_details con la especialidad y marcar como verificado
            if (specialtyId) {
              const { error: detailsError } = await supabase
                .from('doctor_details')
                .upsert(
                  {
                    profile_id: user_id,
                    especialidad_id: specialtyId,
                    sacs_verified: true,
                    verified: true,
                    sacs_data: {
                      cedula: resultado.data.cedula,
                      nombre_completo: resultado.data.nombre_completo,
                      especialidad_display: resultado.data.especialidad_display,
                      matricula_principal: resultado.data.matricula_principal,
                      profesion_principal: resultado.data.profesion_principal,
                      postgrados: resultado.data.postgrados,
                      verified_date: new Date().toISOString(),
                    },
                  },
                  { onConflict: 'profile_id' }
                );

              if (detailsError) {
                console.error('[EDGE] Error actualizando doctor_details:', detailsError);
              } else {
                console.log('[EDGE] doctor_details actualizado con especialidad_id:', specialtyId);
              }
            }
          } catch (specialtyErr) {
            console.error('[EDGE] Error al asignar especialidad (non-fatal):', specialtyErr);
          }
        }
      } catch (dbError) {
        console.error('[EDGE] Error BD (non-fatal):', dbError);
        // No fallar la request por errores de BD
      }
    }

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: unknown) {
    console.error('[EDGE] Error no controlado:', err);
    return new Response(
      JSON.stringify({
        success: false,
        verified: false,
        error: err instanceof Error ? err.message : 'Error interno',
        message: 'Error interno del servicio de verificación.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
