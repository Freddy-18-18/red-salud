"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  useMonitoredParameters,
  useParameterHistory,
} from "@/hooks/use-lab-results";
import { TrendChart } from "@/components/lab/trend-chart";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Share2,
  ChevronDown,
} from "lucide-react";

type TimeRange = 3 | 6 | 12 | 0;

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: "3 meses", value: 3 },
  { label: "6 meses", value: 6 },
  { label: "1 ano", value: 12 },
  { label: "Todo", value: 0 },
];

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-5 w-5" />;
    case "down":
      return <TrendingDown className="h-5 w-5" />;
    default:
      return <Minus className="h-5 w-5" />;
  }
}

function TrendLabel({ trend }: { trend: "up" | "down" | "stable" }) {
  switch (trend) {
    case "up":
      return "Subiendo";
    case "down":
      return "Bajando";
    default:
      return "Estable";
  }
}

export default function TendenciasPage() {
  const searchParams = useSearchParams();
  const initialParam = searchParams.get("parametro") || "";

  const [userId, setUserId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [selectedParam, setSelectedParam] = useState<string>(initialParam);
  const [timeRange, setTimeRange] = useState<TimeRange>(12);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [sharing, setSharing] = useState(false);

  const { parameters, loading: paramsLoading } = useMonitoredParameters(userId);
  const months = timeRange === 0 ? 120 : timeRange; // 0 = "all" → 10 years
  const { history, loading: historyLoading } = useParameterHistory(
    userId,
    selectedParam || undefined,
    months,
  );

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      setLoading(false);
    };
    loadUser();
  }, []);

  // Auto-select first parameter if none selected
  useEffect(() => {
    if (!selectedParam && parameters.length > 0) {
      setSelectedParam(parameters[0].parameter_name);
    }
  }, [parameters, selectedParam]);

  const handleShare = async () => {
    setSharing(true);
    const shareUrl = `${window.location.origin}/dashboard/laboratorio/tendencias?parametro=${encodeURIComponent(selectedParam)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tendencia: ${selectedParam} - Red Salud`,
          text: `Mis tendencias de ${selectedParam}`,
          url: shareUrl,
        });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
    setSharing(false);
  };

  if (loading || paramsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-64" />
        <SkeletonCard />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <a
        href="/dashboard/laboratorio"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a resultados
      </a>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Activity className="h-7 w-7 text-emerald-500" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Tendencias
          </h1>
        </div>
        <p className="text-gray-500 mt-1">
          Visualiza la evolucion de tus valores de laboratorio
        </p>
      </div>

      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Parameter selector */}
        <div className="relative flex-1">
          <button
            onClick={() => setSelectorOpen(!selectorOpen)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
          >
            <span className="truncate">
              {selectedParam || "Seleccionar parametro"}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${selectorOpen ? "rotate-180" : ""}`}
            />
          </button>
          {selectorOpen && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {parameters.map((p) => (
                <button
                  key={p.parameter_name}
                  onClick={() => {
                    setSelectedParam(p.parameter_name);
                    setSelectorOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition first:rounded-t-xl last:rounded-b-xl ${
                    selectedParam === p.parameter_name
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <span>{p.parameter_name}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    ({p.unit})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Time range tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                timeRange === range.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 sm:p-6 bg-white border border-gray-100 rounded-xl">
        {historyLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {history.parameter_name}
                <span className="text-sm text-gray-400 ml-2 font-normal">
                  ({history.unit})
                </span>
              </h3>
              <button
                onClick={handleShare}
                disabled={sharing}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition disabled:opacity-50"
              >
                <Share2 className="h-3.5 w-3.5" />
                Compartir
              </button>
            </div>
            <TrendChart history={history} />
          </>
        ) : (
          <div className="h-64 flex items-center justify-center text-sm text-gray-400">
            Selecciona un parametro para ver su tendencia
          </div>
        )}
      </div>

      {/* Stats summary */}
      {history && history.points.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            <p className="text-xs text-gray-500">Minimo</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {history.stats.min}
            </p>
            <p className="text-xs text-gray-400">{history.unit}</p>
          </div>
          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            <p className="text-xs text-gray-500">Maximo</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {history.stats.max}
            </p>
            <p className="text-xs text-gray-400">{history.unit}</p>
          </div>
          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            <p className="text-xs text-gray-500">Promedio</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {history.stats.average}
            </p>
            <p className="text-xs text-gray-400">{history.unit}</p>
          </div>
          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            <p className="text-xs text-gray-500">Tendencia</p>
            <div className="flex items-center gap-2 mt-1">
              <TrendIcon trend={history.stats.trend} />
              <span className="text-lg font-bold text-gray-900">
                <TrendLabel trend={history.stats.trend} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Reference range info */}
      {history && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-4 h-4 rounded bg-emerald-200 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-800">
                Rango de referencia
              </p>
              <p className="text-sm text-emerald-700 mt-0.5">
                {history.reference_min} - {history.reference_max}{" "}
                {history.unit}. Los valores dentro de esta zona (area verde
                en el grafico) se consideran normales.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
