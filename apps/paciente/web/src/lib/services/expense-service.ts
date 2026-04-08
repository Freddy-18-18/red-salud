import { fetchJson, postJson } from "@/lib/utils/fetch";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ExpenseCategory =
  | "consulta"
  | "examen_lab"
  | "medicamento"
  | "cirugia"
  | "hospitalizacion"
  | "seguro_prima"
  | "seguro_copago"
  | "otro";

export interface Expense {
  id: string;
  patient_id: string;
  category: ExpenseCategory;
  description: string;
  amount_usd: number;
  amount_bs: number | null;
  bcv_rate: number | null;
  date: string;
  provider_name: string | null;
  appointment_id: string | null;
  prescription_id: string | null;
  lab_order_id: string | null;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseData {
  category: ExpenseCategory;
  description: string;
  amount_usd: number;
  amount_bs?: number;
  bcv_rate?: number;
  date: string;
  provider_name?: string;
  appointment_id?: string;
  prescription_id?: string;
  lab_order_id?: string;
  receipt_url?: string;
  notes?: string;
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {}

export interface ExpenseListParams {
  category?: ExpenseCategory;
  from?: string;
  to?: string;
  page?: number;
  page_size?: number;
}

export interface ExpenseListResponse {
  data: Expense[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  totals: {
    total_usd: number;
    total_bs: number;
  };
}

export interface CategorySummary {
  category: ExpenseCategory;
  total_usd: number;
  total_bs: number;
  count: number;
  percentage: number;
}

export interface MonthlySummary {
  month: number;
  year: number;
  label: string;
  total_usd: number;
  total_bs: number;
}

export interface ExpenseSummary {
  total_usd: number;
  total_bs: number;
  by_category: CategorySummary[];
  by_month: MonthlySummary[];
  year_over_year: {
    current_year_usd: number;
    previous_year_usd: number;
    change_pct: number;
  } | null;
}

export interface ProviderSummary {
  provider_name: string;
  total_usd: number;
  total_bs: number;
  count: number;
}

export interface MonthlyBreakdown {
  month: number;
  label: string;
  by_category: Record<ExpenseCategory, number>;
  total_usd: number;
  total_bs: number;
}

export interface AnnualReport {
  year: number;
  grand_total_usd: number;
  grand_total_bs: number;
  expense_count: number;
  monthly_breakdown: MonthlyBreakdown[];
  category_totals: CategorySummary[];
  provider_summary: ProviderSummary[];
  insurance_split: {
    insurance_usd: number;
    out_of_pocket_usd: number;
    insurance_bs: number;
    out_of_pocket_bs: number;
  };
  average_monthly_usd: number;
  top_category: ExpenseCategory | null;
}

/* ------------------------------------------------------------------ */
/*  Category metadata                                                  */
/* ------------------------------------------------------------------ */

export interface CategoryMeta {
  value: ExpenseCategory;
  label: string;
  icon: string;
  color: string;
  bgLight: string;
  textColor: string;
  borderColor: string;
  chartColor: string;
}

export const EXPENSE_CATEGORIES: CategoryMeta[] = [
  {
    value: "consulta",
    label: "Consulta medica",
    icon: "stethoscope",
    color: "blue",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    chartColor: "#3b82f6",
  },
  {
    value: "examen_lab",
    label: "Examen de laboratorio",
    icon: "test-tubes",
    color: "purple",
    bgLight: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    chartColor: "#8b5cf6",
  },
  {
    value: "medicamento",
    label: "Medicamento",
    icon: "pill",
    color: "green",
    bgLight: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    chartColor: "#22c55e",
  },
  {
    value: "cirugia",
    label: "Cirugia",
    icon: "scissors",
    color: "red",
    bgLight: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    chartColor: "#ef4444",
  },
  {
    value: "hospitalizacion",
    label: "Hospitalizacion",
    icon: "bed-double",
    color: "orange",
    bgLight: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    chartColor: "#f97316",
  },
  {
    value: "seguro_prima",
    label: "Prima de seguro",
    icon: "shield",
    color: "amber",
    bgLight: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    chartColor: "#f59e0b",
  },
  {
    value: "seguro_copago",
    label: "Copago de seguro",
    icon: "shield-check",
    color: "amber",
    bgLight: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    chartColor: "#d97706",
  },
  {
    value: "otro",
    label: "Otro",
    icon: "receipt",
    color: "gray",
    bgLight: "bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
    chartColor: "#6b7280",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function getCategoryMeta(category: ExpenseCategory): CategoryMeta {
  return EXPENSE_CATEGORIES.find((c) => c.value === category) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

export function getCategoryLabel(category: ExpenseCategory): string {
  return getCategoryMeta(category).label;
}

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

export const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export const MONTH_LABELS_FULL = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/* ------------------------------------------------------------------ */
/*  API Functions                                                      */
/* ------------------------------------------------------------------ */

export async function getExpenses(params?: ExpenseListParams): Promise<ExpenseListResponse> {
  const sp = new URLSearchParams();
  if (params?.category) sp.set("category", params.category);
  if (params?.from) sp.set("from", params.from);
  if (params?.to) sp.set("to", params.to);
  if (params?.page) sp.set("page", String(params.page));
  if (params?.page_size) sp.set("page_size", String(params.page_size));

  const qs = sp.toString();
  const url = `/api/expenses${qs ? `?${qs}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as Record<string, string>).error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export async function addExpense(data: CreateExpenseData): Promise<Expense> {
  return postJson<Expense>("/api/expenses", data);
}

export async function updateExpense(id: string, data: UpdateExpenseData): Promise<Expense> {
  return postJson<Expense>(`/api/expenses/${id}`, data, "PATCH");
}

export async function deleteExpense(id: string): Promise<void> {
  await fetchJson(`/api/expenses/${id}`, { method: "DELETE" });
}

export async function getSummary(year?: number, month?: number): Promise<ExpenseSummary> {
  const sp = new URLSearchParams();
  if (year) sp.set("year", String(year));
  if (month) sp.set("month", String(month));

  const qs = sp.toString();
  const url = `/api/expenses/summary${qs ? `?${qs}` : ""}`;
  return fetchJson<ExpenseSummary>(url);
}

export async function getAnnualReport(year: number): Promise<AnnualReport> {
  return fetchJson<AnnualReport>(`/api/expenses/report?year=${year}`);
}

export function getCategories(): CategoryMeta[] {
  return EXPENSE_CATEGORIES;
}
