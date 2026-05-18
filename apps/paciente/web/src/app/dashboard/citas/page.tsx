import { redirect } from "next/navigation";

import { CitasList } from "./_components/citas-list";
import { createClient } from "@/lib/supabase/server";

export default async function MisCitasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already enforces auth + role for /dashboard, but the type
  // narrowing here keeps the client component contract clean (userId: string).
  if (!user) {
    redirect("/auth/login");
  }

  return <CitasList userId={user.id} />;
}
