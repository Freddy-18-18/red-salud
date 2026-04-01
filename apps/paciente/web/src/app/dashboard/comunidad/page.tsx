"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@red-salud/design-system";
import {
  Search,
  Plus,
  MessageCircle,
  Users,
  Lightbulb,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

import { PostCard } from "@/components/community/post-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommunityPosts, useCommunityUser } from "@/hooks/use-community";
import type { PostCategory } from "@/lib/services/community-service";

const TAB_CONFIG: {
  value: PostCategory | "all";
  label: string;
  icon: typeof MessageCircle;
}[] = [
  { value: "pregunta", label: "Preguntas", icon: MessageCircle },
  { value: "experiencia", label: "Experiencias", icon: Users },
  { value: "tip", label: "Tips", icon: Lightbulb },
  { value: "articulo", label: "Articulos", icon: FileText },
];

export default function CommunityPage() {
  const router = useRouter();
  const { loading: userLoading } = useCommunityUser();
  const [activeTab, setActiveTab] = useState<PostCategory | "all">("pregunta");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const timeout = setTimeout(() => setDebouncedSearch(value), 300);
    return () => clearTimeout(timeout);
  };

  const categoryFilter =
    activeTab === "all" ? undefined : (activeTab as PostCategory);

  const { posts, loading } = useCommunityPosts({
    category: categoryFilter,
    search: debouncedSearch || undefined,
  });

  const filteredPosts = useMemo(() => {
    if (!debouncedSearch) return posts;
    return posts;
  }, [posts, debouncedSearch]);

  const handlePostClick = (postId: string) => {
    router.push(`/dashboard/comunidad/${postId}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comunidad</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Pregunta, comparte y aprende con otros pacientes y medicos
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar publicaciones..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as PostCategory | "all")}
      >
        <TabsList className="w-full">
          {TAB_CONFIG.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 text-xs sm:text-sm"
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">
                {tab.label.slice(0, 4)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TAB_CONFIG.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {loading || userLoading ? (
              <div className="space-y-3 mt-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-36 rounded-xl" />
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-3 mt-3">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={handlePostClick}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={tab.icon}
                title={
                  debouncedSearch
                    ? "Sin resultados"
                    : `No hay ${tab.label.toLowerCase()} aun`
                }
                description={
                  debouncedSearch
                    ? "Intenta con otros terminos de busqueda"
                    : "Se el primero en publicar en esta categoria"
                }
                action={{
                  label: "Crear publicacion",
                  href: "/dashboard/comunidad/crear",
                }}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* FAB button */}
      <a
        href="/dashboard/comunidad/crear"
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-all hover:scale-105 flex items-center justify-center z-30"
        aria-label="Crear publicacion"
      >
        <Plus className="h-6 w-6" />
      </a>
    </div>
  );
}
