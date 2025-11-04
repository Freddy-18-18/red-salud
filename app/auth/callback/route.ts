import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    await supabase.auth.exchangeCodeForSession(code);
    
    // Obtener el usuario para redirigir según su rol
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const role = user.user_metadata?.role || "paciente";
      return NextResponse.redirect(new URL(`/dashboard/${role}`, requestUrl.origin));
    }
  }

  // Si algo sale mal, redirigir al login
  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
}
