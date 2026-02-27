import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const specialtyId = searchParams.get('specialtyId') || undefined;

        const supabase = createClient(supabaseUrl, supabaseKey);

        let query = supabase
            .from('doctor_details')
            .select(`
                *,
                specialty:specialties(id, name, description, icon),
                profile:profiles!doctor_details_profile_id_fkey(id, nombre_completo, email, avatar_url)
            `)
            .eq('verified', true);

        if (specialtyId) {
            query = query.eq('especialidad_id', specialtyId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 },
            );
        }

        const doctors = (data || []).map((row: any) => ({
            id: String(row.id),
            especialidad_id: row.especialidad_id ?? undefined,
            licencia_medica: row.licencia_medica ?? undefined,
            anos_experiencia: row.anos_experiencia ?? undefined,
            biografia: row.biografia ?? undefined,
            tarifa_consulta: row.tarifa_consulta ? Number(row.tarifa_consulta) : undefined,
            consultation_duration: row.consultation_duration ?? 30,
            verified: Boolean(row.verified),
            created_at: String(row.created_at),
            updated_at: String(row.updated_at),
            specialty: row.specialty
                ? {
                        id: String(row.specialty.id),
                        name: row.specialty.name ?? undefined,
                        description: row.specialty.description ?? undefined,
                        icon: row.specialty.icon ?? undefined,
                    }
                : undefined,
            profile: row.profile
                ? {
                        id: String(row.profile.id),
                        nombre_completo: row.profile.nombre_completo ?? undefined,
                        email: row.profile.email ?? undefined,
                        avatar_url: row.profile.avatar_url ?? undefined,
                    }
                : undefined,
        }));

        return NextResponse.json({
            success: true,
            data: doctors,
        });
    } catch (error) {
        console.error('[API Doctors] Unexpected error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
}
