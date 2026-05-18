import { notFound, redirect } from "next/navigation";

import { CitaDetail } from "./_components/cita-detail";
import { fetchJson } from "@/lib/utils/fetch";
import type { AppointmentDetail } from "@/lib/services/appointments/appointments.types";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CitaDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  let appointment: AppointmentDetail;
  try {
    appointment = await fetchJson<AppointmentDetail>(
      `/api/appointments/${id}`,
    );
  } catch {
    // The API treats both "doesn't exist" and "not yours" as 404 to avoid
    // leaking other users' appointment IDs. Funnel both into Next's notFound.
    notFound();
  }

  return <CitaDetail appointment={appointment} userId={user.id} />;
}
