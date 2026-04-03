import {
  getOfficialDollar,
  isRateStale,
} from "@/lib/services/currency-service";
import { supabase } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";

export type PaymentType =
  | "consulta"
  | "laboratorio"
  | "farmacia"
  | "procedimiento"
  | "emergencia"
  | "telemedicina"
  | "otro";

export type PaymentMethodType =
  | "tarjeta_credito"
  | "tarjeta_debito"
  | "pago_movil"
  | "transferencia"
  | "zelle"
  | "efectivo";

export interface Payment {
  id: string;
  patient_id: string;
  amount_usd: number;
  amount_bs: number;
  exchange_rate: number;
  payment_type: PaymentType;
  status: PaymentStatus;
  description: string;
  provider_name: string;
  provider_id: string | null;
  appointment_id: string | null;
  payment_method_id: string | null;
  reference_number: string | null;
  insurance_covered: number;
  patient_responsibility: number;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  patient_id: string;
  type: PaymentMethodType;
  label: string;
  is_default: boolean;
  // Card fields
  card_last_four: string | null;
  card_brand: string | null;
  card_expiry: string | null;
  // Pago Movil fields
  bank_code: string | null;
  phone_number: string | null;
  cedula: string | null;
  // Transfer fields
  account_number: string | null;
  bank_name: string | null;
  // Zelle fields
  zelle_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  payment_id: string;
  invoice_number: string;
  patient_name: string;
  patient_cedula: string | null;
  provider_name: string;
  provider_rif: string | null;
  provider_address: string | null;
  service_description: string;
  subtotal_usd: number;
  subtotal_bs: number;
  tax_usd: number;
  tax_bs: number;
  total_usd: number;
  total_bs: number;
  exchange_rate: number;
  payment_status: PaymentStatus;
  payment_method_label: string | null;
  issued_at: string;
  created_at: string;
}

export interface PaymentStats {
  total_spent_month_usd: number;
  total_spent_month_bs: number;
  total_spent_year_usd: number;
  total_spent_year_bs: number;
  pending_balance_usd: number;
  pending_balance_bs: number;
  top_category: PaymentType | null;
  insurance_covered_total: number;
  out_of_pocket_total: number;
  payments_count: number;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  type?: PaymentType;
  date_from?: string;
  date_to?: string;
}

export interface CreatePaymentMethodData {
  type: PaymentMethodType;
  label: string;
  is_default?: boolean;
  card_last_four?: string;
  card_brand?: string;
  card_expiry?: string;
  bank_code?: string;
  phone_number?: string;
  cedula?: string;
  account_number?: string;
  bank_name?: string;
  zelle_email?: string;
}

// ─── Constants ───────────────────────────────────────────────────────

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  consulta: "Consulta",
  laboratorio: "Laboratorio",
  farmacia: "Farmacia",
  procedimiento: "Procedimiento",
  emergencia: "Emergencia",
  telemedicina: "Telemedicina",
  otro: "Otro",
};

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; bg: string; text: string }
> = {
  pending: { label: "Pendiente", bg: "bg-amber-50", text: "text-amber-700" },
  processing: { label: "Procesando", bg: "bg-blue-50", text: "text-blue-700" },
  completed: { label: "Completado", bg: "bg-emerald-50", text: "text-emerald-700" },
  failed: { label: "Fallido", bg: "bg-red-50", text: "text-red-700" },
  refunded: { label: "Reembolsado", bg: "bg-purple-50", text: "text-purple-700" },
  cancelled: { label: "Cancelado", bg: "bg-gray-100", text: "text-gray-600" },
};

export const PAYMENT_METHOD_TYPE_LABELS: Record<PaymentMethodType, string> = {
  tarjeta_credito: "Tarjeta de Credito",
  tarjeta_debito: "Tarjeta de Debito",
  pago_movil: "Pago Movil",
  transferencia: "Transferencia Bancaria",
  zelle: "Zelle",
  efectivo: "Efectivo",
};

