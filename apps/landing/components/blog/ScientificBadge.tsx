"use client";

import Link from "next/link";
import { Badge } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Card } from "@red-salud/design-system";
import { ExternalLink, BookOpen, CheckCircle, FileText } from "lucide-react";
import type { ScientificArticle } from "@red-salud/types";

interface ScientificBadgeProps {
  article: ScientificArticle;
  showPreview?: boolean;
}

export function ScientificBadge({ article, showPreview = false }: ScientificBadgeProps) {
  return (
    <div className="space-y-3">
      <Link
        href={`/blog/cientifico/${article.id}`}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
      >
        <CheckCircle className="h-4 w-4" />
        <FileText className="h-3 w-3" />
        Estudio científico validado
      </Link>

      {showPreview && (
        <Card className="p-4 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 mb-1">
                {article.title}
              </h4>
              <p className="text-xs text-gray-500 mb-2">
                {article.journal} • {article.pub_date ? new Date(article.pub_date).getFullYear() : "N/A"}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">PMID: {article.pmid}</span>
                {article.is_open_access && (
                  <Badge variant="secondary" className="text-xs">
                    Acceso abierto
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {article.full_text_url && (
            <a
              href={article.full_text_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-1 text-sm text-green-700 dark:text-green-400 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Ver estudio completo
            </a>
          )}
        </Card>
      )}
    </div>
  );
}

interface ScientificReferencesProps {
  articles: ScientificArticle[];
  maxShow?: number;
}

export function ScientificReferences({ articles, maxShow = 3 }: ScientificReferencesProps) {
  if (articles.length === 0) return null;

  const displayed = articles.slice(0, maxShow);
  const remaining = articles.length - maxShow;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        Referencias científicas
      </h4>
      {displayed.map((article) => (
        <ScientificBadge key={article.id} article={article} showPreview />
      ))}
      {remaining > 0 && (
        <Link
          href="/blog/cientifico"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          Ver {remaining} estudios más
          <ExternalLink className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

export function ScientificCard({ article }: { article: ScientificArticle }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge
            variant="secondary"
            className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Estudio científico
          </Badge>
          <div className="flex items-center gap-1">
            {article.is_open_access ? (
              <Badge variant="outline" className="text-xs">
                Acceso abierto
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                Restringido
              </Badge>
            )}
          </div>
        </div>

        <Link href={`/blog/cientifico/${article.id}`}>
          <h3 className="text-lg font-bold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
        </Link>

        {article.abstract && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
            {article.abstract}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{article.journal}</span>
          <span>
            {article.pub_date
              ? new Date(article.pub_date).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "short",
                })
              : "N/A"}
          </span>
        </div>

        <a
          href={article.full_text_url || `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Ver estudio en PubMed
        </a>
      </div>
    </Card>
  );
}
