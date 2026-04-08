import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateBody } from "@/lib/validation/validate";
import { createExpenseSchema } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Medical Expenses — BFF API Route
// -------------------------------------------------------------------
// GET:  List the authenticated patient's medical expenses.
// POST: Create a new medical expense for the authenticated patient.
// -------------------------------------------------------------------

const VALID_CATEGORIES = [
  "consulta",
  "examen_lab",
  "medicamento",
  "cirugia",
  "hospitalizacion",
  "seguro_prima",
  "seguro_copago",
  "otro",
] as const;

// --- GET: List expenses with filters and pagination ---

export async function GET(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, "authenticated");
    if (limited) return limited;

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
    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("page_size") ?? "20", 10)),
    );
    const offset = (page - 1) * pageSize;

    // Build main query
    let query = supabase
      .from("medical_expenses")
      .select("*", { count: "exact" })
      .eq("patient_id", user.id)
      .order("date", { ascending: false });

    if (category && VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
      query = query.eq("category", category);
    }
    if (from) {
      query = query.gte("date", from);
    }
    if (to) {
      query = query.lte("date", to);
    }

    query = query.range(offset, offset + pageSize - 1);

    const { data: expenses, error, count } = await query;

    if (error) {
      console.error("[Expenses GET] Supabase error:", error);
      return NextResponse.json(
        { error: "Error al obtener gastos medicos." },
        { status: 500 },
      );
    }

    // Build totals query with same filters
    let totalsQuery = supabase
      .from("medical_expenses")
      .select("amount_usd, amount_bs")
      .eq("patient_id", user.id);

    if (category && VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
      totalsQuery = totalsQuery.eq("category", category);
    }
    if (from) {
      totalsQuery = totalsQuery.gte("date", from);
    }
    if (to) {
      totalsQuery = totalsQuery.lte("date", to);
    }

    const { data: allForTotals } = await totalsQuery;

    const totalUsd = (allForTotals ?? []).reduce((sum, e) => sum + (e.amount_usd ?? 0), 0);
    const totalBs = (allForTotals ?? []).reduce((sum, e) => sum + (e.amount_bs ?? 0), 0);

    return NextResponse.json({
      data: expenses ?? [],
      pagination: {
        page,
        page_size: pageSize,
        total: count ?? 0,
        total_pages: count ? Math.ceil(count / pageSize) : 0,
      },
      totals: {
        total_usd: Math.round(totalUsd * 100) / 100,
        total_bs: Math.round(totalBs * 100) / 100,
      },
    });
  } catch (error) {
    console.error("[Expenses GET] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}

// --- POST: Create a new expense ---

export async function POST(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, "mutation");
    if (limited) return limited;

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

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }

    const validation = validateBody(createExpenseSchema, body);
    if (!validation.success) return validation.response;

    const { data } = validation;

    const { data: expense, error: insertError } = await supabase
      .from("medical_expenses")
      .insert({
        patient_id: user.id,
        category: data.category,
        description: data.description,
        amount_usd: data.amount_usd,
        amount_bs: data.amount_bs ?? null,
        bcv_rate: data.bcv_rate ?? null,
        date: data.date,
        provider_name: data.provider_name ?? null,
        appointment_id: data.appointment_id ?? null,
        prescription_id: data.prescription_id ?? null,
        lab_order_id: data.lab_order_id ?? null,
        receipt_url: data.receipt_url ?? null,
        notes: data.notes ?? null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Expenses POST] Insert error:", insertError);
      return NextResponse.json(
        { error: "Error al registrar el gasto medico." },
        { status: 500 },
      );
    }

    // Activity log (best-effort)
    await supabase
      .from("user_activity_log")
      .insert({
        user_id: user.id,
        action: "expense_created",
        details: {
          expense_id: expense.id,
          category: data.category,
          amount_usd: data.amount_usd,
        },
      })
      .then(({ error: logError }) => {
        if (logError) console.error("[Expenses POST] Activity log error:", logError);
      });

    return NextResponse.json({ data: expense }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Solicitud invalida. Verifica los datos enviados." },
        { status: 400 },
      );
    }
    console.error("[Expenses POST] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
