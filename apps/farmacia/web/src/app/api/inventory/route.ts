import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { batchSchema } from '@red-salud/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// GET /api/pharmacy/inventory
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const warehouse_id = searchParams.get('warehouse_id');
    const zone = searchParams.get('zone');
    const expiry_days = searchParams.get('expiry_days');
    const low_stock = searchParams.get('low_stock');

    let query = supabase
      .from('batches')
      .select(`
        *,
        products!inner(*),
        warehouses!inner(*)
      `);

    // Filter by warehouse
    if (warehouse_id) {
      query = query.eq('warehouse_id', warehouse_id);
    }

    // Filter by zone
    if (zone) {
      query = query.eq('zone', zone);
    }

    // Filter by expiry
    if (expiry_days) {
      const days = parseInt(expiry_days);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);
      query = query.lte('expiry_date', expiryDate.toISOString());
    }

    // Filter by low stock
    if (low_stock === 'true') {
      query = query.lte('quantity', 'products.min_stock');
    }

    const { data, error } = await query.order('expiry_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST /api/pharmacy/inventory
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate batch data
    const batchResult = batchSchema.safeParse(body);
    if (!batchResult.success) {
      return NextResponse.json(
        { error: 'Invalid batch data', details: batchResult.error },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('batches')
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the action
    await supabase.from('audit_logs').insert([{
      user_id: body.user_id,
      action: 'create_batch',
      entity_type: 'batch',
      entity_id: data.id,
      new_values: data
    }]);

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// PATCH /api/pharmacy/inventory
// ============================================================================
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    // Get current values for audit
    const { data: current } = await supabase
      .from('batches')
      .select('*')
      .eq('id', id)
      .single();

    // Update batch
    const { data, error } = await supabase
      .from('batches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the action
    await supabase.from('audit_logs').insert([{
      user_id: updates.user_id,
      action: 'update_batch',
      entity_type: 'batch',
      entity_id: id,
      old_values: current,
      new_values: data
    }]);

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// DELETE /api/pharmacy/inventory
// ============================================================================
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const user_id = searchParams.get('user_id');

    if (!id) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    // Get current values for audit
    const { data: current } = await supabase
      .from('batches')
      .select('*')
      .eq('id', id)
      .single();

    // Delete batch
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the action
    await supabase.from('audit_logs').insert([{
      user_id,
      action: 'delete_batch',
      entity_type: 'batch',
      entity_id: id,
      old_values: current
    }]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
