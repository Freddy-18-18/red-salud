import { NextRequest, NextResponse } from 'next/server';
import { medicoSdk } from '@/lib/sdk';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '6');

        // El frontend pide específicamente ?featured=true&limit=6
        const doctors = await medicoSdk.appointments.getFeaturedDoctors(limit);

        return NextResponse.json({
            success: true,
            data: doctors,
        });
    } catch (error) {
        console.error('[API Doctors] Unexpected error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
