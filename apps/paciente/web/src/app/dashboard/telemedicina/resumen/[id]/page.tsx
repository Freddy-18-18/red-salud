"use client";

import {
  ArrowLeft,
  Clock,
  Calendar,
  Star,
  FileText,
  Pill,
  FlaskConical,
  MessageSquare,
  CheckCircle2,
  Video,
  ArrowRight,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import {
  useTelemedicineSession,
  useSessionRating,
} from "@/hooks/use-telemedicine";


function StarRating({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !disabled && onChange(star)}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => setHover(0)}
          disabled={disabled}
          className={`transition ${disabled ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
        >
          <Star
            className={`h-7 w-7 ${
              star <= (hover || value)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function SessionSummaryPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const { session, loading, error } = useTelemedicineSession(sessionId);
  const { rate, loading: ratingLoading, rated } = useSessionRating(sessionId);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showRatingForm] = useState(true);

  const handleRate = async () => {
    if (rating === 0) return;
    await rate(rating, comment || undefined);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-16">
        <Video className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Sesion no encontrada
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          No se pudo cargar el resumen de esta consulta
        </p>
        <a
          href="/dashboard/telemedicina"
          className="inline-flex items-center gap-2 text-sm text-emerald-600 font-medium hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a telemedicina
        </a>
      </div>
    );
  }

  const doctorName = session.doctor?.full_name || "Doctor";
  const scheduledDate = new Date(session.scheduled_at).toLocaleDateString(
    "es-VE",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
  const scheduledTime = new Date(session.scheduled_at).toLocaleTimeString(
    "es-VE",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const durationMinutes = session.duration_minutes || 0;
  const durationFormatted =
    durationMinutes >= 60
      ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}min`
      : `${durationMinutes} min`;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back Link */}
      <a
        href="/dashboard/telemedicina"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a telemedicina
      </a>

      {/* Summary Header */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-600">
            Consulta finalizada
          </span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">
          Consulta con Dr. {doctorName}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">{scheduledDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{scheduledTime}</span>
          </div>
          {durationMinutes > 0 && (
            <div className="flex items-center gap-1.5">
              <Video className="h-4 w-4" />
              <span>Duracion: {durationFormatted}</span>
            </div>
          )}
        </div>
      </div>

      {/* Doctor's Notes */}
      {session.notes && (
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-gray-900">
              Notas del doctor
            </h2>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {session.notes}
          </p>
        </div>
      )}

      {/* Post-Consultation Actions */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Acciones post-consulta
        </h2>
        <div className="space-y-3">
          <a
            href="/dashboard/recetas"
            className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-emerald-200 hover:bg-emerald-50/50 transition"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Pill className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Recetas generadas
              </p>
              <p className="text-xs text-gray-500">
                Consulta las recetas de esta consulta
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </a>

          <a
            href="/dashboard/historial"
            className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-emerald-200 hover:bg-emerald-50/50 transition"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FlaskConical className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Ordenes de laboratorio
              </p>
              <p className="text-xs text-gray-500">
                Revisa si tienes examenes pendientes
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </a>

          <a
            href="/dashboard/mensajes"
            className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-emerald-200 hover:bg-emerald-50/50 transition"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-5 w-5 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Enviar mensaje al doctor
              </p>
              <p className="text-xs text-gray-500">
                Consulta dudas adicionales post-consulta
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </a>
        </div>
      </div>

      {/* Rating Section */}
      {showRatingForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-1">
            Califica tu consulta
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Tu opinion nos ayuda a mejorar el servicio
          </p>

          {rated ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900">
                Gracias por tu calificacion
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Tu opinion es muy valiosa para nosotros
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <StarRating
                  value={rating}
                  onChange={setRating}
                  disabled={ratingLoading}
                />
              </div>

              {rating > 0 && (
                <>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Comparte tu experiencia (opcional)"
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    disabled={ratingLoading}
                  />
                  <button
                    onClick={handleRate}
                    disabled={ratingLoading}
                    className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ratingLoading ? "Enviando..." : "Enviar calificacion"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center">
        <h2 className="font-semibold text-emerald-800 mb-1">
          Proximos pasos
        </h2>
        <p className="text-sm text-emerald-700 mb-4">
          Sigue las indicaciones de tu doctor y no olvides tus medicamentos
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/dashboard/citas"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition"
          >
            <Calendar className="h-4 w-4" />
            Agendar seguimiento
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-100 transition border border-emerald-200"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
