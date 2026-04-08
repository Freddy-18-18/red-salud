import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getSummary,
  getAnnualReport,
  type ExpenseListParams,
  type CreateExpenseData,
  type UpdateExpenseData,
  type Expense,
  type ExpenseListResponse,
  type ExpenseSummary,
  type AnnualReport,
} from "@/lib/services/expense-service";

/* ------------------------------------------------------------------ */
/*  Query keys                                                         */
/* ------------------------------------------------------------------ */

const KEYS = {
  all: ["expenses"] as const,
  list: (params?: ExpenseListParams) => [...KEYS.all, "list", params] as const,
  summary: (year?: number, month?: number) =>
    [...KEYS.all, "summary", year, month] as const,
  report: (year: number) => [...KEYS.all, "report", year] as const,
};

/* ------------------------------------------------------------------ */
/*  useExpenses — paginated list                                       */
/* ------------------------------------------------------------------ */

export function useExpenses(params?: ExpenseListParams) {
  return useQuery<ExpenseListResponse>({
    queryKey: KEYS.list(params),
    queryFn: () => getExpenses(params),
  });
}

/* ------------------------------------------------------------------ */
/*  useAddExpense — create mutation                                    */
/* ------------------------------------------------------------------ */

export function useAddExpense() {
  const qc = useQueryClient();

  const mutation = useMutation<Expense, Error, CreateExpenseData>({
    mutationFn: addExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });

  const add = useCallback(
    async (data: CreateExpenseData): Promise<{ success: boolean; expense?: Expense }> => {
      try {
        const expense = await mutation.mutateAsync(data);
        return { success: true, expense };
      } catch {
        return { success: false };
      }
    },
    [mutation],
  );

  return {
    add,
    isPending: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}

/* ------------------------------------------------------------------ */
/*  useUpdateExpense — edit mutation                                    */
/* ------------------------------------------------------------------ */

export function useUpdateExpense() {
  const qc = useQueryClient();

  const mutation = useMutation<Expense, Error, { id: string; data: UpdateExpenseData }>({
    mutationFn: ({ id, data }) => updateExpense(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });

  const update = useCallback(
    async (
      id: string,
      data: UpdateExpenseData,
    ): Promise<{ success: boolean; expense?: Expense }> => {
      try {
        const expense = await mutation.mutateAsync({ id, data });
        return { success: true, expense };
      } catch {
        return { success: false };
      }
    },
    [mutation],
  );

  return {
    update,
    isPending: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}

/* ------------------------------------------------------------------ */
/*  useDeleteExpense — remove mutation                                 */
/* ------------------------------------------------------------------ */

export function useDeleteExpense() {
  const qc = useQueryClient();

  const mutation = useMutation<void, Error, string>({
    mutationFn: deleteExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });

  const remove = useCallback(
    async (id: string): Promise<{ success: boolean }> => {
      try {
        await mutation.mutateAsync(id);
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [mutation],
  );

  return {
    remove,
    isPending: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}

/* ------------------------------------------------------------------ */
/*  useExpenseSummary — aggregated summary                             */
/* ------------------------------------------------------------------ */

export function useExpenseSummary(year?: number, month?: number) {
  return useQuery<ExpenseSummary>({
    queryKey: KEYS.summary(year, month),
    queryFn: () => getSummary(year, month),
  });
}

/* ------------------------------------------------------------------ */
/*  useAnnualReport — fiscal report                                    */
/* ------------------------------------------------------------------ */

export function useAnnualReport(year: number) {
  return useQuery<AnnualReport>({
    queryKey: KEYS.report(year),
    queryFn: () => getAnnualReport(year),
    enabled: year > 0,
  });
}
