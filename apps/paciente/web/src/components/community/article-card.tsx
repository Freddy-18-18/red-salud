"use client";

import { Clock, Heart, User } from "lucide-react";

import type { HealthArticle } from "@/lib/services/community-service";

interface ArticleCardProps {
  article: HealthArticle;
  onClick: (articleId: string) => void;
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

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  const authorName = article.author?.full_name || "Red-Salud";
  const categoryLabel =
    ARTICLE_CATEGORY_LABELS[article.category] || "General";

  return (
    <button
      type="button"
      onClick={() => onClick(article.id)}
      className="w-full text-left bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all group"
    >
      {/* Cover image */}
      {article.cover_image_url ? (
        <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
          <span className="text-4xl font-bold text-emerald-200">RS</span>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 mb-2">
          {categoryLabel}
        </span>

        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
          {article.title}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {article.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="truncate max-w-[100px]">{authorName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.reading_time_minutes} min
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {article.likes}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
