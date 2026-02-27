import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * API Route para sincronizar la sesión del cliente con el servidor
 * y asegurar que el perfil existe.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { accessToken, role: roleFromClient, action } = body;

        if (!accessToken) {
            return NextResponse.json(
                { error: "Missing access token" },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const supabaseClient = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // Ignore if called from Server Component
                        }
                    },
                },
            }
        );

        // Validar token y obtener usuario
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(accessToken);

        if (userError || !user) {
            console.error("❌ [SYNC] Error validando usuario:", userError);
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Obtener rol:
        // - En registro: permitir setear rol explícitamente desde el cliente.
        // - En cualquier otro caso: NO sobrescribir el rol existente en profiles.
        //   (Evita degradar médicos a 'paciente' si user_metadata.role está desactualizado).
        const isRegisterAction = action === "register";
        const canSetRoleFromClient = isRegisterAction && typeof roleFromClient === 'string' && roleFromClient.length > 0;

        let existingRole: string | null = null;
        let existingRoleKnown = false;
        if (!canSetRoleFromClient) {
            const { data: existingProfile, error: existingProfileError } = await supabaseClient
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .maybeSingle();

            if (existingProfileError) {
                console.warn('⚠️ [SYNC] No se pudo leer el rol existente del profile:', existingProfileError);
            } else {
                existingRole = (existingProfile?.role as string | null) ?? null;
                existingRoleKnown = true;
            }
        }

        const role = canSetRoleFromClient
            ? roleFromClient
            : existingRole
            ?? (user.user_metadata?.role as string | undefined)
            ?? 'paciente';
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0];

        console.log(`🔄 [SYNC] Sincronizando usuario ${user.email} con rol ${role}`);

        // Upsert perfil usando el cliente actual (RLS debería permitir esto si es el mismo usuario)
        // Importante: no sobrescribir role existente salvo en registro o si no existía role.
        const upsertPayload: Record<string, unknown> = {
            id: user.id,
            email: user.email,
            nombre_completo: fullName,
            updated_at: new Date().toISOString(),
        };

        // Solo setear role si:
        // - es registro explícito, o
        // - sabemos que el role actual no existe (profile inexistente o role null)
        //   para evitar sobrescribir por accidente si falló el SELECT.
        if (canSetRoleFromClient || (existingRoleKnown && !existingRole)) {
            upsertPayload.role = role;
        }

        const { data: profile, error: upsertError } = await supabaseClient
            .from('profiles')
            .upsert(upsertPayload, { onConflict: 'id' })
            .select()
            .single();

        if (upsertError) {
            console.error(`❌ [SYNC] Error upserting profile:`, upsertError);
            // Intentar con service role si falla por RLS (opcional, pero profile creation suele ser crítico)
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: profile?.role || role
            }
        });
    } catch (error) {
        console.error("❌ [SYNC] Internal error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