export const VENEZUELAN_BANKS = [
  { code: "0102", name: "Banco de Venezuela" },
  { code: "0104", name: "Venezolano de Credito" },
  { code: "0105", name: "Banco Mercantil" },
  { code: "0108", name: "Banco Provincial" },
  { code: "0114", name: "Bancaribe" },
  { code: "0115", name: "Banco Exterior" },
  { code: "0128", name: "Banco Caroni" },
  { code: "0134", name: "Banesco" },
  { code: "0137", name: "Banco Sofitasa" },
  { code: "0138", name: "Banco Plaza" },
  { code: "0151", name: "BFC Banco Fondo Comun" },
  { code: "0156", name: "100% Banco" },
  { code: "0157", name: "Banco del Sur" },
  { code: "0163", name: "Banco del Tesoro" },
  { code: "0166", name: "Banco Agricola" },
  { code: "0168", name: "Bancrecer" },
  { code: "0169", name: "Mi Banco" },
  { code: "0171", name: "Banco Activo" },
  { code: "0172", name: "Bancamiga" },
  { code: "0174", name: "Banplus" },
  { code: "0175", name: "Banco Bicentenario" },
  { code: "0177", name: "Banco de la Fuerza Armada (BANFANB)" },
  { code: "0191", name: "Banco Nacional de Credito (BNC)" },
];

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

