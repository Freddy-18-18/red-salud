import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // TODO: Add Admin role check here

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = supabase
            .from('payments')
            .select(`
        *,
        user:user_id (
          email,
          full_name
        )
      `)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data: payments, error: dbError } = await query;

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        return NextResponse.json({ payments });
    } catch (_) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, status } = body;

        if (!id || !['approved', 'rejected', 'pending'].includes(status)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const { error: updateError } = await supabase
            .from('payments')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (_) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
