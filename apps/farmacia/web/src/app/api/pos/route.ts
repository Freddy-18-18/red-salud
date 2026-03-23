import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { invoiceSchema } from '@red-salud/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// GET /api/pharmacy/pos
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const invoice_id = searchParams.get('invoice_id');
    const warehouse_id = searchParams.get('warehouse_id');
    const status = searchParams.get('status');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    let query = supabase
      .from('invoices')
      .select(`
        *,
        invoice_items(*),
        patients(*),
        warehouses(*),
        pharmacy_users(*)
      `);

    if (invoice_id) {
      query = query.eq('id', invoice_id);
    }

    if (warehouse_id) {
      query = query.eq('warehouse_id', warehouse_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST /api/pharmacy/pos - Create new invoice
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate invoice data
    const invoiceResult = invoiceSchema.safeParse(body);
    if (!invoiceResult.success) {
      return NextResponse.json(
        { error: 'Invalid invoice data', details: invoiceResult.error },
        { status: 400 }
      );
    }

    // Start a transaction-like operation
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([{
        invoice_number: body.invoice_number,
        patient_id: body.patient_id,
        warehouse_id: body.warehouse_id,
        user_id: body.user_id,
        status: body.status || 'draft',
        subtotal_usd: body.subtotal_usd,
        subtotal_ves: body.subtotal_ves,
        iva_usd: body.iva_usd,
        iva_ves: body.iva_ves,
        total_usd: body.total_usd,
        total_ves: body.total_ves,
        payment_method: body.payment_method,
        payment_details: body.payment_details,
        exchange_rate: body.exchange_rate,
        notes: body.notes
      }])
      .select()
      .single();

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 500 });
    }

    // Insert invoice items
    if (body.items && body.items.length > 0) {
      const itemsToInsert = body.items.map((item: {
        product_id: string;
        batch_id?: string;
        product_name: string;
        generic_name?: string;
        quantity: number;
        unit_type: string;
        unit_price_usd: number;
        unit_price_ves: number;
        total_usd: number;
        total_ves: number;
        iva_rate: number;
        iva_usd: number;
        iva_ves: number;
      }) => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        batch_id: item.batch_id,
        product_name: item.product_name,
        generic_name: item.generic_name,
        quantity: item.quantity,
        unit_type: item.unit_type,
        unit_price_usd: item.unit_price_usd,
        unit_price_ves: item.unit_price_ves,
        total_usd: item.total_usd,
        total_ves: item.total_ves,
        iva_rate: item.iva_rate,
        iva_usd: item.iva_usd,
        iva_ves: item.iva_ves
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);

      if (itemsError) {
        // Rollback invoice
        await supabase.from('invoices').delete().eq('id', invoice.id);
        return NextResponse.json({ error: itemsError.message }, { status: 500 });
      }

      // Update batch quantities
      for (const item of body.items) {
        if (item.batch_id) {
          const { data: batch } = await supabase
            .from('batches')
            .select('quantity')
            .eq('id', item.batch_id)
            .single();

          if (batch) {
            await supabase
              .from('batches')
              .update({ quantity: batch.quantity - item.quantity })
              .eq('id', item.batch_id);
          }
        }
      }
    }

    // Log the action
    await supabase.from('audit_logs').insert([{
      user_id: body.user_id,
      action: 'create_invoice',
      entity_type: 'invoice',
      entity_id: invoice.id,
      new_values: invoice
    }]);

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// PATCH /api/pharmacy/pos - Update invoice
// ============================================================================
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Get current values for audit
    const { data: current } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    // Update invoice
    const { data, error } = await supabase
      .from('invoices')
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
      action: 'update_invoice',
      entity_type: 'invoice',
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
// DELETE /api/pharmacy/pos - Cancel invoice
// ============================================================================
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const user_id = searchParams.get('user_id');

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Get current invoice
    const { data: current } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (!current) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Get invoice items to restore quantities
    const { data: items } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id);

    // Restore batch quantities
    if (items) {
      for (const item of items) {
        if (item.batch_id) {
          const { data: batch } = await supabase
            .from('batches')
            .select('quantity')
            .eq('id', item.batch_id)
            .single();

          if (batch) {
            await supabase
              .from('batches')
              .update({ quantity: batch.quantity + item.quantity })
              .eq('id', item.batch_id);
          }
        }
      }
    }

    // Delete invoice items
    await supabase.from('invoice_items').delete().eq('invoice_id', id);

    // Delete invoice
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the action
    await supabase.from('audit_logs').insert([{
      user_id,
      action: 'delete_invoice',
      entity_type: 'invoice',
      entity_id: id,
      old_values: current
    }]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
