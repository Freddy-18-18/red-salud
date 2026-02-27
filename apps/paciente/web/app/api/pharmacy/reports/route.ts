import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// GET /api/pharmacy/reports
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const warehouse_id = searchParams.get('warehouse_id');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    switch (type) {
      case 'sales':
        return await getSalesReport(warehouse_id, date_from, date_to);
      case 'inventory':
        return await getInventoryReport(warehouse_id);
      case 'profitability':
        return await getProfitabilityReport(warehouse_id, date_from, date_to);
      case 'x_cut':
        return await getXCutReport(warehouse_id);
      case 'z_report':
        return await getZReport(warehouse_id);
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// Sales Report
// ============================================================================
async function getSalesReport(warehouse_id: string | null, date_from: string | null, date_to: string | null) {
  let query = supabase
    .from('invoices')
    .select(`
      *,
      invoice_items(*),
      patients(*)
    `)
    .eq('status', 'paid');

  if (warehouse_id) {
    query = query.eq('warehouse_id', warehouse_id);
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

  // Calculate metrics
  const totalSalesUSD = data.reduce((sum: number, inv: { total_usd: number }) => sum + inv.total_usd, 0);
  const totalSalesVES = data.reduce((sum: number, inv: { total_ves: number }) => sum + inv.total_ves, 0);
  const totalIVACreditUSD = data.reduce((sum: number, inv: { iva_usd: number }) => sum + inv.iva_usd, 0);
  const totalIVACreditVES = data.reduce((sum: number, inv: { iva_ves: number }) => sum + inv.iva_ves, 0);

  return NextResponse.json({
    data: {
      invoices: data,
      metrics: {
        total_invoices: data.length,
        total_sales_usd: totalSalesUSD,
        total_sales_ves: totalSalesVES,
        total_iva_credit_usd: totalIVACreditUSD,
        total_iva_credit_ves: totalIVACreditVES,
        average_ticket_usd: data.length > 0 ? totalSalesUSD / data.length : 0,
        average_ticket_ves: data.length > 0 ? totalSalesVES / data.length : 0
      }
    }
  });
}

// ============================================================================
// Inventory Report
// ============================================================================
async function getInventoryReport(warehouse_id: string | null) {
  let query = supabase
    .from('batches')
    .select(`
      *,
      products!inner(*),
      warehouses!inner(*)
    `)
    .eq('zone', 'available');

  if (warehouse_id) {
    query = query.eq('warehouse_id', warehouse_id);
  }

  const { data, error } = await query.order('expiry_date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate metrics
  const totalItems = data.length;
  const totalQuantity = data.reduce((sum: number, batch: { quantity: number }) => sum + batch.quantity, 0);
  const lowStockItems = data.filter((batch: { quantity: number; products: { min_stock: number } }) => batch.quantity <= batch.products.min_stock);
  const expiringSoon = data.filter((batch: { expiry_date: string }) => {
    const daysUntilExpiry = Math.ceil((new Date(batch.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90;
  });

  return NextResponse.json({
    data: {
      batches: data,
      metrics: {
        total_items: totalItems,
        total_quantity: totalQuantity,
        low_stock_count: lowStockItems.length,
        expiring_soon_count: expiringSoon.length
      }
    }
  });
}

// ============================================================================
// Profitability Report
// ============================================================================
async function getProfitabilityReport(warehouse_id: string | null, date_from: string | null, date_to: string | null) {
  let query = supabase
    .from('invoices')
    .select(`
      *,
      invoice_items(*)
    `)
    .eq('status', 'paid');

  if (warehouse_id) {
    query = query.eq('warehouse_id', warehouse_id);
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

  // Calculate profitability
  let totalRevenueUSD = 0;
  let totalRevenueVES = 0;
  let totalCostUSD = 0;
  let totalCostVES = 0;

  const productSales = new Map();

  for (const invoice of data) {
    totalRevenueUSD += invoice.total_usd;
    totalRevenueVES += invoice.total_ves;

    for (const item of invoice.invoice_items) {
      // Get product cost price
      const { data: product } = await supabase
        .from('products')
        .select('cost_price_usd, cost_price_ves')
        .eq('id', item.product_id)
        .single();

      if (product) {
        const costUSD = product.cost_price_usd * item.quantity;
        const costVES = product.cost_price_ves * item.quantity;
        totalCostUSD += costUSD;
        totalCostVES += costVES;

        // Track product sales
        const productId = item.product_id;
        const current = productSales.get(productId) || {
          name: item.product_name,
          quantity: 0,
          revenue_usd: 0,
          revenue_ves: 0,
          cost_usd: 0,
          cost_ves: 0
        };
        productSales.set(productId, {
          name: item.product_name,
          quantity: current.quantity + item.quantity,
          revenue_usd: current.revenue_usd + item.total_usd,
          revenue_ves: current.revenue_ves + item.total_ves,
          cost_usd: current.cost_usd + costUSD,
          cost_ves: current.cost_ves + costVES
        });
      }
    }
  }

  const grossProfitUSD = totalRevenueUSD - totalCostUSD;
  const grossProfitVES = totalRevenueVES - totalCostVES;
  const profitMarginUSD = totalRevenueUSD > 0 ? (grossProfitUSD / totalRevenueUSD) * 100 : 0;
  const profitMarginVES = totalRevenueVES > 0 ? (grossProfitVES / totalRevenueVES) * 100 : 0;

  // Sort products by revenue
  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue_usd - a.revenue_usd)
    .slice(0, 20);

  return NextResponse.json({
    data: {
      metrics: {
        total_revenue_usd: totalRevenueUSD,
        total_revenue_ves: totalRevenueVES,
        total_cost_usd: totalCostUSD,
        total_cost_ves: totalCostVES,
        gross_profit_usd: grossProfitUSD,
        gross_profit_ves: grossProfitVES,
        profit_margin_percent_usd: profitMarginUSD,
        profit_margin_percent_ves: profitMarginVES
      },
      top_products: topProducts
    }
  });
}

// ============================================================================
// X-Cut Report (Interim Sales Report)
// ============================================================================
async function getXCutReport(warehouse_id: string | null) {
  const today = new Date().toISOString().split('T')[0];

  let query = supabase
    .from('invoices')
    .select(`
      *,
      invoice_items(*),
      patients(*),
      pharmacy_users(*)
    `)
    .eq('status', 'paid')
    .gte('created_at', `${today}T00:00:00Z`)
    .lte('created_at', `${today}T23:59:59Z`);

  if (warehouse_id) {
    query = query.eq('warehouse_id', warehouse_id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalSalesUSD = data.reduce((sum: number, inv: { total_usd: number }) => sum + inv.total_usd, 0);
  const totalSalesVES = data.reduce((sum: number, inv: { total_ves: number }) => sum + inv.total_ves, 0);

  return NextResponse.json({
    data: {
      report_type: 'X_CUT',
      date: today,
      total_invoices: data.length,
      total_sales_usd: totalSalesUSD,
      total_sales_ves: totalSalesVES,
      invoices: data
    }
  });
}

// ============================================================================
// Z-Report (Daily Fiscal Closing)
// ============================================================================
async function getZReport(warehouse_id: string | null) {
  const today = new Date().toISOString().split('T')[0];

  let query = supabase
    .from('invoices')
    .select(`
      *,
      invoice_items(*),
      patients(*),
      pharmacy_users(*)
    `)
    .eq('status', 'paid')
    .gte('created_at', `${today}T00:00:00Z`)
    .lte('created_at', `${today}T23:59:59Z`);

  if (warehouse_id) {
    query = query.eq('warehouse_id', warehouse_id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by payment method
  const paymentMethods = new Map();
  for (const invoice of data) {
    const method = invoice.payment_method;
    const current = paymentMethods.get(method) || {
      count: 0,
      total_usd: 0,
      total_ves: 0
    };
    paymentMethods.set(method, {
      count: current.count + 1,
      total_usd: current.total_usd + invoice.total_usd,
      total_ves: current.total_ves + invoice.total_ves
    });
  }

  const totalSalesUSD = data.reduce((sum: number, inv: { total_usd: number }) => sum + inv.total_usd, 0);
  const totalSalesVES = data.reduce((sum: number, inv: { total_ves: number }) => sum + inv.total_ves, 0);
  const totalIVACreditUSD = data.reduce((sum: number, inv: { iva_usd: number }) => sum + inv.iva_usd, 0);
  const totalIVACreditVES = data.reduce((sum: number, inv: { iva_ves: number }) => sum + inv.iva_ves, 0);

  return NextResponse.json({
    data: {
      report_type: 'Z_REPORT',
      date: today,
      total_invoices: data.length,
      total_sales_usd: totalSalesUSD,
      total_sales_ves: totalSalesVES,
      total_iva_credit_usd: totalIVACreditUSD,
      total_iva_credit_ves: totalIVACreditVES,
      payment_methods: Object.fromEntries(paymentMethods),
      invoices: data
    }
  });
}
