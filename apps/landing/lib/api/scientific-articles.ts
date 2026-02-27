/**
 * API para artículos científicos importados de PubMed
 */

import { createClient } from "@/lib/supabase/client";
import type { ScientificArticle, ScientificArticleFilters, PaginatedResponse, PaginationParams } from "@red-salud/types";

const supabase = createClient();

export async function getScientificArticles(
  filters: ScientificArticleFilters = {},
  pagination: PaginationParams = { page: 1, limit: 12 }
): Promise<PaginatedResponse<ScientificArticle>> {
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("scientific_articles")
    .select("*", { count: "exact" })
    .order("pub_date", { ascending: false });

  if (filters.category) {
    query = query.eq("source_category", filters.category);
  }

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,abstract.ilike.%${filters.search}%,authors.cs.{${filters.search}}`
    );
  }

  if (filters.openAccessOnly) {
    query = query.eq("is_open_access", true);
  }

  const { data, error, count } = await query
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
    hasMore: offset + limit < (count || 0),
  };
}

export async function getScientificArticleById(id: string): Promise<ScientificArticle | null> {
  const { data, error } = await supabase
    .from("scientific_articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
}

export async function getScientificArticleByPmid(pmid: string): Promise<ScientificArticle | null> {
  const { data, error } = await supabase
    .from("scientific_articles")
    .select("*")
    .eq("pmid", pmid)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
}

export async function getScientificCategories(): Promise<{ id: string; name: string; slug: string; description: string | null; color: string }[]> {
  const { data, error } = await supabase
    .from("scientific_categories")
    .select("id, name, slug, description, color")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data || [];
}

export async function getRecentScientificArticles(limit = 6): Promise<ScientificArticle[]> {
  const { data, error } = await supabase
    .from("scientific_articles")
    .select("*")
    .eq("is_open_access", true)
    .order("pub_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getPopularScientificArticles(limit = 6): Promise<ScientificArticle[]> {
  const { data, error } = await supabase
    .from("scientific_articles")
    .select("*")
    .order("view_count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function searchScientificArticles(
  searchQuery: string,
  limit = 10
): Promise<ScientificArticle[]> {
  const { data, error } = await supabase
    .from("scientific_articles")
    .select("*")
    .or(`title.ilike.%${searchQuery}%,abstract.ilike.%${searchQuery}%`)
    .order("pub_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function incrementArticleViews(articleId: string): Promise<void> {
  const { error } = await supabase.rpc("increment_scientific_article_views", {
    article_id: articleId,
  });

  if (error) {
    console.error("Error incrementing views:", error);
  }
}

export async function getScientificArticleStats(): Promise<{
  totalArticles: number;
  openAccessArticles: number;
  categoriesCount: number;
}> {
  const [articlesResult, categoriesResult] = await Promise.all([
    supabase
      .from("scientific_articles")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("scientific_categories")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  const openAccessResult = await supabase
    .from("scientific_articles")
    .select("*", { count: "exact", head: true })
    .eq("is_open_access", true);

  return {
    totalArticles: articlesResult.count || 0,
    openAccessArticles: openAccessResult.count || 0,
    categoriesCount: categoriesResult.count || 0,
  };
}
