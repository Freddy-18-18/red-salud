import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PrescriptionMedication {
  id: string;
  prescription_id: string;
  product_id: string | null;
  quantity: number;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  dispensed_quantity: number;
  product?: {
    id: string;
    name: string;
    generic_name: string;
    presentation: string | null;
  } | null;
}

export interface Prescription {
  id: string;
  prescription_number: string;
  patient_id: string | null;
  doctor_name: string;
  doctor_license: string;
  issue_date: string;
  expiry_date: string;
  status: "pending" | "dispensed" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  patient?: { id: string; full_name: string; email: string | null } | null;
  prescription_items?: PrescriptionMedication[];
}

export interface PrescriptionFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPharmacyIdQuery() {
  const supabase = createClient();
  // pharmacy_users maps auth.uid → pharmacy_id
  return supabase
    .from("pharmacy_users")
    .select("pharmacy_id")
    .limit(1)
    .single();
}

// ---------------------------------------------------------------------------
// Fetch prescriptions
// ---------------------------------------------------------------------------

export async function fetchPrescriptions(
  filters: PrescriptionFilters = {}
): Promise<Prescription[]> {
  const supabase = createClient();

  let query = supabase
    .from("prescriptions")
    .select(
      `
      *,
      patient:patients!patient_id(id, full_name, email),
      prescription_items(
        id, prescription_id, product_id, quantity, dosage, frequency, duration, dispensed_quantity,
        product:products!product_id(id, name, generic_name, presentation)
      )
    `
    )
    .order("issue_date", { ascending: false });

  if (filters.status && filters.status !== "todas") {
    query = query.eq("status", filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte("issue_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("issue_date", filters.dateTo);
  }

  if (filters.search) {
    query = query.or(
      `doctor_name.ilike.%${filters.search}%,prescription_number.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching prescriptions:", error);
    return [];
  }

  return (data || []) as unknown as Prescription[];
}

// ---------------------------------------------------------------------------
// Dispense prescription
// ---------------------------------------------------------------------------

export async function dispensePrescription(prescriptionId: string): Promise<boolean> {
  const supabase = createClient();

  // Get current user's pharmacy_id
  const { data: pharmacyUser } = await getPharmacyIdQuery();

  const { error } = await supabase
    .from("prescriptions")
    .update({
      status: "dispensed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", prescriptionId);

  if (error) {
    console.error("Error dispensing prescription:", error);
    return false;
  }

  // Mark all items as fully dispensed
  const { data: items } = await supabase
    .from("prescription_items")
    .select("id, quantity")
    .eq("prescription_id", prescriptionId);

  if (items) {
    for (const item of items) {
      await supabase
        .from("prescription_items")
        .update({ dispensed_quantity: item.quantity })
        .eq("id", item.id);
    }
  }

  // Create invoice if pharmacy_id available
  if (pharmacyUser?.pharmacy_id) {
    await createInvoiceFromPrescription(prescriptionId, pharmacyUser.pharmacy_id);
  }

  return true;
}

// ---------------------------------------------------------------------------
// Cancel prescription
// ---------------------------------------------------------------------------

export async function cancelPrescription(prescriptionId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("prescriptions")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", prescriptionId);

  if (error) {
    console.error("Error cancelling prescription:", error);
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Get single prescription
// ---------------------------------------------------------------------------

export async function getPrescriptionById(
  id: string
): Promise<Prescription | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("prescriptions")
    .select(
      `
      *,
      patient:patients!patient_id(id, full_name, email),
      prescription_items(
        id, prescription_id, product_id, quantity, dosage, frequency, duration, dispensed_quantity,
        product:products!product_id(id, name, generic_name, presentation)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching prescription:", error);
    return null;
  }

  return data as unknown as Prescription;
}

// ---------------------------------------------------------------------------
// Create invoice from dispensed prescription
// ---------------------------------------------------------------------------

async function createInvoiceFromPrescription(
  prescriptionId: string,
  pharmacyId: string
): Promise<void> {
  const supabase = createClient();

  const { data: items } = await supabase
    .from("prescription_items")
    .select("product_id, quantity, product:products!product_id(precio_venta_usd)")
    .eq("prescription_id", prescriptionId);

  if (!items || items.length === 0) return;

  let subtotal = 0;
  const invoiceItems: Array<{
    product_id: string;
    quantity: number;
    unit_price_usd: number;
    subtotal_usd: number;
  }> = [];

  for (const item of items) {
    const product = item.product as unknown as { precio_venta_usd: number } | null;
    const unitPrice = product?.precio_venta_usd || 0;
    const itemSubtotal = unitPrice * item.quantity;
    subtotal += itemSubtotal;

    if (item.product_id) {
      invoiceItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_usd: unitPrice,
        subtotal_usd: itemSubtotal,
      });
    }
  }

  const taxRate = 0.16;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      pharmacy_id: pharmacyId,
      subtotal_usd: subtotal,
      tax_amount_usd: taxAmount,
      total_usd: total,
      payment_method: "efectivo",
      status: "draft",
      notes: `Generada desde receta ${prescriptionId}`,
    })
    .select("id")
    .single();

  if (invoiceError || !invoice) {
    console.error("Error creating invoice from prescription:", invoiceError);
    return;
  }

  // Insert invoice items
  for (const item of invoiceItems) {
    await supabase.from("invoice_items").insert({
      invoice_id: invoice.id,
      ...item,
    });
  }
}
