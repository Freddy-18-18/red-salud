"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import {
  Scale,
  RefreshCw,
  Bell,
  ArrowLeft,
  TrendingDown,
  Pill,
  Store,
  Loader2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  PrescriptionSelector,
  type Prescription,
} from "@/components/comparator/prescription-selector";
import { ComparisonResults } from "@/components/comparator/comparison-results";
import { PriceAlertForm } from "@/components/comparator/price-alert-form";
import { PriceAlertList } from "@/components/comparator/price-alert-list";
import {
  usePrescriptionComparison,
  usePriceAlerts,
  useCreatePriceAlert,
  useDeletePriceAlert,
} from "@/hooks/use-medication-comparator";
import { useDollarRate } from "@/hooks/use-currency";
import { formatBs } from "@/lib/services/currency-service";

// ─── Page Content ────────────────────────────────────────────────────

function ComparadorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrescriptionId = searchParams.get("prescription_id");

  // ── Local state ──────────────────────────────────────────────────
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(true);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(
    initialPrescriptionId,
  );
  const [alertMedicationName, setAlertMedicationName] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [deletingAlertId, setDeletingAlertId] = useState<string | null>(null);

  // ── Data hooks ────────────────────────────────────────────────────
  const {
    results: comparisonResults,
    loading: comparisonLoading,
    refetch: refetchComparison,
  } = usePrescriptionComparison(selectedPrescriptionId);

  const {
    alerts,
    loading: alertsLoading,
    refetch: refetchAlerts,
  } = usePriceAlerts();

  const { create: createAlert, loading: creatingAlert } = useCreatePriceAlert();
  const { remove: deleteAlert } = useDeletePriceAlert();

  const { rate: bcvRate, loading: bcvLoading } = useDollarRate("oficial");

  // ── Load prescriptions ────────────────────────────────────────────
  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        const res = await fetch("/api/prescriptions?status=active");
        if (!res.ok) throw new Error("Failed to fetch prescriptions");
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
          setPrescriptions(mapped.filter((p) => p.status === "active"));
        }
      } catch (err) {
        console.error("Error loading prescriptions:", err);
      } finally {
        setPrescriptionsLoading(false);
      }
    };

    loadPrescriptions();
  }, []);

  // ── Geolocation ───────────────────────────────────────────────────
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // User denied or unavailable — silently ignore
        },
        { enableHighAccuracy: false, timeout: 10000 },
      );
    }
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────

  const handleSelectPrescription = useCallback(
    (id: string) => {
      setSelectedPrescriptionId(id);
      setAlertMedicationName(null);
      // Update URL without full navigation
      const url = new URL(window.location.href);
      url.searchParams.set("prescription_id", id);
      window.history.replaceState(null, "", url.toString());
    },
    [],
  );

  const handleSetAlert = useCallback((medicationName: string) => {
    setAlertMedicationName(medicationName);
  }, []);

  const handleCreateAlert = useCallback(
    async (data: {
      medication_name: string;
      target_price_usd: number;
      prescription_id?: string;
    }) => {
      const result = await createAlert({
        medication_name: data.medication_name,
        target_price_usd: data.target_price_usd,
        prescription_id: data.prescription_id ?? selectedPrescriptionId ?? undefined,
      });
      if (result.success) {
        setAlertMedicationName(null);
        refetchAlerts();
      }
      return result;
    },
    [createAlert, selectedPrescriptionId, refetchAlerts],
  );

  const handleDeleteAlert = useCallback(
    async (id: string) => {
      setDeletingAlertId(id);
      await deleteAlert(id);
      setDeletingAlertId(null);
      refetchAlerts();
    },
    [deleteAlert, refetchAlerts],
  );

  const handleOrderPharmacy = useCallback(
    (pharmacyId: string) => {
      if (selectedPrescriptionId) {
        router.push(
          `/dashboard/farmacias/orden?pharmacy_id=${pharmacyId}&prescription_id=${selectedPrescriptionId}`,
        );
      }
    },
    [router, selectedPrescriptionId],
  );

  // ── Derived ────────────────────────────────────────────────────────
  const hasSelection = selectedPrescriptionId !== null;
  const showResults = hasSelection && !comparisonLoading && comparisonResults.length > 0;
  const showNoResults = hasSelection && !comparisonLoading && comparisonResults.length === 0;
  const selectedPrescription = prescriptions.find(
    (p) => p.id === selectedPrescriptionId,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Scale className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Comparador de Precios
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Compara precios de tus medicamentos en farmacias cercanas
              </p>
            </div>
          </div>
        </div>

        {/* BCV Rate badge */}
        <div className="flex-shrink-0">
          {bcvLoading ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg animate-pulse">
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          ) : bcvRate ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
              <TrendingDown className="h-4 w-4 text-emerald-600" />
              <div className="text-xs">
                <p className="font-semibold text-emerald-700">Tasa BCV</p>
                <p className="text-emerald-600">
                  {formatBs(bcvRate.rate)} / $1 USD
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Stats bar */}
      {!prescriptionsLoading && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Pill className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {prescriptions.length}
                </p>
                <p className="text-xs text-gray-500">Recetas activas</p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Store className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {comparisonResults.length}
                </p>
                <p className="text-xs text-gray-500">Farmacias</p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Bell className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {alerts.length}
                </p>
                <p className="text-xs text-gray-500">Alertas</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content: two-column on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: prescription selector + results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select prescription */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                  1
                </span>
                <h2 className="text-base font-semibold text-gray-900">
                  Selecciona una receta
                </h2>
              </div>
              {hasSelection && (
                <button
                  onClick={() => {
                    setSelectedPrescriptionId(null);
                    setAlertMedicationName(null);
                    const url = new URL(window.location.href);
                    url.searchParams.delete("prescription_id");
                    window.history.replaceState(null, "", url.toString());
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Cambiar receta
                </button>
              )}
            </div>

            {hasSelection && selectedPrescription ? (
              // Show selected prescription summary
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Pill className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Dr. {selectedPrescription.doctor?.full_name ?? "Medico"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedPrescription.medications?.length ?? 0} medicamentos
                      {selectedPrescription.diagnosis
                        ? ` — ${selectedPrescription.diagnosis}`
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <PrescriptionSelector
                prescriptions={prescriptions}
                selectedId={selectedPrescriptionId}
                onSelect={handleSelectPrescription}
                loading={prescriptionsLoading}
              />
            )}
          </div>

          {/* Step 2: Comparison results */}
          {hasSelection && (
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    2
                  </span>
                  <h2 className="text-base font-semibold text-gray-900">
                    Comparacion de precios
                  </h2>
                </div>
                <button
                  onClick={() => refetchComparison()}
                  disabled={comparisonLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${
                      comparisonLoading ? "animate-spin" : ""
                    }`}
                  />
                  Actualizar
                </button>
              </div>

              <ComparisonResults
                results={comparisonResults}
                bcvRate={bcvRate?.rate ?? null}
                loading={comparisonLoading}
                userLocation={userLocation}
                onSetAlert={handleSetAlert}
                onOrderPharmacy={handleOrderPharmacy}
              />
            </div>
          )}

          {/* Alert form (shown inline when user clicks "set alert") */}
          {alertMedicationName && (
            <PriceAlertForm
              medicationName={alertMedicationName}
              prescriptionId={selectedPrescriptionId ?? undefined}
              onSubmit={handleCreateAlert}
              onCancel={() => setAlertMedicationName(null)}
              loading={creatingAlert}
            />
          )}
        </div>

        {/* Right column: Price alerts */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                  3
                </span>
                <h2 className="text-base font-semibold text-gray-900">
                  Alertas de precio
                </h2>
              </div>
              {alerts.length > 0 && (
                <span className="text-xs bg-amber-50 text-amber-600 font-medium px-2 py-0.5 rounded-full">
                  {alerts.length} activa{alerts.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <PriceAlertList
              alerts={alerts}
              loading={alertsLoading}
              deletingId={deletingAlertId}
              onDelete={handleDeleteAlert}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────

export default function ComparadorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      }
    >
      <ComparadorPageContent />
    </Suspense>
  );
}
