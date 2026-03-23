"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useLabOrderDetail } from "@/hooks/use-lab-results";
import { StatusTimeline } from "@/components/lab/status-timeline";
import { ResultTable } from "@/components/lab/result-table";
import { Skeleton, SkeletonList } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  User,
  Building2,
  Download,
  Share2,
  FlaskConical,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function LabOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { order, results, loading, error } = useLabOrderDetail(orderId);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  // Auto-expand first result
  useEffect(() => {
    if (results.length > 0 && !expandedResult) {
      setExpandedResult(results[0].id);
    }
  }, [results, expandedResult]);

  const handleShareWithDoctor = async () => {
    setSharing(true);
    // Use Web Share API if available, else copy link
    const shareUrl = `${window.location.origin}/dashboard/laboratorio/${orderId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Resultados de laboratorio - Red Salud",
          text: `Mis resultados de laboratorio - Orden ${order?.order_number || orderId}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
    setSharing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <SkeletonList count={2} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <a
          href="/dashboard/laboratorio"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a resultados
        </a>
        <div className="text-center py-16">
          <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">
            Orden no encontrada
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {error || "No se pudo cargar el detalle de la orden"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <a
        href="/dashboard/laboratorio"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a resultados
      </a>

      {/* Order header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Orden #{order.order_number || orderId.slice(0, 8)}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(order.ordered_at)}
          </div>
          {order.doctor?.nombre_completo && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Dr. {order.doctor.nombre_completo}
            </div>
          )}
          {(order.laboratory as Record<string, unknown>)?.name && (
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {(order.laboratory as Record<string, unknown>).name as string}
            </div>
          )}
        </div>
      </div>

      {/* Status timeline */}
      <div className="p-4 bg-white border border-gray-100 rounded-xl">
        <h3 className="text-sm font-medium text-gray-500 mb-4">
          Estado de la orden
        </h3>
        <StatusTimeline status={order.status} />
      </div>

      {/* Results section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Resultados
        </h2>

        {results.length > 0 ? (
          <div className="space-y-3">
            {results.map((result) => {
              const isExpanded = expandedResult === result.id;
              return (
                <div
                  key={result.id}
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden"
                >
                  {/* Result header (clickable) */}
                  <button
                    onClick={() =>
                      setExpandedResult(isExpanded ? null : result.id)
                    }
                    className="w-full p-4 text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {result.test_type?.name || "Examen"}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Resultado:{" "}
                            {formatDate(result.result_at)}
                            {result.validated_at && (
                              <span className="ml-2 text-emerald-600">
                                Validado
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(result.values || []).some(
                          (v) =>
                            v.status === "critico" ||
                            v.status === "alto" ||
                            v.status === "bajo",
                        ) && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700">
                            Valores fuera de rango
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-gray-50">
                      {/* Values table */}
                      {result.values && result.values.length > 0 && (
                        <ResultTable values={result.values} />
                      )}

                      {/* Observations */}
                      {result.general_observations && (
                        <div className="px-4 py-3 border-t border-gray-50">
                          <p className="text-xs text-gray-500 mb-1">
                            Observaciones
                          </p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {result.general_observations}
                          </p>
                        </div>
                      )}

                      {/* PDF download */}
                      {result.result_pdf_url && (
                        <div className="px-4 py-3 border-t border-gray-50">
                          <a
                            href={result.result_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            Descargar PDF
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 bg-white border border-gray-100 rounded-xl text-center">
            <FlaskConical className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Los resultados aun no estan disponibles
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Te notificaremos cuando esten listos
            </p>
          </div>
        )}
      </section>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 pb-6">
        <button
          onClick={handleShareWithDoctor}
          disabled={sharing}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          <Share2 className="h-4 w-4" />
          {sharing ? "Compartiendo..." : "Compartir con mi doctor"}
        </button>
      </div>
    </div>
  );
}
