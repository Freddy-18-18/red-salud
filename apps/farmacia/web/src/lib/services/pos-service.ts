import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────

export type PaymentMethod =
  | "cash_bs"
  | "cash_usd"
  | "zelle"
  | "pago_movil"
  | "punto_venta"
  | "transferencia"
  | "mixed";

export type InvoiceStatus = "completed" | "voided" | "pending";

export interface Product {
  id: string;
  pharmacy_id: string;
  name: string;
  generic_name: string | null;
  presentation: string | null;
  barcode: string | null;
  internal_code: string | null;
  category: string | null;
  price_usd: number;
  price_bs: number;
  tax_rate: number;
  requires_prescription: boolean;
  is_controlled: boolean;
  is_active: boolean;
}

export interface ProductSearchResult extends Product {
  stock_available: number;
  batches: BatchInfo[];
}

export interface BatchInfo {
  id: string;
  batch_number: string;
  expiry_date: string;
  quantity_available: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  batch_id: string;
  batch_number: string;
  expiry_date: string;
  unit_price_usd: number;
  unit_price_bs: number;
  discount_percent: number;
  subtotal_usd: number;
  subtotal_bs: number;
  is_prescription_item: boolean;
}

export interface PaymentSplit {
  method: Exclude<PaymentMethod, "mixed">;
  amount_usd: number;
  amount_bs: number;
  reference?: string;
}

export interface CreateInvoicePayload {
  pharmacy_id: string;
  customer_name?: string;
  customer_ci?: string;
  customer_rif?: string;
  customer_phone?: string;
  prescription_id?: string;
  items: CartItem[];
  subtotal_usd: number;
  discount_usd: number;
  tax_usd: number;
  total_usd: number;
  exchange_rate: number;
  total_bs: number;
  payment_method: PaymentMethod;
  payment_reference?: string;
  payment_details?: PaymentSplit[];
  cashier_id: string;
  notes?: string;
  is_fiscal: boolean;
  cash_session_id?: string;
}

export interface Invoice {
  id: string;
  pharmacy_id: string;
  invoice_number: string;
  customer_name: string | null;
  customer_ci: string | null;
  customer_rif: string | null;
  customer_phone: string | null;
  prescription_id: string | null;
  subtotal_usd: number;
  discount_usd: number;
  tax_usd: number;
  total_usd: number;
  exchange_rate_used: number;
  total_bs: number;
  payment_method: PaymentMethod;
  payment_reference: string | null;
  payment_details: PaymentSplit[] | null;
  status: InvoiceStatus;
  cashier_id: string;
  notes: string | null;
  is_fiscal: boolean;
  fiscal_printer_number: string | null;
  created_at: string;
  voided_at: string | null;
  voided_by: string | null;
  void_reason: string | null;
}

export interface InvoiceWithItems extends Invoice {
  pharmacy_invoice_items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  batch_id: string;
  quantity: number;
  unit_price_usd: number;
  unit_price_bs: number;
  discount_percent: number;
  subtotal_usd: number;
  subtotal_bs: number;
  is_prescription_item: boolean;
  // joined
  pharmacy_products?: Pick<Product, "name" | "generic_name" | "presentation">;
}

// ─── Product Search ──────────────────────────────────────────────────

