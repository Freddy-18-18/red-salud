"use client";

import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@red-salud/ui";
import type { BlogPost } from "@red-salud/types";

interface ArticleHeaderProps {
  post: BlogPost;
}

export default function ArticleHeader({ post }: ArticleHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-12">
      <div className="container mx-auto px-4">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-white/80 hover:text-white">
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <span className="text-white/60">/</span>
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/blog" className="text-white/80 hover:text-white">
                Blog
              </BreadcrumbLink>
            </BreadcrumbItem>
            {post.category && (
              <>
                <BreadcrumbSeparator>
                  <span className="text-white/60">/</span>
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={`/blog?category=${post.category.slug}`}
                    className="text-white/80 hover:text-white"
                  >
                    {post.category.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-4xl">
          {post.is_featured && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-sm font-medium mb-4">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Artículo destacado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
