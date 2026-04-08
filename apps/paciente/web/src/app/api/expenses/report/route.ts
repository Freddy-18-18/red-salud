import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// -------------------------------------------------------------------
// Medical Expenses — Annual Fiscal Report BFF API Route
// -------------------------------------------------------------------
// GET: Complete annual fiscal report with monthly breakdown by category,
//      provider summary, and insurance vs out-of-pocket split.
// -------------------------------------------------------------------

const MONTH_LABELS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const INSURANCE_CATEGORIES = ["seguro_prima", "seguro_copago"];

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
    const yearParam = searchParams.get("year");

    if (!yearParam) {
      return NextResponse.json(
        { error: "Parametro requerido: year." },
        { status: 400 },
      );
    }

    const year = parseInt(yearParam, 10);
    if (isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json(
        { error: "Ano invalido." },
        { status: 400 },
      );
    }

    // Fetch all expenses for the year
    const { data: expenses, error } = await supabase
      .from("medical_expenses")
      .select("*")
      .eq("patient_id", user.id)
      .gte("date", `${year}-01-01`)
      .lte("date", `${year}-12-31`)
      .order("date", { ascending: true });

    if (error) {
      console.error("[Expenses Report] Supabase error:", error);
      return NextResponse.json(
        { error: "Error al generar el reporte fiscal." },
        { status: 500 },
      );
    }

    const items = expenses ?? [];

    // Grand totals
    const grandTotalUsd = items.reduce((s, e) => s + (e.amount_usd ?? 0), 0);
    const grandTotalBs = items.reduce((s, e) => s + (e.amount_bs ?? 0), 0);

    // Monthly breakdown
    const monthlyMap: Record<
      number,
      { by_category: Record<string, number>; total_usd: number; total_bs: number }
    > = {};

    for (let m = 1; m <= 12; m++) {
      monthlyMap[m] = { by_category: {}, total_usd: 0, total_bs: 0 };
    }

    for (const e of items) {
      const m = new Date(e.date).getMonth() + 1;
      const cat = e.category as string;
      if (!monthlyMap[m].by_category[cat]) monthlyMap[m].by_category[cat] = 0;
      monthlyMap[m].by_category[cat] += e.amount_usd ?? 0;
      monthlyMap[m].total_usd += e.amount_usd ?? 0;
      monthlyMap[m].total_bs += e.amount_bs ?? 0;
    }

    const monthlyBreakdown = Object.entries(monthlyMap).map(([m, data]) => ({
      month: parseInt(m, 10),
      label: MONTH_LABELS[parseInt(m, 10) - 1],
      by_category: data.by_category as Record<string, number>,
      total_usd: Math.round(data.total_usd * 100) / 100,
      total_bs: Math.round(data.total_bs * 100) / 100,
    }));

    // Category totals
    const catMap: Record<string, { total_usd: number; total_bs: number; count: number }> = {};
    for (const e of items) {
      const cat = e.category as string;
      if (!catMap[cat]) catMap[cat] = { total_usd: 0, total_bs: 0, count: 0 };
      catMap[cat].total_usd += e.amount_usd ?? 0;
      catMap[cat].total_bs += e.amount_bs ?? 0;
      catMap[cat].count += 1;
    }

    const categoryTotals = Object.entries(catMap)
      .map(([category, data]) => ({
        category,
        total_usd: Math.round(data.total_usd * 100) / 100,
        total_bs: Math.round(data.total_bs * 100) / 100,
        count: data.count,
        percentage:
          grandTotalUsd > 0
            ? Math.round((data.total_usd / grandTotalUsd) * 10000) / 100
            : 0,
      }))
      .sort((a, b) => b.total_usd - a.total_usd);

    // Provider summary
    const provMap: Record<string, { total_usd: number; total_bs: number; count: number }> = {};
    for (const e of items) {
      const name = (e.provider_name as string) || "Sin proveedor";
      if (!provMap[name]) provMap[name] = { total_usd: 0, total_bs: 0, count: 0 };
      provMap[name].total_usd += e.amount_usd ?? 0;
      provMap[name].total_bs += e.amount_bs ?? 0;
      provMap[name].count += 1;
    }

    const providerSummary = Object.entries(provMap)
      .map(([provider_name, data]) => ({
        provider_name,
        total_usd: Math.round(data.total_usd * 100) / 100,
        total_bs: Math.round(data.total_bs * 100) / 100,
        count: data.count,
      }))
      .sort((a, b) => b.total_usd - a.total_usd);

    // Insurance split
    let insuranceUsd = 0;
    let insuranceBs = 0;
    let outOfPocketUsd = 0;
    let outOfPocketBs = 0;

    for (const e of items) {
      if (INSURANCE_CATEGORIES.includes(e.category as string)) {
        insuranceUsd += e.amount_usd ?? 0;
        insuranceBs += e.amount_bs ?? 0;
      } else {
        outOfPocketUsd += e.amount_usd ?? 0;
        outOfPocketBs += e.amount_bs ?? 0;
      }
    }

    // Average monthly (months with data)
    const monthsWithData = Object.values(monthlyMap).filter((m) => m.total_usd > 0).length;
    const averageMonthlyUsd = monthsWithData > 0 ? grandTotalUsd / monthsWithData : 0;

    // Top category
    const topCategory = categoryTotals.length > 0 ? categoryTotals[0].category : null;

    return NextResponse.json({
      data: {
        year,
        grand_total_usd: Math.round(grandTotalUsd * 100) / 100,
        grand_total_bs: Math.round(grandTotalBs * 100) / 100,
        expense_count: items.length,
        monthly_breakdown: monthlyBreakdown,
        category_totals: categoryTotals,
        provider_summary: providerSummary,
        insurance_split: {
          insurance_usd: Math.round(insuranceUsd * 100) / 100,
          out_of_pocket_usd: Math.round(outOfPocketUsd * 100) / 100,
          insurance_bs: Math.round(insuranceBs * 100) / 100,
          out_of_pocket_bs: Math.round(outOfPocketBs * 100) / 100,
        },
        average_monthly_usd: Math.round(averageMonthlyUsd * 100) / 100,
        top_category: topCategory,
      },
    });
  } catch (error) {
    console.error("[Expenses Report] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
