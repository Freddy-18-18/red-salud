// ─── Types ───────────────────────────────────────────────────────────

const BASE_URL = "https://ve.dolarapi.com";
const CACHE_KEY = "red-salud:currency-rates";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export interface ExchangeRate {
  name: string;
  currency: string;
  rate: number;
  lastUpdated: string;
  source: string;
}

export interface CurrencyConversion {
  amountUsd: number;
  amountBs: number;
  amountEur: number;
  rate: ExchangeRate;
}

export interface HistoricalRate {
  date: string;
  rate: number;
}

interface CachedRates {
  rates: ExchangeRate[];
  timestamp: number;
}

// ─── Raw API response shapes ─────────────────────────────────────────

interface DolarApiQuote {
  fuente: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number;
  fechaActualizacion: string;
}

interface DolarApiSingleQuote {
  fuente: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number;
  fechaActualizacion: string;
}

interface DolarApiHistorical {
  fecha: string;
  promedio: number;
  compra?: number;
  venta?: number;
}

// ─── Cache helpers ───────────────────────────────────────────────────

function getCached(): CachedRates | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedRates = JSON.parse(raw);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached;
    }
    return null;
  } catch {
    return null;
  }
}

function setCache(rates: ExchangeRate[]): void {
  if (typeof window === "undefined") return;
  try {
    const data: CachedRates = { rates, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage might be full or disabled — ignore
  }
}

function getCachedRates(): ExchangeRate[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedRates = JSON.parse(raw);
    // Return even stale cache as fallback
    return cached.rates;
  } catch {
    return null;
  }
}

// ─── API helpers ─────────────────────────────────────────────────────

async function fetchJson<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    next: { revalidate: 300 }, // 5-min ISR cache for Next.js
  });
  if (!res.ok) {
    throw new Error(`DolarAPI error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

function mapQuote(q: DolarApiSingleQuote, currency: string): ExchangeRate {
  return {
    name: q.nombre,
    currency,
    rate: q.promedio,
    lastUpdated: q.fechaActualizacion,
    source: q.fuente,
  };
}

// ─── Service functions ───────────────────────────────────────────────

export async function getAllRates(): Promise<ExchangeRate[]> {
  const cached = getCached();
  if (cached) return cached.rates;

  try {
    const quotes = await fetchJson<DolarApiQuote[]>("/cotizaciones");
    const rates: ExchangeRate[] = quotes.map((q) => {
      // Determine currency from the name
      const currency = q.nombre.toLowerCase().includes("euro") ? "EUR" : "USD";
      return mapQuote(q, currency);
    });
    setCache(rates);
    return rates;
  } catch (error) {
    console.error("Error fetching all rates:", error);
    const fallback = getCachedRates();
    if (fallback) return fallback;
    throw error;
  }
}

export async function getOfficialDollar(): Promise<ExchangeRate> {
  try {
    const data = await fetchJson<DolarApiSingleQuote>("/dolar-oficial");
    return mapQuote(data, "USD");
  } catch (error) {
    console.error("Error fetching official dollar:", error);
    const fallback = getCachedRates();
    const rate = fallback?.find(
      (r) => r.currency === "USD" && r.source === "BCV"
    );
    if (rate) return rate;
    throw error;
  }
}

export async function getParallelDollar(): Promise<ExchangeRate> {
  try {
    const data = await fetchJson<DolarApiSingleQuote>("/dolar-paralelo");
    return mapQuote(data, "USD");
  } catch (error) {
    console.error("Error fetching parallel dollar:", error);
    const fallback = getCachedRates();
    const rate = fallback?.find(
      (r) => r.currency === "USD" && r.source !== "BCV"
    );
    if (rate) return rate;
    throw error;
  }
}

export async function getOfficialEuro(): Promise<ExchangeRate> {
  try {
    const data = await fetchJson<DolarApiSingleQuote>("/euro-oficial");
    return mapQuote(data, "EUR");
  } catch (error) {
    console.error("Error fetching official euro:", error);
    const fallback = getCachedRates();
    const rate = fallback?.find(
      (r) => r.currency === "EUR" && r.source === "BCV"
    );
    if (rate) return rate;
    throw error;
  }
}

export async function getParallelEuro(): Promise<ExchangeRate> {
  try {
    const data = await fetchJson<DolarApiSingleQuote>("/euro-paralelo");
    return mapQuote(data, "EUR");
  } catch (error) {
    console.error("Error fetching parallel euro:", error);
    const fallback = getCachedRates();
    const rate = fallback?.find(
      (r) => r.currency === "EUR" && r.source !== "BCV"
    );
    if (rate) return rate;
    throw error;
  }
}

export async function getDollarHistory(): Promise<HistoricalRate[]> {
  try {
    const data = await fetchJson<DolarApiHistorical[]>(
      "/historicos-dolar-oficial"
    );
    return data.map((d) => ({
      date: d.fecha,
      rate: d.promedio,
    }));
  } catch (error) {
    console.error("Error fetching dollar history:", error);
    return [];
  }
}

export async function convertCurrency(
  amount: number,
  from: "USD" | "EUR" | "BS",
  to: "USD" | "EUR" | "BS",
  useParallel = false
): Promise<CurrencyConversion> {
  const [dollarRate, euroRate] = await Promise.all([
    useParallel ? getParallelDollar() : getOfficialDollar(),
    useParallel ? getParallelEuro() : getOfficialEuro(),
  ]);

  let amountUsd = 0;
  let amountBs = 0;
  let amountEur = 0;

  // Normalize everything to USD first
  switch (from) {
    case "USD":
      amountUsd = amount;
      break;
    case "BS":
      amountUsd = dollarRate.rate > 0 ? amount / dollarRate.rate : 0;
      break;
    case "EUR":
      amountBs = euroRate.rate > 0 ? amount * euroRate.rate : 0;
      amountUsd =
        dollarRate.rate > 0 ? amountBs / dollarRate.rate : 0;
      break;
  }

  // Convert from USD to all currencies
  if (from !== "EUR") {
    amountBs = amountUsd * dollarRate.rate;
  }
  amountEur = euroRate.rate > 0 ? amountBs / euroRate.rate : 0;

  // If "from" was EUR we already have amountBs
  if (from === "EUR") {
    amountUsd = dollarRate.rate > 0 ? amountBs / dollarRate.rate : 0;
  }

  // Pick the rate used for the primary conversion
  const rate = to === "EUR" || from === "EUR" ? euroRate : dollarRate;

  return {
    amountUsd: round(amountUsd),
    amountBs: round(amountBs),
    amountEur: round(amountEur),
    rate,
  };
}

// ─── Formatting ──────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────

function round(n: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}

/**
 * Check if a rate timestamp is stale (> 1 hour old).
 */
export function isRateStale(updatedAt: string): boolean {
  const ONE_HOUR_MS = 60 * 60 * 1000;
  try {
    const updated = new Date(updatedAt).getTime();
    return Date.now() - updated > ONE_HOUR_MS;
  } catch {
    return true;
  }
}
