import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Supplier {
  id: string;
  pharmacy_id: string;
  company_name: string;
  rif: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  payment_terms: string | null;
  credit_limit_usd: number | null;
  credit_days: number | null;
  delivery_days: number | null;
  categories: string[] | null;
  rating: number | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // computed
  last_order_date?: string | null;
  total_orders?: number;
}

export interface SupplierFormData {
  company_name: string;
  rif: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  payment_terms: string;
  credit_limit_usd: number | null;
  credit_days: number | null;
  delivery_days: number | null;
  categories: string[];
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

// ---------------------------------------------------------------------------
// Fetch suppliers
// ---------------------------------------------------------------------------

export async function fetchSuppliers(
  filters: SupplierFilters = {}
): Promise<Supplier[]> {
  const supabase = createClient();

  let query = supabase
    .from("pharmacy_suppliers")
    .select("*")
    .order("company_name", { ascending: true });

  if (filters.isActive === "true") {
    query = query.eq("is_active", true);
  } else if (filters.isActive === "false") {
    query = query.eq("is_active", false);
  }

  if (filters.search) {
    query = query.or(
      `company_name.ilike.%${filters.search}%,rif.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%`
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
      .from("pharmacy_purchase_orders")
      .select("supplier_id, created_at")
      .in("supplier_id", supplierIds)
      .order("created_at", { ascending: false });

    if (orders) {
      const lastOrderMap = new Map<string, string>();
      const orderCountMap = new Map<string, number>();
      for (const order of orders) {
        if (!lastOrderMap.has(order.supplier_id)) {
          lastOrderMap.set(order.supplier_id, order.created_at);
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
    .from("pharmacy_suppliers")
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
    .from("pharmacy_suppliers")
    .insert({
      pharmacy_id: pharmacyId,
      company_name: formData.company_name,
      rif: formData.rif || null,
      contact_name: formData.contact_name || null,
      phone: formData.phone || null,
      email: formData.email || null,
      address: formData.address || null,
      city: formData.city || null,
      state: formData.state || null,
      payment_terms: formData.payment_terms || null,
      credit_limit_usd: formData.credit_limit_usd,
      credit_days: formData.credit_days,
      delivery_days: formData.delivery_days,
      categories: formData.categories.length > 0 ? formData.categories : null,
      is_active: formData.is_active,
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
    .from("pharmacy_suppliers")
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
    .from("pharmacy_suppliers")
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
    order_number: string;
    created_at: string;
    status: string;
    total_usd: number;
  }>
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_purchase_orders")
    .select("id, order_number, created_at, status, total_usd")
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false });

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
    batch_number: string;
    quantity_received: number;
    expiry_date: string;
  }>
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_batches")
    .select(
      "batch_number, quantity_received, expiry_date, pharmacy_products!product_id(name)"
    )
    .eq("supplier_id", supplierId)
    .order("expiry_date", { ascending: false });

  if (error) {
    console.error("Error fetching supplier products:", error);
    return [];
  }

  return (data || []).map((b) => ({
    product_name: (b.pharmacy_products as unknown as { name: string })?.name || "N/A",
    batch_number: b.batch_number,
    quantity_received: b.quantity_received,
    expiry_date: b.expiry_date,
  }));
}
