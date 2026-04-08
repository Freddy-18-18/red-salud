import { fetchJson, postJson } from "@/lib/utils/fetch";

// ─── Types ───────────────────────────────────────────────────────────

export interface PharmacyInfo {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  avatar_url: string | null;
  lat: number | null;
  lng: number | null;
}

export interface ComparisonMedication {
  medication_name: string;
  generic_name: string | null;
  price_bs: number;
  price_usd: number | null;
  in_stock: boolean;
  quantity: number;
}

export interface PharmacyComparison {
  pharmacy: PharmacyInfo;
  medications: ComparisonMedication[];
  total_bs: number;
  total_usd: number;
  items_available: number;
  items_total: number;
  all_available: boolean;
  /** Computed client-side when geolocation is available */
  distance_km?: number;
}

export interface PriceAlert {
  id: string;
  patient_id: string;
  medication_name: string;
  target_price_usd: number;
  prescription_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePriceAlertData {
  medication_name: string;
  target_price_usd: number;
  prescription_id?: string;
}

// ─── Currency Formatting ─────────────────────────────────────────────

const bsFormatter = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBs(amount: number): string {
  return `Bs. ${bsFormatter.format(amount)}`;
}

export function formatUsd(amount: number): string {
  return `$ ${usdFormatter.format(amount)}`;
}

/**
 * Format a dual-currency price string: "$ X.XX / Bs. Y.YY"
 * If bcvRate is provided, converts from USD to Bs.
 */
export function formatPrice(usd: number, bcvRate?: number): string {
  const usdStr = formatUsd(usd);
  if (bcvRate && bcvRate > 0) {
    const bsAmount = usd * bcvRate;
    return `${usdStr} / ${formatBs(bsAmount)}`;
  }
  return usdStr;
}

// ─── Distance ─────────────────────────────────────────────────────────

/**
 * Haversine distance between two lat/lng points in km.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // One decimal place
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// ─── Service Functions ───────────────────────────────────────────────

/**
 * Compare medication prices across pharmacies for a given prescription.
 */
export async function comparePrescriptionPrices(
  prescriptionId: string,
): Promise<PharmacyComparison[]> {
  return fetchJson<PharmacyComparison[]>(
    `/api/pharmacy/compare-prescription?prescription_id=${encodeURIComponent(prescriptionId)}`,
  );
}

/**
 * Get the patient's active price alerts.
 */
export async function getPriceAlerts(): Promise<PriceAlert[]> {
  return fetchJson<PriceAlert[]>("/api/pharmacy/price-alerts");
}

/**
 * Create or update a price alert.
 */
export async function createPriceAlert(
  data: CreatePriceAlertData,
): Promise<PriceAlert> {
  return postJson<PriceAlert>("/api/pharmacy/price-alerts", data);
}

/**
 * Delete (deactivate) a price alert.
 */
export async function deletePriceAlert(
  id: string,
): Promise<{ success: boolean }> {
  return fetchJson<{ success: boolean }>(
    `/api/pharmacy/price-alerts/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}
