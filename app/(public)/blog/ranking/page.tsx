"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import {
  ArrowLeft, Trophy, Medal, Award, Star, TrendingUp,
  BookOpen, MessageCircle, CheckCircle, Flame, Crown,
  Shield, Users
} from "lucide-react";
import { getTopContributors } from "@/lib/api/blog";
import type { UserReputation } from "@/lib/types/blog";

export default function RankingPage() {
  const [contributors, setContributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("puntos");

  useEffect(() => {
    loadRanking();
  }, []);

  async function loadRanking() {
    setLoading(true);
    try {
      const data = await getTopContributors(50);
      setContributors(data);
    } catch (error) {
      console.error("Error loading ranking:", error);
    } finally {
      setLoading(false);
    }
  }

  function getRankIcon(index: number) {
    if (index === 0) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Medal className="h-6 w-6 text-orange-400" />;
    return <span className="text-lg font-bold text-gray-400">#{index + 1}</span>;
  }

  function getRankBg(index: number) {
    if (index === 0) return "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200";
    if (index === 1) return "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200";
    if (index === 2) return "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200";
    return "";
  }

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

      {/* Hero */}
      <section className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-200" />
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Ranking de Contribuidores
            </h1>
            <p className="text-xl text-yellow-100 max-w-2xl mx-auto">
              Los miembros más activos de nuestra comunidad médica
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 -mt-8 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center bg-white">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-sm text-gray-500">Contribuidores</p>
            </Card>
            <Card className="p-4 text-center bg-white">
              <BookOpen className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">5,678</p>
              <p className="text-sm text-gray-500">Artículos</p>
            </Card>
            <Card className="p-4 text-center bg-white">
              <MessageCircle className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">12,345</p>
              <p className="text-sm text-gray-500">Respuestas</p>
            </Card>
            <Card className="p-4 text-center bg-white">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-teal-600" />
              <p className="text-2xl font-bold">89%</p>
              <p className="text-sm text-gray-500">Tasa de solución</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Ranking */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="puntos">
                <Star className="h-4 w-4 mr-2" />
                Puntos
              </TabsTrigger>
              <TabsTrigger value="articulos">
                <BookOpen className="h-4 w-4 mr-2" />
                Artículos
              </TabsTrigger>
              <TabsTrigger value="respuestas">
                <MessageCircle className="h-4 w-4 mr-2" />
                Respuestas
              </TabsTrigger>
              <TabsTrigger value="racha">
                <Flame className="h-4 w-4 mr-2" />
                Racha
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : contributors.length === 0 ? (
            <Card className="p-12 text-center">
              <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sin datos de ranking</h3>
              <p className="text-gray-500">
                Aún no hay suficientes contribuidores para mostrar el ranking
              </p>
            </Card>
          ) : (
            <motion.div
              className="space-y-3"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Top 3 Podium */}
              {contributors.length >= 3 && (
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {/* Second Place */}
                  <motion.div variants={fadeInUp} className="mt-8">
                    <Card className="p-4 text-center bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-300">
                      <div className="relative">
                        <Avatar className="h-16 w-16 mx-auto mb-2 border-4 border-gray-300">
                          <AvatarImage src={contributors[1]?.user?.avatar_url || ''} />
                          <AvatarFallback>{contributors[1]?.user?.nombre_completo?.[0] || '2'}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                          2
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm truncate">{contributors[1]?.user?.nombre_completo}</h3>
                      <p className="text-lg font-bold text-gray-600">{contributors[1]?.total_points} pts</p>
                    </Card>
                  </motion.div>

                  {/* First Place */}
                  <motion.div variants={fadeInUp}>
                    <Card className="p-4 text-center bg-gradient-to-b from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20 border-yellow-300">
                      <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <div className="relative">
                        <Avatar className="h-20 w-20 mx-auto mb-2 border-4 border-yellow-400">
                          <AvatarImage src={contributors[0]?.user?.avatar_url || ''} />
                          <AvatarFallback className="text-xl">{contributors[0]?.user?.nombre_completo?.[0] || '1'}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                          1
                        </div>
                      </div>
                      <h3 className="font-bold truncate">{contributors[0]?.user?.nombre_completo}</h3>
                      <p className="text-xl font-bold text-yellow-600">{contributors[0]?.total_points} pts</p>
                    </Card>
                  </motion.div>

                  {/* Third Place */}
                  <motion.div variants={fadeInUp} className="mt-12">
                    <Card className="p-4 text-center bg-gradient-to-b from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 border-orange-300">
                      <div className="relative">
                        <Avatar className="h-14 w-14 mx-auto mb-2 border-4 border-orange-300">
                          <AvatarImage src={contributors[2]?.user?.avatar_url || ''} />
                          <AvatarFallback>{contributors[2]?.user?.nombre_completo?.[0] || '3'}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                          3
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm truncate">{contributors[2]?.user?.nombre_completo}</h3>
                      <p className="text-lg font-bold text-orange-600">{contributors[2]?.total_points} pts</p>
                    </Card>
                  </motion.div>
                </div>
              )}

              {/* Rest of the ranking */}
              {contributors.slice(3).map((contributor, index) => (
                <motion.div key={contributor.user_id} variants={fadeInUp}>
                  <Link href={`/blog/autor/${contributor.user_id}`}>
                    <Card className={`p-4 hover:shadow-lg transition-all ${getRankBg(index + 3)}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 flex justify-center">
                          {getRankIcon(index + 3)}
                        </div>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={contributor.user?.avatar_url || ''} />
                          <AvatarFallback>{contributor.user?.nombre_completo?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{contributor.user?.nombre_completo}</h3>
                            {contributor.user?.role === 'medico' && (
                              <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Nivel {contributor.level}</span>
                            <span>•</span>
                            <span>{contributor.level_name}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-blue-600">{contributor.total_points}</p>
                          <p className="text-xs text-gray-500">puntos</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
                          <div className="text-center">
                            <p className="font-semibold text-gray-700">{contributor.total_posts}</p>
                            <p className="text-xs">artículos</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-gray-700">{contributor.total_answers}</p>
                            <p className="text-xs">respuestas</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-gray-700">{contributor.current_streak}</p>
                            <p className="text-xs">racha</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* How to earn points */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-8">¿Cómo ganar puntos?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-5 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Publicar artículos</h3>
              <p className="text-sm text-gray-500">+50 puntos por artículo publicado</p>
            </Card>
            <Card className="p-5 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Responder preguntas</h3>
              <p className="text-sm text-gray-500">+10 puntos por respuesta</p>
            </Card>
            <Card className="p-5 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Respuesta aceptada</h3>
              <p className="text-sm text-gray-500">+25 puntos adicionales</p>
            </Card>
            <Card className="p-5 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Recibir votos positivos</h3>
              <p className="text-sm text-gray-500">+5 puntos por voto</p>
            </Card>
            <Card className="p-5 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Mantener racha</h3>
              <p className="text-sm text-gray-500">+2 puntos por día activo</p>
            </Card>
            <Card className="p-5 text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="font-semibold mb-2">Obtener insignias</h3>
              <p className="text-sm text-gray-500">+10-100 puntos por insignia</p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
