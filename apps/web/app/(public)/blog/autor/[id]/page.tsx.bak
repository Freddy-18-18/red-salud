"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import {
  ArrowLeft, CheckCircle, Award, BookOpen, MessageCircle,
  ThumbsUp, Eye, Users, Calendar, MapPin, Star,
  TrendingUp, Flame
} from "lucide-react";
import { 
  getPosts, getUserReputation, getUserBadges, 
  subscribeToAuthor, getAuthorSubscribers 
} from "@/lib/api/blog";
import { createClient } from "@/lib/supabase/client";
import type { BlogPost, UserReputation, Badge as BadgeType } from "@/lib/types/blog";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface AuthorProfile {
  id: string;
  nombre_completo: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
  doctor_details?: {
    verified: boolean;
    bio: string | null;
    specialty: { name: string } | null;
    years_experience: number;
    clinic_address: string | null;
  } | null;
}

export default function AuthorProfilePage() {
  const params = useParams();
  const authorId = params.id as string;
  const supabase = createClient();

  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("articulos");

  useEffect(() => {
    if (authorId) {
      loadAuthorData();
    }
  }, [authorId]);

  async function loadAuthorData() {
    setLoading(true);
    try {
      // Load author profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
          id, nombre_completo, avatar_url, role, created_at,
          doctor_details(verified, bio, years_experience, clinic_address, specialty:specialties(name))
        `)
        .eq('id', authorId)
        .single();

      // Handle doctor_details which comes as array from Supabase join
      if (profileData) {
        const doctorDetails = Array.isArray(profileData.doctor_details) 
          ? profileData.doctor_details[0] 
          : profileData.doctor_details;
        
        // Handle specialty which also comes as array
        const specialty = doctorDetails?.specialty 
          ? (Array.isArray(doctorDetails.specialty) ? doctorDetails.specialty[0] : doctorDetails.specialty)
          : null;
        
        const authorData: AuthorProfile = {
          id: profileData.id,
          nombre_completo: profileData.nombre_completo,
          avatar_url: profileData.avatar_url,
          role: profileData.role,
          created_at: profileData.created_at,
          doctor_details: doctorDetails ? {
            verified: doctorDetails.verified,
            bio: doctorDetails.bio,
            specialty: specialty,
            years_experience: doctorDetails.years_experience,
            clinic_address: doctorDetails.clinic_address,
          } : null
        };
        setAuthor(authorData);
      } else {
        setAuthor(null);
      }

      // Load other data in parallel
      const [reputationData, badgesData, postsData, subscribers] = await Promise.all([
        getUserReputation(authorId),
        getUserBadges(authorId),
        getPosts({ author: authorId }, { page: 1, limit: 10 }),
        getAuthorSubscribers(authorId),
      ]);

      setReputation(reputationData);
      setBadges(badgesData);
      setPosts(postsData.data);
      setSubscriberCount(subscribers);
    } catch (error) {
      console.error("Error loading author data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe() {
    try {
      const subscribed = await subscribeToAuthor(authorId);
      setIsSubscribed(subscribed);
      setSubscriberCount(prev => subscribed ? prev + 1 : prev - 1);
    } catch (error) {
      console.error("Error subscribing:", error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="space-y-3 flex-1">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Autor no encontrado</h1>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isVerifiedDoctor = author.doctor_details?.verified;
  const nextLevelPoints = (reputation?.level || 1) * 500;
  const currentLevelProgress = reputation 
    ? ((reputation.total_points % 500) / 500) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/blog" className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al blog
          </Link>
        </div>
      </div>

      {/* Profile Header */}
      <section className="bg-gradient-to-br from-blue-600 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            className="flex flex-col md:flex-row items-center md:items-start gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
              <AvatarImage src={author.avatar_url || ''} />
              <AvatarFallback className="text-3xl bg-blue-500">
                {author.nombre_completo?.[0] || 'A'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold">{author.nombre_completo}</h1>
                {isVerifiedDoctor && (
                  <Badge className="bg-white/20 text-white">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Médico Verificado
                  </Badge>
                )}
              </div>

              {author.doctor_details?.specialty?.name && (
                <p className="text-blue-100 text-lg mb-2">
                  {author.doctor_details.specialty.name}
                </p>
              )}

              {author.doctor_details?.bio && (
                <p className="text-blue-100 mb-4 max-w-2xl">
                  {author.doctor_details.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-blue-100">
                {author.doctor_details?.years_experience && (
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {author.doctor_details.years_experience} años de experiencia
                  </span>
                )}
                {author.doctor_details?.clinic_address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {author.doctor_details.clinic_address}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Miembro desde {formatDistanceToNow(new Date(author.created_at), { locale: es })}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Button
                size="lg"
                variant={isSubscribed ? "secondary" : "default"}
                className={isSubscribed ? "" : "bg-white text-blue-600 hover:bg-blue-50"}
                onClick={handleSubscribe}
              >
                <Users className="h-4 w-4 mr-2" />
                {isSubscribed ? 'Siguiendo' : 'Seguir'}
              </Button>
              <span className="text-sm text-blue-100">
                {subscriberCount} seguidores
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-6 -mt-6 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{reputation?.total_posts || 0}</p>
              <p className="text-sm text-gray-500">Artículos</p>
            </Card>
            <Card className="p-4 text-center">
              <MessageCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{reputation?.total_answers || 0}</p>
              <p className="text-sm text-gray-500">Respuestas</p>
            </Card>
            <Card className="p-4 text-center">
              <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{reputation?.total_points || 0}</p>
              <p className="text-sm text-gray-500">Puntos</p>
            </Card>
            <Card className="p-4 text-center">
              <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">{reputation?.current_streak || 0}</p>
              <p className="text-sm text-gray-500">Días de racha</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Level Progress */}
              <Card className="p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Nivel {reputation?.level || 1}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {reputation?.level_name || 'Novato'}
                </p>
                <Progress value={currentLevelProgress} className="mb-2" />
                <p className="text-xs text-gray-500">
                  {reputation?.total_points || 0} / {nextLevelPoints} puntos para el siguiente nivel
                </p>
              </Card>

              {/* Badges */}
              <Card className="p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Insignias ({badges.length})
                </h3>
                {badges.length === 0 ? (
                  <p className="text-sm text-gray-500">Aún no tiene insignias</p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                        title={badge.description || ''}
                      >
                        <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-1 ${
                          badge.badge_type === 'gold' ? 'bg-yellow-100 text-yellow-600' :
                          badge.badge_type === 'silver' ? 'bg-gray-100 text-gray-600' :
                          badge.badge_type === 'platinum' ? 'bg-purple-100 text-purple-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          <Award className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-medium truncate">{badge.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Stats Breakdown */}
              <Card className="p-5">
                <h3 className="font-bold mb-4">Estadísticas</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Respuestas aceptadas</span>
                    <span className="font-medium">{reputation?.total_accepted_answers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Preguntas realizadas</span>
                    <span className="font-medium">{reputation?.total_questions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Comentarios</span>
                    <span className="font-medium">{reputation?.total_comments || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Racha más larga</span>
                    <span className="font-medium">{reputation?.longest_streak || 0} días</span>
                  </div>
                </div>
              </Card>
            </aside>

            {/* Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="articulos">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Artículos
                  </TabsTrigger>
                  <TabsTrigger value="respuestas">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Respuestas
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="articulos">
                  {posts.length === 0 ? (
                    <Card className="p-8 text-center">
                      <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">Este autor aún no ha publicado artículos</p>
                    </Card>
                  ) : (
                    <motion.div
                      className="space-y-4"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {posts.map((post) => (
                        <motion.div key={post.id} variants={fadeInUp}>
                          <Link href={`/blog/${post.slug}`}>
                            <Card className="p-5 hover:shadow-lg transition-all">
                              <div className="flex gap-4">
                                {post.cover_image && (
                                  <img
                                    src={post.cover_image}
                                    alt={post.title}
                                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  {post.category && (
                                    <Badge
                                      variant="secondary"
                                      className="mb-2 text-xs"
                                      style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
                                    >
                                      {post.category.name}
                                    </Badge>
                                  )}
                                  <h3 className="font-bold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                                    {post.title}
                                  </h3>
                                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                    {post.excerpt}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
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
                              </div>
                            </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="respuestas">
                  <Card className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Las respuestas del autor aparecerán aquí</p>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
