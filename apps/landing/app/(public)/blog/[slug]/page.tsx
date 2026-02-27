"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug } from "@/lib/api/blog";
import ArticleHeader from "@/components/blog/ArticleHeader";
import TableOfContents from "@/components/blog/TableOfContents";
import ArticleSidebar from "@/components/blog/ArticleSidebar";
import RelatedArticles from "@/components/blog/RelatedArticles";
import AuthorCard from "@/components/blog/AuthorCard";
import { Skeleton } from "@red-salud/design-system";
import type { BlogPost } from "@red-salud/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ArticlePage({ params }: PageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tocHeadings, setTocHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  useEffect(() => {
    async function loadPost() {
      try {
        const { slug } = await params;
        const data = await getPostBySlug(slug);
        if (!data) {
          setError("Artículo no encontrado");
          return;
        }
        setPost(data);
        generateTOC(data.content);
      } catch (err) {
        console.error("Error loading post:", err);
        setError("Error al cargar el artículo");
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [params]);

  function generateTOC(content: string) {
    const headingRegex = /<h([2-3])[^>]*>(.*?)<\/h\1>/g;
    const headings: { id: string; text: string; level: number }[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      if (!match[1] || !match[2]) continue;
      const level = parseInt(match[1]);
      const text = match[2].replace(/<[^>]*>/g, "");
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      headings.push({ id, text, level });
    }

    setTocHeadings(headings);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-3/4 mb-4" />
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {error || "Artículo no encontrado"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            El artículo que buscas no existe o ha sido eliminado.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Blog
          </Link>
        </div>
      </div>
    );
  }

  const contentWithIds = tocHeadings.length > 0
    ? post.content.replace(
      /<h([2-3])[^>]*>(.*?)<\/h\1>/g,
      (match, level, content) => {
        const text = content.replace(/<[^>]*>/g, "");
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return `<h${level} id="${id}">${content}</h${level}>`;
      }
    )
    : post.content;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ArticleHeader post={post} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <motion.main
              className="lg:col-span-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                {post.cover_image && (
                  <div className="relative h-64 md:h-80 w-full">
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                )}

                <div className="p-6 md:p-8 lg:p-10">
                  {post.category && (
                    <Link
                      href={`/blog?category=${post.category.slug}`}
                      className="inline-block mb-4"
                    >
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${post.category.color}20`,
                          color: post.category.color,
                        }}
                      >
                        {post.category.name}
                      </span>
                    </Link>
                  )}

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    {post.title}
                  </h1>

                  {post.excerpt && (
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-4 py-4 border-y border-gray-200 dark:border-gray-700 mb-8">
                    {post.author && <AuthorCard author={post.author} size="sm" showName />}
                    <span className="text-gray-500 dark:text-gray-400">•</span>
                    <time className="text-gray-500 dark:text-gray-400">
                      {new Date(post.published_at || post.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span className="text-gray-500 dark:text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {post.reading_time} min de lectura
                    </span>
                  </div>

                  {tocHeadings.length > 2 && (
                    <TableOfContents headings={tocHeadings} />
                  )}

                  <div
                    className="prose prose-lg dark:prose-invert max-w-none
                      prose-headings:scroll-mt-24
                      prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-4
                      prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
                      prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
                      prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                      prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-6
                      prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-6
                      prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:mb-2
                      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
                      prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                      prose-img:rounded-xl prose-img:shadow-lg"
                    dangerouslySetInnerHTML={{ __html: contentWithIds }}
                  />

                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                        Etiquetas
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Link
                            key={tag.id}
                            href={`/blog?tag=${tag.slug}`}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            #{tag.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>

              <RelatedArticles
                currentPostId={post.id}
                categoryId={post.category_id}
                tags={post.tags}
              />
            </motion.main>

            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <ArticleSidebar post={post} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
