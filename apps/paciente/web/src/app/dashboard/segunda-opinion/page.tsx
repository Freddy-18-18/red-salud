"use client";

import {
  Scale,
  Plus,
  CheckCircle2,
  Search,
  Clock,
  Filter,
} from "lucide-react";
import { useState } from "react";

import { RequestCard } from "@/components/second-opinion/request-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList, Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { useSecondOpinionList } from "@/hooks/use-second-opinion";
import type { SecondOpinionStatus } from "@/lib/services/second-opinion-service";

type FilterValue = "all" | SecondOpinionStatus;

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "Todas", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "En revision", value: "in_review" },
  { label: "Completadas", value: "completed" },
  { label: "Rechazadas", value: "declined" },
];

export default function SegundaOpinionPage() {
  const { requests, loading, error } = useSecondOpinionList();
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  const filteredRequests =
    activeFilter === "all"
      ? requests
      : requests.filter((r) => r.status === activeFilter);

  const completedCount = requests.filter(
    (r) => r.status === "completed"
  ).length;
  const inReviewCount = requests.filter(
    (r) => r.status === "in_review" || r.status === "accepted"
  ).length;
  const pendingCount = requests.filter(
    (r) => r.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Segunda Opinion Medica
          </h1>
          <p className="text-gray-500 mt-1">
            Solicita una revision de tu diagnostico por un especialista
            verificado
          </p>
        </div>
        <a
          href="/dashboard/segunda-opinion/solicitar"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Solicitar segunda opinion</span>
          <span className="sm:hidden">Solicitar</span>
        </a>
      </div>

      {/* Hero card */}
      <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <Scale className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-emerald-900">
              No estas seguro de tu diagnostico?
            </h2>
            <p className="text-sm text-emerald-700 mt-1">
              Solicita una segunda opinion de un especialista verificado. Tu
              historial medico y diagnostico original seran compartidos de forma
              segura con el doctor revisor.
            </p>
            <a
              href="/dashboard/segunda-opinion/solicitar"
              className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition"
            >
              Solicitar segunda opinion
              <Plus className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={CheckCircle2}
            label="Completadas"
            value={completedCount}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={Search}
            label="En revision"
            value={inReviewCount}
            color="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            icon={Clock}
            label="Pendientes"
            value={pendingCount}
            color="bg-amber-50 text-amber-600"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition ${
              activeFilter === filter.value
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Request List */}
      {loading ? (
        <SkeletonList count={3} />
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Mis solicitudes
          </h2>
          {filteredRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : requests.length > 0 && activeFilter !== "all" ? (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            No tienes solicitudes con el estado seleccionado
          </p>
          <button
            onClick={() => setActiveFilter("all")}
            className="text-sm text-emerald-600 font-medium hover:text-emerald-700 mt-2"
          >
            Ver todas las solicitudes
          </button>
        </div>
      ) : (
        <EmptyState
          icon={Scale}
          title="No tienes solicitudes de segunda opinion"
          description="Cuando solicites una segunda opinion medica, aparecera aqui para que puedas darle seguimiento."
          action={{
            label: "Solicitar segunda opinion",
            href: "/dashboard/segunda-opinion/solicitar",
          }}
        />
      )}
    </div>
  );
}
