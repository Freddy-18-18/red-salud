/**
 * Sincronizador de artículos científicos desde PubMed a Supabase
 * Este script se puede ejecutar manualmente o programar como cron job
 */

import { searchPubMed, MEDICAL_SEARCH_TERMS, type PubMedArticle } from "./pubmed";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface SyncResult {
  success: boolean;
  imported: number;
  updated: number;
  errors: string[];
}

async function importArticle(article: PubMedArticle, category: string): Promise<boolean> {
  try {
    const pubDate = article.pubDate
      ? new Date(article.pubDate).toISOString().split("T")[0]
      : null;

    const { error } = await supabase.rpc("import_scientific_article", {
      p_pmid: article.pmid,
      p_pmcid: article.pmcid || null,
      p_doi: article.doi || null,
      p_title: article.title,
      p_abstract: article.abstract || null,
      p_authors: article.authors,
      p_journal: article.journal,
      p_pub_date: pubDate,
      p_mesh_terms: article.meshTerms,
      p_full_text_url: article.fullTextUrl || null,
      p_is_open_access: article.isOpenAccess,
      p_source_category: category,
    });

    if (error) {
      console.error(`Error importing article ${article.pmid}:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Exception importing article ${article.pmid}:`, err);
    return false;
  }
}

export async function syncCategory(
  categorySlug: string,
  maxArticles = 50
): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    imported: 0,
    updated: 0,
    errors: [],
  };

  const searchTerm = MEDICAL_SEARCH_TERMS[categorySlug as keyof typeof MEDICAL_SEARCH_TERMS];

  if (!searchTerm) {
    result.success = false;
    result.errors.push(`Unknown category: ${categorySlug}`);
    return result;
  }

  console.log(`Syncing category: ${categorySlug} with term: ${searchTerm}`);

  try {
    const searchResult = await searchPubMed({
      term: searchTerm,
      maxResults: maxArticles,
      sort: "pub_date",
    });

    console.log(`Found ${searchResult.articles.length} articles`);

    for (const article of searchResult.articles) {
      const success = await importArticle(article, categorySlug);

      if (success) {
        result.imported++;
      } else {
        result.errors.push(`Failed to import: ${article.pmid} - ${article.title.substring(0, 50)}`);
      }
    }

    result.success = result.errors.length === 0;
  } catch (err) {
    result.success = false;
    result.errors.push(`Sync failed: ${err}`);
  }

  return result;
}

export async function syncAllCategories(maxArticlesPerCategory = 30): Promise<{
  totalImported: number;
  totalUpdated: number;
  results: Record<string, SyncResult>;
}> {
  const results: Record<string, SyncResult> = {};
  let totalImported = 0;
  let totalUpdated = 0;

  for (const categorySlug of Object.keys(MEDICAL_SEARCH_TERMS)) {
    console.log(`\n=== Syncing ${categorySlug} ===`);

    const result = await syncCategory(categorySlug, maxArticlesPerCategory);
    results[categorySlug] = result;

    totalImported += result.imported;
    totalUpdated += result.updated;

    console.log(`Imported: ${result.imported}, Errors: ${result.errors.length}`);

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return {
    totalImported,
    totalUpdated,
    results,
  };
}

export async function syncSingleArticle(pmid: string): Promise<boolean> {
  const { getArticleDetails } = await import("./pubmed");

  const article = await getArticleDetails(pmid);

  if (!article) {
    console.error(`Article not found: ${pmid}`);
    return false;
  }

  const categories = Object.keys(MEDICAL_SEARCH_TERMS);
  const category = categories[0] || "general";

  return importArticle(article, category);
}

export async function getSyncStats(): Promise<{
  totalArticles: number;
  byCategory: Record<string, number>;
  openAccessCount: number;
}> {
  const { count: total } = await supabase
    .from("scientific_articles")
    .select("*", { count: "exact", head: true });

  const { count: openAccess } = await supabase
    .from("scientific_articles")
    .select("*", { count: "exact", head: true })
    .eq("is_open_access", true);

  const { data: categoryData } = await supabase
    .from("scientific_articles")
    .select("source_category");

  const byCategory: Record<string, number> = {};
  categoryData?.forEach((item) => {
    byCategory[item.source_category] = (byCategory[item.source_category] || 0) + 1;
  });

  return {
    totalArticles: total || 0,
    byCategory,
    openAccessCount: openAccess || 0,
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "sync-all") {
    syncAllCategories(30).then((result) => {
      console.log("\n=== Sync Complete ===");
      console.log(`Total imported: ${result.totalImported}`);
      console.log(JSON.stringify(result.results, null, 2));
      process.exit(0);
    });
  } else if (command === "sync-category" && args[1]) {
    syncCategory(args[1], 30).then((result) => {
      console.log("\n=== Sync Complete ===");
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    });
  } else if (command === "stats") {
    getSyncStats().then((stats) => {
      console.log("\n=== Sync Stats ===");
      console.log(JSON.stringify(stats, null, 2));
      process.exit(0);
    });
  } else {
    console.log("Usage:");
    console.log("  npm run sync-all          - Sync all categories");
    console.log("  npm run sync-category <>   - Sync single category");
    console.log("  npm run sync-stats        - Show sync stats");
  }
}
