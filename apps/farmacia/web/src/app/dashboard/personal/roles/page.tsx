import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoleManager } from "./role-manager";

interface RoleRow {
  id: string;
  pharmacy_id: string | null;
  key: string;
  label_es: string;
  description: string | null;
  is_system: boolean;
  is_default: boolean;
  permissions: Record<string, unknown>;
  updated_at: string;
}

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Resolve current pharmacy + verify user is owner
  const { data: pharmacy } = await supabase
    .from("pharmacy_details")
    .select("id, business_name, profile_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!pharmacy) {
    // Non-owner staff cannot manage roles
    redirect("/dashboard/personal");
  }

  // Load all role definitions for this pharmacy (system + default + custom)
  const { data: roles } = await supabase
    .from("pharmacy_role_definitions")
    .select("*")
    .eq("pharmacy_id", pharmacy.id)
    .order("is_system", { ascending: false })
    .order("is_default", { ascending: false })
    .order("label_es");

  return (
    <RoleManager
      pharmacyId={pharmacy.id}
      pharmacyName={pharmacy.business_name ?? "Farmacia"}
      initialRoles={(roles ?? []) as RoleRow[]}
    />
  );
}
