"use client";

import {
  ArrowLeft,
  Stethoscope,
  History,
  PlusCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SymptomForm } from "@/components/symptom-checker/symptom-form";
import { SymptomHistory } from "@/components/symptom-checker/symptom-history";
import { TriageResult } from "@/components/symptom-checker/triage-result";
import {
  useSymptomHistory,
  useCreateSymptomCheck,
} from "@/hooks/use-symptom-checker";
import type {
  SymptomEntry,
  SymptomCheckSession,
} from "@/lib/services/symptom-checker-service";
import { supabase } from "@/lib/supabase/client";

type View = "form" | "result" | "history";

export default function SintomasPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>();
  const [view, setView] = useState<View>("form");
  const [activeSession, setActiveSession] = useState<SymptomCheckSession | null>(null);

  // Load user
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    load();
  }, []);

  // Data hooks
  const {
    data: history,
    isLoading: historyLoading,
  } = useSymptomHistory(userId);
  const createMutation = useCreateSymptomCheck();

  // Handlers
  const handleSubmitSymptoms = async (symptoms: SymptomEntry) => {
    if (!userId) return;

    try {
      const session = await createMutation.mutateAsync({
        patientId: userId,
        symptoms,
      });
      setActiveSession(session);
      setView("result");
    } catch {
      // Error handled by mutation state
    }
  };

  const handleNewCheck = () => {
    setActiveSession(null);
    setView("form");
  };

  const handleSelectSession = (session: SymptomCheckSession) => {
    setActiveSession(session);
    setView("result");
  };

  const handleBookAppointment = () => {
    router.push("/dashboard/agendar");
  };

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => {
            if (view === "result" || view === "history") {
              setView("form");
              setActiveSession(null);
            } else {
              router.back();
            }
          }}
          className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>

        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-emerald-600" />
            {view === "history"
              ? "Historial de Sintomas"
              : view === "result"
                ? "Resultado del Analisis"
                : "Chequeo de Sintomas"}
          </h1>
          <p className="text-xs text-gray-500">
            {view === "history"
              ? "Consultas anteriores"
              : view === "result"
                ? "Evaluacion orientativa de sus sintomas"
                : "Describa sus sintomas para una orientacion inicial"}
          </p>
        </div>

        {view === "form" && (
          <button
            type="button"
            onClick={() => setView("history")}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <History className="h-3.5 w-3.5" />
            Historial
          </button>
        )}

        {view === "history" && (
          <button
            type="button"
            onClick={handleNewCheck}
            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Nuevo
          </button>
        )}
      </div>

      {/* Error banner */}
      {createMutation.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : "No se pudo realizar el chequeo. Intente de nuevo."}
          </p>
        </div>
      )}

      {/* Views */}
      {view === "form" && (
        <SymptomForm
          onSubmit={handleSubmitSymptoms}
          loading={createMutation.isPending}
        />
      )}

      {view === "result" && activeSession?.triage_result && (
        <TriageResult
          result={activeSession.triage_result}
          symptoms={activeSession.symptoms}
          onNewCheck={handleNewCheck}
          onBookAppointment={handleBookAppointment}
        />
      )}

      {view === "history" && (
        <SymptomHistory
          sessions={history || []}
          loading={historyLoading}
          onSelect={handleSelectSession}
        />
      )}

      {/* Quick stats (visible on form view) */}
      {view === "form" && history && history.length > 0 && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setView("history")}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                Chequeos recientes
              </h3>
              <span className="text-xs text-emerald-600 font-medium">
                Ver todos
              </span>
            </div>
          </button>
          <SymptomHistory
            sessions={history.slice(0, 3)}
            loading={false}
            onSelect={handleSelectSession}
          />
        </div>
      )}
    </div>
  );
}
