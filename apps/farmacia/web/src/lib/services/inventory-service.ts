import { createClient } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────

export type ProductCategory =
  | "medicamentos"
  | "otc"
  | "cuidado_personal"
  | "suplementos"
  | "equipos_medicos"
  | "bebes"
  | "otros";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  medicamentos: "Medicamentos",
  otc: "OTC (Sin receta)",
  cuidado_personal: "Cuidado Personal",
  suplementos: "Suplementos",
  equipos_medicos: "Equipos Medicos",
  bebes: "Bebes",
  otros: "Otros",
};

export interface PharmacyProduct {
  id: string;
  pharmacy_id: string;
  medication_catalog_id: string | null;
  barcode: string | null;
  internal_code: string | null;
  name: string;
  generic_name: string | null;
  presentation: string | null;
  concentration: string | null;
  pharmaceutical_form: string | null;
  manufacturer: string | null;
  category: ProductCategory;
  subcategory: string | null;
  price_usd: number;
  price_bs: number;
  cost_usd: number | null;
  cost_bs: number | null;
  profit_margin: number | null;
  tax_rate: number | null;
  min_stock: number;
  max_stock: number | null;
  reorder_point: number | null;
  requires_prescription: boolean;
  is_controlled: boolean;
  controlled_type: string | null;
  is_refrigerated: boolean;
  storage_conditions: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductWithStock extends PharmacyProduct {
  total_stock: number;
  stock_status: "normal" | "bajo" | "agotado";
  batches: PharmacyBatch[];
}

export interface PharmacyBatch {
  id: string;
  product_id: string;
  pharmacy_id: string;
  batch_number: string;
  expiry_date: string;
  manufacture_date: string | null;
  quantity_received: number;
  quantity_available: number;
  quantity_sold: number;
  quantity_damaged: number;
  quantity_returned: number;
  supplier_id: string | null;
  purchase_price_usd: number | null;
  purchase_price_bs: number | null;
  received_at: string | null;
  status: "active" | "expired" | "recalled" | "depleted";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  search?: string;
  category?: ProductCategory | "";
  stockStatus?: "todos" | "normal" | "bajo" | "agotado";
  requiresPrescription?: boolean | null;
  isActive?: boolean | null;
  page?: number;
  pageSize?: number;
}

export type CreateProductInput = Omit<
  PharmacyProduct,
  "id" | "created_at" | "updated_at"
>;

export type UpdateProductInput = Partial<
  Omit<PharmacyProduct, "id" | "pharmacy_id" | "created_at" | "updated_at">
>;

// ── Service ────────────────────────────────────────────────────────────────

export async function getPharmacyId(): Promise<string | null> {
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
    .single();

  if (staff?.pharmacy_id) return staff.pharmacy_id;

  // Try pharmacy_details (owner)
  const { data: pharmacy } = await supabase
    .from("pharmacy_details")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  return pharmacy?.id ?? null;
}

export async function fetchProducts(
  pharmacyId: string,
  filters: ProductFilters = {}
): Promise<{ data: ProductWithStock[]; count: number }> {
  const supabase = createClient();
  const {
    search,
    category,
    requiresPrescription,
    isActive,
    page = 1,
    pageSize = 25,
  } = filters;

  // Fetch products
  let query = supabase
    .from("pharmacy_products")
    .select("*", { count: "exact" })
    .eq("pharmacy_id", pharmacyId)
    .order("name");

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,generic_name.ilike.%${search}%,barcode.ilike.%${search}%,internal_code.ilike.%${search}%`
    );
  }

  if (category) {
    query = query.eq("category", category);
  }

  if (requiresPrescription !== null && requiresPrescription !== undefined) {
    query = query.eq("requires_prescription", requiresPrescription);
  }

  if (isActive !== null && isActive !== undefined) {
    query = query.eq("is_active", isActive);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: products, error, count } = await query;

  if (error) throw error;
  if (!products) return { data: [], count: 0 };

  // Fetch active batches for these products
  const productIds = products.map((p) => p.id);
  const { data: batches } = await supabase
    .from("pharmacy_batches")
    .select("*")
    .in("product_id", productIds)
    .eq("status", "active")
    .order("expiry_date", { ascending: true });

  // Combine
  const batchMap = new Map<string, PharmacyBatch[]>();
  (batches || []).forEach((b) => {
    const existing = batchMap.get(b.product_id) || [];
    existing.push(b as PharmacyBatch);
    batchMap.set(b.product_id, existing);
  });

  const enriched: ProductWithStock[] = products.map((p) => {
    const productBatches = batchMap.get(p.id) || [];
    const totalStock = productBatches.reduce(
      (sum, b) => sum + (b.quantity_available || 0),
      0
    );
    let stockStatus: "normal" | "bajo" | "agotado" = "normal";
    if (totalStock === 0) stockStatus = "agotado";
    else if (totalStock <= (p.min_stock || 0)) stockStatus = "bajo";

    return {
      ...(p as PharmacyProduct),
      total_stock: totalStock,
      stock_status: stockStatus,
      batches: productBatches,
    };
  });

  // Filter by stock status client-side (requires batch data)
  const stockFilter = filters.stockStatus;
  const filtered =
    stockFilter && stockFilter !== "todos"
      ? enriched.filter((p) => p.stock_status === stockFilter)
      : enriched;

  return { data: filtered, count: count || 0 };
}

export async function createProduct(
  input: CreateProductInput
): Promise<PharmacyProduct> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pharmacy_products")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as PharmacyProduct;
}

export async function updateProduct(
  productId: string,
  input: UpdateProductInput
): Promise<PharmacyProduct> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pharmacy_products")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", productId)
    .select()
    .single();

  if (error) throw error;
  return data as PharmacyProduct;
}

export async function toggleProductActive(
  productId: string,
  isActive: boolean
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("pharmacy_products")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", productId);

  if (error) throw error;
}

export async function fetchExchangeRate(): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase
    .from("exchange_rates")
    .select("rate")
    .eq("currency_pair", "USD/VES")
    .order("valid_date", { ascending: false })
    .limit(1)
    .single();

  return data?.rate ?? 36;
}
