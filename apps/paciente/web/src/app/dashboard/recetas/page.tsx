"use client";

import {
  FileText,
  Pill,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
type TabValue = "active" | "expired" | "all";

interface PrescriptionMedication {
  id: string;
  medication_name: string;
  total_quantity?: string;
  duration_days?: number;
  special_instructions?: string;
}

interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis?: string;
  general_instructions?: string;
  prescribed_at: string;
  expires_at?: string;
  status: "active" | "expired" | "dispensed";
  doctor?: {
    full_name?: string;
    avatar_url?: string;
  };
  medications?: PrescriptionMedication[];
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: "Activa", bg: "bg-emerald-50", text: "text-emerald-700" },
  expired: { label: "Expirada", bg: "bg-gray-50", text: "text-gray-600" },
  dispensed: { label: "Dispensada", bg: "bg-blue-50", text: "text-blue-700" },
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function RecetasPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("active");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/prescriptions');
        if (!res.ok) throw new Error('Failed to fetch prescriptions');
        const { data } = await res.json();

        if (data) {
          // Determine active/expired status based on dates
          const now = new Date();
          const mapped = (data as Record<string, unknown>[]).map((p) => {
            const expiresAt = p.expires_at as string | null;
            let status = (p.status as string) || "active";
            if (expiresAt && new Date(expiresAt) < now && status === "active") {
              status = "expired";
            }
            return { ...p, status } as Prescription;
          });
          setPrescriptions(mapped);
        }
      } catch (err) {
        console.error("Error loading prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const activePrescriptions = prescriptions.filter((p) => p.status === "active");
  const expiredPrescriptions = prescriptions.filter((p) => p.status === "expired" || p.status === "dispensed");

  const displayedPrescriptions =
    activeTab === "active" ? activePrescriptions :
    activeTab === "expired" ? expiredPrescriptions :
    prescriptions;

  const tabs: { label: string; value: TabValue; count: number }[] = [
    { label: "Activas", value: "active", count: activePrescriptions.length },
    { label: "Pasadas", value: "expired", count: expiredPrescriptions.length },
    { label: "Todas", value: "all", count: prescriptions.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Recetas</h1>
        <p className="text-gray-500 mt-1">Consulta tus recetas medicas y medicamentos</p>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-50">
                <Pill className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activePrescriptions.length}</p>
                <p className="text-xs text-gray-500">Recetas activas</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
                <p className="text-xs text-gray-500">Total recetas</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
              activeTab === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.value
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-200 text-gray-500"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Prescriptions list */}
      {loading ? (
        <SkeletonList count={3} />
      ) : displayedPrescriptions.length > 0 ? (
        <div className="space-y-3">
          {displayedPrescriptions.map((prescription) => {
            const isExpanded = expandedId === prescription.id;
            const statusConfig = STATUS_CONFIG[prescription.status] || STATUS_CONFIG.active;
            const initials = (prescription.doctor?.full_name || "D")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={prescription.id}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : prescription.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-emerald-600">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">
                            Dr. {prescription.doctor?.full_name || "Medico"}
                          </h3>
                          {prescription.diagnosis && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{prescription.diagnosis}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.label}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(prescription.prescribed_at)}
                        </div>
                        {prescription.medications && prescription.medications.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Pill className="h-3 w-3" />
                            {prescription.medications.length} medicamento{prescription.medications.length > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-50">
                    <div className="ml-14 space-y-4 pt-3">
                      {prescription.general_instructions && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Instrucciones generales</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {prescription.general_instructions}
                          </p>
                        </div>
                      )}

                      {/* Medications */}
                      {prescription.medications && prescription.medications.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Medicamentos</p>
                          <div className="space-y-2">
                            {prescription.medications.map((med) => (
                              <div key={med.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Pill className="h-4 w-4 text-emerald-500" />
                                  <h4 className="text-sm font-medium text-gray-900">{med.medication_name}</h4>
                                </div>
                                <div className="ml-6 mt-1 text-xs text-gray-500 space-y-0.5">
                                  {med.total_quantity && <p>Cantidad: {med.total_quantity}</p>}
                                  {med.duration_days && <p>Duracion: {med.duration_days} dias</p>}
                                  {med.special_instructions && <p>Indicaciones: {med.special_instructions}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {prescription.expires_at && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          Expira: {formatDate(prescription.expires_at)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={
            activeTab === "active" ? "No tienes recetas activas" :
            activeTab === "expired" ? "No tienes recetas pasadas" :
            "No tienes recetas"
          }
          description="Tus recetas medicas apareceran aqui despues de tus consultas"
          action={{ label: "Buscar Medico", href: "/dashboard/buscar-medico" }}
        />
      )}
    </div>
  );
}
