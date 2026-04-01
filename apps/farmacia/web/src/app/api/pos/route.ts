import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// LEGACY API ROUTE — /api/pos
//
// NOTA: Esta ruta usa las tablas con prefijo farmacia_* del esquema actual.
// Tablas anteriores (invoices, invoice_items) ya no existen.
//
// Tablas actuales:
//   farmacia_ventas              — Facturas/ventas
//   pharmacy_invoice_items       — Items de factura (legacy name kept in schema)
//   farmacia_inventario          — Inventario (para ajustar stock)
// ============================================================================

// ============================================================================
// GET /api/pos — Listar ventas/facturas
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const invoice_id = searchParams.get("invoice_id");
    const pharmacy_id = searchParams.get("pharmacy_id");
    const status = searchParams.get("status");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    let query = supabase
      .from("farmacia_ventas")
      .select(`
        *,
        pharmacy_invoice_items(*)
      `);

    if (invoice_id) {
      query = query.eq("id", invoice_id);
    }

    if (pharmacy_id) {
      query = query.eq("pharmacy_id", pharmacy_id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (date_from) {
      query = query.gte("created_at", date_from);
    }

    if (date_to) {
      query = query.lte("created_at", date_to);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================================================
// POST /api/pos — Crear nueva venta/factura
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Crear factura
    const { data: invoice, error: invoiceError } = await supabase
      .from("farmacia_ventas")
      .insert([
        {
          pharmacy_id: body.pharmacy_id,
          invoice_number: body.invoice_number,
          customer_name: body.customer_name,
          customer_ci: body.customer_ci,
          customer_rif: body.customer_rif,
          customer_phone: body.customer_phone,
          status: body.status || "completed",
          subtotal_usd: body.subtotal_usd,
          discount_usd: body.discount_usd ?? 0,
          tax_usd: body.tax_usd ?? 0,
          total_usd: body.total_usd,
          exchange_rate_used: body.exchange_rate,
          total_bs: body.total_bs,
          payment_method: body.payment_method,
          payment_reference: body.payment_reference,
          payment_details: body.payment_details,
          cashier_id: body.cashier_id,
          notes: body.notes,
          is_fiscal: body.is_fiscal ?? false,
          cash_session_id: body.cash_session_id,
        },
      ])
      .select()
      .single();

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 500 });
    }

    // Insertar items de la factura
    if (body.items && body.items.length > 0) {
      const itemsToInsert = body.items.map(
        (item: {
          product_id: string;
          batch_id?: string;
          quantity: number;
          unit_price_usd: number;
          unit_price_bs: number;
          discount_percent?: number;
          subtotal_usd: number;
          subtotal_bs: number;
          is_prescription_item?: boolean;
        }) => ({
          invoice_id: invoice.id,
          product_id: item.product_id,
          batch_id: item.batch_id,
          quantity: item.quantity,
          unit_price_usd: item.unit_price_usd,
          unit_price_bs: item.unit_price_bs,
          discount_percent: item.discount_percent ?? 0,
          subtotal_usd: item.subtotal_usd,
          subtotal_bs: item.subtotal_bs,
          is_prescription_item: item.is_prescription_item ?? false,
        }),
      );

      const { error: itemsError } = await supabase
        .from("pharmacy_invoice_items")
        .insert(itemsToInsert);

      if (itemsError) {
        // Rollback: eliminar la factura si fallan los items
        await supabase.from("farmacia_ventas").delete().eq("id", invoice.id);
        return NextResponse.json({ error: itemsError.message }, { status: 500 });
      }

      // Actualizar stock de inventario
      for (const item of body.items) {
        if (item.batch_id) {
          const { data: batch } = await supabase
            .from("farmacia_inventario")
            .select("quantity_available")
            .eq("id", item.batch_id)
            .single();

          if (batch) {
            await supabase
              .from("farmacia_inventario")
              .update({
                quantity_available: batch.quantity_available - item.quantity,
              })
              .eq("id", item.batch_id);
          }
        }
      }
    }

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================================================
// PATCH /api/pos — Actualizar factura
// ============================================================================
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Se requiere el ID de la factura" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("farmacia_ventas")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================================================
// DELETE /api/pos — Anular factura y restaurar stock
// ============================================================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Se requiere el ID de la factura" },
        { status: 400 },
      );
    }

    // Obtener factura actual
    const { data: current } = await supabase
      .from("farmacia_ventas")
      .select("*")
      .eq("id", id)
      .single();

    if (!current) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 },
      );
    }

    // Obtener items para restaurar stock
    const { data: items } = await supabase
      .from("pharmacy_invoice_items")
      .select("*")
      .eq("invoice_id", id);

    // Restaurar stock
    if (items) {
      for (const item of items) {
        if (item.batch_id) {
          const { data: batch } = await supabase
            .from("farmacia_inventario")
            .select("quantity_available")
            .eq("id", item.batch_id)
            .single();

          if (batch) {
            await supabase
              .from("farmacia_inventario")
              .update({
                quantity_available: batch.quantity_available + item.quantity,
              })
              .eq("id", item.batch_id);
          }
        }
      }
    }

    // Anular factura (soft delete — marcar como voided)
    const { data, error } = await supabase
      .from("farmacia_ventas")
      .update({
        status: "voided",
        voided_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, success: true });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
