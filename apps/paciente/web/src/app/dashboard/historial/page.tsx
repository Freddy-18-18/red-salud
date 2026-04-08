"use client";

import {
  Clock,
  Stethoscope,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  Pill,
  FlaskConical,
  TestTube,
} from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList, Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { usePatientAppointments } from "@/hooks/use-appointments";
import { labResultsService, type LabOrder } from "@/lib/services/lab-results-service";
import { supabase } from "@/lib/supabase/client";

type FilterType = "all" | "consultas" | "recetas" | "laboratorios";

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
  doctor?: { full_name?: string; avatar_url?: string };
  medications?: PrescriptionMedication[];
}

const PRESCRIPTION_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: "Activa", bg: "bg-emerald-50", text: "text-emerald-700" },
  expired: { label: "Expirada", bg: "bg-gray-50", text: "text-gray-600" },
  dispensed: { label: "Dispensada", bg: "bg-blue-50", text: "text-blue-700" },
};

const LAB_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  ordenada: { label: "Ordenada", bg: "bg-blue-50", text: "text-blue-700" },
  muestra_tomada: { label: "Muestra tomada", bg: "bg-purple-50", text: "text-purple-700" },
  en_proceso: { label: "En proceso", bg: "bg-yellow-50", text: "text-yellow-700" },
  completada: { label: "Completada", bg: "bg-emerald-50", text: "text-emerald-700" },
  cancelada: { label: "Cancelada", bg: "bg-red-50", text: "text-red-700" },
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("es-VE", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr: string): string {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("es-VE", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatPrescriptionDate(dateStr: string): string {
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

export default function HistorialMedicoPage() {
  const [userId, setUserId] = useState<string | undefined>();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { appointments, loading } = usePatientAppointments(userId);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);

  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [labOrdersLoading, setLabOrdersLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    if (activeFilter === "recetas") {
      const fetchPrescriptions = async () => {
        setPrescriptionsLoading(true);
        try {
          const res = await fetch('/api/prescriptions');
          if (!res.ok) throw new Error('Failed to fetch prescriptions');
          const { data } = await res.json();

          if (data) {
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
          setPrescriptionsLoading(false);
        }
      };
      fetchPrescriptions();
    }

    if (activeFilter === "laboratorios") {
      const fetchLabOrders = async () => {
        setLabOrdersLoading(true);
        try {
          const data = await labResultsService.getOrders(userId);
          setLabOrders(data);
        } catch (err) {
          console.error("Error loading lab orders:", err);
        } finally {
          setLabOrdersLoading(false);
        }
      };
      fetchLabOrders();
    }
  }, [userId, activeFilter]);

  const completedAppointments = appointments
    .filter((a) => a.status === "completed")
    .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());

  const uniqueDoctors = new Set(completedAppointments.map((a) => a.doctor_id)).size;

  const lastConsultDate = completedAppointments.length > 0
    ? formatShortDate(completedAppointments[0].appointment_date)
    : "Sin consultas";

  const filters: { label: string; value: FilterType }[] = [
    { label: "Todos", value: "all" },
    { label: "Consultas", value: "consultas" },
    { label: "Recetas", value: "recetas" },
    { label: "Laboratorios", value: "laboratorios" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Historial Medico</h1>
        <p className="text-gray-500 mt-1">Tu registro de consultas y tratamientos</p>
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
            icon={Stethoscope}
            label="Consultas"
            value={completedAppointments.length}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={Calendar}
            label="Doctores"
            value={uniqueDoctors}
            color="bg-emerald-50 text-emerald-600"
          />
          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-900 font-semibold">{lastConsultDate}</p>
                <p className="text-xs text-gray-500">Ultima consulta</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => (
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

      {/* Timeline */}
      {activeFilter === "recetas" ? (
        prescriptionsLoading ? (
          <SkeletonList count={4} />
        ) : prescriptions.length > 0 ? (
          <div className="space-y-3">
            {prescriptions.map((rx) => {
              const isExpanded = expandedId === rx.id;
              const statusConfig = PRESCRIPTION_STATUS[rx.status] || PRESCRIPTION_STATUS.active;

              return (
                <div key={rx.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : rx.id)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0 ring-4 ring-blue-50" />
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Pill className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            Dr. {rx.doctor?.full_name || "Medico"}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                              {statusConfig.label}
                            </span>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatPrescriptionDate(rx.prescribed_at)}
                            </span>
                          </div>
                        </div>
                        {rx.diagnosis && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{rx.diagnosis}</p>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-50">
                      <div className="ml-7 pl-10 space-y-3 pt-3">
                        {rx.general_instructions && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Instrucciones generales</p>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{rx.general_instructions}</p>
                          </div>
                        )}
                        {rx.medications && rx.medications.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Medicamentos</p>
                            <div className="space-y-2">
                              {rx.medications.map((med) => (
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
                        {rx.expires_at && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            Expira: {formatPrescriptionDate(rx.expires_at)}
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
            icon={Pill}
            title="No tienes recetas en tu historial"
            description="Tus recetas medicas apareceran aqui despues de tus consultas."
            action={{ label: "Buscar Medico", href: "/dashboard/buscar-medico" }}
          />
        )
      ) : activeFilter === "laboratorios" ? (
        labOrdersLoading ? (
          <SkeletonList count={4} />
        ) : labOrders.length > 0 ? (
          <div className="space-y-3">
            {labOrders.map((order) => {
              const isExpanded = expandedId === order.id;
              const statusConfig = LAB_STATUS[order.status] || LAB_STATUS.ordenada;
              const testNames = order.tests?.map((t) => t.test_type?.name).filter(Boolean).join(", ");

              return (
                <div key={order.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0 ring-4 ring-purple-50" />
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <TestTube className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {order.order_number || "Orden de laboratorio"}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                              {statusConfig.label}
                            </span>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatPrescriptionDate(order.ordered_at)}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          Dr. {order.doctor?.full_name || "Medico"}
                          {testNames && ` — ${testNames}`}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-50">
                      <div className="ml-7 pl-10 space-y-3 pt-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Fecha de orden</p>
                            <p className="font-medium text-gray-900 capitalize">
                              {formatDate(order.ordered_at)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Estado</p>
                            <p className={`font-medium ${statusConfig.text}`}>{statusConfig.label}</p>
                          </div>
                        </div>
                        {order.tests && order.tests.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Pruebas solicitadas</p>
                            <div className="space-y-1.5">
                              {order.tests.map((test) => (
                                <div key={test.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                                  <FlaskConical className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{test.test_type?.name || "Prueba"}</span>
                                  {test.result_available && (
                                    <span className="ml-auto text-xs text-emerald-600 font-medium">Resultados disponibles</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {order.status === "completada" && (
                          <a
                            href="/dashboard/laboratorios"
                            className="inline-block px-3 py-1.5 text-xs font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition"
                          >
                            Ver resultados completos
                          </a>
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
            icon={FlaskConical}
            title="No tienes ordenes de laboratorio"
            description="Tus ordenes de laboratorio apareceran aqui cuando tu doctor te solicite estudios."
            action={{ label: "Buscar Medico", href: "/dashboard/buscar-medico" }}
          />
        )
      ) : loading ? (
        <SkeletonList count={4} />
      ) : completedAppointments.length > 0 ? (
        <div className="space-y-3">
          {completedAppointments.map((appointment) => {
            const isExpanded = expandedId === appointment.id;
            const initials = (appointment.doctor?.full_name || "D")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={appointment.id}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : appointment.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    {/* Timeline dot */}
                    <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0 ring-4 ring-emerald-50" />

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-emerald-600">{initials}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          Dr. {appointment.doctor?.full_name || "Medico"}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatShortDate(appointment.appointment_date)}
                        </span>
                      </div>
                      {appointment.reason && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{appointment.reason}</p>
                      )}
                    </div>

                    {/* Expand icon */}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-50">
                    <div className="ml-7 pl-10 space-y-3 pt-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Fecha</p>
                          <p className="font-medium text-gray-900 capitalize">
                            {formatDate(appointment.appointment_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Hora</p>
                          <p className="font-medium text-gray-900">
                            {appointment.appointment_time?.slice(0, 5)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Duracion</p>
                          <p className="font-medium text-gray-900">{appointment.duration} minutos</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Estado</p>
                          <p className="font-medium text-emerald-600">Completada</p>
                        </div>
                      </div>

                      {appointment.reason && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Motivo</p>
                          <p className="text-sm text-gray-700">{appointment.reason}</p>
                        </div>
                      )}

                      {appointment.notes && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Notas del doctor</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {appointment.notes}
                          </p>
                        </div>
                      )}

                      <a
                        href="/dashboard/buscar-medico"
                        className="inline-block px-3 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition"
                      >
                        Agendar de nuevo
                      </a>
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
          title="No tienes consultas en tu historial"
          description="Tus consultas completadas apareceran aqui para que puedas revisarlas cuando quieras."
          action={{ label: "Buscar Medico", href: "/dashboard/buscar-medico" }}
        />
      )}
    </div>
  );
}
