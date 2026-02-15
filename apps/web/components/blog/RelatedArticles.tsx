"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@red-salud/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { motion } from "framer-motion";
import { ArrowRight, Eye, ThumbsUp } from "lucide-react";
import { getPosts } from "@/lib/api/blog";
import type { BlogPost, ContentTag } from "@red-salud/types";

interface RelatedArticlesProps {
  currentPostId: string;
  categoryId: string | null;
  tags?: ContentTag[];
}

export default function RelatedArticles({
  currentPostId,
  categoryId,
  tags,
}: RelatedArticlesProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedPosts() {
      try {
        const result = await getPosts(
          {
            category: categoryId || undefined,
          },
          { page: 1, limit: 4 }
        );
        const filtered = result.data.filter((p) => p.id !== currentPostId).slice(0, 3);
        setPosts(filtered);
      } catch (error) {
        console.error("Error fetching related posts:", error);
      } finally {
        setLoading(false);
      }
    }

    if (categoryId) {
      fetchRelatedPosts();
    } else {
      setLoading(false);
    }
  }, [currentPostId, categoryId]);

  if (loading || posts.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Artículos relacionados
        </h2>
        <Link
          href="/blog"
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver todos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/blog/${post.slug}`}>
              <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="relative h-40 bg-gradient-to-br from-blue-500 to-teal-500">
                  {post.cover_image && (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  )}
                </div>
                <div className="p-4">
                  {post.category && (
                    <Badge
                      variant="secondary"
                      className="mb-2 text-xs"
                      style={{
                        backgroundColor: `${post.category.color}20`,
                        color: post.category.color,
                      }}
                    >
                      {post.category.name}
                    </Badge>
                  )}
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={post.author?.avatar_url || ""} />
                        <AvatarFallback className="text-xs">
                          {post.author?.nombre_completo?.[0] || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate max-w-[80px]">
                        {post.author?.nombre_completo}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.view_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {post.like_count}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