export async function searchProducts(
  pharmacyId: string,
  query: string,
  limit = 20
): Promise<ProductSearchResult[]> {
  const supabase = createClient();
  const trimmed = query.trim();

  if (!trimmed) return [];

  // Search products by name, generic_name, barcode, or internal_code
  const { data: products, error } = await supabase
    .from("pharmacy_products")
    .select("*")
    .eq("pharmacy_id", pharmacyId)
    .eq("is_active", true)
    .or(
      `name.ilike.%${trimmed}%,generic_name.ilike.%${trimmed}%,barcode.eq.${trimmed},internal_code.ilike.%${trimmed}%`
    )
    .order("name")
    .limit(limit);

  if (error) {
    console.error("Error searching products:", error);
    return [];
  }

  if (!products || products.length === 0) return [];

  // Fetch active batches for found products with FEFO ordering
  const productIds = products.map((p) => p.id);
  const { data: batches } = await supabase
    .from("pharmacy_batches")
    .select("id, product_id, batch_number, expiry_date, quantity_available")
    .in("product_id", productIds)
    .eq("pharmacy_id", pharmacyId)
    .eq("status", "active")
    .gt("quantity_available", 0)
    .order("expiry_date", { ascending: true });

  const batchMap = new Map<string, BatchInfo[]>();
  for (const b of batches || []) {
    const arr = batchMap.get(b.product_id) || [];
    arr.push({
      id: b.id,
      batch_number: b.batch_number,
      expiry_date: b.expiry_date,
      quantity_available: b.quantity_available,
    });
    batchMap.set(b.product_id, arr);
  }

  return products.map((p) => {
    const productBatches = batchMap.get(p.id) || [];
    const totalStock = productBatches.reduce(
      (sum, b) => sum + b.quantity_available,
      0
    );
    return {
      ...p,
      stock_available: totalStock,
      batches: productBatches,
    } as ProductSearchResult;
  });
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  pharmacyId: string,
  category: string,
  limit = 50
): Promise<ProductSearchResult[]> {
  const supabase = createClient();

  const { data: products, error } = await supabase
    .from("pharmacy_products")
    .select("*")
    .eq("pharmacy_id", pharmacyId)
    .eq("is_active", true)
    .eq("category", category)
    .order("name")
    .limit(limit);

  if (error || !products) return [];

  const productIds = products.map((p) => p.id);
  if (productIds.length === 0) return [];

  const { data: batches } = await supabase
    .from("pharmacy_batches")
    .select("id, product_id, batch_number, expiry_date, quantity_available")
    .in("product_id", productIds)
    .eq("pharmacy_id", pharmacyId)
    .eq("status", "active")
    .gt("quantity_available", 0)
    .order("expiry_date", { ascending: true });

  const batchMap = new Map<string, BatchInfo[]>();
  for (const b of batches || []) {
    const arr = batchMap.get(b.product_id) || [];
    arr.push({
      id: b.id,
      batch_number: b.batch_number,
      expiry_date: b.expiry_date,
      quantity_available: b.quantity_available,
    });
    batchMap.set(b.product_id, arr);
  }

  return products.map((p) => {
    const productBatches = batchMap.get(p.id) || [];
    const totalStock = productBatches.reduce(
      (sum, b) => sum + b.quantity_available,
      0
    );
    return { ...p, stock_available: totalStock, batches: productBatches } as ProductSearchResult;
  });
}

/**
 * Get distinct categories for the pharmacy
 */
export async function getProductCategories(
  pharmacyId: string
): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_products")
    .select("category")
    .eq("pharmacy_id", pharmacyId)
    .eq("is_active", true)
    .not("category", "is", null);

  if (error || !data) return [];

  const categories = [...new Set(data.map((d) => d.category as string))];
  return categories.filter(Boolean).sort();
}

// ─── FEFO Batch Selection ────────────────────────────────────────────

/**
 * Select batch using FEFO (First Expired, First Out).
 * Tries the RPC function first, falls back to manual query.
 */
export async function selectFEFOBatch(
  productId: string,
  pharmacyId: string,
  quantity: number
): Promise<BatchInfo | null> {
  const supabase = createClient();

  // Try the DB function first
  const { data: fefoResult, error: fefoError } = await supabase.rpc(
    "pharmacy_fefo_next_batch",
    {
      p_product_id: productId,
      p_pharmacy_id: pharmacyId,
      p_quantity: quantity,
    }
  );

  if (!fefoError && fefoResult && fefoResult.length > 0) {
    const first = fefoResult[0];
    return {
      id: first.batch_id,
      batch_number: first.batch_number,
      expiry_date: first.expiry_date,
      quantity_available: first.quantity_available,
    };
  }

  // Fallback: manual FEFO query
  const { data: batches } = await supabase
    .from("pharmacy_batches")
    .select("id, batch_number, expiry_date, quantity_available")
    .eq("product_id", productId)
    .eq("pharmacy_id", pharmacyId)
    .eq("status", "active")
    .gte("quantity_available", quantity)
    .order("expiry_date", { ascending: true })
    .limit(1)
    .single();

  if (batches) {
    return {
      id: batches.id,
      batch_number: batches.batch_number,
      expiry_date: batches.expiry_date,
      quantity_available: batches.quantity_available,
    };
  }

  return null;
}

