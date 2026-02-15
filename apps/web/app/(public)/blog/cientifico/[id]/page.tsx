"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { Skeleton } from "@red-salud/ui";
import {
  getScientificArticleById,
  getScientificCategories,
  incrementArticleViews,
} from "@/lib/api/scientific-articles";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Users,
  BookOpen,
  Globe,
  Lock,
  Share2,
  Copy,
  CheckCircle,
} from "lucide-react";
import type { ScientificArticle } from "@red-salud/types";

export default function ScientificArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<ScientificArticle | null>(null);
  const [category, setCategory] = useState<{ name: string; color: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      try {
        const id = params.id as string;
        const data = await getScientificArticleById(id);
        
        if (!data) {
          setError("Artículo no encontrado");
          return;
        }

        setArticle(data);
        
        const categories = await getScientificCategories();
        const cat = categories.find((c) => c.slug === data.source_category);
        if (cat) {
          setCategory({ name: cat.name, color: cat.color });
        }

        await incrementArticleViews(data.id);
      } catch (err) {
        console.error("Error loading article:", err);
        setError("Error al cargar el artículo");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadArticle();
    }
  }, [params.id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <Skeleton className="h-64 w-full mb-8" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {error || "Artículo no encontrado"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            El artículo científico que buscas no existe.
          </p>
          <Link
            href="/blog/cientifico"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ver todos los artículos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link
            href="/blog/cientifico"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a artículos científicos
          </Link>

          <div className="max-w-4xl">
            {category && (
              <Badge
                className="mb-4"
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "white",
                }}
              >
                {category.name}
              </Badge>
            )}

            <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
              {article.authors && article.authors.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {article.authors.slice(0, 3).join(", ")}
                  {article.authors.length > 3 && ` +${article.authors.length - 3}`}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {article.pub_date
                  ? new Date(article.pub_date).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Fecha no disponible"}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {article.journal}
              </span>
              <span className="flex items-center gap-1">
                {article.is_open_access ? (
                  <>
                    <Globe className="h-4 w-4" />
                    Acceso abierto
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Acceso restringido
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-6 md:p-8">
                <h2 className="text-xl font-bold mb-4">Resumen</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  {article.abstract || "No hay resumen disponible para este artículo."}
                </p>

                {article.mesh_terms && article.mesh_terms.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Temas MeSH
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {article.mesh_terms.slice(0, 10).map((term, index) => (
                        <Badge key={index} variant="outline">
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={article.full_text_url || `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver artículo completo en PubMed
                  </a>
                  <Button
                    variant="outline"
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4" />
                        Compartir
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {article.authors && article.authors.length > 0 && (
                <Card className="p-6 mt-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Autores
                  </h3>
                  <ul className="space-y-2">
                    {article.authors.map((author, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">
                        {author}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="p-5">
                <h3 className="font-bold text-lg mb-4">Información del artículo</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">PMID</dt>
                    <dd className="font-mono">{article.pmid}</dd>
                  </div>
                  {article.pmcid && (
                    <div>
                      <dt className="text-gray-500">PMCID</dt>
                      <dd className="font-mono">{article.pmcid}</dd>
                    </div>
                  )}
                  {article.doi && (
                    <div>
                      <dt className="text-gray-500">DOI</dt>
                      <dd className="font-mono text-xs break-all">{article.doi}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-500">Revista</dt>
                    <dd>{article.journal}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Fecha de publicación</dt>
                    <dd>
                      {article.pub_date
                        ? new Date(article.pub_date).toLocaleDateString("es-ES")
                        : "No disponible"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Acceso</dt>
                    <dd className="flex items-center gap-1">
                      {article.is_open_access ? (
                        <>
                          <Globe className="h-4 w-4 text-green-500" />
                          Abierto
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 text-gray-400" />
                          Restringido
                        </>
                      )}
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card className="p-5">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <BookOpen className="h-4 w-4" />
                  <span>Artículo importado desde PubMed/NCBI</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Los artículos científicos son proporcionados por el National Center for Biotechnology Information (NCBI) y PubMed.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
