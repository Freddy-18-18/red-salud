import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Supplier {
  id: string;
  pharmacy_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  tax_id: string | null;
  bank_account: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  payment_terms: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // computed
  last_order_date?: string | null;
  total_orders?: number;
  categories?: string[];
  rating?: number;
  credit_limit_usd?: number;
  credit_days?: number;
  delivery_days?: number;
}

export interface SupplierFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  tax_id: string;
  bank_account: string;
  contact_person: string;
  contact_phone: string;
  payment_terms: string;
  is_active: boolean;
}

export interface SupplierFilters {
  search?: string;
  isActive?: string;
}

// ---------------------------------------------------------------------------
// Venezuelan states
// ---------------------------------------------------------------------------

export const VENEZUELAN_STATES = [
  "Amazonas",
  "Anzoategui",
  "Apure",
  "Aragua",
  "Barinas",
  "Bolivar",
  "Carabobo",
  "Cojedes",
  "Delta Amacuro",
  "Distrito Capital",
  "Falcon",
  "Guarico",
  "Lara",
  "Merida",
  "Miranda",
  "Monagas",
  "Nueva Esparta",
  "Portuguesa",
  "Sucre",
  "Tachira",
  "Trujillo",
  "La Guaira",
  "Yaracuy",
  "Zulia",
] as const;

export const SUPPLIER_CATEGORIES = [
  "Medicamentos",
  "OTC",
  "Cuidado Personal",
  "Suplementos",
  "Equipos Medicos",
  "Material Descartable",
  "Dermocosmetica",
  "Bebes y Ninos",
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getPharmacyId(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("pharmacy_users")
    .select("pharmacy_id")
    .limit(1)
    .single();
  return data?.pharmacy_id || null;
}

// ---------------------------------------------------------------------------
// Fetch suppliers
// ---------------------------------------------------------------------------

export async function fetchSuppliers(
  filters: SupplierFilters = {}
): Promise<Supplier[]> {
  const supabase = createClient();

  let query = supabase
    .from("suppliers")
    .select("*")
    .order("name", { ascending: true });

  if (filters.isActive === "true") {
    query = query.eq("is_active", true);
  } else if (filters.isActive === "false") {
    query = query.eq("is_active", false);
  }

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,tax_id.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }

  // Enrich with last order date
  const suppliers = (data || []) as Supplier[];

  if (suppliers.length > 0) {
    const supplierIds = suppliers.map((s) => s.id);
    const { data: orders } = await supabase
      .from("purchase_orders")
      .select("supplier_id, order_date")
      .in("supplier_id", supplierIds)
      .order("order_date", { ascending: false });

    if (orders) {
      const lastOrderMap = new Map<string, string>();
      const orderCountMap = new Map<string, number>();
      for (const order of orders) {
        if (!lastOrderMap.has(order.supplier_id)) {
          lastOrderMap.set(order.supplier_id, order.order_date);
        }
        orderCountMap.set(
          order.supplier_id,
          (orderCountMap.get(order.supplier_id) || 0) + 1
        );
      }

      for (const supplier of suppliers) {
        supplier.last_order_date = lastOrderMap.get(supplier.id) || null;
        supplier.total_orders = orderCountMap.get(supplier.id) || 0;
      }
    }
  }

  return suppliers;
}

// ---------------------------------------------------------------------------
// Get single supplier
// ---------------------------------------------------------------------------

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching supplier:", error);
    return null;
  }

  return data as Supplier;
}

// ---------------------------------------------------------------------------
// Create supplier
// ---------------------------------------------------------------------------

export async function createSupplier(
  formData: SupplierFormData
): Promise<Supplier | null> {
  const supabase = createClient();
  const pharmacyId = await getPharmacyId();

  if (!pharmacyId) {
    console.error("No pharmacy_id found for current user");
    return null;
  }

  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      pharmacy_id: pharmacyId,
      ...formData,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating supplier:", error);
    return null;
  }

  return data as Supplier;
}

// ---------------------------------------------------------------------------
// Update supplier
// ---------------------------------------------------------------------------

export async function updateSupplier(
  id: string,
  formData: Partial<SupplierFormData>
): Promise<Supplier | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("suppliers")
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating supplier:", error);
    return null;
  }

  return data as Supplier;
}

// ---------------------------------------------------------------------------
// Delete (soft deactivate) supplier
// ---------------------------------------------------------------------------

export async function deactivateSupplier(id: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("suppliers")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error deactivating supplier:", error);
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Get supplier purchase history
// ---------------------------------------------------------------------------

export async function getSupplierOrders(
  supplierId: string
): Promise<
  Array<{
    id: string;
    po_number: string;
    order_date: string;
    status: string;
    total_usd: number;
  }>
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("purchase_orders")
    .select("id, po_number, order_date, status, total_usd")
    .eq("supplier_id", supplierId)
    .order("order_date", { ascending: false });

  if (error) {
    console.error("Error fetching supplier orders:", error);
    return [];
  }

  return data || [];
}

// ---------------------------------------------------------------------------
// Get products supplied (from batches)
// ---------------------------------------------------------------------------

export async function getSupplierProducts(
  supplierId: string
): Promise<
  Array<{
    product_name: string;
    lot_number: string;
    quantity_received: number;
    expiration_date: string;
  }>
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("batches")
    .select(
      "lot_number, quantity_received, expiration_date, product:products!product_id(name)"
    )
    .eq("supplier_id", supplierId)
    .order("expiration_date", { ascending: false });

  if (error) {
    console.error("Error fetching supplier products:", error);
    return [];
  }

  return (data || []).map((b) => ({
    product_name: (b.product as unknown as { name: string })?.name || "N/A",
    lot_number: b.lot_number,
    quantity_received: b.quantity_received,
    expiration_date: b.expiration_date,
  }));
}
