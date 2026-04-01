import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost_usd: number;
  unit_cost_bs: number | null;
  subtotal_usd: number;
  batch_number: string | null;
  expiry_date: string | null;
  // joined
  product?: {
    id: string;
    name: string;
    generic_name: string;
    presentation: string | null;
  } | null;
}

export interface PurchaseOrder {
  id: string;
  pharmacy_id: string;
  supplier_id: string;
  order_number: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  subtotal_usd: number;
  tax_usd: number;
  total_usd: number;
  exchange_rate_used: number | null;
  total_bs: number | null;
  payment_method: string | null;
  payment_status: string | null;
  expected_delivery_date: string | null;
  received_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // joined
  supplier?: {
    id: string;
    company_name: string;
    contact_name: string | null;
    phone: string | null;
  } | null;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderFilters {
  status?: string;
  supplierId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreatePOItemInput {
  product_id: string;
  quantity_ordered: number;
  unit_cost_usd: number;
}

export interface CreatePOInput {
  supplier_id: string;
  expected_delivery_date: string | null;
  notes: string;
  items: CreatePOItemInput[];
  saveAsDraft: boolean;
}

export interface ReceiveItemInput {
  item_id: string;
  product_id: string;
  quantity_received: number;
  batch_number: string;
  expiry_date: string;
}

// ---------------------------------------------------------------------------
// Label maps
// ---------------------------------------------------------------------------

export const PO_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  shipped: "Enviada",
  delivered: "Recibida",
  cancelled: "Cancelada",
};

export const PO_STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getPharmacyId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Try pharmacy_staff first (employee)
  const { data: staff } = await supabase
    .from("pharmacy_staff")
    .select("pharmacy_id")
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (staff?.pharmacy_id) return staff.pharmacy_id;

  // Try pharmacy_details (owner)
  const { data: pharmacy } = await supabase
    .from("pharmacy_details")
    .select("id")
    .eq("profile_id", user.id)
    .limit(1)
    .maybeSingle();

  return pharmacy?.id ?? null;
}

async function generatePONumber(pharmacyId: string): Promise<string> {
  const supabase = createClient();
  const { count } = await supabase
    .from("pharmacy_purchase_orders")
    .select("*", { count: "exact", head: true })
    .eq("pharmacy_id", pharmacyId);

  const sequence = ((count || 0) + 1).toString().padStart(6, "0");
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `OC-${date}-${sequence}`;
}

// ---------------------------------------------------------------------------
// Fetch purchase orders
// ---------------------------------------------------------------------------

export async function fetchPurchaseOrders(
  filters: PurchaseOrderFilters = {}
): Promise<PurchaseOrder[]> {
  const supabase = createClient();

  let query = supabase
    .from("pharmacy_purchase_orders")
    .select(
      `
      *,
      supplier:pharmacy_suppliers!supplier_id(id, company_name, contact_name, phone)
    `
    )
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "todas") {
    query = query.eq("status", filters.status);
  }

  if (filters.supplierId) {
    query = query.eq("supplier_id", filters.supplierId);
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", `${filters.dateFrom}T00:00:00`);
  }

  if (filters.dateTo) {
    query = query.lte("created_at", `${filters.dateTo}T23:59:59`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching purchase orders:", error);
    return [];
  }

  return (data || []) as unknown as PurchaseOrder[];
}

// ---------------------------------------------------------------------------
// Get single PO with items
// ---------------------------------------------------------------------------

