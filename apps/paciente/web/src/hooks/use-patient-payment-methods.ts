"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchJson, postJson } from "@/lib/utils/fetch";

// -------------------------------------------------------------------
// Patient saved payment methods — TanStack Query hooks
// -------------------------------------------------------------------

export type PatientPaymentMethodType =
  | "pago_movil"
  | "transferencia"
  | "efectivo"
  | "zelle"
  | "tarjeta_credito"
  | "tarjeta_debito";

export interface PatientPaymentMethod {
  id: string;
  patient_id: string;
  type: PatientPaymentMethodType;
  label: string;
  is_default: boolean;
  card_last_four: string | null;
  card_brand: string | null;
  pago_movil_bank_code: string | null;
  pago_movil_phone: string | null;
  pago_movil_cedula: string | null;
  bank_name: string | null;
  account_last_four: string | null;
  zelle_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientPaymentMethodData {
  type: PatientPaymentMethodType;
  label: string;
  is_default?: boolean;
  card_last_four?: string | null;
  card_brand?: string | null;
  pago_movil_bank_code?: string | null;
  pago_movil_phone?: string | null;
  pago_movil_cedula?: string | null;
  bank_name?: string | null;
  account_last_four?: string | null;
  zelle_email?: string | null;
}

const QUERY_KEY = ["payment-methods"] as const;

export function usePatientPaymentMethods() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fetchJson<PatientPaymentMethod[]>("/api/payment-methods"),
  });

  return {
    methods: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: query.refetch,
  };
}

export function useCreatePatientPaymentMethod() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: CreatePatientPaymentMethodData) =>
      postJson<PatientPaymentMethod>("/api/payment-methods", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const create = async (data: CreatePatientPaymentMethodData) => {
    try {
      const result = await mutation.mutateAsync(data);
      return { success: true as const, data: result, error: null };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos guardar el método. Intenta de nuevo.";
      return { success: false as const, data: null, error: message };
    }
  };

  return {
    create,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}

export function useUpdatePatientPaymentMethod() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreatePatientPaymentMethodData>;
    }) =>
      postJson<PatientPaymentMethod>(
        `/api/payment-methods/${id}`,
        data,
        "PATCH",
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const update = async (
    id: string,
    data: Partial<CreatePatientPaymentMethodData>,
  ) => {
    try {
      const result = await mutation.mutateAsync({ id, data });
      return { success: true as const, data: result, error: null };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos actualizar el método.";
      return { success: false as const, data: null, error: message };
    }
  };

  return { update, loading: mutation.isPending };
}

export function useDeletePatientPaymentMethod() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) =>
      fetchJson<null>(`/api/payment-methods/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const remove = async (id: string) => {
    try {
      await mutation.mutateAsync(id);
      return { success: true as const, error: null };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No pudimos eliminar el método.";
      return { success: false as const, error: message };
    }
  };

  return { remove, loading: mutation.isPending };
}

// -------------------------------------------------------------------
// Helpers used by both the manager UI and the PaymentDialog auto-fill.
// -------------------------------------------------------------------

export function describeMethod(method: PatientPaymentMethod): string {
  switch (method.type) {
    case "pago_movil":
      return method.pago_movil_phone
        ? `Pago Móvil ${method.pago_movil_phone}`
        : "Pago Móvil";
    case "zelle":
      return method.zelle_email ?? "Zelle";
    case "transferencia":
      return method.bank_name
        ? method.account_last_four
          ? `${method.bank_name} *${method.account_last_four}`
          : method.bank_name
        : "Transferencia";
    case "tarjeta_credito":
    case "tarjeta_debito":
      return method.card_last_four
        ? `${method.card_brand ?? "Tarjeta"} *${method.card_last_four}`
        : "Tarjeta";
    case "efectivo":
      return "Efectivo";
    default:
      return method.label;
  }
}

export function suggestReferenceForMethod(
  method: PatientPaymentMethod,
): string | null {
  // For pago_movil and zelle the patient often passes the phone/email itself
  // as the reference. The dialog still lets them edit, but pre-fill is
  // friendly. Card and transfer references come from the bank, so leave blank.
  if (method.type === "pago_movil") return method.pago_movil_phone ?? null;
  if (method.type === "zelle") return method.zelle_email ?? null;
  return null;
}
