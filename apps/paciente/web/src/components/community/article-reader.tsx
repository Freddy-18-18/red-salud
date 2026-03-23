"use client";

import {
  ArrowLeft,
  Clock,
  Heart,
  Share2,
  Eye,
  User,
} from "lucide-react";
import { cn } from "@red-salud/core/utils";
import { DoctorBadge } from "@/components/community/doctor-badge";
import type { HealthArticle } from "@/lib/services/community-service";

interface ArticleReaderProps {
  article: HealthArticle;
  liked: boolean;
  onLike: () => void;
  onBack: () => void;
  relatedArticles?: HealthArticle[];
  onArticleClick?: (articleId: string) => void;
}

const ARTICLE_CATEGORY_LABELS: Record<string, string> = {
  nutricion: "Nutricion",
  ejercicio: "Ejercicio",
  salud_mental: "Salud Mental",
  prevencion: "Prevencion",
  medicamentos: "Medicamentos",
  enfermedades: "Enfermedades",
  embarazo: "Embarazo",
  pediatria: "Pediatria",
  dental: "Dental",
  cardiologia: "Cardiologia",
  general: "General",
};

export function ArticleReader({
  article,
  liked,
  onLike,
  onBack,
  relatedArticles = [],
  onArticleClick,
}: ArticleReaderProps) {
  const authorName = article.author?.full_name || "Red Salud";
  const isDoctor = article.author?.role === "medico";
  const categoryLabel =
    ARTICLE_CATEGORY_LABELS[article.category] || "General";

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a articulos
      </button>

      {/* Cover image */}
      {article.cover_image_url && (
        <div className="aspect-[2/1] rounded-xl overflow-hidden bg-gray-100">
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article content */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
        {/* Category & reading time */}
        <div className="flex items-center gap-3 mb-3">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
            {categoryLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            {article.reading_time_minutes} min de lectura
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
            <Eye className="h-3 w-3" />
            {article.views}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        {/* Author */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {article.author?.avatar_url ? (
              <img
                src={article.author.avatar_url}
                alt={authorName}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-emerald-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-900">
                {authorName}
              </span>
              {isDoctor && <DoctorBadge size="md" />}
            </div>
            <span className="text-xs text-gray-400">
              {new Date(article.created_at).toLocaleDateString("es-VE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Summary highlight */}
        {article.summary && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg mb-6">
            <p className="text-sm text-emerald-800 italic">{article.summary}</p>
          </div>
        )}

        {/* Article body */}
        <div className="prose prose-sm max-w-none">
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
            {article.content}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-6 mt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onLike}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              liked
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            )}
          >
            <Heart
              className={cn("h-4 w-4", liked && "fill-current")}
            />
            {article.likes} Me gusta
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
          >
            <Share2 className="h-4 w-4" />
            Compartir
          </button>
        </div>
      </div>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Articulos relacionados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedArticles.map((related) => (
              <button
                key={related.id}
                type="button"
                onClick={() => onArticleClick?.(related.id)}
                className="flex gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all text-left"
              >
                {related.cover_image_url ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={related.cover_image_url}
                      alt={related.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-emerald-200">
                      RS
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {related.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {related.reading_time_minutes} min
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Heart className="h-3 w-3" />
                      {related.likes}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
