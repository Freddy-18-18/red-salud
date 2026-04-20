"use client";

import {
  ArrowRightLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileStack,
} from "lucide-react";
import { useCallback, useState } from "react";

import { BookFromReferral } from "@/components/referrals/book-from-referral";
import { ReferralCard } from "@/components/referrals/referral-card";
import { ReferralDetail } from "@/components/referrals/referral-detail";
import {
  useMedicalReferrals,
  useMedicalReferralDetail,
} from "@/hooks/use-medical-referrals";
import type {
  MedicalReferral,
  ReferralStatus,
} from "@/lib/services/medical-referral-service";

// ── Filter tabs ───────────────────────────────────────────────────────

type FilterTab = "all" | ReferralStatus;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "pending", label: "Pendientes" },
  { key: "scheduled", label: "Agendadas" },
  { key: "completed", label: "Completadas" },
];

// ── View states ───────────────────────────────────────────────────────

type ViewState =
  | { view: "list" }
  | { view: "detail"; referralId: string }
  | { view: "book"; referral: MedicalReferral };

// ── Page ──────────────────────────────────────────────────────────────

export default function ReferenciasMedicasPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [viewState, setViewState] = useState<ViewState>({ view: "list" });

  const statusFilter = activeTab === "all" ? undefined : activeTab;
  const { data: referrals, isLoading, error } = useMedicalReferrals(statusFilter);

  const selectedReferralId =
    viewState.view === "detail" ? viewState.referralId : null;
  const { data: referralDetail } = useMedicalReferralDetail(selectedReferralId);

  // ── Stats ─────────────────────────────────────────────────────────

  const { data: allReferrals } = useMedicalReferrals();
  const stats = {
    total: allReferrals?.length ?? 0,
    pending: allReferrals?.filter((r) => r.status === "pending").length ?? 0,
    scheduled:
      allReferrals?.filter((r) => r.status === "scheduled").length ?? 0,
    completed:
      allReferrals?.filter((r) => r.status === "completed").length ?? 0,
  };

  // ── Handlers ──────────────────────────────────────────────────────

  const handleSelect = useCallback((referral: MedicalReferral) => {
    setViewState({ view: "detail", referralId: referral.id });
  }, []);

  const handleBook = useCallback((referral: MedicalReferral) => {
    setViewState({ view: "book", referral });
  }, []);

  const handleBack = useCallback(() => {
    setViewState({ view: "list" });
  }, []);

  const handleViewProfile = useCallback((doctorId: string) => {
    window.open(`/dashboard/buscar-medico/${doctorId}`, "_blank");
  }, []);

  // ── Detail view ───────────────────────────────────────────────────

  if (viewState.view === "detail" && referralDetail) {
    return (
      <ReferralDetail
        referral={referralDetail}
        onBack={handleBack}
        onBook={handleBook}
        onViewProfile={handleViewProfile}
      />
    );
  }

  // ── Booking view ──────────────────────────────────────────────────

  if (viewState.view === "book") {
    return (
      <BookFromReferral referral={viewState.referral} onBack={handleBack} />
    );
  }

  // ── List view ─────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <ArrowRightLeft className="h-7 w-7 text-emerald-500" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Referencias medicas
          </h1>
        </div>
        <p className="text-gray-500 mt-1">
          Tus referencias de medicos a especialistas. Agenda directamente desde
          aca.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={FileStack}
          label="Total"
          value={stats.total}
          color="gray"
        />
        <StatCard
          icon={Clock}
          label="Pendientes"
          value={stats.pending}
          color="amber"
        />
        <StatCard
          icon={CalendarCheck}
          label="Agendadas"
          value={stats.scheduled}
          color="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completadas"
          value={stats.completed}
          color="emerald"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.key === "pending" && stats.pending > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-bold text-amber-700">
                {stats.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error instanceof Error ? error.message : "Error al cargar referencias"} />
      ) : referrals && referrals.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {referrals.map((referral) => (
            <ReferralCard
              key={referral.id}
              referral={referral}
              onSelect={handleSelect}
              onBook={handleBook}
            />
          ))}
        </div>
      ) : (
        <EmptyState activeTab={activeTab} />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof FileStack;
  label: string;
  value: number;
  color: "gray" | "amber" | "blue" | "emerald";
}) {
  const colorStyles = {
    gray: "bg-gray-50 text-gray-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  const valueStyles = {
    gray: "text-gray-900",
    amber: "text-amber-700",
    blue: "text-blue-700",
    emerald: "text-emerald-700",
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorStyles[color]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className={`text-xl font-bold ${valueStyles[color]}`}>{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-100 bg-white p-4 animate-pulse"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-16 rounded-full bg-gray-200" />
            <div className="h-5 w-20 rounded-full bg-gray-200" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-7 w-7 rounded-full bg-gray-200" />
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-200" />
          </div>
          <div className="h-4 w-3/4 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ activeTab }: { activeTab: FilterTab }) {
  const messages: Record<FilterTab, string> = {
    all: "No tenes referencias medicas aun.",
    pending: "No tenes referencias pendientes.",
    scheduled: "No tenes referencias agendadas.",
    completed: "No tenes referencias completadas.",
    expired: "No tenes referencias vencidas.",
  };

  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16 text-center">
      <ArrowRightLeft className="mx-auto h-12 w-12 text-gray-300" />
      <p className="mt-4 text-gray-500 font-medium">{messages[activeTab]}</p>
      <p className="mt-1 text-sm text-gray-400">
        Cuando un medico te refiera a un especialista, aparecera aca.
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 py-12 text-center">
      <p className="text-red-600 font-medium">{message}</p>
      <p className="mt-1 text-sm text-red-500">
        Intenta recargar la pagina.
      </p>
    </div>
  );
}
