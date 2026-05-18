import { redirect } from "next/navigation";

import { PaymentsHistory, type PaymentRow } from "./_components/payments-history";
import { SavedMethodsManager } from "@/components/payments/saved-methods-manager";
import { createClient } from "@/lib/supabase/server";

export default async function PagosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: payments, error } = await supabase
    .from("payments")
    .select(
      `
      id,
      amount,
      currency,
      exchange_rate,
      reference_number,
      bank_origin,
      bank_destination,
      payment_date,
      status,
      payment_method,
      payment_type,
      description,
      appointment_id,
      created_at,
      appointment:appointments!payments_appointment_id_fkey (
        id,
        scheduled_at,
        doctor:profiles!appointments_medico_id_fkey (
          full_name
        )
      )
      `,
    )
    .eq("user_id", user.id)
    .order("payment_date", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Historial de pagos
        </h1>
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
          No pudimos cargar tus pagos. Intenta más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SavedMethodsManager />
      <PaymentsHistory payments={(payments ?? []) as PaymentRow[]} />
    </div>
  );
}
