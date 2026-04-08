import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// -------------------------------------------------------------------
// Medical Expenses — Summary BFF API Route
// -------------------------------------------------------------------
// GET: Aggregated expense summary with category breakdown, monthly
//      totals, and year-over-year comparison.
// -------------------------------------------------------------------

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado. Inicia sesion para continuar." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()), 10);
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!, 10) : null;

    // Fetch all expenses for the requested year
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    let query = supabase
      .from("medical_expenses")
      .select("*")
      .eq("patient_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (month) {
      const monthStr = String(month).padStart(2, "0");
      query = query
        .gte("date", `${year}-${monthStr}-01`)
        .lte("date", `${year}-${monthStr}-31`);
    }

    const { data: expenses, error } = await query;

    if (error) {
      console.error("[Expenses Summary] Supabase error:", error);
      return NextResponse.json(
        { error: "Error al obtener resumen de gastos." },
        { status: 500 },
      );
    }

    const items = expenses ?? [];

    // Total
    const totalUsd = items.reduce((s, e) => s + (e.amount_usd ?? 0), 0);
    const totalBs = items.reduce((s, e) => s + (e.amount_bs ?? 0), 0);

    // By category
    const catMap: Record<string, { total_usd: number; total_bs: number; count: number }> = {};
    for (const e of items) {
      const cat = e.category as string;
      if (!catMap[cat]) catMap[cat] = { total_usd: 0, total_bs: 0, count: 0 };
      catMap[cat].total_usd += e.amount_usd ?? 0;
      catMap[cat].total_bs += e.amount_bs ?? 0;
      catMap[cat].count += 1;
    }

    const byCategory = Object.entries(catMap)
      .map(([category, data]) => ({
        category,
        total_usd: Math.round(data.total_usd * 100) / 100,
        total_bs: Math.round(data.total_bs * 100) / 100,
        count: data.count,
        percentage: totalUsd > 0 ? Math.round((data.total_usd / totalUsd) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.total_usd - a.total_usd);

    // By month
    const monthMap: Record<number, { total_usd: number; total_bs: number }> = {};
    for (let m = 1; m <= 12; m++) {
      monthMap[m] = { total_usd: 0, total_bs: 0 };
    }
    for (const e of items) {
      const m = new Date(e.date).getMonth() + 1;
      monthMap[m].total_usd += e.amount_usd ?? 0;
      monthMap[m].total_bs += e.amount_bs ?? 0;
    }

    const byMonth = Object.entries(monthMap).map(([m, data]) => ({
      month: parseInt(m, 10),
      year,
      label: MONTH_LABELS[parseInt(m, 10) - 1],
      total_usd: Math.round(data.total_usd * 100) / 100,
      total_bs: Math.round(data.total_bs * 100) / 100,
    }));

    // Year-over-year comparison
    let yearOverYear = null;
    const prevYear = year - 1;
    const { data: prevExpenses } = await supabase
      .from("medical_expenses")
      .select("amount_usd")
      .eq("patient_id", user.id)
      .gte("date", `${prevYear}-01-01`)
      .lte("date", `${prevYear}-12-31`);

    if (prevExpenses && prevExpenses.length > 0) {
      const prevTotal = prevExpenses.reduce((s, e) => s + (e.amount_usd ?? 0), 0);
      yearOverYear = {
        current_year_usd: Math.round(totalUsd * 100) / 100,
        previous_year_usd: Math.round(prevTotal * 100) / 100,
        change_pct:
          prevTotal > 0
            ? Math.round(((totalUsd - prevTotal) / prevTotal) * 10000) / 100
            : 0,
      };
    }

    return NextResponse.json({
      data: {
        total_usd: Math.round(totalUsd * 100) / 100,
        total_bs: Math.round(totalBs * 100) / 100,
        by_category: byCategory,
        by_month: byMonth,
        year_over_year: yearOverYear,
      },
    });
  } catch (error) {
    console.error("[Expenses Summary] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
