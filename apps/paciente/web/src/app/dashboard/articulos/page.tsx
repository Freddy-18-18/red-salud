"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { ArticleCard } from "@/components/community/article-card";
import { CategoryChips } from "@/components/community/category-chips";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useHealthArticles, useFeaturedArticles } from "@/hooks/use-community";
import type { ArticleCategory } from "@/lib/services/community-service";

const ARTICLE_CATEGORIES: { value: ArticleCategory; label: string }[] = [
  { value: "nutricion", label: "Nutricion" },
  { value: "ejercicio", label: "Ejercicio" },
  { value: "salud_mental", label: "Salud Mental" },
  { value: "prevencion", label: "Prevencion" },
  { value: "medicamentos", label: "Medicamentos" },
  { value: "enfermedades", label: "Enfermedades" },
  { value: "embarazo", label: "Embarazo" },
  { value: "pediatria", label: "Pediatria" },
  { value: "dental", label: "Dental" },
  { value: "cardiologia", label: "Cardiologia" },
  { value: "general", label: "General" },
];

export default function ArticlesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] =
    useState<ArticleCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const carouselRef = useRef<HTMLDivElement>(null);

  const { articles: featuredArticles, loading: featuredLoading } =
    useFeaturedArticles();
  const { articles, loading } = useHealthArticles({
    category: selectedCategory ?? undefined,
    search: debouncedSearch || undefined,
  });

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleArticleClick = (articleId: string) => {
    router.push(`/dashboard/articulos/${articleId}`);
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.offsetWidth * 0.8;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Articulos de Salud
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Informacion confiable escrita por profesionales de salud
        </p>
      </div>

      {/* Featured carousel */}
      {featuredArticles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Destacados</h2>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => scrollCarousel("left")}
                className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel("right")}
                className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {featuredLoading ? (
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="min-w-[260px] h-48 rounded-xl" />
              ))}
            </div>
          ) : (
            <div
              ref={carouselRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {featuredArticles.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => handleArticleClick(article.id)}
                  className="min-w-[260px] sm:min-w-[320px] snap-start flex-shrink-0 relative aspect-[16/10] rounded-xl overflow-hidden group"
                >
                  {article.cover_image_url ? (
                    <img
                      src={article.cover_image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white backdrop-blur-sm mb-2">
                      Destacado
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-1 mt-1">
                      {article.summary}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar articulos..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
        />
      </div>

      {/* Category chips */}
      <CategoryChips
        categories={ARTICLE_CATEGORIES}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Articles grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={handleArticleClick}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title={
            debouncedSearch
              ? "Sin resultados"
              : "No hay articulos en esta categoria"
          }
          description={
            debouncedSearch
              ? "Intenta con otros terminos de busqueda"
              : "Pronto se publicaran nuevos articulos"
          }
        />
      )}
    </div>
  );
}
