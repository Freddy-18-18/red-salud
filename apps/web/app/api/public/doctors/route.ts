import { NextRequest, NextResponse } from 'next/server';
import { getFeaturedDoctors } from '@/lib/supabase/services/doctors-service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '6');
        const featured = searchParams.get('featured') === 'true';

        // El frontend pide específicamente ?featured=true&limit=6
        // La función getFeaturedDoctors ya filtra por verified y sacs_verified
        const result = await getFeaturedDoctors(limit);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.data,
        });
    } catch (error) {
        console.error('[API Doctors] Unexpected error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
