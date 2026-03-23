"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArticleReader } from "@/components/community/article-reader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useHealthArticle,
  useArticleLike,
  useHealthArticles,
  useCommunityUser,
} from "@/hooks/use-community";

interface ArticleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { userId } = useCommunityUser();
  const { article, loading } = useHealthArticle(id);
  const { liked, toggle: toggleLike } = useArticleLike(userId, id);

  // Fetch related articles of same category
  const { articles: relatedArticles } = useHealthArticles({
    category: article?.category ?? undefined,
  });

  // Filter out current article from related
  const filteredRelated = relatedArticles
    .filter((a) => a.id !== id)
    .slice(0, 4);

  const handleBack = () => {
    router.push("/dashboard/articulos");
  };

  const handleArticleClick = (articleId: string) => {
    router.push(`/dashboard/articulos/${articleId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="aspect-[2/1] rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Articulo no encontrado</p>
        <button
          type="button"
          onClick={handleBack}
          className="mt-4 text-emerald-600 text-sm font-medium hover:text-emerald-700"
        >
          Volver a articulos
        </button>
      </div>
    );
  }

  return (
    <ArticleReader
      article={article}
      liked={liked}
      onLike={toggleLike}
      onBack={handleBack}
      relatedArticles={filteredRelated}
      onArticleClick={handleArticleClick}
    />
  );
}
