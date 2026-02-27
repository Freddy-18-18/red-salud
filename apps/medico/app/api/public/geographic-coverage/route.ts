import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Datos de cobertura geográfica
        // En una fase posterior esto vendría de una agregación por estado/ciudad en profiles o doctor_details
        const coverage = [
            { name: 'Distrito Capital', count: 45, percentage: 35 },
            { name: 'Miranda', count: 32, percentage: 25 },
            { name: 'Carabobo', count: 18, percentage: 15 },
            { name: 'Zulia', count: 15, percentage: 12 },
            { name: 'Aragua', count: 12, percentage: 8 },
            { name: 'Otros', count: 8, percentage: 5 },
        ];

        return NextResponse.json({
            success: true,
            data: coverage,
        });
    } catch (error) {
        console.error('[API Coverage] Unexpected error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
