import { createClient } from "@/lib/supabase/client";

// ============================================================================
// Types
// ============================================================================

export type DeliveryStatus =
  | "pending"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "failed"
  | "returned";

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: "Pendiente",
  assigned: "Asignada",
  in_transit: "En transito",
  delivered: "Entregada",
  failed: "Fallida",
  returned: "Devuelta",
};

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  in_transit: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  returned: "bg-orange-100 text-orange-800",
};

export interface Delivery {
  id: string;
  pharmacy_id: string;
  invoice_id: string | null;
  order_id: string | null;
  delivery_person_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  delivery_address: string;
  zone_id: string | null;
  status: DeliveryStatus;
  estimated_delivery_at: string | null;
  delivered_at: string | null;
  delivery_notes: string | null;
  customer_signature_url: string | null;
  created_at: string;
  delivery_person?: {
    full_name: string;
    phone: string | null;
  };
  zone?: {
    zone_name: string;
    delivery_fee_usd: number;
  };
}

export interface DeliveryZone {
  id: string;
  pharmacy_id: string;
  zone_name: string;
  municipalities: string[];
  delivery_fee_usd: number;
  delivery_fee_bs: number;
  estimated_time_minutes: number;
  is_active: boolean;
}

export interface CreateDeliveryInput {
  pharmacy_id: string;
  invoice_id?: string;
  order_id?: string;
  delivery_person_id?: string;
  customer_name: string;
  customer_phone?: string;
  delivery_address: string;
  zone_id?: string;
  estimated_delivery_at?: string;
  delivery_notes?: string;
}

export interface CreateZoneInput {
  pharmacy_id: string;
  zone_name: string;
  municipalities: string[];
  delivery_fee_usd: number;
  delivery_fee_bs: number;
  estimated_time_minutes: number;
}

// ============================================================================
// Delivery Queries
// ============================================================================

export async function getDeliveries(
  pharmacyId: string,
  statusFilter?: DeliveryStatus
): Promise<Delivery[]> {
  const supabase = createClient();

  let query = supabase
    .from("pharmacy_deliveries")
    .select(
      `*,
      delivery_person:delivery_person_id(full_name, phone),
      zone:zone_id(zone_name, delivery_fee_usd)`
    )
    .eq("pharmacy_id", pharmacyId)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching deliveries:", error);
    return [];
  }

  return (data || []).map((d) => ({
    ...d,
    delivery_person: d.delivery_person as unknown as Delivery["delivery_person"],
    zone: d.zone as unknown as Delivery["zone"],
  }));
}

export async function getDeliveryStats(pharmacyId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_deliveries")
    .select("status")
    .eq("pharmacy_id", pharmacyId);

  if (error) return { pending: 0, assigned: 0, in_transit: 0, delivered: 0, failed: 0, returned: 0, total: 0 };

  const counts: Record<string, number> = {};
  for (const d of data || []) {
    counts[d.status] = (counts[d.status] || 0) + 1;
  }

  return {
    pending: counts["pending"] || 0,
    assigned: counts["assigned"] || 0,
    in_transit: counts["in_transit"] || 0,
    delivered: counts["delivered"] || 0,
    failed: counts["failed"] || 0,
    returned: counts["returned"] || 0,
    total: data?.length || 0,
  };
}

// ============================================================================
// Delivery Mutations
// ============================================================================

export async function createDelivery(
  input: CreateDeliveryInput
): Promise<Delivery | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_deliveries")
    .insert({
      pharmacy_id: input.pharmacy_id,
      invoice_id: input.invoice_id || null,
      order_id: input.order_id || null,
      delivery_person_id: input.delivery_person_id || null,
      customer_name: input.customer_name,
      customer_phone: input.customer_phone || null,
      delivery_address: input.delivery_address,
      zone_id: input.zone_id || null,
      status: input.delivery_person_id ? "assigned" : "pending",
      estimated_delivery_at: input.estimated_delivery_at || null,
      delivery_notes: input.delivery_notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating delivery:", error);
    return null;
  }

  return data;
}

export async function updateDeliveryStatus(
  deliveryId: string,
  newStatus: DeliveryStatus,
  notes?: string
): Promise<boolean> {
  const supabase = createClient();

  const payload: Record<string, unknown> = { status: newStatus };
  if (newStatus === "delivered") {
    payload.delivered_at = new Date().toISOString();
  }
  if (notes) {
    payload.delivery_notes = notes;
  }

  const { error } = await supabase
    .from("pharmacy_deliveries")
    .update(payload)
    .eq("id", deliveryId);

  if (error) {
    console.error("Error updating delivery status:", error);
    return false;
  }

  return true;
}

export async function assignDeliveryPerson(
  deliveryId: string,
  personId: string
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("pharmacy_deliveries")
    .update({
      delivery_person_id: personId,
      status: "assigned",
    })
    .eq("id", deliveryId);

  if (error) {
    console.error("Error assigning delivery person:", error);
    return false;
  }

  return true;
}

// ============================================================================
// Delivery Zones
// ============================================================================

export async function getDeliveryZones(
  pharmacyId: string
): Promise<DeliveryZone[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_delivery_zones")
    .select("*")
    .eq("pharmacy_id", pharmacyId)
    .order("zone_name", { ascending: true });

  if (error) {
    console.error("Error fetching delivery zones:", error);
    return [];
  }

  return data || [];
}

export async function createDeliveryZone(
  input: CreateZoneInput
): Promise<DeliveryZone | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pharmacy_delivery_zones")
    .insert({
      pharmacy_id: input.pharmacy_id,
      zone_name: input.zone_name,
      municipalities: input.municipalities,
      delivery_fee_usd: input.delivery_fee_usd,
      delivery_fee_bs: input.delivery_fee_bs,
      estimated_time_minutes: input.estimated_time_minutes,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating delivery zone:", error);
    return null;
  }

  return data;
}

export async function updateDeliveryZone(
  zoneId: string,
  updates: Partial<Omit<DeliveryZone, "id" | "pharmacy_id">>
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("pharmacy_delivery_zones")
    .update(updates)
    .eq("id", zoneId);

  if (error) {
    console.error("Error updating delivery zone:", error);
    return false;
  }

  return true;
}
