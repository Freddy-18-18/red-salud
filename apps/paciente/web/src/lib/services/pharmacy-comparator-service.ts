import { supabase } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type DeliveryType = "delivery" | "pickup";

export type PaymentMethod =
  | "pago_movil"
  | "zelle"
  | "transferencia"
  | "efectivo";

export interface PharmacyInventoryItem {
  id: string;
  pharmacy_id: string;
  medication_name: string;
  generic_name?: string;
  price_bs: number;
  price_usd?: number;
  stock_quantity: number;
  in_stock: boolean;
  offers_delivery: boolean;
  delivery_fee?: number;
}

export interface FulfillmentOption {
  id: string;
  prescription_id: string;
  pharmacy_id: string;
  pharmacy_name: string;
  total_price_bs: number;
  total_price_usd?: number;
  items_available: number;
  items_total: number;
  all_available: boolean;
  offers_delivery: boolean;
  delivery_fee?: number;
  items: PharmacyMedicationPrice[];
  pharmacy?: PharmacyDetails;
}

export interface PharmacyMedicationPrice {
  medication_name: string;
  generic_name?: string;
  price_bs: number;
  price_usd?: number;
  in_stock: boolean;
  stock_quantity: number;
}

export interface PharmacyDetails {
  id: string;
  nombre_completo?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  avatar_url?: string;
  horario?: string;
  rating?: number;
}

export interface OrderItem {
  medication_name: string;
  quantity: number;
  price_bs: number;
  price_usd?: number;
}

export interface CreateOrderData {
  patient_id: string;
  pharmacy_id: string;
  prescription_id: string;
  items: OrderItem[];
  total_bs: number;
  delivery_type: DeliveryType;
  delivery_address?: string;
  payment_method: PaymentMethod;
  payment_reference?: string;
  notes?: string;
}

export interface PharmacyOrder {
  id: string;
  patient_id: string;
  pharmacy_id: string;
  prescription_id: string;
  items: OrderItem[];
  total_bs: number;
  delivery_type: DeliveryType;
  delivery_address?: string;
  payment_method: PaymentMethod;
  payment_reference?: string;
  status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  pharmacy?: PharmacyDetails;
}

// ─── Currency Formatting ─────────────────────────────────────────────

const bsFormatter = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatBs(amount: number): string {
  return `Bs. ${bsFormatter.format(amount)}`;
}

export function formatUsd(amount: number): string {
  return usdFormatter.format(amount);
}

// ─── Service ─────────────────────────────────────────────────────────

export async function comparePrices(
  prescriptionId: string
): Promise<{ success: boolean; data: FulfillmentOption[]; error?: unknown }> {
  try {
    // Get fulfillment options pre-computed by the system
    const { data: options, error: optionsError } = await supabase
      .from("prescription_fulfillment_options")
      .select("*")
      .eq("prescription_id", prescriptionId)
      .order("total_price_bs", { ascending: true });

    if (optionsError) throw optionsError;

    if (!options || options.length === 0) {
      return { success: true, data: [] };
    }

    // Enrich with pharmacy details and individual medication prices
    const enriched: FulfillmentOption[] = await Promise.all(
      (options || []).map(async (option) => {
        // Get pharmacy profile
        const { data: pharmacy } = await supabase
          .from("profiles")
          .select("id, nombre_completo, telefono, direccion, ciudad, estado, avatar_url")
          .eq("id", option.pharmacy_id)
          .maybeSingle();

        // Get individual medication prices for this pharmacy
        const { data: inventoryItems } = await supabase
          .from("pharmacy_inventory")
          .select("*")
          .eq("pharmacy_id", option.pharmacy_id);

        const items: PharmacyMedicationPrice[] = (inventoryItems || []).map((item) => ({
          medication_name: item.medication_name,
          generic_name: item.generic_name,
          price_bs: item.price_bs,
          price_usd: item.price_usd,
          in_stock: item.in_stock,
          stock_quantity: item.stock_quantity,
        }));

        // Estimate USD total if individual prices have USD
        const totalUsd = items.reduce((sum, item) => sum + (item.price_usd || 0), 0);

        return {
          id: option.id,
          prescription_id: option.prescription_id,
          pharmacy_id: option.pharmacy_id,
          pharmacy_name: option.pharmacy_name,
          total_price_bs: option.total_price_bs,
          total_price_usd: totalUsd > 0 ? totalUsd : undefined,
          items_available: option.items_available,
          items_total: option.items_total,
          all_available: option.all_available,
          offers_delivery: option.offers_delivery,
          delivery_fee: option.delivery_fee ?? undefined,
          items,
          pharmacy: pharmacy as PharmacyDetails | undefined,
        } satisfies FulfillmentOption;
      })
    );

    // Sort: all available first, then by price
    enriched.sort((a, b) => {
      if (a.all_available && !b.all_available) return -1;
      if (!a.all_available && b.all_available) return 1;
      return a.total_price_bs - b.total_price_bs;
    });

    return { success: true, data: enriched };
  } catch (error) {
    console.error("Error comparing pharmacy prices:", error);
    return { success: false, data: [], error };
  }
}