export const paymentsService = {
  // ---- Payment History ----

  async getPayments(
    patientId: string,
    filters?: PaymentFilters
  ): Promise<Payment[]> {
    let query = supabase
      .from("payments")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.type) {
      query = query.eq("payment_type", filters.type);
    }
    if (filters?.date_from) {
      query = query.gte("created_at", filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte("created_at", filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }

    return (data ?? []).map(normalizePayment);
  },

  // ---- Pending Payments ----

  async getPendingPayments(patientId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("patient_id", patientId)
      .in("status", ["pending", "processing"])
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching pending payments:", error);
      throw error;
    }

    return (data ?? []).map(normalizePayment);
  },

  // ---- Payment Methods ----

  async getPaymentMethods(patientId: string): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("patient_id", patientId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching payment methods:", error);
      throw error;
    }

    return (data ?? []).map(normalizePaymentMethod);
  },

  async addPaymentMethod(
    patientId: string,
    payload: CreatePaymentMethodData
  ): Promise<PaymentMethod> {
    // If setting as default, unset current default first
    if (payload.is_default) {
      await supabase
        .from("payment_methods")
        .update({ is_default: false, updated_at: new Date().toISOString() })
        .eq("patient_id", patientId)
        .eq("is_default", true);
    }

    const { data, error } = await supabase
      .from("payment_methods")
      .insert({
        patient_id: patientId,
        type: payload.type,
        label: payload.label,
        is_default: payload.is_default ?? false,
        card_last_four: payload.card_last_four || null,
        card_brand: payload.card_brand || null,
        card_expiry: payload.card_expiry || null,
        bank_code: payload.bank_code || null,
        phone_number: payload.phone_number || null,
        cedula: payload.cedula || null,
        account_number: payload.account_number || null,
        bank_name: payload.bank_name || null,
        zelle_email: payload.zelle_email || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding payment method:", error);
      throw error;
    }

    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "payment_method_added",
      description: `Metodo de pago agregado: ${PAYMENT_METHOD_TYPE_LABELS[payload.type]}`,
      status: "success",
    });

    return normalizePaymentMethod(data);
  },

  async deletePaymentMethod(id: string): Promise<void> {
    const { error } = await supabase
      .from("payment_methods")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting payment method:", error);
      throw error;
    }
  },

  // ---- Process Payment ----

  async processPayment(
    paymentId: string,
    methodId: string
  ): Promise<Payment> {
    const { data, error } = await supabase
      .from("payments")
      .update({
        status: "processing",
        payment_method_id: methodId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId)
      .select()
      .single();

    if (error) {
      console.error("Error processing payment:", error);
      throw error;
    }

    // Simulate payment processing — in production this would call a payment gateway
    const { data: completedData, error: completeError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        paid_at: new Date().toISOString(),
        reference_number: `REF-${Date.now()}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId)
      .select()
      .single();

    if (completeError) {
      console.error("Error completing payment:", completeError);
      throw completeError;
    }

    const payment = normalizePayment(completedData ?? data);

    await supabase.from("user_activity_log").insert({
      user_id: payment.patient_id,
      activity_type: "payment_completed",
      description: `Pago completado: ${formatUsd(payment.amount_usd)} - ${payment.description}`,
      status: "success",
    });

    return payment;
  },

  // ---- Invoice ----

  async getInvoice(paymentId: string): Promise<Invoice> {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("payment_id", paymentId)
      .single();

    if (error) {
      console.error("Error fetching invoice:", error);
      throw error;
    }

    return normalizeInvoice(data);
  },

  // ---- Payment Stats ----

  async getPaymentStats(patientId: string): Promise<PaymentStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

    // All completed payments for the year
    const { data: yearPayments, error: yearError } = await supabase
      .from("payments")
      .select("amount_usd, amount_bs, payment_type, insurance_covered, patient_responsibility")
      .eq("patient_id", patientId)
      .eq("status", "completed")
      .gte("paid_at", startOfYear);

    if (yearError) {
      console.error("Error fetching year payments:", yearError);
      throw yearError;
    }

    // Pending payments
    const { data: pendingPayments, error: pendingError } = await supabase
      .from("payments")
      .select("amount_usd, amount_bs")
      .eq("patient_id", patientId)
      .in("status", ["pending", "processing"]);

    if (pendingError) {
      console.error("Error fetching pending payments:", pendingError);
      throw pendingError;
    }

    const payments = yearPayments ?? [];
    const pending = pendingPayments ?? [];

    // Month totals
    const monthPayments = payments.filter((p) => {
      return true; // All are >= startOfYear, filter by month
    }).filter(() => {
      // Re-fetch would be cleaner but let's filter in memory
      return true;
    });

    // We need to filter month payments properly
    const monthData = payments.filter((p) => {
      // paid_at isn't available here, use created_at from the query
      // Since we only have completed payments from the year, approximate with current month
      return true; // The month filter is applied server-side below
    });

    // Separate query for month totals
    const { data: monthPaymentsData } = await supabase
      .from("payments")
      .select("amount_usd, amount_bs")
      .eq("patient_id", patientId)
      .eq("status", "completed")
      .gte("paid_at", startOfMonth);

    const monthPays = monthPaymentsData ?? [];

    const totalSpentMonthUsd = monthPays.reduce(
      (sum, p) => sum + (Number(p.amount_usd) || 0),
      0
    );
    const totalSpentMonthBs = monthPays.reduce(
      (sum, p) => sum + (Number(p.amount_bs) || 0),
      0
    );
    const totalSpentYearUsd = payments.reduce(
      (sum, p) => sum + (Number(p.amount_usd) || 0),
      0
    );
    const totalSpentYearBs = payments.reduce(
      (sum, p) => sum + (Number(p.amount_bs) || 0),
      0
    );
    const pendingBalanceUsd = pending.reduce(
      (sum, p) => sum + (Number(p.amount_usd) || 0),
      0
    );
    const pendingBalanceBs = pending.reduce(
      (sum, p) => sum + (Number(p.amount_bs) || 0),
      0
    );

    // Top category
    const categoryCount: Record<string, number> = {};
    for (const p of payments) {
      const type = p.payment_type as string;
      categoryCount[type] = (categoryCount[type] || 0) + 1;
    }
    const topCategory =
      Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] as
        | PaymentType
        | undefined ?? null;

    // Insurance vs out-of-pocket
    const insuranceCoveredTotal = payments.reduce(
      (sum, p) => sum + (Number(p.insurance_covered) || 0),
      0
    );
    const outOfPocketTotal = payments.reduce(
      (sum, p) => sum + (Number(p.patient_responsibility) || 0),
      0
    );

    return {
      total_spent_month_usd: totalSpentMonthUsd,
      total_spent_month_bs: totalSpentMonthBs,
      total_spent_year_usd: totalSpentYearUsd,
      total_spent_year_bs: totalSpentYearBs,
      pending_balance_usd: pendingBalanceUsd,
      pending_balance_bs: pendingBalanceBs,
      top_category: topCategory,
      insurance_covered_total: insuranceCoveredTotal,
      out_of_pocket_total: outOfPocketTotal,
      payments_count: payments.length,
    };
  },

  // ---- BCV Exchange Rate ----

  async getExchangeRate(): Promise<{ rate: number; updated_at: string } | null> {
    // 1. Try DB first (existing logic)
    const { data, error } = await supabase
      .from("exchange_rates")
      .select("rate, updated_at")
      .eq("source", "BCV")
      .eq("currency_pair", "USD/VES")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching exchange rate from DB:", error);
    }

    const dbRate = data
      ? { rate: Number(data.rate) || 0, updated_at: data.updated_at as string }
      : null;

    // 2. If DB has a recent rate (< 1 hour old), use it
    if (dbRate && !isRateStale(dbRate.updated_at)) {
      return dbRate;
    }

    // 3. Fallback: fetch from dolarapi.com
    try {
      const apiRate = await getOfficialDollar();
      return {
        rate: apiRate.rate,
        updated_at: apiRate.lastUpdated,
      };
    } catch (apiError) {
      console.error("Error fetching exchange rate from DolarAPI:", apiError);
    }

    // 4. Return stale DB rate as last resort, or null
    return dbRate;
  },
};

// ─── Normalizers ─────────────────────────────────────────────────────

function normalizePayment(raw: Record<string, unknown>): Payment {
  return {
    id: raw.id as string,
    patient_id: raw.patient_id as string,
    amount_usd: Number(raw.amount_usd) || 0,
    amount_bs: Number(raw.amount_bs) || 0,
    exchange_rate: Number(raw.exchange_rate) || 0,
    payment_type: raw.payment_type as PaymentType,
    status: raw.status as PaymentStatus,
    description: raw.description as string,
    provider_name: raw.provider_name as string,
    provider_id: (raw.provider_id as string) ?? null,
    appointment_id: (raw.appointment_id as string) ?? null,
    payment_method_id: (raw.payment_method_id as string) ?? null,
    reference_number: (raw.reference_number as string) ?? null,
    insurance_covered: Number(raw.insurance_covered) || 0,
    patient_responsibility: Number(raw.patient_responsibility) || 0,
    paid_at: (raw.paid_at as string) ?? null,
    created_at: raw.created_at as string,
    updated_at: raw.updated_at as string,
  };
}

function normalizePaymentMethod(raw: Record<string, unknown>): PaymentMethod {
  return {
    id: raw.id as string,
    patient_id: raw.patient_id as string,
    type: raw.type as PaymentMethodType,
    label: raw.label as string,
    is_default: raw.is_default as boolean,
    card_last_four: (raw.card_last_four as string) ?? null,
    card_brand: (raw.card_brand as string) ?? null,
    card_expiry: (raw.card_expiry as string) ?? null,
    bank_code: (raw.bank_code as string) ?? null,
    phone_number: (raw.phone_number as string) ?? null,
    cedula: (raw.cedula as string) ?? null,
    account_number: (raw.account_number as string) ?? null,
    bank_name: (raw.bank_name as string) ?? null,
    zelle_email: (raw.zelle_email as string) ?? null,
    created_at: raw.created_at as string,
    updated_at: raw.updated_at as string,
  };
}

function normalizeInvoice(raw: Record<string, unknown>): Invoice {
  return {
    id: raw.id as string,
    payment_id: raw.payment_id as string,
    invoice_number: raw.invoice_number as string,
    patient_name: raw.patient_name as string,
    patient_cedula: (raw.patient_cedula as string) ?? null,
    provider_name: raw.provider_name as string,
    provider_rif: (raw.provider_rif as string) ?? null,
    provider_address: (raw.provider_address as string) ?? null,
    service_description: raw.service_description as string,
    subtotal_usd: Number(raw.subtotal_usd) || 0,
    subtotal_bs: Number(raw.subtotal_bs) || 0,
    tax_usd: Number(raw.tax_usd) || 0,
    tax_bs: Number(raw.tax_bs) || 0,
    total_usd: Number(raw.total_usd) || 0,
    total_bs: Number(raw.total_bs) || 0,
    exchange_rate: Number(raw.exchange_rate) || 0,
    payment_status: raw.payment_status as PaymentStatus,
    payment_method_label: (raw.payment_method_label as string) ?? null,
    issued_at: raw.issued_at as string,
    created_at: raw.created_at as string,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────

export function getPaymentStatusConfig(status: PaymentStatus) {
  return PAYMENT_STATUS_CONFIG[status] ?? PAYMENT_STATUS_CONFIG.pending;
}

export function getPaymentTypeLabel(type: PaymentType): string {
  return PAYMENT_TYPE_LABELS[type] ?? type;
}

export function getMethodTypeLabel(type: PaymentMethodType): string {
  return PAYMENT_METHOD_TYPE_LABELS[type] ?? type;
}

export function formatPaymentDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatPaymentDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
