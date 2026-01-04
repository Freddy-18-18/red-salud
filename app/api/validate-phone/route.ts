import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isValidVzlaPhone(v: string) {
  return /^\+58\s\d{3}\s\d{3}\s\d{4}$/.test(v);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: true, message: "No autenticado" }, { status: 401 });

    const { phone } = await request.json();
    if (typeof phone !== "string") return NextResponse.json({ error: true, message: "Parámetro inválido" }, { status: 400 });
    const valid = isValidVzlaPhone(phone);
    if (!valid) return NextResponse.json({ error: true, valid: false, message: "Formato de teléfono inválido" }, { status: 400 });
    return NextResponse.json({ error: false, valid: true });
  } catch {
    return NextResponse.json({ error: true, message: "Error interno del servidor" }, { status: 500 });
  }
}