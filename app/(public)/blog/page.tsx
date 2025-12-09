"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { 
  Calendar, User, ArrowRight, Search, TrendingUp, 
  MessageCircle, ThumbsUp, Eye, BookOpen, Award,
  Clock, Filter, ChevronRight, Sparkles, Users
} from "lucide-react";
import { getPosts, getCategories, getPopularTags, getFeaturedPosts, getTopContributors } from "@/lib/api/blog";
import type { BlogPost, BlogCategory, ContentTag, UserReputation } from "@/lib/types/blog";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [popularTags, setPopularTags] = useState<ContentTag[]>([]);
  const [topContributors, setTopContributors] = useState<UserReputation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, searchQuery, page]);

  async function loadInitialData() {
    try {
      const [categoriesData, tagsData, featuredData, contributorsData] = await Promise.all([
        getCategories(),
        getPopularTags(15),
        getFeaturedPosts(3),
        getTopContributors(5),
      ]);
      setCategories(categoriesData);
      setPopularTags(tagsData);
      setFeaturedPosts(featuredData);
      setTopContributors(contributorsData);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  }

  async function loadPosts() {
    setLoading(true);
    try {
      const result = await getPosts(
        { 
          category: selectedCategory || undefined, 
          search: searchQuery || undefined 
        },
        { page, limit: 9 }
      );
      setPosts(prev => page === 1 ? result.data : [...prev, ...result.data]);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  function handleCategoryChange(categoryId: string | null) {
    setSelectedCategory(categoryId);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:50px_50px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-yellow-300" />
              <span className="text-blue-200 font-medium">Conocimiento médico verificado</span>
            </motion.div>
            <motion.h1 
              variants={fadeInUp} 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
            >
              Blog Médico & Comunidad
            </motion.h1>
            <motion.p 
              variants={fadeInUp} 
              className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
            >
              Artículos escritos por médicos verificados, preguntas de la comunidad 
              y las últimas noticias en salud
            </motion.p>
            
            {/* Search Bar */}
            <motion.form 
              variants={fadeInUp}
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar artículos, temas de salud..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-full bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-blue-200 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400 transition-all"
                />
                <Button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white text-blue-600 hover:bg-blue-50"
                >
                  Buscar
                </Button>
              </div>
            </motion.form>

            {/* Quick Links */}
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-3 mt-6">
              <Link href="/blog/preguntas">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Preguntas y Respuestas
                </Button>
              </Link>
              <Link href="/blog/escribir">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Escribir Artículo
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-12 -mt-16 relative z-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="h-full overflow-hidden group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
                      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-teal-500">
                        {post.cover_image && (
                          <img 
                            src={post.cover_image} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-yellow-500 text-yellow-900">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Destacado
                          </Badge>
                        </div>
                      </div>
                      <div className="p-5">
                        {post.category && (
                          <Badge 
                            variant="secondary" 
                            className="mb-2"
                            style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
                          >
                            {post.category.name}
                          </Badge>
                        )}
                        <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={post.author?.avatar_url || ''} />
                              <AvatarFallback>{post.author?.nombre_completo?.[0] || 'A'}</AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-[100px]">{post.author?.nombre_completo}</span>
                          </div>
                          <div className="flex items-center gap-3">
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
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Categories */}
              <Card className="p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Categorías
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !selectedCategory 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    Todas las categorías
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedCategory === category.id 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
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
              </Card>

              {/* Popular Tags */}
              <Card className="p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Tags Populares
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      >
                        #{tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </Card>

              {/* Top Contributors */}
              <Card className="p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Top Contribuidores
                </h3>
                <div className="space-y-3">
                  {topContributors.map((contributor: any, index) => (
                    <Link 
                      key={contributor.user_id} 
                      href={`/blog/autor/${contributor.user_id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {index + 1}
                      </span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={contributor.user?.avatar_url || ''} />
                        <AvatarFallback>{contributor.user?.nombre_completo?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{contributor.user?.nombre_completo}</p>
                        <p className="text-xs text-gray-500">{contributor.total_points} pts</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/blog/ranking">
                  <Button variant="ghost" className="w-full mt-3 text-blue-600">
                    Ver ranking completo
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </Card>
            </aside>

            {/* Posts Grid */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="recientes" className="mb-6">
                <TabsList>
                  <TabsTrigger value="recientes">Más Recientes</TabsTrigger>
                  <TabsTrigger value="populares">Más Populares</TabsTrigger>
                  <TabsTrigger value="tendencias">Tendencias</TabsTrigger>
                </TabsList>
              </Tabs>

              {loading && page === 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-40 bg-gray-200 dark:bg-gray-700" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <Card className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay artículos</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? `No encontramos artículos para "${searchQuery}"`
                      : 'Aún no hay artículos publicados en esta categoría'}
                  </p>
                  <Link href="/blog/escribir">
                    <Button>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Escribir el primero
                    </Button>
                  </Link>
                </Card>
              ) : (
                <>
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {posts.map((post) => (
                      <motion.div key={post.id} variants={fadeInUp}>
                        <PostCard post={post} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {hasMore && (
                    <div className="text-center mt-8">
                      <Button 
                        variant="outline" 
                        onClick={() => setPage(p => p + 1)}
                        disabled={loading}
                      >
                        {loading ? 'Cargando...' : 'Cargar más artículos'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">¿Eres médico verificado?</h2>
            <p className="text-xl text-blue-100 mb-6">
              Comparte tu conocimiento con miles de pacientes. Escribe artículos, 
              responde preguntas y construye tu reputación profesional.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/blog/escribir">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Escribir Artículo
                </Button>
              </Link>
              <Link href="/blog/preguntas">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Responder Preguntas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Componente de tarjeta de post
function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className="relative h-40 bg-gradient-to-br from-blue-500 to-teal-500">
          {post.cover_image && (
            <img 
              src={post.cover_image} 
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>
        <div className="p-5">
          {post.category && (
            <Badge 
              variant="secondary" 
              className="mb-2 text-xs"
              style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
            >
              {post.category.name}
            </Badge>
          )}
          <h3 className="font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={post.author?.avatar_url || ''} />
                <AvatarFallback className="text-[10px]">
                  {post.author?.nombre_completo?.[0] || 'A'}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[80px]">{post.author?.nombre_completo}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.reading_time} min
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.view_count}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {post.like_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {post.comment_count}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
