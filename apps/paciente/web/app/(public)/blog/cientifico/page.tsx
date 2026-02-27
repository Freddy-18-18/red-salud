"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import {
  getScientificArticles,
  getScientificCategories,
} from "@/lib/api/scientific-articles";
import {
  Search,
  BookOpen,
  ExternalLink,
  Calendar,
  Users,
  Filter,
  Lock,
  Globe,
  ArrowRight,
} from "lucide-react";
import type { ScientificArticle } from "@red-salud/types";

export default function ScientificArticlesPage() {
  const [articles, setArticles] = useState<ScientificArticle[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showOpenAccessOnly, setShowOpenAccessOnly] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [selectedCategory, searchQuery, page, showOpenAccessOnly]);

  async function loadCategories() {
    try {
      const data = await getScientificCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  async function loadArticles() {
    setLoading(true);
    try {
      const result = await getScientificArticles(
        {
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
          openAccessOnly: showOpenAccessOnly || undefined,
        },
        { page, limit: 12 }
      );
      setArticles(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Error loading articles:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadArticles();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-medium">Investigación Médica</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Artículos Científicos
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Acceso a investigación médica validada y revisada por pares
            </p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar artículos por título, autor o tema..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg bg-white dark:bg-gray-800 border-0 shadow-lg"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  Buscar
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <Card className="p-5 sticky top-24">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Categorías
              </h3>
              
              <div className="space-y-2 mb-6">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setPage(1);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !selectedCategory
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  Todas las categorías
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.slug);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      selectedCategory === category.slug
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOpenAccessOnly}
                    onChange={(e) => {
                      setShowOpenAccessOnly(e.target.checked);
                      setPage(1);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Solo acceso abierto
                  </span>
                </label>
              </div>
            </Card>
          </aside>

          <main className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {articles.length} artículos encontrados
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
                    <div className="h-6 bg-gray-200700 rounded w- dark:bg-gray-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No se encontraron artículos
                </h3>
                <p className="text-gray-500 mb-4">
                  Intenta con otros términos de búsqueda o categorías
                </p>
                <Button onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setPage(1);
                }}>
                  Ver todos los artículos
                </Button>
              </Card>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {articles.map((article, index) => (
                  <motion.div key={article.id} variants={fadeInUp}>
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: `${categories.find(c => c.slug === article.source_category)?.color || "#3B82F6"}20`,
                              color: categories.find(c => c.slug === article.source_category)?.color || "#3B82F6",
                            }}
                          >
                            {categories.find(c => c.slug === article.source_category)?.name || article.source_category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {article.is_open_access ? (
                              <Globe className="h-4 w-4 text-green-500" />
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>

                        <Link href={`/blog/cientifico/${article.id}`}>
                          <h3 className="text-lg font-bold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                            {article.title}
                          </h3>
                        </Link>

                        {article.abstract && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                            {article.abstract}
                          </p>
                        )}

                        <div className="space-y-2 mb-4">
                          {article.authors && article.authors.length > 0 && (
                            <p className="text-sm text-gray-500 line-clamp-1">
                              <Users className="h-3 w-3 inline mr-1" />
                              {article.authors.slice(0, 3).join(", ")}
                              {article.authors.length > 3 && ` +${article.authors.length - 3} más`}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {article.pub_date
                              ? new Date(article.pub_date).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Fecha no disponible"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                          <span className="text-xs text-gray-500">
                            PMID: {article.pmid}
                          </span>
                          <a
                            href={article.full_text_url || `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Ver artículo
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <span className="px-4 text-gray-600">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
