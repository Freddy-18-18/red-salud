import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// LEGACY API ROUTE — /api/reports
//
// NOTA: Esta ruta usa las tablas con prefijo farmacia_* del esquema actual.
// Tablas anteriores (invoices, invoice_items, batches, products) ya no existen.
//
// Tablas actuales:
//   farmacia_ventas              — Facturas/ventas
//   pharmacy_invoice_items       — Items de factura
//   farmacia_inventario          — Inventario
// ============================================================================

// ============================================================================
// GET /api/reports — Reportes por tipo
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const pharmacy_id = searchParams.get("pharmacy_id");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    switch (type) {
      case "sales":
        return await getSalesReport(pharmacy_id, date_from, date_to);
      case "inventory":
        return await getInventoryReport(pharmacy_id);
      case "x_cut":
        return await getXCutReport(pharmacy_id);
      case "z_report":
        return await getZReport(pharmacy_id);
      default:
        return NextResponse.json(
          { error: "Tipo de reporte invalido" },
          { status: 400 },
        );
    }
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================================================
// Reporte de Ventas
// ============================================================================
async function getSalesReport(
  pharmacy_id: string | null,
  date_from: string | null,
  date_to: string | null,
) {
  const supabase = await createClient();

  let query = supabase
    .from("farmacia_ventas")
    .select(`
      *,
      pharmacy_invoice_items(*)
    `)
    .eq("status", "completed");

  if (pharmacy_id) {
    query = query.eq("pharmacy_id", pharmacy_id);
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

  const totalSalesUSD = data.reduce(
    (sum: number, inv: { total_usd: number }) => sum + Number(inv.total_usd),
    0,
  );
  const totalSalesBs = data.reduce(
    (sum: number, inv: { total_bs: number }) => sum + Number(inv.total_bs),
    0,
  );
  const totalTaxUSD = data.reduce(
    (sum: number, inv: { tax_usd: number }) => sum + Number(inv.tax_usd),
    0,
  );

  return NextResponse.json({
    data: {
      invoices: data,
      metrics: {
        total_invoices: data.length,
        total_sales_usd: totalSalesUSD,
        total_sales_bs: totalSalesBs,
        total_tax_usd: totalTaxUSD,
        average_ticket_usd: data.length > 0 ? totalSalesUSD / data.length : 0,
        average_ticket_bs: data.length > 0 ? totalSalesBs / data.length : 0,
      },
    },
  });
}

// ============================================================================
// Reporte de Inventario
// ============================================================================
async function getInventoryReport(pharmacy_id: string | null) {
  const supabase = await createClient();

  let query = supabase
    .from("farmacia_inventario")
    .select("*");

  if (pharmacy_id) {
    query = query.eq("pharmacy_id", pharmacy_id);
  }

  const { data, error } = await query.order("expiry_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalItems = data.length;
  const totalQuantity = data.reduce(
    (sum: number, batch: { quantity_available: number }) =>
      sum + Number(batch.quantity_available),
    0,
  );
  const lowStockItems = data.filter(
    (batch: { quantity_available: number }) => Number(batch.quantity_available) <= 10,
  );
  const expiringSoon = data.filter((batch: { expiry_date: string }) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(batch.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 90;
  });

  return NextResponse.json({
    data: {
      batches: data,
      metrics: {
        total_items: totalItems,
        total_quantity: totalQuantity,
        low_stock_count: lowStockItems.length,
        expiring_soon_count: expiringSoon.length,
      },
    },
  });
}

// ============================================================================
// Corte X (Reporte parcial de ventas del dia)
// ============================================================================
async function getXCutReport(pharmacy_id: string | null) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("farmacia_ventas")
    .select(`
      *,
      pharmacy_invoice_items(*)
    `)
    .eq("status", "completed")
    .gte("created_at", `${today}T00:00:00Z`)
    .lte("created_at", `${today}T23:59:59Z`);

  if (pharmacy_id) {
    query = query.eq("pharmacy_id", pharmacy_id);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalSalesUSD = data.reduce(
    (sum: number, inv: { total_usd: number }) => sum + Number(inv.total_usd),
    0,
  );
  const totalSalesBs = data.reduce(
    (sum: number, inv: { total_bs: number }) => sum + Number(inv.total_bs),
    0,
  );

  return NextResponse.json({
    data: {
      report_type: "X_CUT",
      date: today,
      total_invoices: data.length,
      total_sales_usd: totalSalesUSD,
      total_sales_bs: totalSalesBs,
      invoices: data,
    },
  });
}

// ============================================================================
// Reporte Z (Cierre fiscal diario)
// ============================================================================
async function getZReport(pharmacy_id: string | null) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("farmacia_ventas")
    .select(`
      *,
      pharmacy_invoice_items(*)
    `)
    .eq("status", "completed")
    .gte("created_at", `${today}T00:00:00Z`)
    .lte("created_at", `${today}T23:59:59Z`);

  if (pharmacy_id) {
    query = query.eq("pharmacy_id", pharmacy_id);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Agrupar por metodo de pago
  const paymentMethods = new Map<
    string,
    { count: number; total_usd: number; total_bs: number }
  >();
  for (const invoice of data) {
    const method = invoice.payment_method as string;
    const current = paymentMethods.get(method) || {
      count: 0,
      total_usd: 0,
      total_bs: 0,
    };
    paymentMethods.set(method, {
      count: current.count + 1,
      total_usd: current.total_usd + Number(invoice.total_usd),
      total_bs: current.total_bs + Number(invoice.total_bs),
    });
  }

  const totalSalesUSD = data.reduce(
    (sum: number, inv: { total_usd: number }) => sum + Number(inv.total_usd),
    0,
  );
  const totalSalesBs = data.reduce(
    (sum: number, inv: { total_bs: number }) => sum + Number(inv.total_bs),
    0,
  );
  const totalTaxUSD = data.reduce(
    (sum: number, inv: { tax_usd: number }) => sum + Number(inv.tax_usd),
    0,
  );

  return NextResponse.json({
    data: {
      report_type: "Z_REPORT",
      date: today,
      total_invoices: data.length,
      total_sales_usd: totalSalesUSD,
      total_sales_bs: totalSalesBs,
      total_tax_usd: totalTaxUSD,
      payment_methods: Object.fromEntries(paymentMethods),
      invoices: data,
    },
  });
}