export async function getPharmacyDetails(
  pharmacyId: string
): Promise<{ success: boolean; data: PharmacyDetails | null; error?: unknown }> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nombre_completo, telefono, direccion, ciudad, estado, avatar_url")
      .eq("id", pharmacyId)
      .maybeSingle();

    if (error) throw error;

    return { success: true, data: data as PharmacyDetails | null };
  } catch (error) {
    console.error("Error fetching pharmacy details:", error);
    return { success: false, data: null, error };
  }
}

export async function createOrder(
  orderData: CreateOrderData
): Promise<{ success: boolean; data: PharmacyOrder | null; error?: unknown }> {
  try {
    const { data, error } = await supabase
      .from("pharmacy_orders")
      .insert({
        patient_id: orderData.patient_id,
        pharmacy_id: orderData.pharmacy_id,
        prescription_id: orderData.prescription_id,
        items: orderData.items,
        total_bs: orderData.total_bs,
        delivery_type: orderData.delivery_type,
        delivery_address: orderData.delivery_address,
        payment_method: orderData.payment_method,
        payment_reference: orderData.payment_reference,
        notes: orderData.notes,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: orderData.patient_id,
      activity_type: "pharmacy_order_created",
      description: `Pedido de farmacia creado`,
      status: "success",
    });

    return { success: true, data: data as PharmacyOrder };
  } catch (error) {
    console.error("Error creating pharmacy order:", error);
    return { success: false, data: null, error };
  }
}

export async function getOrderStatus(
  orderId: string
): Promise<{ success: boolean; data: PharmacyOrder | null; error?: unknown }> {
  try {
    const { data, error } = await supabase
      .from("pharmacy_orders")
      .select(`
        *,
        pharmacy:profiles!pharmacy_orders_pharmacy_id_fkey(
          id, nombre_completo, telefono, direccion, ciudad, estado, avatar_url
        )
      `)
      .eq("id", orderId)
      .single();

    if (error) throw error;

    return { success: true, data: data as PharmacyOrder };
  } catch (error) {
    console.error("Error fetching order status:", error);
    return { success: false, data: null, error };
  }
}

export async function getMyOrders(
  patientId: string
): Promise<{ success: boolean; data: PharmacyOrder[]; error?: unknown }> {
  try {
    const { data, error } = await supabase
      .from("pharmacy_orders")
      .select(`
        *,
        pharmacy:profiles!pharmacy_orders_pharmacy_id_fkey(
          id, nombre_completo, telefono, direccion, ciudad, estado, avatar_url
        )
      `)
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: (data || []) as PharmacyOrder[] };
  } catch (error) {
    console.error("Error fetching patient orders:", error);
    return { success: false, data: [], error };
  }
}

export function subscribeToOrderUpdates(
  orderId: string,
  onUpdate: (order: PharmacyOrder) => void
) {
  const channel = supabase
    .channel(`order:${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "pharmacy_orders",
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        onUpdate(payload.new as PharmacyOrder);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToAllOrderUpdates(
  patientId: string,
  onUpdate: (order: PharmacyOrder) => void
) {
  const channel = supabase
    .channel(`patient-orders:${patientId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "pharmacy_orders",
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => {
        onUpdate(payload.new as PharmacyOrder);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