export async function getPurchaseOrderById(
  id: string
): Promise<PurchaseOrder | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_purchase_orders")
    .select(
      `
      *,
      supplier:pharmacy_suppliers!supplier_id(id, company_name, contact_name, phone),
      items:pharmacy_purchase_order_items(
        *,
        product:pharmacy_products!product_id(id, name, generic_name, presentation)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching purchase order:", error);
    return null;
  }

  return data as unknown as PurchaseOrder;
}

// ---------------------------------------------------------------------------
// Create purchase order
// ---------------------------------------------------------------------------

export async function createPurchaseOrder(
  input: CreatePOInput
): Promise<PurchaseOrder | null> {
  const supabase = createClient();
  const pharmacyId = await getPharmacyId();

  if (!pharmacyId) {
    console.error("No pharmacy_id found");
    return null;
  }

  const poNumber = await generatePONumber(pharmacyId);

  // Calculate totals
  let subtotal = 0;
  for (const item of input.items) {
    subtotal += item.quantity_ordered * item.unit_cost_usd;
  }
  const taxRate = 0.16;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const { data: po, error: poError } = await supabase
    .from("pharmacy_purchase_orders")
    .insert({
      pharmacy_id: pharmacyId,
      order_number: poNumber,
      supplier_id: input.supplier_id,
      expected_delivery_date: input.expected_delivery_date || null,
      subtotal_usd: subtotal,
      tax_usd: tax,
      total_usd: total,
      status: input.saveAsDraft ? "pending" : "confirmed",
      notes: input.notes || null,
    })
    .select()
    .single();

  if (poError || !po) {
    console.error("Error creating purchase order:", poError);
    return null;
  }

  // Insert items
  const itemsToInsert = input.items.map((item) => ({
    purchase_order_id: po.id,
    product_id: item.product_id,
    quantity_ordered: item.quantity_ordered,
    quantity_received: 0,
    unit_cost_usd: item.unit_cost_usd,
    subtotal_usd: item.quantity_ordered * item.unit_cost_usd,
  }));

  const { error: itemsError } = await supabase
    .from("pharmacy_purchase_order_items")
    .insert(itemsToInsert);

  if (itemsError) {
    console.error("Error creating PO items:", itemsError);
    // PO was created, items failed -- still return PO
  }

  return po as unknown as PurchaseOrder;
}

// ---------------------------------------------------------------------------
// Update PO status
// ---------------------------------------------------------------------------

export async function updatePOStatus(
  id: string,
  status: PurchaseOrder["status"]
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("pharmacy_purchase_orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error updating PO status:", error);
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Cancel PO
// ---------------------------------------------------------------------------

export async function cancelPurchaseOrder(id: string): Promise<boolean> {
  return updatePOStatus(id, "cancelled");
}

// ---------------------------------------------------------------------------
// Receive purchase order (full or partial)
// ---------------------------------------------------------------------------

export async function receivePurchaseOrder(
  poId: string,
  receivedItems: ReceiveItemInput[]
): Promise<boolean> {
  const supabase = createClient();
  const pharmacyId = await getPharmacyId();

  if (!pharmacyId) return false;

  // Get the PO to find the supplier
  const { data: po } = await supabase
    .from("pharmacy_purchase_orders")
    .select("supplier_id")
    .eq("id", poId)
    .single();

  // Update each PO item with received quantity
  for (const received of receivedItems) {
    const { error: itemError } = await supabase
      .from("pharmacy_purchase_order_items")
      .update({
        quantity_received: received.quantity_received,
        batch_number: received.batch_number,
        expiry_date: received.expiry_date,
      })
      .eq("id", received.item_id);

    if (itemError) {
      console.error("Error updating PO item:", itemError);
      continue;
    }

    // Create batch record in pharmacy_batches
    if (received.quantity_received > 0) {
      // Get unit cost from the PO item
      const { data: poItem } = await supabase
        .from("pharmacy_purchase_order_items")
        .select("unit_cost_usd, product_id")
        .eq("id", received.item_id)
        .single();

      if (poItem) {
        const costPerUnit = poItem.unit_cost_usd || 0;

        await supabase.from("pharmacy_batches").insert({
          product_id: received.product_id,
          pharmacy_id: pharmacyId,
          batch_number: received.batch_number,
          expiry_date: received.expiry_date,
          quantity_received: received.quantity_received,
          quantity_available: received.quantity_received,
          quantity_sold: 0,
          quantity_damaged: 0,
          quantity_returned: 0,
          purchase_price_usd: costPerUnit,
          purchase_price_bs: null,
          supplier_id: po?.supplier_id || null,
          received_at: new Date().toISOString(),
          status: "active",
        });
      }
    }
  }

  // Determine if fully or partially received
  const { data: allItems } = await supabase
    .from("pharmacy_purchase_order_items")
    .select("quantity_ordered, quantity_received")
    .eq("purchase_order_id", poId);

  if (allItems) {
    const allFullyReceived = allItems.every(
      (item) => item.quantity_received >= item.quantity_ordered
    );
    const someReceived = allItems.some((item) => item.quantity_received > 0);

    const newStatus = allFullyReceived
      ? "delivered"
      : someReceived
        ? "shipped" // using shipped as "partial" since the enum doesn't have partial
        : "confirmed";

    await supabase
      .from("pharmacy_purchase_orders")
      .update({
        status: newStatus,
        received_at: allFullyReceived ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", poId);
  }

  return true;
}

// ---------------------------------------------------------------------------
// Fetch products for PO item selection
// ---------------------------------------------------------------------------

export async function fetchProductsForPO(): Promise<
  Array<{
    id: string;
    name: string;
    generic_name: string | null;
    presentation: string | null;
    cost_usd: number | null;
  }>
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_products")
    .select("id, name, generic_name, presentation, cost_usd")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data || [];
}

// ---------------------------------------------------------------------------
// Fetch suppliers for PO creation
// ---------------------------------------------------------------------------

export async function fetchSuppliersForPO(): Promise<
  Array<{ id: string; company_name: string; contact_name: string | null }>
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_suppliers")
    .select("id, company_name, contact_name")
    .eq("is_active", true)
    .order("company_name");

  if (error) {
    console.error("Error fetching suppliers for PO:", error);
    return [];
  }

  return data || [];
}
