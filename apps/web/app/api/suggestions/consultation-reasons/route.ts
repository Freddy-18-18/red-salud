/**
 * API Route: Sugerencias Inteligentes de Motivos de Consulta
 * 
 * GET /api/suggestions/consultation-reasons
 * 
 * Query params:
 * - q: texto de búsqueda (opcional)
 * - limit: límite de resultados (default: 20)
 * 
 * Retorna sugerencias personalizadas basadas en:
 * 1. Historial de uso del médico
 * 2. Especialidad del médico
 * 3. Catálogo general de motivos
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import {
    getSmartSuggestions,
    getInitialSuggestions
} from '@/lib/services/suggestions-service';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Obtener parámetros de búsqueda
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q') || '';
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

        // Obtener especialidad del médico
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('sacs_especialidad, specialty_id, specialties(name)')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.warn('Could not fetch doctor specialty:', profileError);
        }

        // Determinar la especialidad a usar
        const specialty =
            profile?.sacs_especialidad ||
            (profile?.specialties as { name?: string } | null)?.name ||
            'Medicina Interna'; // Fallback

        // Si no hay query, devolver sugerencias iniciales
        if (!query || query.length < 2) {
            const initialSuggestions = await getInitialSuggestions(
                supabase as unknown as SupabaseClient,
                user.id,
                specialty,
                limit
            );

            return NextResponse.json({
                suggestions: initialSuggestions,
                specialty,
                query: '',
            });
        }

        // Obtener sugerencias inteligentes
        const suggestions = await getSmartSuggestions(supabase as unknown as SupabaseClient, {
            doctorId: user.id,
            specialty,
            query,
            limit,
        });

        return NextResponse.json({
            ...suggestions,
            specialty,
            query,
        });

    } catch (error) {
        console.error('Error in consultation-reasons API:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/suggestions/consultation-reasons
 * 
 * Body:
 * - reason: motivo de consulta usado
 * 
 * Registra el uso de un motivo para mejorar las sugerencias futuras
 */
export async function POST(request: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Obtener el motivo del body
        const body = await request.json();
        const { reason } = body;

        if (!reason || typeof reason !== 'string') {
            return NextResponse.json(
                { error: 'El campo "reason" es requerido' },
                { status: 400 }
            );
        }

        // Intentar usar la función RPC primero
        const { error: rpcError } = await supabase.rpc('increment_reason_usage', {
            p_doctor_id: user.id,
            p_reason: reason.trim(),
        });

        if (rpcError) {
            console.warn('RPC failed, using manual upsert:', rpcError);

            // Verificar si existe
            const { data: existing } = await supabase
                .from('doctor_reason_usage')
                .select('id, use_count')
                .eq('doctor_id', user.id)
                .eq('reason', reason.trim())
                .single();

            if (existing) {
                // Update existente
                await supabase
                    .from('doctor_reason_usage')
                    .update({
                        use_count: (existing as { use_count: number }).use_count + 1,
                        last_used_at: new Date().toISOString(),
                    })
                    .eq('id', (existing as { id: string }).id);
            } else {
                // Insert nuevo
                await supabase
                    .from('doctor_reason_usage')
                    .insert({
                        doctor_id: user.id,
                        reason: reason.trim(),
                        use_count: 1,
                        last_used_at: new Date().toISOString(),
                    });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in POST consultation-reasons:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
