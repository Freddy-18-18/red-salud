"use client";

import { Star, ThumbsUp, ThumbsDown, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

import { useSubmitRating } from "@/hooks/use-ratings";

interface RatingFormProps {
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  onSuccess?: () => void;
}

export function RatingForm({
  appointmentId,
  doctorId,
  doctorName,
  onSuccess,
}: RatingFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { submit, loading } = useSubmitRating();

  const ratingLabels: Record<number, string> = {
    1: "Muy mala",
    2: "Mala",
    3: "Regular",
    4: "Buena",
    5: "Excelente",
  };

  const handleSubmit = async () => {
    setFormError(null);

    if (rating === 0) {
      setFormError("Selecciona una valoracion de 1 a 5 estrellas.");
      return;
    }

    if (wouldRecommend === null) {
      setFormError("Indica si recomendarias a este medico.");
      return;
    }

    const result = await submit({
      appointment_id: appointmentId,
      doctor_id: doctorId,
      rating,
      comment: comment.trim() || undefined,
      would_recommend: wouldRecommend,
    });

    if (result.success) {
      setSubmitted(true);
      onSuccess?.();
    } else {
      setFormError(result.error);
    }
  };

  // --- Success state ---
  if (submitted) {
    return (
      <div className="p-6 bg-white border border-gray-100 rounded-xl text-center">
        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Gracias por tu valoracion
        </h3>
        <p className="text-sm text-gray-500">
          Tu opinion ayuda a otros pacientes a elegir mejor
        </p>
        <div className="flex items-center justify-center gap-0.5 mt-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  const displayRating = hoveredStar || rating;

  return (
    <div className="p-6 bg-white border border-gray-100 rounded-xl space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-gray-900">
          Valora tu consulta
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Como fue tu experiencia con Dr. {doctorName}?
        </p>
      </div>

      {/* Star rating */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="p-1 rounded-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1"
              aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= displayRating
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-200 hover:text-amber-200"
                }`}
              />
            </button>
          ))}
        </div>
        {displayRating > 0 && (
          <p className="text-sm font-medium text-amber-600">
            {ratingLabels[displayRating]}
          </p>
        )}
      </div>

      {/* Would recommend */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Recomendarias a este medico?
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setWouldRecommend(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              wouldRecommend === true
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <ThumbsUp
              className={`h-4 w-4 ${
                wouldRecommend === true ? "text-emerald-600" : "text-gray-400"
              }`}
            />
            Si, lo recomiendo
          </button>
          <button
            type="button"
            onClick={() => setWouldRecommend(false)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              wouldRecommend === false
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <ThumbsDown
              className={`h-4 w-4 ${
                wouldRecommend === false ? "text-red-500" : "text-gray-400"
              }`}
            />
            No
          </button>
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <label
          htmlFor="rating-comment"
          className="text-sm font-medium text-gray-700"
        >
          Comentario{" "}
          <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="rating-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuenta tu experiencia con este medico..."
          rows={3}
          maxLength={500}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 placeholder:text-gray-400"
        />
        <p className="text-xs text-gray-400 text-right">
          {comment.length}/500
        </p>
      </div>

      {/* Error */}
      {formError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {formError}
        </p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || rating === 0}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar valoracion"
        )}
      </button>
    </div>
  );
}
