import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// LEGACY API ROUTE — /api/inventory
//
// NOTA: Esta ruta usa las tablas con prefijo farmacia_* del esquema actual.
// Tablas anteriores (batches, products, warehouses) ya no existen.
//
// Tablas actuales:
//   farmacia_inventario  — Lotes/batches de inventario
//   farmacia_productos   — Productos (joined via product_id)
// ============================================================================

// ============================================================================
// GET /api/inventory — Listar inventario con filtros
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const pharmacy_id = searchParams.get("pharmacy_id");
    const expiry_days = searchParams.get("expiry_days");
    const low_stock = searchParams.get("low_stock");

    let query = supabase
      .from("farmacia_inventario")
      .select("*");

    if (pharmacy_id) {
      query = query.eq("pharmacy_id", pharmacy_id);
    }

    // Filtrar por fecha de caducidad proxima
    if (expiry_days) {
      const days = parseInt(expiry_days);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);
      query = query.lte("expiry_date", expiryDate.toISOString());
    }

    // Filtrar por stock bajo
    if (low_stock === "true") {
      query = query.lte("quantity_available", 10); // Umbral de stock bajo
    }

    const { data, error } = await query.order("expiry_date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================================================
// POST /api/inventory — Agregar lote al inventario
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("farmacia_inventario")
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================================================
// PATCH /api/inventory — Actualizar lote
// ============================================================================
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Se requiere el ID del lote" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("farmacia_inventario")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ============================================================================
// DELETE /api/inventory — Eliminar lote
// ============================================================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Se requiere el ID del lote" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("farmacia_inventario")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