// ─── Invoice Creation ────────────────────────────────────────────────

export async function createInvoice(
  payload: CreateInvoicePayload
): Promise<InvoiceWithItems> {
  const supabase = createClient();

  // Create the invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from("pharmacy_invoices")
    .insert({
      pharmacy_id: payload.pharmacy_id,
      customer_name: payload.customer_name || null,
      customer_ci: payload.customer_ci || null,
      customer_rif: payload.customer_rif || null,
      customer_phone: payload.customer_phone || null,
      prescription_id: payload.prescription_id || null,
      subtotal_usd: payload.subtotal_usd,
      discount_usd: payload.discount_usd,
      tax_usd: payload.tax_usd,
      total_usd: payload.total_usd,
      exchange_rate_used: payload.exchange_rate,
      total_bs: payload.total_bs,
      payment_method: payload.payment_method,
      payment_reference: payload.payment_reference || null,
      payment_details:
        payload.payment_method === "mixed" ? payload.payment_details : null,
      status: "completed" as InvoiceStatus,
      cashier_id: payload.cashier_id,
      notes: payload.notes || null,
      is_fiscal: payload.is_fiscal,
    })
    .select("*")
    .single();

  if (invoiceError || !invoice) {
    throw new Error(
      `Error creating invoice: ${invoiceError?.message || "Unknown error"}`
    );
  }

  // Insert invoice items — DB trigger auto-deducts stock from batch
  const itemsToInsert = payload.items.map((item) => ({
    invoice_id: invoice.id,
    product_id: item.product.id,
    batch_id: item.batch_id,
    quantity: item.quantity,
    unit_price_usd: item.unit_price_usd,
    unit_price_bs: item.unit_price_bs,
    discount_percent: item.discount_percent,
    subtotal_usd: item.subtotal_usd,
    subtotal_bs: item.subtotal_bs,
    is_prescription_item: item.is_prescription_item,
  }));

  const { data: items, error: itemsError } = await supabase
    .from("pharmacy_invoice_items")
    .insert(itemsToInsert)
    .select("*");

  if (itemsError) {
    throw new Error(
      `Error creating invoice items: ${itemsError.message}`
    );
  }

  return {
    ...(invoice as Invoice),
    pharmacy_invoice_items: (items || []) as InvoiceItem[],
  };
}

// ─── Void Invoice ────────────────────────────────────────────────────

export async function voidInvoice(
  invoiceId: string,
  voidedBy: string,
  reason: string
): Promise<Invoice> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_invoices")
    .update({
      status: "voided" as InvoiceStatus,
      voided_at: new Date().toISOString(),
      voided_by: voidedBy,
      void_reason: reason,
    })
    .eq("id", invoiceId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      `Error voiding invoice: ${error?.message || "Unknown error"}`
    );
  }

  return data as Invoice;
}

// ─── Get Invoice with Items ──────────────────────────────────────────

export async function getInvoiceWithItems(
  invoiceId: string
): Promise<InvoiceWithItems | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_invoices")
    .select(
      `
      *,
      pharmacy_invoice_items (
        *,
        pharmacy_products (name, generic_name, presentation)
      )
    `
    )
    .eq("id", invoiceId)
    .single();

  if (error || !data) return null;

  return data as unknown as InvoiceWithItems;
}

// ─── Get Last Invoice Number ─────────────────────────────────────────

export async function getLastInvoiceNumber(
  pharmacyId: string
): Promise<string> {
  const supabase = createClient();

  const { data } = await supabase
    .from("pharmacy_invoices")
    .select("invoice_number")
    .eq("pharmacy_id", pharmacyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (data?.invoice_number) {
    const num = parseInt(data.invoice_number.replace("FAR-", ""), 10);
    return `FAR-${String(num + 1).padStart(6, "0")}`;
  }

  return "FAR-000001";
}
