import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Obtener conteo real de pacientes
        const { count: patientsCount, error: patientsError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'paciente');

        // Obtener conteo real de doctores
        const { count: doctorsCount, error: doctorsError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'medico');

        if (patientsError || doctorsError) {
            console.error('[API Metrics] Supabase error:', patientsError || doctorsError);
        }

        return NextResponse.json({
            success: true,
            total_patients: patientsCount || 0,
            total_doctors: doctorsCount || 0,
            total_specialties: 132, // Valor constante referenciado en el hook
            satisfaction_percentage: 98, // Meta-dato de impacto
        });
    } catch (error) {
        console.error('[API Metrics] Unexpected error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
