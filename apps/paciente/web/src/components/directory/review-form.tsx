"use client";

import { useState } from "react";
import { Star, X, ThumbsUp } from "lucide-react";
import type { ProviderType, CreateReview } from "@/lib/services/directory-service";

interface ReviewFormProps {
  providerId: string;
  providerType: ProviderType;
  providerName: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReview) => Promise<boolean>;
  submitting?: boolean;
}

export function ReviewForm({
  providerId,
  providerType,
  providerName,
  open,
  onClose,
  onSubmit,
  submitting = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [visitDate, setVisitDate] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;

    const success = await onSubmit({
      providerId,
      providerType,
      rating,
      title: title.trim() || undefined,
      comment: comment.trim() || undefined,
      wouldRecommend,
      visitDate: visitDate || undefined,
    });

    if (success) {
      // Reset form
      setRating(0);
      setTitle("");
      setComment("");
      setWouldRecommend(true);
      setVisitDate("");
      onClose();
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">Escribir resena</h3>
            <p className="text-sm text-gray-500 mt-0.5">{providerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Tu calificacion
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= displayRating
                        ? "text-amber-400 fill-current"
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {displayRating === 1 && "Mala experiencia"}
                {displayRating === 2 && "Podria mejorar"}
                {displayRating === 3 && "Aceptable"}
                {displayRating === 4 && "Buena experiencia"}
                {displayRating === 5 && "Excelente"}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titulo (opcional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resume tu experiencia en una frase"
              maxLength={100}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tu experiencia (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuenta tu experiencia para ayudar a otros pacientes..."
              rows={4}
              maxLength={1000}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {comment.length}/1000
            </p>
          </div>

          {/* Would recommend */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Lo recomendarias?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setWouldRecommend(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${
                  wouldRecommend
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                Si, lo recomiendo
              </button>
              <button
                onClick={() => setWouldRecommend(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${
                  !wouldRecommend
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <ThumbsUp className="h-4 w-4 rotate-180" />
                No
              </button>
            </div>
          </div>

          {/* Visit date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de visita (opcional)
            </label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 sm:p-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="flex-1 py-3 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Enviando..." : "Publicar resena"}
          </button>
        </div>
      </div>
    </div>
  );
}
